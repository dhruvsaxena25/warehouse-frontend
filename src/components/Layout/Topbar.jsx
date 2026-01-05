import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();

  const styles = {
    topbar: {
      height: '64px',
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      gap: '16px',
    },
    user: {
      fontSize: '14px',
      color: '#475569',
    },
    role: {
      fontSize: '12px',
      color: '#94a3b8',
      fontWeight: 600,
    },
    logoutBtn: {
      padding: '8px 16px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: 500,
    },
  };

  return (
    <div style={styles.topbar}>
      <div>
        <div style={styles.user}>{user?.username}</div>
        <div style={styles.role}>{user?.role}</div>
      </div>
      <button style={styles.logoutBtn} onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Topbar;
