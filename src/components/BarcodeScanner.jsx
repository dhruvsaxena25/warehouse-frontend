import React, { useRef, useEffect, useState } from 'react';
import { WebSocketClient, CameraStream } from '../utils/websocket';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1';

const BarcodeScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [camera, setCamera] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      const client = new WebSocketClient(`${WS_URL}/ws/scan`, token);

      client.onMessage = (data) => {
        if (data.type === 'error') {
          setError(data.message);
        } else if (data.type === 'init') {
          console.log('Scanner initialized:', data.matched_products);
        } else if (data.type === 'detection') {
          setDetections(data.detections);
          // Draw bounding boxes
          drawDetections(data.detections);
        }
      };

      client.onError = () => setError('WebSocket connection failed');

      await client.connect();
      setWs(client);

      // Send init message
      client.send({
        type: 'init',
        queries: searchQuery ? [searchQuery] : [],
        mode: 'catalog',
      });

      setScanning(true);

      // Start frame capture loop
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
    }, 300); // Capture every 300ms
  };

  const drawDetections = (dets) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dets.forEach((det) => {
      if (det.rect) {
        const { x, y, width, height } = det.rect;
        ctx.strokeStyle = det.color || 'green';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Draw label
        ctx.fillStyle = det.color || 'green';
        ctx.fillRect(x, y - 25, width, 25);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(det.product_name || det.upc, x + 5, y - 8);
      }
    });
  };

  const stopScanning = () => {
    setScanning(false);
    if (ws) ws.close();
    if (camera) camera.stop();
    setDetections([]);
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Barcode Scanner
      </h2>

      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search specific product (optional)"
          style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '12px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={scanning}
        />

        {!scanning ? (
          <button className="btn btn-success" onClick={startScanning}>
            📷 Start Scanning
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopScanning}>
            ⏹️ Stop Scanning
          </button>
        )}
      </div>

      {scanning && (
        <div className="video-container">
          <video ref={videoRef} className="video-canvas" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="scanner-overlay" />
        </div>
      )}

      {detections.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Detections</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>UPC</th>
                <th>Match Type</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((det, i) => (
                <tr key={i}>
                  <td>{det.product_name}</td>
                  <td><code>{det.upc}</code></td>
                  <td><span className="badge">{det.match_type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
