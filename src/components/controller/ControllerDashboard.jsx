import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBlocks } from '../../context/BlockContext';
import { AIBlockOptimizer } from './AIBlockOptimizer';
import { TrainDelayImpact } from './TrainDelayImpact';
import { LiveTrainTracker } from '../live/LiveTrainTracker';
import { MapView } from '../MapView';
import { DEPARTMENTS } from '../../data/credentials';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  MapPin, 
  Train, 
  Activity, 
  Check, 
  X, 
  Calendar,
  Layers,
  MapPinned,
  ChevronRight,
  User,
  Wrench,
  Hammer,
  Radio,
  Zap,
  Cog,
  Filter,
  Search,
  CheckCheck,
  AlertCircle
} from 'lucide-react';

const DEPT_ICONS = {
  TRACK_ENG: Hammer,
  SIGNAL_TELECOM: Radio,
  ELECTRICAL_OHE: Zap,
  MECHANICAL: Cog
};

const DEPT_BADGE_CLASSES = {
  TRACK_ENG: 'badge-track',
  SIGNAL_TELECOM: 'badge-signal',
  ELECTRICAL_OHE: 'badge-ohe',
  MECHANICAL: 'badge-mech'
};

export const ControllerDashboard = () => {
  const { currentUser, showNotification } = useAuth();
  const { 
    blocks, 
    stats, 
    approveBlock, 
    rejectBlock, 
    rescheduleBlock, 
    runAIOptimizer,
    createMultiDeptDemoRequests 
  } = useBlocks();

  const [activeTab, setActiveTab] = useState('APPROVAL_HUB'); // APPROVAL_HUB, AI_OPTIMIZER, MAP_VIEW, TRAFFIC_VIEW
  const [selectedBlockForMap, setSelectedBlockForMap] = useState(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING, CANCELLED
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Modals
  const [rejectModalBlock, setRejectModalBlock] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rescheduleModalBlock, setRescheduleModalBlock] = useState(null);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const pendingBlocks = blocks.filter(b => b.status === 'PENDING_CONTROLLER');
  const approvedBlocks = blocks.filter(b => b.status === 'APPROVED');
  const inProgressBlocks = blocks.filter(b => b.status === 'IN_PROGRESS');
  const cancelledBlocks = blocks.filter(b => b.status === 'CANCELLED');

  const activeDisplayList = statusFilter === 'CANCELLED' ? cancelledBlocks : pendingBlocks;

  const filteredDisplayBlocks = activeDisplayList.filter(b => {
    const matchDept = selectedDeptFilter === 'ALL' || b.departmentId === selectedDeptFilter;
    const matchSearch = !searchQuery || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchSearch;
  });

  const handleApprove = (blockId) => {
    approveBlock(blockId, 'Approved by Controller for scheduled window.');
    if (showNotification) {
      showNotification('✅ Maintenance block approved and locked into Chennai division timetable.', 'success');
    }
  };

  const handleApproveAll = () => {
    pendingBlocks.forEach(b => {
      approveBlock(b.id, 'Batch approved by Chief Traffic Controller MAS.');
    });
    if (showNotification) {
      showNotification(`✅ Batch approved ${pendingBlocks.length} maintenance blocks.`, 'success');
    }
  };

  const handleOpenReject = (block) => {
    setRejectModalBlock(block);
    setRejectReason('High train traffic priority during requested slot. Please request an alternative night window.');
  };

  const handleConfirmReject = () => {
    if (rejectModalBlock) {
      rejectBlock(rejectModalBlock.id, rejectReason);
      if (showNotification) {
        showNotification(`Declined block "${rejectModalBlock.title}". Engineer notified.`, 'info');
      }
      setRejectModalBlock(null);
    }
  };

  const handleOpenReschedule = (block) => {
    setRescheduleModalBlock(block);
    setNewTimeSlot(block.recommendedSlot || (block.timeSlot ? block.timeSlot : '01:15 AM – 03:45 AM'));
    setRescheduleReason('Shifted to optimal night low-traffic window to eliminate train delay.');
  };

  const handleConfirmReschedule = () => {
    if (rescheduleModalBlock && newTimeSlot.trim()) {
      rescheduleBlock(rescheduleModalBlock.id, newTimeSlot.trim(), rescheduleReason);
      if (showNotification) {
        showNotification(`✅ Rescheduled "${rescheduleModalBlock.title}" to ${newTimeSlot.trim()}!`, 'success');
      }
      setRescheduleModalBlock(null);
      setRescheduleReason('');
    }
  };

  // Helper to find potential shadow-block companion on the same section
  const findShadowBlockPartner = (currentBlock) => {
    return blocks.find(
      b => b.id !== currentBlock.id &&
           b.sectionId === currentBlock.sectionId &&
           b.status !== 'REJECTED' &&
           b.status !== 'COMPLETED'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Executive Header Banner */}
      <div 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span className="badge badge-approved" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
              <ShieldCheck size={13} />
              Traffic Controller Console
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>• {currentUser.division}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#0f2942' }}>
            Chennai Division Traffic Control & Block Authorization Hub
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={createMultiDeptDemoRequests}
            style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
            title="Simulate 3 different departments (Track, S&T, OHE) submitting block requests simultaneously"
          >
            <Sparkles size={14} />
            <span>+ Spawn Multi-Dept Issues</span>
          </button>

          {pendingBlocks.length > 0 && (
            <button
              className="btn btn-ai btn-sm"
              onClick={runAIOptimizer}
              title="Auto-bundle all pending issues with AI and approve optimal slots"
            >
              <Sparkles size={14} />
              <span>Auto-Bundle with AI</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Clean High-Importance Railway Counters */}
      <div className="grid-4">
        <div 
          className="stat-card" 
          style={{ padding: '14px 18px', cursor: 'pointer' }}
          onClick={() => setActiveTab('APPROVAL_HUB')}
          title="Click to view Pending Approvals"
        >
          <div className="stat-icon-wrapper stat-icon-amber" style={{ width: '40px', height: '40px' }}>
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Pending Approvals</h4>
            <div className="stat-value" style={{ fontSize: '1.4rem', color: '#d97706', fontWeight: 800 }}>
              {pendingBlocks.length} Requests
            </div>
            <div className="stat-subtext" style={{ fontSize: '0.725rem', color: '#64748b' }}>Awaiting Controller Clearance</div>
          </div>
        </div>

        <div 
          className="stat-card" 
          style={{ padding: '14px 18px', cursor: 'pointer' }}
          onClick={() => setActiveTab('MAP_VIEW')}
          title="Click to view Active Blocks on Map"
        >
          <div className="stat-icon-wrapper stat-icon-red" style={{ width: '40px', height: '40px' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Active Work on Line</h4>
            <div className="stat-value" style={{ fontSize: '1.4rem', color: '#dc2626', fontWeight: 800 }}>
              {inProgressBlocks.length} Track Blocks
            </div>
            <div className="stat-subtext" style={{ fontSize: '0.725rem', color: '#64748b' }}>Possessions Active Now</div>
          </div>
        </div>

        <div 
          className="stat-card" 
          style={{ padding: '14px 18px', cursor: 'pointer' }}
          onClick={() => setActiveTab('AI_OPTIMIZER')}
          title="Click to view Hours Saved by Bundling"
        >
          <div className="stat-icon-wrapper stat-icon-green" style={{ width: '40px', height: '40px' }}>
            <Sparkles size={20} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Hours Saved by AI</h4>
            <div className="stat-value" style={{ fontSize: '1.4rem', color: '#059669', fontWeight: 800 }}>
              4.5 Hours
            </div>
            <div className="stat-subtext" style={{ fontSize: '0.725rem', color: '#64748b' }}>Saved via Joint Shadow-Blocks</div>
          </div>
        </div>

        <div 
          className="stat-card" 
          style={{ padding: '14px 18px', cursor: 'pointer' }}
          onClick={() => setActiveTab('TRAFFIC_VIEW')}
          title="Click to view Express Trains & Delay Status"
        >
          <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '40px', height: '40px' }}>
            <Train size={20} />
          </div>
          <div className="stat-content">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Superfast Trains</h4>
            <div className="stat-value" style={{ fontSize: '1.4rem', color: '#1d4ed8', fontWeight: 800 }}>
              {stats.activeTrainsRunning} Running
            </div>
            <div className="stat-subtext" style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 700 }}>100% On-Time (0 Delays)</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'APPROVAL_HUB' ? 'active' : ''}`}
          onClick={() => setActiveTab('APPROVAL_HUB')}
        >
          <CheckCircle2 size={15} />
          <span>Approvals Hub ({pendingBlocks.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'AI_OPTIMIZER' ? 'active' : ''}`}
          onClick={() => setActiveTab('AI_OPTIMIZER')}
        >
          <Sparkles size={15} />
          <span>AI Block Optimizer</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'MAP_VIEW' ? 'active' : ''}`}
          onClick={() => setActiveTab('MAP_VIEW')}
        >
          <MapPin size={15} />
          <span>Chennai Live Map</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'TRAFFIC_VIEW' ? 'active' : ''}`}
          onClick={() => setActiveTab('TRAFFIC_VIEW')}
        >
          <Train size={15} />
          <span>Train Telemetry & Delays</span>
        </button>
      </div>

      {/* TAB 1: OPTIMIZED APPROVAL HUB */}
      {activeTab === 'APPROVAL_HUB' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Card Container for Incoming Requests */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0f2942' }}>
                  {statusFilter === 'CANCELLED' 
                    ? `Processed Department Cancellations & Withdrawals (${cancelledBlocks.length})` 
                    : `Incoming Track Block Requests (${pendingBlocks.length})`}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                  {statusFilter === 'CANCELLED'
                    ? 'Review processed withdrawal notices from field departments. Released corridor windows are automatically returned to the division master timetable.'
                    : 'Authorize possession windows, synchronize multi-department joint shadow-blocks, and eliminate express train conflicts.'}
                </p>
              </div>

              {/* Status Switcher (Pending vs Cancelled/Withdrawn) & Quick Batch Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setStatusFilter('PENDING')}
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  >
                    Pending Queue ({pendingBlocks.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${statusFilter === 'CANCELLED' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setStatusFilter('CANCELLED')}
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  >
                    Withdrawn / Cancelled ({cancelledBlocks.length})
                  </button>
                </div>

                {statusFilter === 'PENDING' && pendingBlocks.length > 0 && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleApproveAll}
                    style={{ fontSize: '0.785rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <CheckCheck size={14} />
                    <span>Approve All ({pendingBlocks.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', marginBottom: '16px' }}>
              {/* Department Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${selectedDeptFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedDeptFilter('ALL')}
                >
                  All Depts ({activeDisplayList.length})
                </button>
                {Object.values(DEPARTMENTS).map(dept => {
                  const count = activeDisplayList.filter(b => b.departmentId === dept.id).length;
                  const IconComp = DEPT_ICONS[dept.id] || Wrench;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      className={`btn btn-sm ${selectedDeptFilter === dept.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedDeptFilter(dept.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IconComp size={12} />
                      <span>{dept.shortName} ({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '220px' }}>
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search section, title or engineer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '5px 10px', fontSize: '0.8rem', width: '100%' }}
                />
              </div>
            </div>

            {filteredDisplayBlocks.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
                <CheckCircle2 size={38} color="#059669" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ margin: 0, color: '#0f172a' }}>
                  {statusFilter === 'CANCELLED'
                    ? (selectedDeptFilter === 'ALL' ? 'No Cancelled Requests on Record' : 'No Cancelled Requests for Selected Department')
                    : (selectedDeptFilter === 'ALL' ? 'All Department Requests Cleared' : `No Pending Requests for Selected Department`)}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>
                  {statusFilter === 'CANCELLED'
                    ? 'All departmental maintenance requests are actively scheduled or in progress.'
                    : (selectedDeptFilter === 'ALL'
                        ? 'No pending maintenance block requests requiring your review.'
                        : 'Switch filters or click "+ Spawn Multi-Dept Issues" above to test new requests.')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '14px' }}>
                {filteredDisplayBlocks.map((block) => {
                  const shadowPartner = findShadowBlockPartner(block);
                  const IconComp = DEPT_ICONS[block.departmentId] || Wrench;
                  const badgeClass = DEPT_BADGE_CLASSES[block.departmentId] || 'badge-pending';
                  const isCancelled = block.status === 'CANCELLED';
                  const isLogsExpanded = expandedLogId === block.id;

                  if (isCancelled) {
                    return (
                      <div 
                        key={block.id} 
                        className="approval-card" 
                        style={{ 
                          background: '#ffffff', 
                          border: '1px solid #cbd5e1', 
                          padding: '18px 20px', 
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          gap: '12px'
                        }}
                      >
                        <div>
                          {/* Header: Dept Badge & Withdrawn Slot */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            <span className={`badge ${badgeClass}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '4px 10px' }}>
                              <IconComp size={14} />
                              <strong>{block.departmentName}</strong>
                            </span>
                            <span className="badge badge-cancelled" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                              🚫 Withdrawn by Department
                            </span>
                          </div>

                          {/* Title & Section */}
                          <div style={{ marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '1.02rem', color: '#334155', margin: '0 0 4px', fontWeight: 700 }}>
                              {block.title}
                            </h4>
                            <div style={{ fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 600, marginBottom: '6px' }}>
                              📍 {block.sectionName} • <span style={{ color: '#64748b' }}>{block.trackLine}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px', lineHeight: 1.4 }}>
                              {block.plainPurpose}
                            </p>
                          </div>

                          {/* Processed Review Card for Controller */}
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#334155' }}>
                              <span style={{ fontWeight: 700, color: '#047857' }}>✓ Review Status: PROCESSED & AUDITED</span>
                              <span style={{ color: '#64748b' }}>Withdrawn at: <strong>{block.cancellation?.cancelledAt || 'Recently'}</strong></span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                              <strong>Reason for Withdrawal:</strong> {block.cancellation?.reason || 'Withdrawn by Department Field Engineer'}
                            </div>
                            {block.cancellation?.remarks && (
                              <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic' }}>
                                <strong>Remarks:</strong> {block.cancellation.remarks}
                              </div>
                            )}
                            <div style={{ fontSize: '0.74rem', color: '#047857', background: '#f0fdf4', padding: '3px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={13} color="#059669" />
                              <span>
                                <strong>Corridor Freed:</strong> Slot <strong>{block.cancellation?.slotReleased || block.timeSlot}</strong> restored to timetable (0 delay impact).
                              </span>
                            </div>
                          </div>

                          {/* Expandable Audit Log */}
                          {isLogsExpanded && (
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Audit Trail:</div>
                              {block.workLogs?.map((log, i) => (
                                <div key={i} style={{ fontSize: '0.73rem', color: '#334155', marginTop: '2px' }}>
                                  <span style={{ color: '#64748b' }}>[{log.timestamp}]</span> {log.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer info & Audit Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            👤 <strong>Engineer:</strong> {block.cancellation?.cancelledBy || block.requestedBy}
                          </span>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                            onClick={() => setExpandedLogId(isLogsExpanded ? null : block.id)}
                          >
                            <FileText size={12} />
                            <span>{isLogsExpanded ? 'Hide Logs' : 'View Audit Logs'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={block.id} 
                      className="approval-card" 
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        padding: '18px 20px', 
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        gap: '12px'
                      }}
                    >
                      <div>
                        {/* Header: Dept Badge & Requested Window */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                          <span className={`badge ${badgeClass}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '4px 10px' }}>
                            <IconComp size={14} />
                            <strong>{block.departmentName}</strong>
                          </span>
                          <span style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                            ⏰ {block.timeSlot} ({block.durationHours} hrs)
                          </span>
                        </div>

                        {/* Title & Location */}
                        <div style={{ marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', margin: '0 0 4px', fontWeight: 800 }}>{block.title}</h4>
                          <div style={{ fontSize: '0.82rem', color: '#1d4ed8', fontWeight: 700, marginBottom: '6px' }}>
                            📍 {block.sectionName} • <span style={{ color: '#475569' }}>{block.trackLine}</span>
                          </div>
                          <p style={{ fontSize: '0.825rem', color: '#334155', margin: '0 0 8px', lineHeight: 1.45 }}>{block.plainPurpose}</p>
                          
                          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                            <span>👤 <strong>Engineer:</strong> {block.requestedBy}</span>
                            <span>🚜 <strong>Machine:</strong> {block.machineryRequired}</span>
                          </div>
                        </div>

                        {/* Joint Shadow-Block Notice if another block exists on same section */}
                        {shadowPartner && (
                          <div style={{ 
                            background: '#fdf4ff', 
                            border: '1px solid #f0abfc', 
                            borderRadius: '8px', 
                            padding: '8px 12px', 
                            margin: '8px 0',
                            fontSize: '0.78rem',
                            color: '#86198f',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <Sparkles size={15} color="#a21caf" style={{ flexShrink: 0 }} />
                            <span>
                              <strong>Joint Shadow-Block:</strong> Bundles with <strong>{shadowPartner.departmentName}</strong> on {block.sectionName} for 0 extra line downtime!
                            </span>
                          </div>
                        )}

                        {/* AI Headway Safety Pill */}
                        <div style={{ 
                          background: '#f0fdf4', 
                          border: '1px solid #bbf7d0', 
                          borderRadius: '8px', 
                          padding: '8px 12px', 
                          margin: '6px 0',
                          fontSize: '0.78rem',
                          color: '#166534',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}>
                          <ShieldCheck size={16} color="#166534" style={{ flexShrink: 0, marginTop: '1px' }} />
                          <span>
                            <strong>AI Safety Check:</strong> {block.aiRecommendation.plainReason}
                          </span>
                        </div>
                      </div>

                      {/* Clear Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenReject(block)}
                          title="Decline request"
                        >
                          <X size={14} />
                          <span>Decline</span>
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenReschedule(block)}
                          title="Adjust time window"
                        >
                          <Calendar size={14} />
                          <span>Reschedule</span>
                        </button>

                        <button
                          className="btn btn-success btn-sm"
                          style={{ padding: '7px 16px', fontSize: '0.82rem', fontWeight: 700 }}
                          onClick={() => handleApprove(block.id)}
                          title="Approve this maintenance slot"
                        >
                          <Check size={15} />
                          <span>Approve Slot</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Currently Active Maintenance Blocks */}
          {inProgressBlocks.length > 0 && (
            <div className="card" style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#991b1b' }}>
                  🔴 Currently Active Track Blocks ({inProgressBlocks.length})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {inProgressBlocks.map(block => (
                  <div
                    key={block.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#991b1b' }}>{block.title}</strong>
                        <span className="badge badge-in-progress" style={{ fontSize: '0.65rem' }}>Line Closed (TSR 50 km/h)</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        📍 {block.sectionName} ({block.trackLine}) • ⏰ Window: <strong>{block.timeSlot}</strong>
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedBlockForMap(block.id);
                        setActiveTab('MAP_VIEW');
                      }}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <MapPin size={12} />
                      <span>View on Map</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved & Scheduled Maintenance Blocks */}
          {approvedBlocks.length > 0 && (
            <div className="card" style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#166534" />
                  <span>Approved & Scheduled Blocks ({approvedBlocks.length})</span>
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ready for field execution & safety handover</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '10px' }}>
                {approvedBlocks.map(block => (
                  <div
                    key={block.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#14532d' }}>{block.title}</strong>
                        <span className="badge badge-approved" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          Approved ✓
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '3px' }}>
                        📍 {block.sectionName} • ⏰ Locked Slot: <strong>{block.timeSlot}</strong>
                      </div>
                      {block.controllerNote && (
                        <div style={{ fontSize: '0.72rem', color: '#4b5563', fontStyle: 'italic', marginTop: '3px' }}>
                          Note: {block.controllerNote}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                        onClick={() => handleOpenReschedule(block)}
                        title="Re-adjust time slot"
                      >
                        <Calendar size={12} />
                        <span>Reschedule</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                        onClick={() => {
                          setSelectedBlockForMap(block.id);
                          setActiveTab('MAP_VIEW');
                        }}
                      >
                        <MapPin size={12} />
                        <span>Map</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI BLOCK OPTIMIZER */}
      {activeTab === 'AI_OPTIMIZER' && (
        <AIBlockOptimizer />
      )}

      {/* TAB 3: CHENNAI LIVE MAP */}
      {activeTab === 'MAP_VIEW' && (
        <div className="card">
          <MapView selectedBlockId={selectedBlockForMap} height="600px" />
        </div>
      )}

      {/* TAB 4: LIVE TRAIN TRACKER & TELEMETRY */}
      {activeTab === 'TRAFFIC_VIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* apiss-main Live Train Status & Station Itinerary Tracker */}
          <LiveTrainTracker />
          
          {/* Chennai Division Active Trains Overview Table */}
          <TrainDelayImpact />
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalBlock && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Reschedule Maintenance Block Window</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px' }}>
              Adjust time window for <strong>{rescheduleModalBlock.title}</strong> ({rescheduleModalBlock.sectionName})
            </p>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>Select AI Recommended Time Slot:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setNewTimeSlot('01:15 AM – 03:45 AM')}
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    textAlign: 'left', 
                    justifyContent: 'flex-start', 
                    background: newTimeSlot === '01:15 AM – 03:45 AM' ? '#eff6ff' : '#ffffff',
                    borderColor: newTimeSlot === '01:15 AM – 03:45 AM' ? '#3b82f6' : '#e2e8f0',
                    borderWidth: newTimeSlot === '01:15 AM – 03:45 AM' ? '2px' : '1px'
                  }}
                >
                  🌙 <strong>01:15 AM – 03:45 AM</strong> (Midnight Window • 0 Express Delay)
                </button>
                <button
                  type="button"
                  onClick={() => setNewTimeSlot('11:30 AM – 01:00 PM')}
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    textAlign: 'left', 
                    justifyContent: 'flex-start', 
                    background: newTimeSlot === '11:30 AM – 01:00 PM' ? '#eff6ff' : '#ffffff',
                    borderColor: newTimeSlot === '11:30 AM – 01:00 PM' ? '#3b82f6' : '#e2e8f0',
                    borderWidth: newTimeSlot === '11:30 AM – 01:00 PM' ? '2px' : '1px'
                  }}
                >
                  🌤️ <strong>11:30 AM – 01:00 PM</strong> (Midday Inter-City Headway Gap)
                </button>
                <button
                  type="button"
                  onClick={() => setNewTimeSlot('01:30 AM – 04:00 AM')}
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    textAlign: 'left', 
                    justifyContent: 'flex-start', 
                    background: newTimeSlot === '01:30 AM – 04:00 AM' ? '#eff6ff' : '#ffffff',
                    borderColor: newTimeSlot === '01:30 AM – 04:00 AM' ? '#3b82f6' : '#e2e8f0',
                    borderWidth: newTimeSlot === '01:30 AM – 04:00 AM' ? '2px' : '1px'
                  }}
                >
                  🌌 <strong>01:30 AM – 04:00 AM</strong> (Early Morning Low-Traffic Slot)
                </button>
              </div>

              <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569' }}>Or Enter Custom Time Slot:</label>
              <input
                type="text"
                className="form-input"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                placeholder="e.g. 01:30 AM – 04:00 AM"
                style={{ marginBottom: '10px' }}
              />

              <label className="form-label" style={{ fontSize: '0.8rem', color: '#475569' }}>Controller Note / Rationale:</label>
              <input
                type="text"
                className="form-input"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g. Shifted to optimal night low-traffic window."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setRescheduleModalBlock(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmReschedule}>Confirm & Reschedule Slot</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalBlock && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#dc2626' }}>Decline Block Request</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px' }}>
              Declining request <strong>{rejectModalBlock.title}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Reason for Rejection:</label>
              <textarea
                className="form-input"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setRejectModalBlock(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmReject}>Decline Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
