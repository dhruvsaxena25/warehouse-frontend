import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WebSocketClient, CameraStream } from '../utils/websocket';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1';

const PickerScanner = () => {
  const { requestName } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [camera, setCamera] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [lastDetection, setLastDetection] = useState(null);

  useEffect(() => {
    return () => {
      if (ws) ws.close();
      if (camera) camera.stop();
    };
  }, [ws, camera]);

  const startScanning = async () => {
    try {
      setError('');

      // Initialize camera
      const cam = new CameraStream();
      await cam.start(videoRef.current);
      setCamera(cam);

      // Connect WebSocket
      const token = localStorage.getItem('access_token');
      const client = new WebSocketClient(
        `${WS_URL}/ws/pick/${requestName}`,
        token
      );

      client.onMessage = (data) => {
        if (data.type === 'error') {
          setError(data.message);
        } else if (data.type === 'init') {
          setItems(data.items);
        } else if (data.type === 'detection') {
          // Valid barcode (GREEN box)
          setLastDetection({
            ...data,
            timestamp: Date.now(),
          });
          drawBoundingBox(data.rect, 'green');
          // Refresh items
          client.send({ type: 'get_status' });
        } else if (data.type === 'warning') {
          // Invalid barcode (RED box)
          setLastDetection({
            ...data,
            timestamp: Date.now(),
          });
          drawBoundingBox(data.rect, 'red');
        } else if (data.type === 'update') {
          // Manual update response
          client.send({ type: 'get_status' });
        } else if (data.type === 'status') {
          setItems(data.items);
        }
      };

      client.onError = () => setError('WebSocket connection failed');

      await client.connect();
      setWs(client);
      setScanning(true);

      // Start frame capture
      startFrameCapture(client, cam);
    } catch (err) {
      setError(err.message || 'Failed to start scanner');
    }
  };

  const startFrameCapture = (client, cam) => {
    const captureInterval = setInterval(() => {
      if (!client.isConnected() || !scanning) {
        clearInterval(captureInterval);
        return;
      }

      const frame = cam.captureFrame(videoRef.current, canvasRef.current);
      if (frame) {
        client.send({ type: 'frame', frame });
      }
    }, 200); // Faster for picking
  };

  const drawBoundingBox = (rect, color) => {
    const canvas = canvasRef.current;
    if (!canvas || !rect) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { x, y, width, height } = rect;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);
  };

  const updateQuantity = (upc, quantity) => {
    ws.send({
      type: 'manual_update',
      upc,
      quantity: parseInt(quantity),
    });
  };

  const stopScanning = () => {
    setScanning(false);
    if (ws) ws.close();
    if (camera) camera.stop();
  };

  const completedCount = items.filter((i) => i.is_complete).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        Pick: {requestName}
      </h1>

      {error && (
        <div className="card" style={{ background: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              Progress: {completedCount} / {items.length}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{progress.toFixed(0)}%</span>
          </div>
          <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#10b981',
                width: `${progress}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        {!scanning ? (
          <button className="btn btn-success" onClick={startScanning}>
            📷 Start Picking Scanner
          </button>
        ) : (
          <>
            <button className="btn btn-danger" onClick={stopScanning} style={{ marginBottom: '16px' }}>
              ⏹️ Stop Scanner
            </button>

            <div className="video-container" style={{ marginBottom: '16px' }}>
              <video ref={videoRef} className="video-canvas" autoPlay playsInline muted />
              <canvas ref={canvasRef} className="scanner-overlay" />
            </div>

            {lastDetection && (
              <div
                style={{
                  padding: '12px',
                  background: lastDetection.in_request ? '#d1fae5' : '#fee2e2',
                  borderRadius: '6px',
                  marginBottom: '16px',
                }}
              >
                {lastDetection.in_request ? (
                  <>
                    <div style={{ fontWeight: '600', color: '#065f46' }}>
                      ✅ {lastDetection.product_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#047857', marginTop: '4px' }}>
                      Picked: {lastDetection.picked_qty} / {lastDetection.requested_qty}
                      {lastDetection.mode === 'scan-to-count' && ' (Auto-increment)'}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: '600', color: '#991b1b' }}>
                      ❌ Barcode NOT in this request
                    </div>
                    <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '4px' }}>
                      UPC: {lastDetection.upc}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>UPC</th>
              <th>Requested</th>
              <th>Picked</th>
              <th>Status</th>
              <th>Manual Entry</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.upc}>
                <td>{item.product_name}</td>
                <td><code>{item.upc}</code></td>
                <td>{item.requested_qty}</td>
                <td style={{ fontWeight: '600' }}>{item.picked_qty}</td>
                <td>
                  <span className={item.is_complete ? 'badge badge-completed' : 'badge badge-pending'}>
                    {item.is_complete ? 'Complete' : `${item.remaining} left`}
                  </span>
                </td>
                <td>
                  {item.mode === 'bulk' && !item.is_complete && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max={item.requested_qty}
                        defaultValue={item.picked_qty}
                        style={{ width: '70px', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        onBlur={(e) => updateQuantity(item.upc, e.target.value)}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Bulk mode</span>
                    </div>
                  )}
                  {item.mode === 'scan-to-count' && (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Scan to count</span>
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

export default PickerScanner;
