import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS, USER_ROLES } from '../data/credentials';
import { 
  Train, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Info, 
  Eye,
  EyeOff,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export const Login = () => {
  const { login, loginAsDemo } = useAuth();
  
  const [selectedRoleTab, setSelectedRoleTab] = useState(USER_ROLES.CONTROLLER);
  const [userId, setUserId] = useState('controller@railways.gov.in');
  const [password, setPassword] = useState('ctrl123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleTabChange = (role) => {
    setSelectedRoleTab(role);
    setErrorMessage('');
    if (role === USER_ROLES.CONTROLLER) {
      setUserId('controller@railways.gov.in');
      setPassword('ctrl123');
    } else {
      setUserId('track.eng@railways.gov.in');
      setPassword('track123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      const res = login(userId, password);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error);
      }
    }, 300);
  };

  const handleQuickDemoClick = (demoEmail, demoPassword, role) => {
    setSelectedRoleTab(role);
    setUserId(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    login(demoEmail, demoPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <img 
            src="/railway-logo.png" 
            alt="Indian Railways Official Logo" 
            style={{ 
              width: '84px', 
              height: '84px', 
              objectFit: 'contain',
              marginBottom: '10px',
              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.14))'
            }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#0f2942', fontWeight: 800 }}>RailLexa</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 600 }}>
              Chennai Division • Southern Railway (MAS)
            </p>
          </div>
        </div>

        {/* Role Selector Buttons */}
        <div className="role-selector-pills" style={{ marginBottom: '18px' }}>
          <button
            type="button"
            className={`role-pill ${selectedRoleTab === USER_ROLES.CONTROLLER ? 'active' : ''}`}
            onClick={() => handleRoleTabChange(USER_ROLES.CONTROLLER)}
          >
            <ShieldCheck size={16} />
            <span>Traffic Controller</span>
          </button>
          <button
            type="button"
            className={`role-pill ${selectedRoleTab === USER_ROLES.DEPARTMENT ? 'active' : ''}`}
            onClick={() => handleRoleTabChange(USER_ROLES.DEPARTMENT)}
          >
            <Wrench size={16} />
            <span>Department Engineer</span>
          </button>
        </div>

        {errorMessage && (
          <div 
            style={{
              padding: '10px 12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '0.8rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Info size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or User ID</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. controller@railways.gov.in"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px', padding: '10px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In as {selectedRoleTab === USER_ROLES.CONTROLLER ? 'Controller' : 'Engineer'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Demo Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚡ 1-Click Instant Test Login:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.email}
                type="button"
                className="demo-account-btn"
                onClick={() => handleQuickDemoClick(cred.email, cred.password, cred.role)}
              >
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                  {cred.roleTitle}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                  {cred.email}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
