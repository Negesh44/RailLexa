import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RAILWAY_STATIONS, CORRIDOR_SECTIONS, ALL_INDIA_CORRIDORS } from '../data/realRailData';
import { useBlocks } from '../context/BlockContext';
import { 
  Play, 
  Pause, 
  Radio, 
  Zap, 
  MapPin, 
  Train, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Layers, 
  Navigation,
  Compass,
  Activity,
  RotateCw
} from 'lucide-react';

// Custom DivIcons for Leaflet
const createStationIcon = (name, code, isMajor) => {
  return L.divIcon({
    className: 'custom-station-icon',
    html: `
      <div style="
        background: ${isMajor ? '#1d4ed8' : '#ffffff'};
        color: ${isMajor ? '#ffffff' : '#0f172a'};
        border: 1.5px solid ${isMajor ? '#1e40af' : '#64748b'};
        border-radius: 6px;
        padding: 2px 6px;
        font-family: 'Inter', -apple-system, sans-serif;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transform: translate(-50%, -50%);
      ">
        <span style="display:inline-block; width:5px; height:5px; border-radius:50%; background:${isMajor ? '#ffffff' : '#1d4ed8'};"></span>
        ${code}
      </div>
    `,
    iconSize: [52, 20],
    iconAnchor: [26, 10]
  });
};

const createTrainIcon = (train) => {
  const isVandeBharat = train.type === 'VANDE_BHARAT';
  const isShatabdi = train.type === 'SHATABDI';
  const isFreight = train.priority === 'FREIGHT';
  const color = isVandeBharat ? '#0284c7' : isShatabdi ? '#7c3aed' : isFreight ? '#d97706' : '#059669';

  return L.divIcon({
    className: 'custom-train-icon',
    html: `
      <div style="
        background: ${color};
        color: #ffffff;
        border: 2px solid #ffffff;
        border-radius: 9999px;
        padding: 3px 8px;
        font-family: 'Inter', -apple-system, sans-serif;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 3px 12px rgba(0,0,0,0.38);
        white-space: nowrap;
        cursor: pointer;
        transform: translate(-50%, -50%);
      ">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 6px #22c55e;"></span>
        <span>🚆 ${train.trainNumber}</span>
        <span style="background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; font-size: 9.5px; font-weight: 800; color: #f8fafc;">
          ${train.speedKmH} km/h
        </span>
      </div>
    `,
    iconSize: [118, 26],
    iconAnchor: [59, 13]
  });
};

const createBlockZoneIcon = (block) => {
  const isWork = block.status === 'IN_PROGRESS';
  const bgColor = isWork ? '#dc2626' : '#d97706';
  const text = isWork ? '⚠️ ACTIVE WORK' : '⏱️ PLANNED BLOCK';

  return L.divIcon({
    className: 'custom-block-icon',
    html: `
      <div style="
        background: ${bgColor};
        color: #ffffff;
        border: 2px solid #ffffff;
        border-radius: 6px;
        padding: 3px 8px;
        font-family: 'Inter', -apple-system, sans-serif;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 12px ${isWork ? 'rgba(220,38,38,0.5)' : 'rgba(217,119,6,0.4)'};
        white-space: nowrap;
        transform: translate(-50%, -50%);
        cursor: pointer;
      ">
        <span>${text}</span>
      </div>
    `,
    iconSize: [112, 24],
    iconAnchor: [56, 12]
  });
};

