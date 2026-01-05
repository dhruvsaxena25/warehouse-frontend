import React, { useRef, useEffect, useState } from 'react';
import { WebSocketClient, CameraStream } from '../utils/websocket';
import { useNavigate } from 'react-router-dom';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1';

const RequesterScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [camera, setCamera] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cart, setCart] = useState([]);
  const [detectedProduct, setDetectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [requestName, setRequestName] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [error, setError] = useState('');

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
      const client = new WebSocketClient(`${WS_URL}/ws/create-request`, token);

      client.onMessage = (data) => {
        if (data.type === 'error') {
          setError(data.message);
        } else if (data.type === 'init') {
          console.log('Requester initialized');
          setCart(data.cart || []);
        } else if (data.type === 'detection') {
          if (data.found) {
            setDetectedProduct(data.product);
            drawBoundingBox(data.rect, data.color);
          }
        } else if (data.type === 'cart_updated') {
          setCart(data.items);
          setDetectedProduct(null);
          setQuantity(1);
        } else if (data.type === 'submitted') {
          alert(`✅ Pick request "${data.request_name}" created successfully!`);
          stopScanning();
          navigate('/pick-requests');
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
    }, 300);
  };

  const drawBoundingBox = (rect, color) => {
    const canvas = canvasRef.current;
    if (!canvas || !rect) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { x, y, width, height } = rect;
    ctx.strokeStyle = color || 'blue';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);
  };

  const addToCart = () => {
    if (!detectedProduct) return;
    ws.send({
      type: 'add_item',
      upc: detectedProduct.upc,
      quantity: parseInt(quantity),
    });
  };

  const removeFromCart = (upc) => {
    ws.send({ type: 'remove_item', upc });
  };

  const submitRequest = () => {
    if (!requestName.trim()) {
      alert('Please enter a request name');
      return;
    }
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    ws.send({
      type: 'submit',
      name: requestName.trim(),
      priority,
    });
  };

  const stopScanning = () => {
    setScanning(false);
    if (ws) ws.close();
    if (camera) camera.stop();
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        Create Pick Request (Scanner)
      </h1>

      {error && (
        <div className="card" style={{ background: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      <div className="card">
        {!scanning ? (
          <button className="btn btn-success" onClick={startScanning}>
            📷 Start Camera Scanner
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

            {detectedProduct && (
              <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '8px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Detected: {detectedProduct.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                  UPC: {detectedProduct.upc} | Category: {detectedProduct.main_category}
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{ width: '80px', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  />
                  <button className="btn btn-primary" onClick={addToCart}>
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Cart ({cart.length} items)
        </h2>

        {cart.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
            Scan products to add to cart
          </p>
        ) : (
          <>
            <table style={{ marginBottom: '24px' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>UPC</th>
                  <th>Quantity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.upc}>
                    <td>{item.product_name}</td>
                    <td><code>{item.upc}</code></td>
                    <td>{item.quantity}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => removeFromCart(item.upc)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Request name (e.g. monday-restock)"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <button className="btn btn-success" onClick={submitRequest}>
              ✅ Submit Pick Request
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RequesterScanner;
 