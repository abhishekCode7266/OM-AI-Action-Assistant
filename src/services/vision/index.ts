import { Attachment } from '@/types';

export function captureVideoFrame(
  videoElement: HTMLVideoElement,
  namePrefix: 'camera_snapshot' | 'screen_snapshot'
): Attachment {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 1280;
  canvas.height = videoElement.videoHeight || 720;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create canvas rendering context for video frame capture.');
  }

  // Draw frame
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    id: `att-snap-${Date.now()}`,
    name: `${namePrefix}_${timestamp}.jpg`,
    type: namePrefix,
    mimeType: 'image/jpeg',
    size: Math.round(dataUrl.length * 0.75),
    dataUrl,
    uploadedAt: Date.now(),
  };
}

export function isCameraSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

export function isScreenShareSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;
}
