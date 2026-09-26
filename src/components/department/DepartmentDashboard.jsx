import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBlocks } from '../../context/BlockContext';
import { RequestBlockForm } from './RequestBlockForm';
import { TrackSafetyChecklist } from './TrackSafetyChecklist';
import { MapView } from '../MapView';
import { DEPARTMENTS } from '../../data/credentials';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Wrench,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const CANCELLATION_PRESETS = [
  { id: 'MACHINERY', label: '🚜 Urgent Machinery breakdown / maintenance diversion' },
  { id: 'WEATHER', label: '🌧️ Adverse weather / heavy rainfall / visibility restrictions' },
  { id: 'MATERIALS', label: '📦 Material & spare parts logistical delay (ballast, catenary, relays)' },
  { id: 'CREW', label: '👥 Field crew & gang emergency shift reassignment' },
  { id: 'RESCHEDULE', label: '🔁 Maintenance window rescheduled to upcoming weekend mega-block' },
  { id: 'CUSTOM', label: '📝 Custom Departmental Reason' }
];

export const DepartmentDashboard = () => {
  const { currentUser, userDepartment, showNotification } = useAuth();
  const { blocks, cancelBlockRequest } = useBlocks();

  const [activeTab, setActiveTab] = useState('SUBMIT_REQUEST'); // SUBMIT_REQUEST, MY_BLOCKS, SAFETY_HANDOVER, MAP_VIEW
  const [myBlocksFilter, setMyBlocksFilter] = useState('ALL'); // ALL, PENDING, APPROVED, CANCELLED, ACTIVE
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Cancellation Modal State
  const [cancelModalBlock, setCancelModalBlock] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(CANCELLATION_PRESETS[0].label);
  const [customReason, setCustomReason] = useState('');
  const [cancellationRemarks, setCancellationRemarks] = useState('');

  const deptInfo = DEPARTMENTS[userDepartment] || {
    name: 'Railway Maintenance Dept',
    id: userDepartment
  };

  const myDeptBlocks = blocks.filter(b => b.departmentId === userDepartment);
  const pendingCount = myDeptBlocks.filter(b => b.status === 'PENDING_CONTROLLER').length;
  const approvedCount = myDeptBlocks.filter(b => b.status === 'APPROVED').length;
  const inProgressCount = myDeptBlocks.filter(b => b.status === 'IN_PROGRESS').length;
  const completedCount = myDeptBlocks.filter(b => b.status === 'COMPLETED').length;
  const cancelledCount = myDeptBlocks.filter(b => b.status === 'CANCELLED').length;

  const filteredBlocks = myDeptBlocks.filter(b => {
    if (myBlocksFilter === 'PENDING') return b.status === 'PENDING_CONTROLLER';
    if (myBlocksFilter === 'APPROVED') return b.status === 'APPROVED';
    if (myBlocksFilter === 'CANCELLED') return b.status === 'CANCELLED';
    if (myBlocksFilter === 'ACTIVE') return b.status === 'IN_PROGRESS';
    return true;
  });

  const handleOpenCancelModal = (block) => {
    setCancelModalBlock(block);
    setSelectedPreset(CANCELLATION_PRESETS[0].label);
    setCustomReason('');
    setCancellationRemarks('');
  };

  const handleConfirmCancellation = () => {
    if (!cancelModalBlock) return;

    const finalReason = selectedPreset.includes('Custom') 
      ? (customReason.trim() || 'Withdrawn by Department Field Engineer')
      : selectedPreset;

    const engineerName = currentUser?.name || cancelModalBlock.requestedBy || 'Field Engineer';

    cancelBlockRequest(
      cancelModalBlock.id,
      finalReason,
      engineerName,
      cancellationRemarks
    );

    if (showNotification) {
      showNotification(`🚫 Block request "${cancelModalBlock.title}" has been cancelled & withdrawn. Corridor window released back to division timetable.`, 'info');
    }

    setCancelModalBlock(null);
    setMyBlocksFilter('ALL');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
              <Wrench size={12} />
              {deptInfo.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>• {currentUser.division}</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{deptInfo.name} Portal</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
            Request track possession windows, manage cancellations & processed reviews, and execute field safety handovers.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setActiveTab('SUBMIT_REQUEST')}
        >
          <PlusCircle size={16} />
          <span>New Block Request</span>
        </button>
      </div>

      {/* 5 Clean Stats Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div 
          className="stat-card" 
          style={{ cursor: 'pointer', padding: '14px 16px' }}
          onClick={() => { setActiveTab('MY_BLOCKS'); setMyBlocksFilter('PENDING'); }}
          title="Click to view Pending Requests"
        >
          <div className="stat-icon-wrapper stat-icon-amber" style={{ width: '36px', height: '36px' }}>
            <Clock size={18} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.75rem' }}>Pending Review</h4>
            <div className="stat-value" style={{ color: '#d97706', fontSize: '1.3rem' }}>{pendingCount}</div>
            <div className="stat-subtext" style={{ fontSize: '0.7rem' }}>Awaiting controller</div>
          </div>
        </div>

        <div 
          className="stat-card" 
          style={{ cursor: 'pointer', padding: '14px 16px' }}
          onClick={() => { setActiveTab('MY_BLOCKS'); setMyBlocksFilter('APPROVED'); }}
          title="Click to view Approved Slots"
        >
          <div className="stat-icon-wrapper stat-icon-green" style={{ width: '36px', height: '36px' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.75rem' }}>Approved Slots</h4>
            <div className="stat-value" style={{ color: '#059669', fontSize: '1.3rem' }}>{approvedCount}</div>
            <div className="stat-subtext" style={{ fontSize: '0.7rem' }}>Ready for execution</div>
          </div>
        </div>

        <div 
          className="stat-card" 
          style={{ cursor: 'pointer', padding: '14px 16px' }}
          onClick={() => { setActiveTab('SAFETY_HANDOVER'); }}
          title="Click to view Safety Handover"
        >
          <div className="stat-icon-wrapper stat-icon-red" style={{ width: '36px', height: '36px' }}>
            <AlertTriangle size={18} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.75rem' }}>Active on Track</h4>
            <div className="stat-value" style={{ color: '#dc2626', fontSize: '1.3rem' }}>{inProgressCount}</div>
            <div className="stat-subtext" style={{ fontSize: '0.7rem' }}>Crew working now</div>
          </div>
        </div>

        <div 
          className="stat-card" 
          style={{ cursor: 'pointer', padding: '14px 16px' }}
          onClick={() => { setActiveTab('MY_BLOCKS'); setMyBlocksFilter('CANCELLED'); }}
          title="Click to view Cancelled / Withdrawn Requests"
        >
          <div className="stat-icon-wrapper" style={{ width: '36px', height: '36px', background: '#f1f5f9', color: '#475569' }}>
            <XCircle size={18} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.75rem' }}>Cancelled / Withdrawn</h4>
            <div className="stat-value" style={{ color: '#475569', fontSize: '1.3rem' }}>{cancelledCount}</div>
            <div className="stat-subtext" style={{ fontSize: '0.7rem' }}>Reviews Processed</div>
          </div>
        </div>

        <div 
          className="stat-card" 
          style={{ cursor: 'pointer', padding: '14px 16px' }}
          onClick={() => { setActiveTab('MY_BLOCKS'); setMyBlocksFilter('ALL'); }}
          title="Click to view Completed Handovers"
        >
          <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '36px', height: '36px' }}>
            <ShieldCheck size={18} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.75rem' }}>Completed Handover</h4>
            <div className="stat-value" style={{ color: '#1d4ed8', fontSize: '1.3rem' }}>{completedCount}</div>
            <div className="stat-subtext" style={{ fontSize: '0.7rem' }}>Returned safe to traffic</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'SUBMIT_REQUEST' ? 'active' : ''}`}
          onClick={() => setActiveTab('SUBMIT_REQUEST')}
        >
          <PlusCircle size={16} />
          <span>Submit Request</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'MY_BLOCKS' ? 'active' : ''}`}
          onClick={() => setActiveTab('MY_BLOCKS')}
        >
          <span>My Requests ({myDeptBlocks.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'SAFETY_HANDOVER' ? 'active' : ''}`}
          onClick={() => setActiveTab('SAFETY_HANDOVER')}
        >
          <ShieldCheck size={16} />
          <span>Field Safety & Handover</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'MAP_VIEW' ? 'active' : ''}`}
          onClick={() => setActiveTab('MAP_VIEW')}
        >
          <MapPin size={16} />
          <span>Live Map</span>
        </button>
      </div>

      {/* TAB 1: SUBMIT REQUEST */}
      {activeTab === 'SUBMIT_REQUEST' && (
        <RequestBlockForm onSuccess={() => setActiveTab('MY_BLOCKS')} />
      )}

      {/* TAB 2: MY BLOCKS */}
      {activeTab === 'MY_BLOCKS' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0f2942' }}>
                {deptInfo.name} Maintenance Requests ({myDeptBlocks.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                Track possession requests, cancel/withdraw slots with processed review records, and view audit timelines.
              </p>
            </div>

            {/* Sub-Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${myBlocksFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMyBlocksFilter('ALL')}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                All ({myDeptBlocks.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${myBlocksFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMyBlocksFilter('PENDING')}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${myBlocksFilter === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMyBlocksFilter('APPROVED')}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Approved ({approvedCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${myBlocksFilter === 'CANCELLED' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMyBlocksFilter('CANCELLED')}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Cancelled / Withdrawn ({cancelledCount})
              </button>
            </div>
          </div>
          
          {filteredBlocks.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No requests match the selected filter.</p>
              {myBlocksFilter !== 'ALL' && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ marginTop: '10px' }}
                  onClick={() => setMyBlocksFilter('ALL')}
                >
                  Show All Requests
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredBlocks.map(block => {
                const isPending = block.status === 'PENDING_CONTROLLER';
                const isApproved = block.status === 'APPROVED';
                const isInProgress = block.status === 'IN_PROGRESS';
                const isCompleted = block.status === 'COMPLETED';
                const isCancelled = block.status === 'CANCELLED';
                const isLogsExpanded = expandedLogId === block.id;

                return (
                  <div
                    key={block.id}
                    style={{
                      border: isCancelled ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '16px 18px',
                      background: isCancelled ? '#fafafa' : '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    {/* Top Row: Title, Badges & Actions */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.98rem', color: isCancelled ? '#475569' : '#0f172a' }}>
                            {block.title}
                          </strong>
                          <span className={`badge ${
                            isPending ? 'badge-pending' : 
                            isApproved ? 'badge-approved' : 
                            isInProgress ? 'badge-in-progress' : 
                            isCancelled ? 'badge-cancelled' : 'badge-completed'
                          }`}>
                            {isPending ? '⏳ Awaiting Controller Review' : 
                             isApproved ? '✓ Approved by Controller' : 
                             isInProgress ? '🔴 Active on Track' : 
                             isCancelled ? '🚫 Cancelled / Withdrawn' : '✓ Handover Completed'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            ID: {block.id}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                          📍 <strong>{block.sectionName}</strong> • {block.trackLine} • ⏱️ Slot: <strong>{block.timeSlot}</strong> ({block.durationHours} hrs)
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
                          {block.plainPurpose}
                        </p>
                      </div>

                      {/* Action Buttons for Department */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {/* Cancellation button available for PENDING and APPROVED requests */}
                        {(isPending || isApproved) && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ 
                              color: '#dc2626', 
                              borderColor: '#fca5a5', 
                              padding: '5px 10px', 
                              fontSize: '0.78rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenCancelModal(block)}
                            title="Withdraw / Cancel this maintenance block request"
                          >
                            <XCircle size={14} />
                            <span>Cancel Request</span>
                          </button>
                        )}

                        {(isApproved || isInProgress) && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                            onClick={() => setActiveTab('SAFETY_HANDOVER')}
                          >
                            <span>Safety Handover →</span>
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '5px 8px', color: '#64748b' }}
                          onClick={() => setExpandedLogId(isLogsExpanded ? null : block.id)}
                          title="View audit logs and timeline"
                        >
                          <FileText size={13} />
                          <span>Audit Trail</span>
                          {isLogsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* PROCESSED CANCELLATION REVIEW BANNER */}
                    {isCancelled && (
                      <div 
                        style={{ 
                          background: '#f8fafc', 
                          border: '1px solid #e2e8f0', 
                          borderLeft: '4px solid #64748b', 
                          borderRadius: '8px', 
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                            <span style={{ color: '#dc2626' }}>🚫 Cancellation Processed</span>
                            <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              ✓ Review Status: PROCESSED & AUDITED
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Withdrawn by: <strong>{block.cancellation?.cancelledBy || block.requestedBy}</strong> ({block.cancellation?.cancelledAt || 'Recently'})
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                          <strong>Reason for Cancellation:</strong> {block.cancellation?.reason || 'Withdrawn by Department Field Engineer'}
                        </div>

                        {block.cancellation?.remarks && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                            <strong>Engineer Remarks:</strong> {block.cancellation.remarks}
                          </div>
                        )}

                        <div style={{ fontSize: '0.74rem', color: '#047857', background: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} color="#059669" />
                          <span>
                            <strong>Corridor Restored:</strong> Track possession window ({block.cancellation?.slotReleased || block.timeSlot}) released back to Chennai Division master clock. Zero delay to passenger trains.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* EXPANDABLE AUDIT LOGS & WORK TIMELINE */}
                    {isLogsExpanded && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginTop: '4px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={13} />
                          <span>Activity & Authorization Audit Logs</span>
                        </div>
                        {(!block.workLogs || block.workLogs.length === 0) ? (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No log entries recorded.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {block.workLogs.map((log, index) => (
                              <div key={index} style={{ fontSize: '0.75rem', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ color: '#64748b', fontWeight: 600, minWidth: '60px' }}>[{log.timestamp}]</span>
                                <span>{log.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAFETY HANDOVER */}
      {activeTab === 'SAFETY_HANDOVER' && (
        <TrackSafetyChecklist />
      )}

      {/* TAB 4: MAP VIEW */}
      {activeTab === 'MAP_VIEW' && (
        <MapView height="520px" />
      )}

      {/* CANCELLATION MODAL */}
      {cancelModalBlock && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <XCircle size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f2942' }}>Withdraw Block Request</h3>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0 0 14px' }}>
              Cancel maintenance slot for <strong>{cancelModalBlock.title}</strong> on <strong>{cancelModalBlock.sectionName}</strong> ({cancelModalBlock.timeSlot}).
            </p>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                Select Departmental Cancellation Reason:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {CANCELLATION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset.label)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      fontSize: '0.78rem',
                      background: selectedPreset === preset.label ? '#eff6ff' : '#ffffff',
                      borderColor: selectedPreset === preset.label ? '#3b82f6' : '#e2e8f0',
                      borderWidth: selectedPreset === preset.label ? '2px' : '1px',
                      color: selectedPreset === preset.label ? '#1d4ed8' : '#334155'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {selectedPreset.includes('Custom') && (
                <div style={{ marginTop: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569' }}>Specify Custom Reason:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter reason for withdrawing maintenance request..."
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              )}

              <div style={{ marginTop: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569' }}>Additional Engineer Remarks / Next Planned Window (Optional):</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={cancellationRemarks}
                  onChange={(e) => setCancellationRemarks(e.target.value)}
                  placeholder="e.g. Rescheduling to tomorrow midnight shift once spares arrive."
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
              <span>
                Releasing this slot will instantly notify the Chief Controller and mark the cancellation review as <strong>PROCESSED</strong>.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setCancelModalBlock(null)}
              >
                Keep Request
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                onClick={handleConfirmCancellation}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <XCircle size={15} />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

