import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBlocks } from '../../context/BlockContext';
import { CORRIDOR_SECTIONS, MAINTENANCE_TYPES } from '../../data/realRailData';
import { DEPARTMENTS } from '../../data/credentials';
import { CheckCircle2, Send, Clock, Sparkles, Wrench, Hammer, Radio, Zap, Cog } from 'lucide-react';

const DEPT_ICONS = {
  TRACK_ENG: Hammer,
  SIGNAL_TELECOM: Radio,
  ELECTRICAL_OHE: Zap,
  MECHANICAL: Cog
};

export const RequestBlockForm = ({ onSuccess }) => {
  const { currentUser, userDepartment } = useAuth();
  const { createBlockRequest, createMultiDeptDemoRequests } = useBlocks();

  const [selectedDeptId, setSelectedDeptId] = useState(userDepartment || 'TRACK_ENG');

  const deptInfo = DEPARTMENTS[selectedDeptId] || {
    name: 'Civil & Track Engineering',
    id: selectedDeptId
  };

  const availableTypes = MAINTENANCE_TYPES.filter(t => t.departmentId === selectedDeptId);

  const [title, setTitle] = useState(availableTypes[0]?.title || 'Routine Track Maintenance');
  const [plainPurpose, setPlainPurpose] = useState(availableTypes[0]?.simpleExplanation || 'Ensuring track safety and rail stability.');
  const [sectionId, setSectionId] = useState(CORRIDOR_SECTIONS[1].id);
  const [trackLine, setTrackLine] = useState('UP Main Line');
  const [durationHours, setDurationHours] = useState('2.5');
  const [machineryRequired, setMachineryRequired] = useState(availableTypes[0]?.commonMachinery || 'Maintenance Machine + 10 Staff');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Update presets when department selector changes
  useEffect(() => {
    const types = MAINTENANCE_TYPES.filter(t => t.departmentId === selectedDeptId);
    if (types.length > 0) {
      setTitle(types[0].title);
      setPlainPurpose(types[0].simpleExplanation);
      setDurationHours(String(types[0].defaultDurationHours || 2.5));
      setMachineryRequired(types[0].commonMachinery);
    }
  }, [selectedDeptId]);

  const handleTypeSelect = (typeObj) => {
    setTitle(typeObj.title);
    setPlainPurpose(typeObj.simpleExplanation);
    setDurationHours(String(typeObj.defaultDurationHours || 2.5));
    setMachineryRequired(typeObj.commonMachinery);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedSec = CORRIDOR_SECTIONS.find(s => s.id === sectionId);
    const durNum = parseFloat(durationHours) || 2.5;
    const cleanTimeSlot = durationHours.includes('AM') || durationHours.includes('PM') || durationHours.includes('–')
      ? durationHours
      : `${durationHours.includes('Hour') ? durationHours : `${durNum} Hours Window`}`;

    createBlockRequest({
      title,
      plainPurpose,
      departmentId: selectedDeptId,
      departmentName: deptInfo.name,
      sectionId,
      sectionName: selectedSec ? selectedSec.name : 'Corridor Line',
      trackLine,
      requestedBy: `${currentUser.name} (${currentUser.designation})`,
      requestedDate: 'Today',
      timeSlot: cleanTimeSlot,
      durationHours: String(durNum),
      machineryRequired,
      speedRestrictionAfterWork: 'Normal Section Speed (130 km/h)'
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div 
      className="card" 
      style={{ 
        maxWidth: '820px', 
        margin: '0 auto', 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '12px', 
        padding: '24px 28px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px', color: '#0f2942' }}>Request Maintenance Track Window</h3>
          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.designation})
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            createMultiDeptDemoRequests();
            if (onSuccess) onSuccess();
          }}
          style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#1e40af', fontSize: '0.785rem' }}
          title="Simulate 3 different departments (Track, S&T, OHE) raising requests at once"
        >
          <Sparkles size={13} color="#2563eb" />
          <span>⚡ 1-Click Multi-Dept Demo Requests</span>
        </button>
      </div>

      {submittedSuccess ? (
        <div style={{ padding: '32px', textAlign: 'center', background: '#ecfdf5', borderRadius: '10px' }}>
          <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 8px' }} />
          <h4 style={{ margin: 0, color: '#047857' }}>Request Submitted to Controller!</h4>
          <p style={{ fontSize: '0.825rem', color: '#475569', margin: '4px 0 0' }}>
            The traffic controller will review your request in the Approvals queue or optimize with AI.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Department Selector */}
          <div style={{ marginBottom: '18px' }}>
            <label className="form-label">🏢 Raising Department:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {Object.values(DEPARTMENTS).map((dept) => {
                const isSelected = selectedDeptId === dept.id;
                const IconComponent = DEPT_ICONS[dept.id] || Wrench;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDeptId(dept.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComponent size={16} color={isSelected ? '#2563eb' : '#64748b'} />
                    <span>{dept.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Presets */}
          {availableTypes.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">💡 Quick Work Presets for {deptInfo.name}:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: title === type.title ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
                      background: title === type.title ? '#eff6ff' : '#ffffff',
                      color: title === type.title ? '#1d4ed8' : '#334155',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {type.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Work Title</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Corridor Section</label>
              <select
                className="form-input"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
              >
                {CORRIDOR_SECTIONS.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.distanceKm} km)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Track Line</label>
              <select
                className="form-input"
                value={trackLine}
                onChange={(e) => setTrackLine(e.target.value)}
              >
                <option value="UP Fast Line (130 km/h)">UP Fast Line (130 km/h Vande Bharat & Superfast)</option>
                <option value="DOWN Fast Line (130 km/h)">DOWN Fast Line (130 km/h Superfast)</option>
                <option value="UP Main Line">UP Main Line (Towards Chennai Central / Egmore)</option>
                <option value="DOWN Main Line">DOWN Main Line (Towards Arakkonam / Villupuram)</option>
                <option value="3rd/4th Suburban & Goods Line">3rd/4th Suburban & Goods Line</option>
                <option value="Mainline Crossover Point">Mainline Crossover Point / Turnout</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Machinery & Staff Required</label>
              <input
                type="text"
                className="form-input"
                value={machineryRequired}
                onChange={(e) => setMachineryRequired(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Work Scope</label>
            <textarea
              className="form-input"
              rows={2}
              value={plainPurpose}
              onChange={(e) => setPlainPurpose(e.target.value)}
              required
            />
          </div>

          {/* Custom Timing / Duration Box */}
          <div className="form-group">
            <label className="form-label">Duration / Preferred Timing</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2.5 Hours (or 01:30 AM – 04:00 AM)"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary btn-lg" style={{ padding: '10px 22px' }}>
              <Send size={15} />
              <span>Submit Request to Controller</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
