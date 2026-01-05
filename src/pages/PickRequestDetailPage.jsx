import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getPickRequest,
  startPicking,
  submitPickRequest,
  releaseLock,
  deletePickRequest,
} from '../api/pickRequests';

const PickRequestDetailPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await getPickRequest(name);
      setRequest(data.request);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [name]);

  const handleStart = async () => {
    try {
      await startPicking(name);
      alert('Pick request started');
      navigate(`/picker/${name}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start');
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Submit this pick request as completed?')) return;
    try {
      await submitPickRequest(name, false);
      alert('Pick request submitted');
      navigate('/pick-requests');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit');
    }
  };

  const handleRelease = async () => {
    if (!confirm('Release lock on this request?')) return;
    try {
      await releaseLock(name);
      alert('Lock released');
      await load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to release');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this pick request? This cannot be undone.')) return;
    try {
      await deletePickRequest(name);
      alert('Request deleted');
      navigate('/pick-requests');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ background: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!request) return null;

  const completedItems = request.items.filter((i) => i.is_complete).length;
  const progress = (completedItems / request.items.length) * 100;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>{request.name}</h1>
        <Link to="/pick-requests" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          ← Back to list
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Status</div>
            <span className={`badge badge-${request.status.toLowerCase().replace('_', '-')}`}>
              {request.status}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Priority</div>
            <span className={`badge ${request.priority === 'URGENT' ? 'badge-urgent' : ''}`}>
              {request.priority}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Created By</div>
            <div style={{ fontWeight: '500' }}>{request.created_by_username}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Created At</div>
            <div>{new Date(request.created_at).toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              Progress: {completedItems} / {request.items.length}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{progress.toFixed(0)}%</span>
          </div>
          <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: progress === 100 ? '#10b981' : '#3b82f6',
                width: `${progress}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {request.status === 'PENDING' && (
            <button className="btn btn-success" onClick={handleStart}>
              ▶️ Start Picking
            </button>
          )}
          {request.status === 'IN_PROGRESS' && (
            <>
              <Link to={`/picker/${name}`} className="btn btn-primary">
                📷 Open Scanner
              </Link>
              <button className="btn btn-success" onClick={handleSubmit}>
                ✅ Submit as Complete
              </button>
              <button className="btn" style={{ background: '#f59e0b', color: 'white' }} onClick={handleRelease}>
                🔓 Release Lock
              </button>
            </>
          )}
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑️ Delete Request
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Items ({request.items.length})
        </h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>UPC</th>
              <th>Requested</th>
              <th>Picked</th>
              <th>Remaining</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {request.items.map((item) => (
              <tr key={item.upc}>
                <td>{item.product_name}</td>
                <td><code>{item.upc}</code></td>
                <td>{item.requested_qty}</td>
                <td style={{ fontWeight: '600', color: item.is_complete ? '#10b981' : '#475569' }}>
                  {item.picked_qty}
                </td>
                <td>{item.remaining}</td>
                <td>
                  <span className={item.is_complete ? 'badge badge-completed' : 'badge badge-pending'}>
                    {item.is_complete ? '✓ Complete' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {request.notes && (
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Notes</h3>
          <p style={{ color: '#475569' }}>{request.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PickRequestDetailPage;
