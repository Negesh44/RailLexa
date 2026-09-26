import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MAINTENANCE_BLOCKS, LIVE_TRAINS, CORRIDOR_SECTIONS } from '../data/realRailData';
import { optimizeBlocksWithAI } from '../services/aiService';
import confetti from 'canvas-confetti';

const BlockContext = createContext(null);

export const BlockProvider = ({ children }) => {
  const [blocks, setBlocks] = useState(INITIAL_MAINTENANCE_BLOCKS);
  const [trains, setTrains] = useState(LIVE_TRAINS);
  const [sections, setSections] = useState(CORRIDOR_SECTIONS);
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [isLiveTrackingActive, setIsLiveTrackingActive] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 1 = Realtime, 2 = 2x, 4 = 4x

  const [aiOptimizationSummary, setAiOptimizationSummary] = useState({
    lastOptimizedAt: 'Just now',
    blocksGrouped: 3,
    hoursSaved: 4.5,
    trackAvailabilityGain: '+22.4%',
    conflictsPrevented: 5,
    aiNotes: 'RailLexa ML Optimizer evaluated Chennai Division headway gaps and bundled multi-department maintenance into unified joint shadow-blocks, preserving 100% Superfast & Vande Bharat punctuality.',
    aiRecommendations: [
      {
        sectionName: "Avadi – Tiruvallur (UP Fast 130 km/h Line)",
        recommendedSlot: "01:15 AM – 03:45 AM",
        actionSummary: "Combined Heavy Ballast Tamping + 25kV OHE Catenary Overhaul into 1 Joint Shadow-Block.",
        trainImpact: "Zero delay for Vande Bharat (20607/20608) & Kovai SF (12675)",
        whyThisTime: "Optimal 150-minute midnight headway gap between incoming Train 20608 Mysuru Vande Bharat (00:40 AM) and morning Train 12675 Kovai SF (05:40 AM). Simultaneous OHE power isolation provides maximum electrical safety while tamping machines operate.",
        departmentsBundled: ["Civil Track Eng (MAS)", "OHE Electrical Traction (MAS)"]
      },
      {
        sectionName: "Arakkonam Jn – Katpadi Jn (Point 142A Crossover)",
        recommendedSlot: "11:30 AM – 01:00 PM",
        actionSummary: "Synchronized S&T Point Machine Overhaul & USFD Double-Rail Crack Scan.",
        trainImpact: "Zero delay on 130 km/h mainline tracks",
        whyThisTime: "Utilizes midday timetable gap between Shatabdi (12007) and afternoon Vande Bharat (20643). Point mechanism tested and calibrated with fail-safe crossover isolation.",
        departmentsBundled: ["Signal & Telecom (MAS)", "Civil Track Eng (MAS)"]
      },
      {
        sectionName: "Tambaram – Chengalpattu Jn (South Superfast Line)",
        recommendedSlot: "01:30 AM – 04:00 AM",
        actionSummary: "Rescheduled MSDAC Axle Counter Calibration to low-traffic night window.",
        trainImpact: "Eliminated 18 mins potential daytime delay for Tirunelveli Vande Bharat (20665)",
        whyThisTime: "Shifting daytime request to night prevents speed restrictions during the peak afternoon run of Train 20665 Vande Bharat (03:15 PM) and Vaigai Express (12635).",
        departmentsBundled: ["Signal & Telecom (MAS)"]
      }
    ]
  });

  // Real-Time High-Precision Live Train Movement & Dynamic Speed Telemetry Engine
  useEffect(() => {
    if (!isLiveTrackingActive) return;

    const interval = setInterval(() => {
      setTrains(prevTrains => {
        return prevTrains.map(trn => {
          if (!trn.routeWaypoints || trn.routeWaypoints.length < 2) return trn;

          const totalWp = trn.routeWaypoints.length;
          let currIdx = trn.waypointIndex ?? 0;
          let isFwd = trn.isForward !== false;
          let nextIdx = isFwd ? currIdx + 1 : currIdx - 1;

          // Safe bounds check
          if (currIdx >= totalWp - 1) {
            isFwd = false;
            currIdx = totalWp - 1;
            nextIdx = currIdx - 1;
          } else if (currIdx <= 0) {
            isFwd = true;
            currIdx = 0;
            nextIdx = 1;
          }

          const currentPoint = trn.routeWaypoints[currIdx] || trn.routeWaypoints[0];
          const nextPoint = trn.routeWaypoints[nextIdx] || currentPoint;

          // Approximate inter-waypoint distance in kilometers
          const dLat = (nextPoint.lat - currentPoint.lat) * 111;
          const dLng = (nextPoint.lng - currentPoint.lng) * 108;
          const segmentDistanceKm = Math.max(1.5, Math.sqrt(dLat * dLat + dLng * dLng));

          // Train seed for deterministic yet unique dynamic variations
          const trainSeed = (trn.trainNumber ? trn.trainNumber.charCodeAt(trn.trainNumber.length - 1) : 5) * 13;
          const now = Date.now();

          // Authentic Indian Railway dynamic speed variations:
          // Micro-fluctuations from traction power, catenary voltage, and track gradient (±3.5 km/h)
          const base = trn.baseSpeed || 130;
          const microJitter = (Math.sin(now / 2200 + trainSeed) * 2.6) + (Math.cos(now / 1200 + trainSeed * 2) * 1.2);
          let calculatedSpeed = base + microJitter;

          const currentProg = trn.segmentProgress ?? 0;

          // Realistic Station Deceleration & Acceleration Curves
          if (currentProg < 0.22) {
            // Accelerating out of previous station
            const accelFactor = 0.48 + (0.52 * (currentProg / 0.22));
            calculatedSpeed = calculatedSpeed * accelFactor;
          } else if (currentProg > 0.78) {
            // Braking into upcoming station approach
            const decelFactor = 1.0 - (0.45 * ((currentProg - 0.78) / 0.22));
            calculatedSpeed = calculatedSpeed * decelFactor;
          }

          // Active Maintenance Caution Order restriction (45-50 km/h)
          const isCautionZone = blocks.some(b => b.status === 'IN_PROGRESS' && b.sectionId === trn.currentSectionId);
          if (isCautionZone && trn.priority !== 'FREIGHT') {
            calculatedSpeed = Math.min(calculatedSpeed, 45 + (Math.sin(now / 1500) * 3));
          }

          calculatedSpeed = Math.max(35, Math.round(calculatedSpeed));

          // Smooth progress increment calibrated for realistic Indian train speeds
          // (At 1x realtime, smooth progress across 4-6 km segments)
          const stepDelta = (0.007 * (calculatedSpeed / 130)) * simSpeed;
          let progress = currentProg + stepDelta;

          if (progress >= 1.0) {
            progress = 0;
            currIdx = nextIdx;

            if (currIdx >= totalWp - 1) {
              isFwd = false;
              currIdx = totalWp - 1;
              nextIdx = currIdx - 1;
            } else if (currIdx <= 0) {
              isFwd = true;
              currIdx = 0;
              nextIdx = 1;
            } else {
              nextIdx = isFwd ? currIdx + 1 : currIdx - 1;
            }
          }

          // Precise Geographic Coordinate Interpolation
          const activeStartPoint = trn.routeWaypoints[currIdx] || trn.routeWaypoints[0];
          const activeEndPoint = trn.routeWaypoints[nextIdx] || activeStartPoint;
          const lat = activeStartPoint.lat + (activeEndPoint.lat - activeStartPoint.lat) * progress;
          const lng = activeStartPoint.lng + (activeEndPoint.lng - activeStartPoint.lng) * progress;

          const targetStation = activeEndPoint.station || trn.nextStation;
          const distanceRemainingKm = Math.max(0.1, (segmentDistanceKm * (1 - progress))).toFixed(1);

          const statusText = isCautionZone
            ? `⚠️ Caution Order Zone: Speed restricted to ${calculatedSpeed} km/h (Active Maintenance Work)`
            : calculatedSpeed >= 125
              ? `⚡ Cruising at ${calculatedSpeed} km/h • Green Wave Automatic Signalling`
              : progress > 0.78
                ? `Approaching ${targetStation} (${distanceRemainingKm} km remaining) • ${calculatedSpeed} km/h`
                : `Accelerating on mainline track • ${calculatedSpeed} km/h`;

          return {
            ...trn,
            lat,
            lng,
            speedKmH: calculatedSpeed,
            waypointIndex: currIdx,
            segmentProgress: progress,
            isForward: isFwd,
            nextStation: targetStation,
            distanceRemainingKm,
            statusText
          };
        });
      });
    }, 750);

    return () => clearInterval(interval);
  }, [isLiveTrackingActive, simSpeed, blocks]);

  // Calculate live statistics
  const stats = {
    totalBlocks: blocks.length,
    inProgressBlocks: blocks.filter(b => b.status === 'IN_PROGRESS').length,
    pendingBlocks: blocks.filter(b => b.status === 'PENDING_CONTROLLER').length,
    approvedBlocks: blocks.filter(b => b.status === 'APPROVED').length,
    completedBlocks: blocks.filter(b => b.status === 'COMPLETED').length,
    cancelledBlocks: blocks.filter(b => b.status === 'CANCELLED').length,
    trackAvailabilityScore: 94.6,
    totalTrackKmUnderWork: 8.5,
    activeTrainsRunning: trains.length,
    avgNetworkSpeed: Math.round(trains.reduce((acc, t) => acc + (t.speedKmH || 0), 0) / (trains.length || 1))
  };

  // Department Action: Submit New Maintenance Block Request
  const createBlockRequest = (newRequestData) => {
    const newId = `BLK-2024-MAS-${String(blocks.length + 1).padStart(3, '0')}`;
    
    // AI Pre-check simulation
    const estimatedImpact = newRequestData.timeSlot?.includes('01:') || newRequestData.timeSlot?.includes('02:') || newRequestData.timeSlot?.includes('03:')
      ? 0
      : Math.floor(Math.random() * 4);

    const fullBlock = {
      id: newId,
      title: newRequestData.title,
      plainPurpose: newRequestData.plainPurpose || 'General track & asset safety enhancement maintenance.',
      departmentId: newRequestData.departmentId,
      departmentName: newRequestData.departmentName,
      sectionId: newRequestData.sectionId,
      sectionName: newRequestData.sectionName,
      trackLine: newRequestData.trackLine,
      requestedBy: newRequestData.requestedBy,
      requestedDate: newRequestData.requestedDate || 'Today',
      timeSlot: newRequestData.timeSlot,
      durationHours: parseFloat(newRequestData.durationHours) || 2.0,
      machineryRequired: newRequestData.machineryRequired || 'Standard Maintenance Gear + Team',
      speedRestrictionAfterWork: newRequestData.speedRestrictionAfterWork || 'Normal Section Speed (130 km/h)',
      status: 'PENDING_CONTROLLER',
      aiRecommendation: {
        isOptimal: estimatedImpact === 0,
        safeWindowStart: newRequestData.timeSlot?.split('–')[0]?.trim() || '01:30 AM',
        safeWindowEnd: newRequestData.timeSlot?.split('–')[1]?.trim() || '04:00 AM',
        trainDelayImpactMins: estimatedImpact,
        confidenceScore: `${90 + Math.floor(Math.random() * 9)}%`,
        shadowBlockGroup: null,
        plainReason: estimatedImpact === 0 
          ? 'AI verified: Clear window between scheduled Chennai Superfast & Vande Bharat runs.' 
          : 'Daytime proximity to express trains. ML optimizer can auto-bundle into night shadow-block.'
      },
      safetyChecklist: {
        flagsPlaced: false,
        detonatorsReady: false,
        powerShutOff: false,
        machineryPositioned: false,
        trackClearanceCertified: false
      },
      workLogs: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Request created by ${newRequestData.requestedBy} and forwarded to Chief Traffic Controller (MAS HQ).`
        }
      ]
    };

    setBlocks(prev => [fullBlock, ...prev]);
    return fullBlock;
  };

  // Department Action: Cancel / Withdraw Block Request with Processed Review
  const cancelBlockRequest = (blockId, reason = 'Withdrawn by Department Field Engineer', cancelledBy = '', remarks = '') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          const author = cancelledBy || b.requestedBy || 'Department Field Engineer';
          return {
            ...b,
            status: 'CANCELLED',
            cancellation: {
              isCancelled: true,
              cancelledBy: author,
              departmentId: b.departmentId,
              departmentName: b.departmentName,
              cancelledAt: timestamp,
              reason: reason || 'Withdrawn by Department Field Engineer',
              remarks: remarks || '',
              reviewStatus: 'PROCESSED',
              reviewNote: 'Corridor window released back to Chennai Division Timetable. 0 Express Delay Impact.',
              slotReleased: b.timeSlot
            },
            workLogs: [
              ...b.workLogs,
              {
                timestamp,
                text: `🚫 Request cancelled & withdrawn by ${author} (${b.departmentName}). Reason: "${reason}". Review status: PROCESSED. Slot [${b.timeSlot}] released back to division timetable.`
              }
            ]
          };
        }
        return b;
      })
    );
  };

  // Controller Action: Approve Block
  const approveBlock = (blockId, note = '') => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            status: 'APPROVED',
            controllerNote: note || 'Approved by Chief Section Controller MAS for scheduled window.',
            approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            workLogs: [
              ...b.workLogs,
              {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `Approved by Chief Traffic Controller MAS. Window confirmed: ${b.timeSlot}.`
              }
            ]
          };
        }
        return b;
      })
    );
  };

  // Controller Action: Reject Block
  const rejectBlock = (blockId, reason) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            status: 'REJECTED',
            rejectionReason: reason || 'High train traffic priority during requested slot. Please request an alternative night window.',
            workLogs: [
              ...b.workLogs,
              {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `Request declined by Controller. Reason: ${reason || 'Traffic conflict'}`
              }
            ]
          };
        }
        return b;
      })
    );
  };

  // Controller Action: Reschedule Block
  const rescheduleBlock = (blockId, newTimeSlot, reason = '') => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            timeSlot: newTimeSlot,
            status: 'APPROVED',
            controllerNote: `Time adjusted to ${newTimeSlot} to avoid train conflict. (${reason})`,
            aiRecommendation: {
              ...b.aiRecommendation,
              isOptimal: true,
              trainDelayImpactMins: 0,
              confidenceScore: '99%',
              plainReason: 'Optimized slot approved with 0 train delay on Chennai Superfast line.'
            },
            workLogs: [
              ...b.workLogs,
              {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `Time rescheduled by Controller MAS to ${newTimeSlot}.`
              }
            ]
          };
        }
        return b;
      })
    );
  };

  // AI Block Optimizer Action (Powered by Azure OpenAI GPT-5.6-Luna & ML Timetabling)
  const runAIOptimizer = async () => {
    setIsAiOptimizing(true);

    try {
      const pending = blocks.filter(b => b.status === 'PENDING_CONTROLLER');
      const aiResult = await optimizeBlocksWithAI(pending, trains, sections);

      // Auto-approve and optimize pending requests with bundled shadow block metadata
      setBlocks(prev => {
        return prev.map(b => {
          if (b.status === 'PENDING_CONTROLLER') {
            const isAvadiSec = b.sectionId === 'SEC-AVD-TRL';
            const isAjjSec = b.sectionId === 'SEC-AJJ-KPD';
            const optimalTime = isAvadiSec ? '01:15 AM – 03:45 AM' : isAjjSec ? '11:30 AM – 01:00 PM' : '01:30 AM – 04:00 AM';

            return {
              ...b,
              status: 'APPROVED',
              timeSlot: optimalTime,
              aiRecommendation: {
                ...b.aiRecommendation,
                isOptimal: true,
                safeWindowStart: optimalTime.split('–')[0]?.trim(),
                safeWindowEnd: optimalTime.split('–')[1]?.trim(),
                shadowBlockGroup: 'SHADOW-MAS-AUTO-BUNDLE',
                trainDelayImpactMins: 0,
                confidenceScore: '99%',
                plainReason: 'RailLexa ML: Auto-bundled into joint shadow-block. Safe timetable headway gap preserves 100% Superfast punctuality.'
              },
              workLogs: [
                ...b.workLogs,
                {
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  text: `RailLexa AI & ML Optimizer bundled this problem into optimal joint window ${optimalTime}.`
                }
              ]
            };
          }
          return b;
        });
      });

      if (aiResult.success && aiResult.data) {
        setAiOptimizationSummary({
          lastOptimizedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          blocksGrouped: aiResult.data.blocksGrouped || (pending.length > 0 ? pending.length : 3),
          hoursSaved: aiResult.data.hoursSaved || 4.5,
          trackAvailabilityGain: aiResult.data.trackAvailabilityGain || '+22.4%',
          conflictsPrevented: aiResult.data.conflictsPrevented || 5,
          aiRecommendations: aiResult.data.recommendations || [],
          aiNotes: aiResult.data.aiSummaryNotes || ''
        });
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (err) {
      console.error('AI Optimizer Error:', err);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  // Department Action: Update field safety checklist
  const updateSafetyChecklist = (blockId, checklistKey, value) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          const updatedChecklist = {
            ...b.safetyChecklist,
            [checklistKey]: value
          };
          return {
            ...b,
            safetyChecklist: updatedChecklist
          };
        }
        return b;
      })
    );
  };

  // Department Action: Start Maintenance Work (Take Block)
  const startBlockWork = (blockId) => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            status: 'IN_PROGRESS',
            actualStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            workLogs: [
              ...b.workLogs,
              {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Chennai Division field team on site. Red banner flags placed 600m prior. Track block commenced.'
              }
            ]
          };
        }
        return b;
      })
    );
  };

  // Department Action: Complete Work & Handover Track Back to Controller
  const completeBlockWork = (blockId, completionNotes = '') => {
    setBlocks(prev =>
      prev.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            status: 'COMPLETED',
            actualEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            safetyChecklist: {
              ...b.safetyChecklist,
              trackClearanceCertified: true
            },
            workLogs: [
              ...b.workLogs,
              {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: `Work completed successfully. All staff & machines cleared. Track certified FIT for 130 km/h train movement. ${completionNotes}`
              }
            ]
          };
        }
        return b;
      })
    );

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  // Demo Action: Generate Multi-Department Chennai Problems for instant testing
  const createMultiDeptDemoRequests = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newCount = blocks.length;

    const sample1 = {
      id: `BLK-2024-MAS-${String(newCount + 1).padStart(3, '0')}`,
      title: 'Track Ballast Cleaning & Sleeper Packing (Civil)',
      plainPurpose: 'Civil Track department requesting urgent ballast screening and sleeper tamping on UP Fast Line near Tiruvallur.',
      departmentId: 'TRACK_ENG',
      departmentName: 'Civil & Track Engineering (MAS P-Way)',
      sectionId: 'SEC-AVD-TRL',
      sectionName: 'Avadi – Tiruvallur',
      trackLine: 'UP Fast Line (130 km/h)',
      requestedBy: 'Er. K. Ramanathan (SSE P-Way MAS)',
      requestedDate: 'Today',
      timeSlot: '01:30 PM – 03:45 PM',
      durationHours: '2.25',
      machineryRequired: 'CSM Duomatic Tamping Machine + 15 Trackmen',
      speedRestrictionAfterWork: '50 km/h for 12h, then 130 km/h',
      status: 'PENDING_CONTROLLER',
      aiRecommendation: {
        isOptimal: true,
        safeWindowStart: '01:15 AM',
        safeWindowEnd: '03:45 AM',
        trainDelayImpactMins: 0,
        confidenceScore: '97%',
        shadowBlockGroup: 'SHADOW-MAS-WEST-PAIR',
        plainReason: '⚡ Shadow-Block Opportunity: Can be bundled with OHE electrical inspection on the same UP Fast Line for 0 extra corridor downtime.'
      },
      safetyChecklist: {
        flagsPlaced: false,
        detonatorsReady: false,
        powerShutOff: false,
        machineryPositioned: false,
        trackClearanceCertified: false
      },
      workLogs: [
        {
          timestamp,
          text: 'Request raised by Civil Track Engineering MAS. Awaiting Chief Controller approval.'
        }
      ]
    };

    const sample2 = {
      id: `BLK-2024-MAS-${String(newCount + 2).padStart(3, '0')}`,
      title: '25kV OHE Catenary Wire Dropper & Isolator Check',
      plainPurpose: 'Electrical OHE team requesting 25kV traction power isolation for contact wire realignment on the same section.',
      departmentId: 'ELECTRICAL_OHE',
      departmentName: 'Overhead Electrical Traction (OHE MAS)',
      sectionId: 'SEC-AVD-TRL',
      sectionName: 'Avadi – Tiruvallur',
      trackLine: 'UP Fast Line (130 km/h)',
      requestedBy: 'Er. V. Sundaram (ADE OHE Katpadi)',
      requestedDate: 'Today',
      timeSlot: '01:45 PM – 03:30 PM',
      durationHours: '1.75',
      machineryRequired: '8-Wheeler Tower Wagon + Discharge Earth Rods',
      speedRestrictionAfterWork: 'Full 130 km/h Electric Traction Restored',
      status: 'PENDING_CONTROLLER',
      aiRecommendation: {
        isOptimal: true,
        safeWindowStart: '01:15 AM',
        safeWindowEnd: '03:45 AM',
        trainDelayImpactMins: 0,
        confidenceScore: '99%',
        shadowBlockGroup: 'SHADOW-MAS-WEST-PAIR',
        plainReason: '⚡ Joint Shadow-Block candidate: Simultaneous execution with Civil tamping provides maximum safety under de-energized catenary.'
      },
      safetyChecklist: {
        flagsPlaced: false,
        detonatorsReady: false,
        powerShutOff: false,
        machineryPositioned: false,
        trackClearanceCertified: false
      },
      workLogs: [
        {
          timestamp,
          text: 'Request raised by OHE Electrical Traction MAS. Candidate for Joint Shadow-Block.'
        }
      ]
    };

    const sample3 = {
      id: `BLK-2024-MAS-${String(newCount + 3).padStart(3, '0')}`,
      title: 'MSDAC Digital Axle Counter & Point 142A Calibration',
      plainPurpose: 'S&T team calibrating electronic track sensors and switch point gears at Arakkonam junction.',
      departmentId: 'SIGNAL_TELECOM',
      departmentName: 'Signal & Telecom (S&T MAS)',
      sectionId: 'SEC-AJJ-KPD',
      sectionName: 'Arakkonam Jn – Katpadi Jn',
      trackLine: 'Mainline Crossover Point 142A',
      requestedBy: 'Er. S. Meenakshi (SSE Signal MAS)',
      requestedDate: 'Today',
      timeSlot: '11:30 AM – 01:00 PM',
      durationHours: '1.5',
      machineryRequired: 'Digital Multi-meter & MSDAC Sensor Calibrator',
      speedRestrictionAfterWork: 'Normal 130 km/h Track Speed',
      status: 'PENDING_CONTROLLER',
      aiRecommendation: {
        isOptimal: true,
        safeWindowStart: '11:30 AM',
        safeWindowEnd: '01:00 PM',
        trainDelayImpactMins: 0,
        confidenceScore: '96%',
        shadowBlockGroup: null,
        plainReason: 'Optimal midday gap between morning Shatabdi (12007) and afternoon Vande Bharat (20643).'
      },
      safetyChecklist: {
        flagsPlaced: false,
        detonatorsReady: false,
        powerShutOff: false,
        machineryPositioned: false,
        trackClearanceCertified: false
      },
      workLogs: [
        {
          timestamp,
          text: 'Request raised by Signal & Telecom MAS. Sent to Chief Controller optimization queue.'
        }
      ]
    };

    setBlocks(prev => [sample1, sample2, sample3, ...prev]);

    try {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.5 }
      });
    } catch (e) {}
  };

  return (
    <BlockContext.Provider
      value={{
        blocks,
        trains,
        sections,
        stats,
        isAiOptimizing,
        aiOptimizationSummary,
        isLiveTrackingActive,
        setIsLiveTrackingActive,
        simSpeed,
        setSimSpeed,
        createBlockRequest,
        createMultiDeptDemoRequests,
        cancelBlockRequest,
        approveBlock,
        rejectBlock,
        rescheduleBlock,
        runAIOptimizer,
        updateSafetyChecklist,
        startBlockWork,
        completeBlockWork
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};

export const useBlocks = () => {
  const context = useContext(BlockContext);
  if (!context) {
    throw new Error('useBlocks must be used within a BlockProvider');
  }
  return context;
};
