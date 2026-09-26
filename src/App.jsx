import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BlockProvider } from './context/BlockContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { ControllerDashboard } from './components/controller/ControllerDashboard';
import { DepartmentDashboard } from './components/department/DepartmentDashboard';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { USER_ROLES } from './data/credentials';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const MainApp = () => {
  const { currentUser, isController, isDepartment, notification } = useAuth();

  // Strict route protection: If not logged in, enforce Login view regardless of URL
  return (
    <div className="app-layout">
      {currentUser ? (
        <>
          <Navbar />
          <main className="main-content">
            {isController && <ControllerDashboard />}
            {isDepartment && <DepartmentDashboard />}
            {!isController && !isDepartment && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3>Unauthorized Access</h3>
                <p>Please log in with appropriate role permissions.</p>
              </div>
            )}
          </main>
          <AIAssistantWidget />
        </>
      ) : (
        <Login />
      )}

      {/* Global Notification Toast */}
      {notification && (
        <div className="toast-banner">
          {notification.type === 'success' ? (
            <CheckCircle size={18} color="#10b981" />
          ) : (
            <Info size={18} color="#38bdf8" />
          )}
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BlockProvider>
        <MainApp />
      </BlockProvider>
    </AuthProvider>
  );
}

export default App;
