import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBlocks } from '../context/BlockContext';
import { DEMO_CREDENTIALS } from '../data/credentials';
import { LogOut, ChevronDown, UserCheck, ShieldCheck, Wrench, RefreshCw } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout, loginAsDemo, isController } = useAuth();
  const { stats } = useBlocks();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  if (!currentUser) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-section">
          <img 
            src="/railway-logo.png" 
            alt="Indian Railways" 
            style={{ width: '42px', height: '42px', objectFit: 'contain' }} 
          />
          <div className="brand-text">
            <h1>RailLexa</h1>
            <p>Chennai Division • Southern Railway (MAS) AI Block Optimizer</p>
          </div>
        </div>

        {/* Live Section Control Operational Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#ecfdf5', 
              border: '1px solid #a7f3d0', 
              padding: '5px 12px', 
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#065f46',
              fontWeight: 700
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 0 2px #bbf7d0' }}></span>
            Section Status: Normal Operations • 0 Delays
          </span>
        </div>

        {/* User Actions & Quick Switcher */}
        <div className="nav-actions">
          {/* Fast Switch Role Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem' }}
              title="Quickly switch between Traffic Controller and Field Departments"
            >
              <RefreshCw size={13} color="#2563eb" />
              <span>Switch Role</span>
              <ChevronDown size={13} />
            </button>

            {showRoleMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  padding: '8px',
                  width: '260px',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '4px 8px' }}>
                  Switch Operational Role:
                </div>
                {DEMO_CREDENTIALS.map((cred) => {
                  const isCurrent = currentUser.userId === cred.email;
                  return (
                    <button
                      key={cred.email}
                      type="button"
                      onClick={() => {
                        loginAsDemo(cred.email);
                        setShowRoleMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: isCurrent ? '1px solid #93c5fd' : '1px solid transparent',
                        background: isCurrent ? '#eff6ff' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isCurrent ? '#1d4ed8' : '#0f172a' }}>
                          {cred.roleTitle}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {cred.dept}
                        </div>
                      </div>
                      {isCurrent && <UserCheck size={14} color="#1d4ed8" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile pill */}
          <div className="user-profile-badge">
            <span className="user-avatar">{currentUser.avatar || '👤'}</span>
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role-tag">
                {isController ? 'Section Controller' : currentUser.designation?.split('(')[0] || 'Department Engineer'}
              </span>
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={logout}
            title="Sign out of system"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
