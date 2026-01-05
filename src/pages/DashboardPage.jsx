import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPickRequests } from '../api/pickRequests';
import { getHealth } from '../api/health';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    Promise.all([
      listPickRequests({ limit: 10 }),
      getHealth(),
    ]).then(([requests, healthData]) => {
      const pending = requests.requests.filter((r) => r.status === 'PENDING').length;
      const inProgress = requests.requests.filter((r) => r.status === 'IN_PROGRESS').length;
      setStats({ total: requests.total, pending, inProgress });
      setHealth(healthData);
    });
  }, []);

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Total Requests</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{stats?.total || 0}</p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Pending</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats?.pending || 0}</p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>In Progress</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{stats?.inProgress || 0}</p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>System Status</h3>
          <p style={{ fontSize: '32px', fontWeight: '700', color: health?.status === 'healthy' ? '#10b981' : '#ef4444' }}>
            {health?.status || 'Unknown'}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/create-request" className="btn btn-primary">➕ Create Pick Request</Link>
          <Link to="/pick-requests" className="btn btn-primary">📋 View All Requests</Link>
          <Link to="/scanner" className="btn btn-primary">📷 Open Scanner</Link>
          <Link to="/products" className="btn btn-primary">📦 Browse Products</Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
