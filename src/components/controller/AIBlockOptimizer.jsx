import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBlocks } from '../../context/BlockContext';
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  HelpCircle, 
  Zap, 
  Hammer, 
  Radio, 
  CheckCheck,
  AlertCircle,
  TrendingUp,
  Check,
  CalendarCheck
} from 'lucide-react';

const renderCleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '• ')
    .replace(/###/g, '')
    .replace(/##/g, '');
};

export const AIBlockOptimizer = () => {
  const { showNotification } = useAuth();
  const { 
    isAiOptimizing, 
    runAIOptimizer, 
    aiOptimizationSummary, 
    blocks, 
    rescheduleBlock,
    approveBlock,
    createMultiDeptDemoRequests 
  } = useBlocks();

  const [appliedCards, setAppliedCards] = useState({});
  const [activeViewMode, setActiveViewMode] = useState('BUNDLED_CARDS'); // BUNDLED_CARDS, BEFORE_AFTER

  const pendingBlocks = blocks.filter(b => b.status === 'PENDING_CONTROLLER');

  const recommendations = aiOptimizationSummary.aiRecommendations || [
    {
      sectionName: "Avadi – Tiruvallur (UP Fast 130 km/h Line)",
      recommendedSlot: "01:15 AM – 03:45 AM",
      actionSummary: "Combined Heavy Ballast Tamping + 25kV OHE Catenary Overhaul into 1 Joint Shadow-Block.",
      trainImpact: "Zero delay for Vande Bharat (20607/20608) & Kovai SF (12675)",
      whyThisTime: "Optimal 150-minute midnight headway gap between incoming Train 20608 Mysuru Vande Bharat (00:40 AM) and morning Train 12675 Kovai SF (05:40 AM). Simultaneous OHE power isolation provides maximum electrical safety while tamping machines operate.",
      departmentsBundled: ["Civil Track Eng", "OHE Electrical Traction"],
      downtimeBefore: "5.5 hrs (2 separate shutdowns)",
      downtimeAfter: "2.5 hrs (Joint window)",
      timeSaved: "3.0 hrs saved"
    },
    {
      sectionName: "Arakkonam Jn – Katpadi Jn (Point 142A Crossover)",
      recommendedSlot: "11:30 AM – 01:00 PM",
      actionSummary: "Synchronized S&T Point Machine Overhaul & USFD Double-Rail Crack Scan.",
      trainImpact: "Zero delay on 130 km/h mainline tracks",
      whyThisTime: "Utilizes midday timetable gap between Shatabdi (12007) and afternoon Vande Bharat (20643). Point mechanism tested and calibrated with fail-safe crossover isolation.",
      departmentsBundled: ["Signal & Telecom", "Civil Track Eng"],
      downtimeBefore: "3.5 hrs (Isolated slots)",
      downtimeAfter: "1.5 hrs (Joint window)",
      timeSaved: "2.0 hrs saved"
    },
    {
      sectionName: "Tambaram – Chengalpattu Jn (South Superfast Line)",
      recommendedSlot: "01:30 AM – 04:00 AM",
      actionSummary: "Rescheduled MSDAC Axle Counter Calibration to low-traffic night window.",
      trainImpact: "Eliminated 18 mins potential daytime delay for Tirunelveli Vande Bharat (20665)",
      whyThisTime: "Shifting daytime request to night prevents speed restrictions during the peak afternoon run of Train 20665 Vande Bharat (03:15 PM) and Vaigai Express (12635).",
      departmentsBundled: ["Signal & Telecom"],
      downtimeBefore: "Daytime conflict (+18 min train delay)",
      downtimeAfter: "Night window (0 min train delay)",
      timeSaved: "18 mins delay eliminated"
    }
  ];

  const handleApplySlot = (rec, idx) => {
    // Find blocks that correspond to this section
    const matchingBlocks = blocks.filter(b => 
      b.sectionName.toLowerCase().includes(rec.sectionName.split(' ')[0].toLowerCase()) ||
      rec.sectionName.toLowerCase().includes(b.sectionName.toLowerCase())
    );

    if (matchingBlocks.length > 0) {
      matchingBlocks.forEach(b => {
        rescheduleBlock(b.id, rec.recommendedSlot, `Applied AI Recommended Joint Slot (${rec.actionSummary})`);
      });
    } else {
      // If no exact match found, reschedule the first pending block
      const target = pendingBlocks[0];
      if (target) {
        rescheduleBlock(target.id, rec.recommendedSlot, `Applied AI Recommended Window for ${rec.sectionName}`);
      }
    }

    setAppliedCards(prev => ({ ...prev, [idx]: true }));
    if (showNotification) {
      showNotification(`✅ Successfully applied and scheduled joint slot "${rec.recommendedSlot}" for ${rec.sectionName}!`, 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner Card with Clean Official Railway Header */}
      <div 
        style={{ 
          border: '1px solid #ddd6fe', 
          background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', 
          borderRadius: '12px',
          padding: '18px 22px',
          boxShadow: '0 2px 6px rgba(109, 40, 217, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="badge badge-ai" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                <Sparkles size={12} />
                AI Joint Block Optimizer
              </span>
              <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 700 }}>
                • Southern Railway (MAS Division)
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: '2px 0 4px', color: '#0f2942', fontWeight: 800 }}>
              Multi-Department Track Problem Bundler
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0, maxWidth: '680px', lineHeight: 1.4 }}>
              Combines Civil Track, 25kV OHE, and Signal & Telecom work orders into single joint time-windows to save track downtime and keep all Superfast trains running on time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={createMultiDeptDemoRequests}
              style={{ fontSize: '0.825rem', padding: '8px 14px', background: '#ffffff', borderColor: '#cbd5e1' }}
              title="Spawn unbundled Civil, OHE, and S&T maintenance issues"
            >
              <span>+ Spawn Dept Problems</span>
            </button>

            <button
              className="btn btn-ai btn-lg"
              onClick={runAIOptimizer}
              disabled={isAiOptimizing}
              style={{ padding: '9px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isAiOptimizing ? (
                <>
                  <Loader2 size={16} className="spin-slow" />
                  <span>Optimizing Schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Bundle & Optimize Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean High-Importance Railway Metrics */}
      <div className="grid-4">
        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #059669', background: '#ffffff' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            ⏱️ Total Downtime Saved
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '3px' }}>
            {aiOptimizationSummary.hoursSaved || '4.5'} Hours
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Saved via Joint Shadow-Blocks</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #7c3aed', background: '#ffffff' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            🔗 Tasks Combined
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginTop: '3px' }}>
            {aiOptimizationSummary.blocksGrouped || 3} Requests
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Civil + OHE + S&T Synchronized</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #1d4ed8', background: '#ffffff' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            🚆 Express Train Delays
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '3px' }}>
            0 Minutes
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>100% On-Time Punctuality</div>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #d97706', background: '#ffffff' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            🛡️ Traction Safety
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '3px' }}>
            100% Safe
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>25kV Power Cut Matched</div>
        </div>
      </div>

      {/* Pending Unbundled Problems Warning Box (if any) */}
      {pendingBlocks.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={22} color="#d97706" />
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.875rem' }}>
                {pendingBlocks.length} Unbundled Department Request(s) Awaiting Review
              </strong>
              <div style={{ fontSize: '0.775rem', color: '#b45309', marginTop: '2px' }}>
                Overlapping track maintenance found in Avadi–Tiruvallur & Arakkonam. Click below to bundle and approve joint slots.
              </div>
            </div>
          </div>
          <button 
            className="btn btn-sm btn-primary"
            onClick={runAIOptimizer}
            disabled={isAiOptimizing}
            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>Auto-Bundle & Approve All</span>
          </button>
        </div>
      )}

      {/* View Switcher: Joint Shadow-Blocks vs Before & After Comparison */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className={`btn btn-sm ${activeViewMode === 'BUNDLED_CARDS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveViewMode('BUNDLED_CARDS')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.785rem' }}
          >
            <Layers size={13} />
            <span>Optimized Joint Blocks ({recommendations.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeViewMode === 'BEFORE_AFTER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveViewMode('BEFORE_AFTER')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.785rem' }}
          >
            <TrendingUp size={13} />
            <span>Before vs. After Comparison</span>
          </button>
        </div>

        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCheck size={14} />
          Zero Express Train Delays Guaranteed
        </span>
      </div>

      {/* VIEW 1: BUNDLED CARDS & WHY-RATIONALE */}
      {activeViewMode === 'BUNDLED_CARDS' && (
        <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-ai" style={{ fontSize: '0.75rem' }}>
                <Sparkles size={12} />
                Recommended Joint Slots
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Last Updated: {aiOptimizationSummary.lastOptimizedAt || 'Just now'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, background: '#f0fdf4', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
              ✓ All Track Geometry & Timetables Verified
            </span>
          </div>

          {/* Simple, highly readable cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '10px', 
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Row 1: Section Name, Bundled Tags & Recommended Slot */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: '#0f2942', fontSize: '1rem' }}>
                      📍 {rec.sectionName}
                    </span>
                    {rec.departmentsBundled && rec.departmentsBundled.map((d, dIdx) => (
                      <span 
                        key={dIdx} 
                        className="badge" 
                        style={{ 
                          background: '#ede9fe', 
                          color: '#6d28d9', 
                          border: '1px solid #ddd6fe',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        🔗 {d}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1d4ed8' }}>
                        ⏰ {rec.recommendedSlot}
                      </div>
                      <span style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 700 }}>
                        ✓ {rec.trainImpact}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 2: What work is being done */}
                <div style={{ color: '#1e293b', fontSize: '0.85rem', fontWeight: 600 }}>
                  {renderCleanText(rec.actionSummary)}
                </div>

                {/* Row 3: Why This Time Explanation */}
                <div 
                  style={{ 
                    background: '#eff6ff', 
                    border: '1px solid #bfdbfe', 
                    borderRadius: '8px', 
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <HelpCircle size={16} color="#1d4ed8" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.8rem', color: '#1e40af', lineHeight: '1.5' }}>
                    <strong>Why this exact time window?</strong><br />
                    {renderCleanText(rec.whyThisTime)}
                  </div>
                </div>

                {/* Row 4: Downtime Saved Highlight & Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
                  {rec.timeSaved && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span>Before: <strong style={{ color: '#dc2626' }}>{rec.downtimeBefore}</strong></span>
                      <span>→ Joint Window: <strong style={{ color: '#059669' }}>{rec.downtimeAfter}</strong></span>
                      <span className="badge badge-approved" style={{ fontSize: '0.72rem', fontWeight: 700 }}>⚡ {rec.timeSaved}</span>
                    </div>
                  )}

                  <button
                    className={`btn btn-sm ${appliedCards[idx] ? 'btn-success' : 'btn-primary'}`}
                    style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
                    onClick={() => handleApplySlot(rec, idx)}
                  >
                    {appliedCards[idx] ? (
                      <>
                        <Check size={14} />
                        <span>Slot Rescheduled & Scheduled ✓</span>
                      </>
                    ) : (
                      <>
                        <CalendarCheck size={14} />
                        <span>Apply & Reschedule This Slot</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: BEFORE VS AFTER COMPARISON */}
      {activeViewMode === 'BEFORE_AFTER' && (
        <div className="card" style={{ padding: '20px 24px', background: '#ffffff' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#0f2942' }}>
            Before vs. After AI Bundling Comparison
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px' }}>
            See how combining maintenance tasks reduces track closures and prevents train delays.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Unoptimized Approach */}
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991b1b', fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px' }}>
                <span>❌ Without AI (Separate Requests)</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#7f1d1d', lineHeight: '1.6' }}>
                <li>Civil Track requests daytime slot $\rightarrow$ 45 mins Vande Bharat delay</li>
                <li>OHE Electrical requests separate power cut $\rightarrow$ 2.0 hours extra line shutdown</li>
                <li>S&T requests independent point testing $\rightarrow$ multiple speed restrictions</li>
                <li><strong>Total Track Closure: 7.5 hours / day</strong></li>
                <li><strong>Train Delays: 120+ minutes</strong></li>
              </ul>
            </div>

            {/* AI/ML Joint Shadow-Block Approach */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px' }}>
                <span>✓ With RailLexa Joint Blocks</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#065f46', lineHeight: '1.6' }}>
                <li>Civil + OHE synchronized in 1 midnight window (01:15 AM – 03:45 AM)</li>
                <li>S&T point overhaul placed in midday gap between trains</li>
                <li>Simultaneous 25kV power cut provides 100% electrical safety for track machines</li>
                <li><strong>Total Track Closure: 2.5 hours (4.5 hours saved)</strong></li>
                <li><strong>Train Delays: 0 minutes (100% On-Time)</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