export const MapView = ({ selectedBlockId = null, height = '600px' }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  // Dedicated Separate Layer Groups
  const staticTracksLayerRef = useRef(null);
  const staticStationsLayerRef = useRef(null);
  const blocksLayerRef = useRef(null);
  const trainsLayerRef = useRef(null);
  const trainMarkersMapRef = useRef(new Map());

  const { 
    blocks, 
    trains, 
    stats,
    isLiveTrackingActive, 
    setIsLiveTrackingActive, 
    simSpeed, 
    setSimSpeed 
  } = useBlocks();

  const [activeFilter, setActiveFilter] = useState('ALL_CHENNAI'); // ALL_CHENNAI, WEST_TRUNK, SOUTH_TRUNK, NORTH_TRUNK
  const [selectedEntity, setSelectedEntity] = useState(null); // { type: 'TRAIN'|'STATION'|'BLOCK'|'CORRIDOR', data: ... }
  const [mapInitialized, setMapInitialized] = useState(false);

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    trainMarkersMapRef.current.clear();

    const map = L.map(mapContainerRef.current, {
      center: [13.0827, 79.9500],
      zoom: 9,
      zoomControl: true,
      attributionControl: false
    });

    // Primary: CartoDB Voyager Tiles
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; CartoDB & OpenStreetMap'
    }).addTo(map);

    // Fallback error handler for tiles
    tileLayer.on('tileerror', () => {
      // If CartoDB fails, add OSM standard as fallback
      if (!map._hasOsmFallback) {
        map._hasOsmFallback = true;
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
      }
    });

    // Layer groups
    staticTracksLayerRef.current = L.layerGroup().addTo(map);
    staticStationsLayerRef.current = L.layerGroup().addTo(map);
    blocksLayerRef.current = L.layerGroup().addTo(map);
    trainsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setMapInitialized(true);

    // Aggressive invalidateSize sequence to guarantee immediate visibility
    const timers = [
      setTimeout(() => map.invalidateSize(), 30),
      setTimeout(() => map.invalidateSize(), 120),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 600),
      setTimeout(() => map.invalidateSize(), 1200)
    ];

    let resizeObserver = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      timers.forEach(t => clearTimeout(t));
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Static Tracks & Stations (Runs when Map is Ready or Filter changes)
  const renderTracksAndStations = useCallback(() => {
    if (!mapInstanceRef.current || !staticTracksLayerRef.current || !staticStationsLayerRef.current) return;

    const tracksLayer = staticTracksLayerRef.current;
    const stationsLayer = staticStationsLayerRef.current;

    tracksLayer.clearLayers();
    stationsLayer.clearLayers();

    const isWest = activeFilter === 'WEST_TRUNK';
    const isSouth = activeFilter === 'SOUTH_TRUNK';
    const isNorth = activeFilter === 'NORTH_TRUNK';

    // Draw Mainline Corridors
    ALL_INDIA_CORRIDORS.forEach(corridor => {
      if (isWest && corridor.quadrant !== 'CHENNAI_WEST') return;
      if (isSouth && corridor.quadrant !== 'CHENNAI_SOUTH') return;
      if (isNorth && corridor.quadrant !== 'CHENNAI_NORTH') return;

      const polyline = L.polyline(corridor.coordinates, {
        color: corridor.color,
        weight: 5,
        opacity: 0.9
      }).addTo(tracksLayer);

      polyline.on('click', () => {
        setSelectedEntity({
          type: 'CORRIDOR',
          data: corridor
        });
      });

      polyline.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 220px; padding: 2px;">
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-weight: 800; font-size: 11px; padding: 4px 6px; border-radius: 6px; text-align: center; margin-bottom: 6px; text-transform: uppercase;">
            ⚡ 130 km/h Superfast Trunk Line
          </div>
          <div style="font-weight: 800; font-size: 13px; color: ${corridor.color}; margin-bottom: 4px;">
            ${corridor.name}
          </div>
          <div style="font-size: 11px; color: #475569;">
            <strong>Zone:</strong> ${corridor.zone}
          </div>
          <div style="font-size: 11px; color: #059669; font-weight: 700; margin-top: 4px;">
            ⚡ Speed Limit: ${corridor.speedKmH} km/h (Automatic Block Signalling)
          </div>
        </div>
      `);
    });

    // Draw Operational Track Sections
    CORRIDOR_SECTIONS.forEach(sec => {
      const polyline = L.polyline(sec.coordinates, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.8
      }).addTo(tracksLayer);

      polyline.on('click', () => {
        setSelectedEntity({
          type: 'SECTION',
          data: sec
        });
      });
    });

    // Draw Stations
    RAILWAY_STATIONS.forEach(station => {
      if (isWest && station.quadrant !== 'CHENNAI_WEST' && station.quadrant !== 'CHENNAI_CENTRAL') return;
      if (isSouth && station.quadrant !== 'CHENNAI_SOUTH') return;
      if (isNorth && station.quadrant !== 'CHENNAI_NORTH' && station.quadrant !== 'CHENNAI_CENTRAL') return;

      const isMajor = station.stationType.includes('Major') || station.stationType.includes('HQ') || station.stationType.includes('Junction');
      const marker = L.marker([station.lat, station.lng], {
        icon: createStationIcon(station.name, station.code, isMajor)
      }).addTo(stationsLayer);

      marker.on('click', () => {
        setSelectedEntity({
          type: 'STATION',
          data: station
        });
      });

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 200px;">
          <div style="font-weight: 800; font-size: 13px; color: #1d4ed8;">${station.name} (${station.code})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            <strong>Zone:</strong> ${station.zone} | <strong>Division:</strong> ${station.division}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            <strong>Type:</strong> ${station.stationType} | <strong>Platforms:</strong> ${station.platforms}
          </div>
        </div>
      `);
    });
  }, [activeFilter]);

  useEffect(() => {
    if (mapInitialized) {
      renderTracksAndStations();
    }
  }, [mapInitialized, renderTracksAndStations]);

  // 3. Render Maintenance Blocks
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current || !blocksLayerRef.current) return;

    const blocksLayer = blocksLayerRef.current;
    blocksLayer.clearLayers();

    blocks.forEach(block => {
      const sec = CORRIDOR_SECTIONS.find(s => s.id === block.sectionId);
      if (sec && sec.coordinates.length >= 2) {
        const midLat = (sec.coordinates[0][0] + sec.coordinates[1][0]) / 2;
        const midLng = (sec.coordinates[0][1] + sec.coordinates[1][1]) / 2;

        const blockMarker = L.marker([midLat, midLng], {
          icon: createBlockZoneIcon(block),
          zIndexOffset: 1000
        }).addTo(blocksLayer);

        const isWork = block.status === 'IN_PROGRESS';

        blockMarker.on('click', () => {
          setSelectedEntity({
            type: 'BLOCK',
            data: block
          });
        });

        blockMarker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; min-width: 240px; padding: 2px;">
            <div style="background: ${isWork ? '#fee2e2' : '#fef3c7'}; border: 1px solid ${isWork ? '#fca5a5' : '#fde68a'}; color: ${isWork ? '#991b1b' : '#92400e'}; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 6px; text-align: center; margin-bottom: 8px; text-transform: uppercase;">
              ${isWork ? '🔴 TRACK CLOSED (TSR 50 km/h)' : '🟡 PLANNED POSSESSION'}
            </div>
            <div style="font-weight: 800; font-size: 13px; color: #0f2942; margin-bottom: 4px;">
              ${block.title}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">
              <strong>Section:</strong> ${block.sectionName} (${block.trackLine})
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">
              <strong>Department:</strong> ${block.departmentName} • 👤 ${block.requestedBy}
            </div>
            <div style="font-size: 11px; color: #1d4ed8; font-weight: 700; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
              ⏰ Slot: ${block.timeSlot} (${block.durationHours} hrs)
            </div>
          </div>
        `);

        if (selectedBlockId === block.id) {
          blockMarker.openPopup();
          setSelectedEntity({ type: 'BLOCK', data: block });
        }
      }
    });
  }, [mapInitialized, blocks, selectedBlockId]);

  // 4. Smooth Train Position Updates
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current || !trainsLayerRef.current) return;

    const trainsLayer = trainsLayerRef.current;
    const markersMap = trainMarkersMapRef.current;

    trains.forEach(train => {
      let marker = markersMap.get(train.id);

      if (!marker) {
        marker = L.marker([train.lat, train.lng], {
          icon: createTrainIcon(train),
          zIndexOffset: 800
        }).addTo(trainsLayer);

        marker.on('click', () => {
          setSelectedEntity({
            type: 'TRAIN',
            data: train
          });
        });

        markersMap.set(train.id, marker);
      } else {
        marker.setLatLng([train.lat, train.lng]);
        marker.setIcon(createTrainIcon(train));
      }

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 240px; padding: 2px;">
          <div style="font-weight: 800; font-size: 13px; color: #0284c7; margin-bottom: 4px;">
            🚆 ${train.name} (${train.trainNumber})
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <strong>Route:</strong> ${train.route}
          </div>
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 4px 8px; margin-bottom: 4px;">
            <div style="font-size: 11.5px; color: #047857; font-weight: 800; display: flex; align-items: center; justify-content: space-between;">
              <span>⚡ Speed:</span>
              <span style="font-size: 13px; color: #059669;">${train.speedKmH} km/h</span>
            </div>
            <div style="font-size: 10px; color: #065f46; margin-top: 1px;">
              ${train.statusText}
            </div>
          </div>
          <div style="font-size: 11px; color: #64748b;">
            Next Halt: <strong>${train.nextStation}</strong> (ETA: ${train.scheduledArrivalAtNextStation})
          </div>
        </div>
      `);
    });
  }, [mapInitialized, trains]);

  // Handle Corridor Focus
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (!mapInstanceRef.current) return;

    if (filter === 'ALL_CHENNAI') {
      mapInstanceRef.current.setView([13.0827, 79.9500], 9);
    } else if (filter === 'WEST_TRUNK') {
      mapInstanceRef.current.setView([12.9696, 79.5000], 10);
    } else if (filter === 'SOUTH_TRUNK') {
      mapInstanceRef.current.setView([12.5000, 79.8500], 10);
    } else if (filter === 'NORTH_TRUNK') {
      mapInstanceRef.current.setView([13.6000, 80.1000], 10);
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 80);
  };

  const handleManualRefresh = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      renderTracksAndStations();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Header Card */}
      <div 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '10px', 
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f2942' }}>
              Chennai Division Live GIS Rail Map
            </span>
            <span 
              style={{ 
                background: isLiveTrackingActive ? '#ecfdf5' : '#f1f5f9', 
                border: isLiveTrackingActive ? '1px solid #a7f3d0' : '1px solid #cbd5e1', 
                color: isLiveTrackingActive ? '#065f46' : '#64748b', 
                padding: '2px 8px', 
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: isLiveTrackingActive ? '#10b981' : '#94a3b8',
                  boxShadow: isLiveTrackingActive ? '0 0 6px #10b981' : 'none'
                }}
              />
              {isLiveTrackingActive ? 'LIVE GPS TELEMETRY STREAMING' : 'TELEMETRY PAUSED'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
            Click any train, station, or maintenance block on the map to inspect live engineering telemetry.
          </p>
        </div>

        {/* Telemetry Speed Simulation Controls & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px' }}>
            <button
              className="btn btn-sm"
              onClick={() => setIsLiveTrackingActive(!isLiveTrackingActive)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 8px',
                color: isLiveTrackingActive ? '#d97706' : '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              {isLiveTrackingActive ? <Pause size={12} /> : <Play size={12} />}
              <span>{isLiveTrackingActive ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => setSimSpeed(1)}
              style={{
                background: simSpeed === 1 ? '#1d4ed8' : 'transparent',
                color: simSpeed === 1 ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 7px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              1x Real
            </button>
            <button
              onClick={() => setSimSpeed(2)}
              style={{
                background: simSpeed === 2 ? '#1d4ed8' : 'transparent',
                color: simSpeed === 2 ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 7px',
                fontSize: '0.725rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              2x Fast
            </button>
          </div>

          {/* Corridor Filter Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { id: 'ALL_CHENNAI', label: 'All Chennai' },
              { id: 'WEST_TRUNK', label: 'West (MAS-JTJ)' },
              { id: 'SOUTH_TRUNK', label: 'South (MS-VM)' },
              { id: 'NORTH_TRUNK', label: 'North (MAS-GDR)' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterChange(f.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: activeFilter === f.id ? 800 : 500,
                  background: activeFilter === f.id ? '#1d4ed8' : '#ffffff',
                  color: activeFilter === f.id ? '#ffffff' : '#334155',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleManualRefresh}
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 8px' }}
              title="Refresh Map Tiles"
            >
              <RotateCw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container with Live Inspector Overlay */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          minHeight: '600px',
          height: height, 
          borderRadius: '12px', 
          overflow: 'hidden', 
          border: '1px solid #cbd5e1', 
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          background: '#f8fafc'
        }}
      >
        {/* Leaflet Map Div with guaranteed explicit sizing */}
        <div 
          ref={mapContainerRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '600px', 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1 
          }} 
        />

        {/* Selected Component Inspector Panel */}
        {selectedEntity && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              width: '320px', 
              background: '#ffffff', 
              border: '1px solid #cbd5e1', 
              borderRadius: '12px', 
              padding: '16px', 
              zIndex: 999, 
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                {selectedEntity.type} INSPECTOR
              </span>
              <button 
                type="button" 
                onClick={() => setSelectedEntity(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* TRAIN DETAILS */}
            {selectedEntity.type === 'TRAIN' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🚆</span>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#0f2942' }}>
                      {selectedEntity.data.name}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700 }}>
                      Train #{selectedEntity.data.trainNumber} • {selectedEntity.data.type}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Live Speed:</span>
                    <strong style={{ color: '#059669', fontSize: '0.9rem' }}>⚡ {selectedEntity.data.speedKmH} km/h</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Route:</span>
                    <strong>{selectedEntity.data.route}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Next Stoppage:</span>
                    <strong style={{ color: '#1d4ed8' }}>{selectedEntity.data.nextStation}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Delay:</span>
                    <strong style={{ color: selectedEntity.data.delayMinutes === 0 ? '#059669' : '#dc2626' }}>
                      {selectedEntity.data.delayMinutes === 0 ? 'On-Time (0 min)' : `+${selectedEntity.data.delayMinutes} mins`}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* STATION DETAILS */}
            {selectedEntity.type === 'STATION' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🚉</span>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#0f2942' }}>
                      {selectedEntity.data.name}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700 }}>
                      Code: {selectedEntity.data.code} • {selectedEntity.data.division}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Platforms:</span>
                    <strong>{selectedEntity.data.platforms} Platforms</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Classification:</span>
                    <strong>{selectedEntity.data.stationType}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Zone:</span>
                    <strong>{selectedEntity.data.zone}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>GPS Coordinates:</span>
                    <strong>{selectedEntity.data.lat.toFixed(4)}, {selectedEntity.data.lng.toFixed(4)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* BLOCK DETAILS */}
            {selectedEntity.type === 'BLOCK' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#991b1b' }}>
                      {selectedEntity.data.title}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>
                      {selectedEntity.data.status} • {selectedEntity.data.departmentName}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Section:</span>
                    <strong>{selectedEntity.data.sectionName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Track Line:</span>
                    <strong style={{ color: '#dc2626' }}>{selectedEntity.data.trackLine}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Slot Window:</span>
                    <strong style={{ color: '#1d4ed8' }}>{selectedEntity.data.timeSlot}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Machine:</span>
                    <strong>{selectedEntity.data.machineryRequired}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* CORRIDOR DETAILS */}
            {(selectedEntity.type === 'CORRIDOR' || selectedEntity.type === 'SECTION') && (
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#0f2942', display: 'block', marginBottom: '4px' }}>
                  {selectedEntity.data.name}
                </strong>
                <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700, marginBottom: '8px' }}>
                  ⚡ Speed Limit: {selectedEntity.data.speedKmH || selectedEntity.data.maxSpeedKmH || 130} km/h
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Track Signalling:</span>
                    <strong style={{ color: '#059669' }}>Automatic Block Signalling (ABS)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Traction:</span>
                    <strong>25kV 50Hz AC Single Phase</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
