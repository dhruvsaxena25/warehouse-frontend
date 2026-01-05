import React, { useEffect, useState } from 'react';
import { listUsers, createUser, deactivateUser, activateUser } from '../api/users';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('REQUESTER');

  const load = async () => {
    const data = await listUsers({ limit: 100 });
    setUsers(data.users);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser({ username, password, role });
      setUsername('');
      setPassword('');
      alert('User created');
      await load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user');
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>User Management</h1>

      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Create New User</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#475569' }}>Username</label>
            <input
              type="text"
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#475569' }}>Password</label>
            <input
              type="password"
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#475569' }}>Role</label>
            <select
              style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ADMIN">Admin</option>
              <option value="REQUESTER">Requester</option>
              <option value="PICKER">Picker</option>
              <option value="USER">User</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Add User</button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td><span className="badge" style={{background: '#e0e7ff', color: '#3730a3'}}>{u.role}</span></td>
                <td>
                  <span className={u.is_active ? 'badge badge-completed' : 'badge'} style={{background: u.is_active ? '#d1fae5' : '#fee2e2'}}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {u.is_active ? (
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={async () => {
                        if (confirm('Deactivate this user?')) {
                          await deactivateUser(u.id);
                          await load();
                        }
                      }}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={async () => {
                        await activateUser(u.id);
                        await load();
                      }}
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
