import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: '📊 Dashboard', roles: [] },
    { path: '/users', label: '👥 Users', roles: ['ADMIN'] },
    { path: '/products', label: '📦 Products', roles: [] },
    { path: '/pick-requests', label: '📋 Pick Requests', roles: [] },
    { path: '/create-request', label: '➕ Create Request (Manual)', roles: ['REQUESTER', 'ADMIN'] },
    { path: '/requester-scanner', label: '📷 Create Request (Scanner)', roles: ['REQUESTER', 'ADMIN'] },
    { path: '/barcode-scanner', label: '🔍 Product Scanner', roles: [] },
    { path: '/health', label: '💚 System Health', roles: [] },
  ];

  const filteredItems = navItems.filter(
    (item) => item.roles.length === 0 || item.roles.includes(user?.role)
  );

  const styles = {
    sidebar: {
      width: '280px',
      background: '#1e293b',
      color: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
    header: {
      padding: '20px',
      fontSize: '18px',
      fontWeight: '700',
      borderBottom: '1px solid #334155',
    },
    nav: {
      flex: 1,
      padding: '16px 12px',
    },
    navLink: {
      display: 'block',
      padding: '12px 16px',
      marginBottom: '4px',
      borderRadius: '6px',
      color: '#f1f5f9',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'background 0.2s',
    },
    navLinkActive: {
      background: '#334155',
    },
    footer: {
      padding: '16px 20px',
      borderTop: '1px solid #334155',
      fontSize: '12px',
    },
    userInfo: {
      marginBottom: '8px',
      color: '#cbd5e1',
    },
    role: {
      display: 'inline-block',
      padding: '2px 8px',
      background: '#3b82f6',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      marginTop: '4px',
    },
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>Warehouse System</div>
      
      <nav style={styles.nav}>
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navLink,
                ...(isActive && styles.navLinkActive),
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.target.style.background = 'rgba(51, 65, 85, 0.6)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.target.style.background = 'transparent';
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{user?.username}</div>
          <span style={styles.role}>{user?.role}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
