import React, { useEffect, useState } from 'react';
import { getHealth } from '../api/health';

const HealthPage = () => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth);
  }, []);

  if (!health) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>System Health</h1>

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Overall Status: <span style={{ color: health.status === 'healthy' ? '#10b981' : '#ef4444' }}>{health.status}</span></h2>

        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>API</td>
              <td><span className={health.components.api === 'healthy' ? 'badge badge-completed' : 'badge'}>{health.components.api}</span></td>
            </tr>
            <tr>
              <td>Database</td>
              <td><span className={health.components.database === 'healthy' ? 'badge badge-completed' : 'badge'}>{health.components.database}</span></td>
            </tr>
            <tr>
              <td>Catalog</td>
              <td><span className={health.components.catalog === 'healthy' ? 'badge badge-completed' : 'badge'}>{health.components.catalog}</span></td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '20px' }}>
          <p><strong>Products Loaded:</strong> {health.details.products_loaded}</p>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
