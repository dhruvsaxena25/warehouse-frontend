import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      width: '100%',
      maxWidth: '400px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '8px',
      textAlign: 'center',
      color: '#1e293b',
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      textAlign: 'center',
      marginBottom: '32px',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      marginBottom: '16px',
    },
    button: {
      width: '100%',
      padding: '12px',
      background: '#3b82f6',
      color: 'white',
      borderRadius: '6px',
      fontSize: '15px',
      fontWeight: '600',
      marginTop: '8px',
    },
    error: {
      color: '#ef4444',
      fontSize: '13px',
      marginBottom: '12px',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Warehouse Portal</h1>
        <p style={styles.subtitle}>Sign in to manage your warehouse</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
