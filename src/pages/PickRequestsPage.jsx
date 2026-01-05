import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPickRequests, deletePickRequest, startPicking } from '../api/pickRequests';

const PickRequestsPage = () => {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const data = await listPickRequests({ limit: 100 });
    setRequests(data.requests);
  };

  useEffect(() => {
    load();
  }, []);

  const handleStart = async (name) => {
    try {
      await startPicking(name);
      alert('Started picking');
      await load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start');
    }
  };

  const handleDelete = async (name) => {
    if (!confirm('Delete this request?')) return;
    try {
      await deletePickRequest(name);
      await load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete');
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Pick Requests</h1>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.name}>
                <td>
                  <Link to={`/pick-requests/${r.name}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                    {r.name}
                  </Link>
                </td>
                <td>
                  <span className={`badge badge-${r.status.toLowerCase().replace('_', '-')}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${r.priority === 'URGENT' ? 'badge-urgent' : ''}`}>
                    {r.priority}
                  </span>
                </td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  {r.status === 'PENDING' && (
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleStart(r.name)}>
                      Start
                    </button>
                  )}
                  <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleDelete(r.name)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PickRequestsPage;
