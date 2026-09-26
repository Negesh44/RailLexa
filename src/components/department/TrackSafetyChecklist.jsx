import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBlocks } from '../../context/BlockContext';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Play, Check } from 'lucide-react';

export const TrackSafetyChecklist = () => {
  const { currentUser, userDepartment } = useAuth();
  const { blocks, startBlockWork, completeBlockWork } = useBlocks();

  const [checkedFlags, setCheckedFlags] = useState(false);
  const [checkedPower, setCheckedPower] = useState(false);
  const [checkedMachinery, setCheckedMachinery] = useState(false);
  const [handoverNote, setHandoverNote] = useState('');
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Find approved or in-progress blocks for this department (or all if not filtered)
  const activeOrApprovedBlocks = blocks.filter(
    b => (b.status === 'APPROVED' || b.status === 'IN_PROGRESS') &&
         (!userDepartment || b.departmentId === userDepartment)
  );

  const fallbackBlocks = activeOrApprovedBlocks.length > 0 
    ? activeOrApprovedBlocks 
    : blocks.filter(b => b.status === 'APPROVED' || b.status === 'IN_PROGRESS');

  const [selectedBlockId, setSelectedBlockId] = useState(
    fallbackBlocks[0]?.id || ''
  );

  const selectedBlock = fallbackBlocks.find(b => b.id === selectedBlockId) || fallbackBlocks[0];

  const handleStartWork = () => {
    if (selectedBlock) {
      startBlockWork(selectedBlock.id);
    }
  };

  const handleCompleteHandover = (e) => {
    e.preventDefault();
    if (!checkedFlags || !checkedMachinery) {
      alert('Please check off the mandatory safety verifications first.');
      return;
    }

    if (selectedBlock) {
      completeBlockWork(selectedBlock.id, handoverNote || 'Track cleared and safe for train traffic.');
      setHandoverSuccess(true);
      setTimeout(() => {
        setHandoverSuccess(false);
        setCheckedFlags(false);
        setCheckedPower(false);
        setCheckedMachinery(false);
        setHandoverNote('');
      }, 2500);
    }
  };

  if (!selectedBlock) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 8px' }} />
        <h3 style={{ margin: 0 }}>No Active Work on Track</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '6px 0 0' }}>
          You do not have any currently approved or active maintenance blocks requiring handover right now.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={12} />
            Safety Clearance & Track Handover
          </span>
        </div>
        <h3 style={{ fontSize: '1.2rem', margin: '2px 0 0' }}>Track Handover to Controller</h3>
        <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '2px 0 0' }}>
          Confirm all field safety steps before certifying the line fit for train traffic.
        </p>
      </div>

      {/* Block Selector Dropdown if multiple blocks exist */}
      {fallbackBlocks.length > 1 && (
        <div style={{ marginBottom: '14px' }}>
          <label className="form-label">Select Maintenance Block to Execute / Hand Over:</label>
          <select
            className="form-input"
            value={selectedBlock?.id}
            onChange={(e) => setSelectedBlockId(e.target.value)}
            style={{ fontWeight: 600, color: '#0f172a' }}
          >
            {fallbackBlocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id}: {b.title} ({b.sectionName}) — {b.status === 'IN_PROGRESS' ? '🔴 Active on Track' : '🟢 Approved'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Block Info */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedBlock.title}</strong>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              📍 {selectedBlock.sectionName} ({selectedBlock.trackLine}) • ⏱️ {selectedBlock.timeSlot} • 👤 {selectedBlock.requestedBy}
            </div>
          </div>
          <span className={`badge ${selectedBlock.status === 'IN_PROGRESS' ? 'badge-in-progress' : 'badge-approved'}`}>
            {selectedBlock.status === 'IN_PROGRESS' ? 'Work In Progress' : 'Approved (Ready to Start)'}
          </span>
        </div>
      </div>

      {handoverSuccess ? (
        <div style={{ padding: '32px', textAlign: 'center', background: '#ecfdf5', borderRadius: '10px' }}>
          <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 8px' }} />
          <h4 style={{ margin: 0, color: '#047857' }}>Track Successfully Handed Over!</h4>
          <p style={{ fontSize: '0.825rem', color: '#475569', margin: '4px 0 0' }}>
            Chief Section Controller notified. Line is certified <strong>FIT FOR TRAFFIC (130 km/h)</strong>.
          </p>
        </div>
      ) : selectedBlock.status === 'APPROVED' ? (
        <div style={{ textAlign: 'center', padding: '24px 16px' }}>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
            This maintenance window is approved by the Controller. When your field team is on-site and ready, click below to take the line block.
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleStartWork}>
            <span>Start Work on Track (Take Line Block)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleCompleteHandover}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <label 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '10px 12px', 
                background: checkedFlags ? '#ecfdf5' : '#f8fafc',
                border: checkedFlags ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={checkedFlags}
                onChange={(e) => setCheckedFlags(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.825rem', color: '#0f172a' }}>
                🚩 <strong>Caution Boards & Detonators:</strong> Red flags removed and detonators safely retrieved.
              </span>
            </label>

            <label 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '10px 12px', 
                background: checkedPower ? '#ecfdf5' : '#f8fafc',
                border: checkedPower ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={checkedPower}
                onChange={(e) => setCheckedPower(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.825rem', color: '#0f172a' }}>
                ⚡ <strong>OHE Traction Power / Earthing:</strong> Earth discharge rods removed; power line clear.
              </span>
            </label>

            <label 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '10px 12px', 
                background: checkedMachinery ? '#ecfdf5' : '#f8fafc',
                border: checkedMachinery ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={checkedMachinery}
                onChange={(e) => setCheckedMachinery(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.825rem', color: '#0f172a' }}>
                🚜 <strong>Track Cleared of Machinery:</strong> All tools, machines, and personnel cleared from track fouling mark.
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Remarks</label>
            <input
              type="text"
              className="form-input"
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              placeholder="e.g. Work completed successfully. Line fit for 130 km/h traffic."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="submit"
              className="btn btn-success btn-lg"
              disabled={!checkedFlags || !checkedMachinery}
            >
              <CheckCircle2 size={16} />
              <span>Handover Track to Controller (Line Fit)</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
