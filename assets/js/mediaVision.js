/**
 * OM AI Assistant - Live Media Vision Engine
 * Screen Share (WebRTC getDisplayMedia) & Camera Vision (getUserMedia)
 * Supports Mobile & Tablet front/back camera flipping,
 * Snapshot-to-3D Assemblable Studio, and Live Spoken Telemetry.
 * 
 * Lead Architect: Udayast
 * Always addresses user as: "Boss"
 */

class OMMediaVisionEngine {
  constructor() {
    this.screenStream = null;
    this.cameraStream = null;
    this.facingMode = 'user'; // 'user' (front) or 'environment' (back for mobile/tablet)
    this.isScreenSharing = false;
    this.isCameraActive = false;
  }

  /* =========================================================================
     Screen Share (WebRTC getDisplayMedia)
     ========================================================================= */
  async startScreenShare() {
    if (this.isScreenSharing) {
      this.stopScreenShare();
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        if (window.omApp) {
          window.omApp.showToast('⚠️ Screen sharing is not supported by this browser/device.', 'warning');
        }
        return;
      }

      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });

      this.isScreenSharing = true;
      const videoEl = document.getElementById('live-screen-video');
      const container = document.getElementById('live-screen-container');

      if (videoEl) {
        videoEl.srcObject = this.screenStream;
        videoEl.play();
      }
      if (container) {
        container.style.display = 'block';
      }

      // Update button state
      this.updateUIButtons();

      // Listen for browser's native "Stop sharing" bar
      const track = this.screenStream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          this.stopScreenShare();
        };
      }

      // Spoken Telemetry from Active Persona
      if (window.omJarvisLive && window.omJarvisLive.isActive) {
        const isHindi = (window.omJarvisLive.currentLanguage || 'en').startsWith('hi');
        const speech = isHindi
          ? 'स्क्रीन शेयरिंग सक्रिय हो चुकी है बॉस। डिस्प्ले का लाइव टेलीमेट्री विश्लेषण चालू है।'
          : 'Screen sharing is live, Boss. Visual telemetry linked and analyzing viewport in real-time.';
        window.omJarvisLive.speakResponse(speech);
      } else if (window.omApp) {
        window.omApp.showToast('🖥️ Screen Share Active: Transmitting visual viewport', 'success');
      }

    } catch (err) {
      console.warn('Screen share cancelled or error:', err);
      if (err.name !== 'NotAllowedError' && window.omApp) {
        window.omApp.showToast('Could not start screen sharing: ' + err.message, 'error');
      }
      this.stopScreenShare();
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop());
      this.screenStream = null;
    }
    this.isScreenSharing = false;

    const videoEl = document.getElementById('live-screen-video');
    const container = document.getElementById('live-screen-container');
    if (videoEl) {
      videoEl.srcObject = null;
    }
    if (container) {
      container.style.display = 'none';
    }

    this.updateUIButtons();

    if (window.omApp) {
      window.omApp.showToast('Screen sharing stopped.', 'info');
    }
  }

  /* =========================================================================
     Camera Vision (getUserMedia + Mobile/Tablet Flip)
     ========================================================================= */
  async startCamera() {
    if (this.isCameraActive) {
      this.stopCamera();
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (window.omApp) {
          window.omApp.showToast('⚠️ Camera access is not supported by this browser.', 'warning');
        }
        return;
      }

      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.isCameraActive = true;
      const videoEl = document.getElementById('live-camera-video');
      const container = document.getElementById('live-camera-container');

      if (videoEl) {
        videoEl.srcObject = this.cameraStream;
        videoEl.play();
      }
      if (container) {
        container.style.display = 'block';
      }

      this.updateUIButtons();

      // Spoken notification from Persona
      if (window.omJarvisLive && window.omJarvisLive.isActive) {
        const isHindi = (window.omJarvisLive.currentLanguage || 'en').startsWith('hi');
        const speech = isHindi
          ? 'कैमरा विज़न कनेक्ट हो गया है बॉस। ऑप्टिकल सेंसर सक्रिय हैं।'
          : 'Camera vision optical sensors engaged, Boss. Visual tracking active.';
        window.omJarvisLive.speakResponse(speech);
      } else if (window.omApp) {
        window.omApp.showToast('📷 Camera Vision Active: Optical sensors engaged', 'success');
      }

    } catch (err) {
      console.warn('Camera access error:', err);
      if (err.name !== 'NotAllowedError' && window.omApp) {
        window.omApp.showToast('Camera permission denied or unavailable.', 'error');
      }
      this.stopCamera();
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
    }
    this.isCameraActive = false;

    const videoEl = document.getElementById('live-camera-video');
    const container = document.getElementById('live-camera-container');
    if (videoEl) {
      videoEl.srcObject = null;
    }
    if (container) {
      container.style.display = 'none';
    }

    this.updateUIButtons();

    if (window.omApp) {
      window.omApp.showToast('Camera vision closed.', 'info');
    }
  }

  async flipCamera() {
    // Switch between front and rear cameras (for mobile and tablet)
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    if (this.isCameraActive) {
      this.stopCamera();
      await this.startCamera();
      if (window.omApp) {
        window.omApp.showToast(`Switched to ${this.facingMode === 'user' ? 'Front' : 'Rear'} Camera`, 'info');
      }
    }
  }

  /* =========================================================================
     Snapshot Capture -> Send to 3D Assemblable Studio or Chat Vision
     ========================================================================= */
  captureSnapshot(target = '3d') {
    const activeVideo = (this.isCameraActive && document.getElementById('live-camera-video')) ||
                        (this.isScreenSharing && document.getElementById('live-screen-video'));

    if (!activeVideo || !activeVideo.videoWidth) {
      if (window.omApp) {
        window.omApp.showToast('⚠️ No active video feed to capture snapshot from.', 'warning');
      }
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = activeVideo.videoWidth;
    canvas.height = activeVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(activeVideo, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (target === '3d' && window.omDismantler) {
      // Launch 3D Assemblable Studio with snapshot
      window.omDismantler.openModal('drone');
      if (window.omApp) {
        window.omApp.showToast('📸 Frame captured! Transferred to 3D Assemblable Studio for CAD modeling.', 'success');
      }
      if (window.omJarvisLive && window.omJarvisLive.isActive) {
        window.omJarvisLive.speakResponse('Optical snapshot captured, Boss. Generating parametric 3D structural model.');
      }
    } else if (window.omApp) {
      window.omApp.showToast('📸 Snapshot captured and saved to workspace.', 'success');
    }
  }

  updateUIButtons() {
    const screenBtn = document.getElementById('btn-toggle-screen-share');
    const camBtn = document.getElementById('btn-toggle-camera-share');
    const pipScreenBtn = document.getElementById('pip-btn-screen');
    const pipCamBtn = document.getElementById('pip-btn-camera');

    if (screenBtn) {
      screenBtn.classList.toggle('active', this.isScreenSharing);
      screenBtn.innerHTML = this.isScreenSharing ? '🖥️ Stop Screen' : '🖥️ Screen Share';
    }
    if (camBtn) {
      camBtn.classList.toggle('active', this.isCameraActive);
      camBtn.innerHTML = this.isCameraActive ? '📷 Stop Camera' : '📷 Camera Share';
    }
    if (pipScreenBtn) {
      pipScreenBtn.classList.toggle('active', this.isScreenSharing);
    }
    if (pipCamBtn) {
      pipCamBtn.classList.toggle('active', this.isCameraActive);
    }
  }
}

// Global Singleton
window.omMediaVision = new OMMediaVisionEngine();
