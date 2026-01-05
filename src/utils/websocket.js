/**
 * WebSocket utility for real-time barcode scanning
 */

export class WebSocketClient {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.onMessage = null;
    this.onOpen = null;
    this.onClose = null;
    this.onError = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.url}?token=${this.token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          if (this.onOpen) this.onOpen();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (this.onMessage) this.onMessage(data);
          } catch (err) {
            console.error('Failed to parse message:', err);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          if (this.onError) this.onError(error);
        };

        this.ws.onclose = (event) => {
          console.log('📱 WebSocket closed:', event.code, event.reason);
          if (this.onClose) this.onClose(event);

          // Auto-reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts && !event.wasClean) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), this.reconnectDelay);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * Camera utility for capturing frames
 */
export class CameraStream {
  constructor() {
    this.stream = null;
    this.videoElement = null;
  }

  async start(videoElement) {
    try {
      this.videoElement = videoElement;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      videoElement.srcObject = this.stream;
      await videoElement.play();
      return true;
    } catch (err) {
      console.error('Failed to start camera:', err);
      throw err;
    }
  }

  captureFrame(videoElement, canvas) {
    if (!videoElement || !canvas) return null;

    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
}
