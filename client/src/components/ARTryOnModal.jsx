import React, { useEffect, useRef, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

const ARTryOnModal = ({ open, onClose, imageSrc, productName }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const imageRef = useRef(null);
  const [captured, setCaptured] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    setCaptured(null);
    imageRef.current = new Image();
    imageRef.current.crossOrigin = 'anonymous';
    imageRef.current.src = imageSrc;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      enableSegmentation: false,
      selfieMode: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !results?.image) return;

      const w = results.image.width;
      const h = results.image.height;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(results.image, 0, 0, w, h);

      const landmarks = results.poseLandmarks;
      if (!landmarks || !imageRef.current?.complete) return;

      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

      const shoulderX = (leftShoulder.x + rightShoulder.x) / 2 * w;
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2 * h;
      const hipX = (leftHip.x + rightHip.x) / 2 * w;
      const hipY = (leftHip.y + rightHip.y) / 2 * h;

      const shoulderWidth = Math.hypot(
        (leftShoulder.x - rightShoulder.x) * w,
        (leftShoulder.y - rightShoulder.y) * h
      );
      const torsoHeight = Math.hypot(hipX - shoulderX, hipY - shoulderY);

      const overlayWidth = shoulderWidth * 2.0;
      const overlayHeight = Math.max(overlayWidth * 1.3, torsoHeight * 2.2);
      const x = shoulderX - overlayWidth / 2;
      const y = shoulderY - torsoHeight * 0.6;

      ctx.globalAlpha = 0.95;
      ctx.drawImage(imageRef.current, x, y, overlayWidth, overlayHeight);
      ctx.globalAlpha = 1;
    });

    poseRef.current = pose;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (poseRef.current && videoRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
      },
      width: 720,
      height: 540,
    });

    camera.start();
    cameraRef.current = camera;

    return () => {
      cameraRef.current?.stop();
      poseRef.current?.close();
      cameraRef.current = null;
      poseRef.current = null;
    };
  }, [open, imageSrc]);

  if (!open) return null;

  const captureHandler = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setCaptured(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="app-card w-full max-w-4xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-foreground">AR Try‑On (Beta)</h3>
            <p className="text-sm text-muted">Best for clothing. Good lighting improves accuracy.</p>
          </div>
          <button onClick={onClose} className="text-sm font-bold text-primary">Close</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative w-full overflow-hidden rounded-lg border border-app bg-black">
              <video ref={videoRef} className="hidden" playsInline />
              <canvas ref={canvasRef} className="w-full h-auto block" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="app-card p-4">
              <div className="text-xs uppercase text-muted font-black">Product</div>
              <div className="text-lg font-black text-foreground mt-1">{productName}</div>
              <div className="text-xs text-muted mt-2">Align yourself in frame, then capture.</div>
            </div>

            <button onClick={captureHandler} className="app-btn w-full py-3">
              Capture
            </button>

            {captured && (
              <div className="app-card p-4">
                <div className="text-xs uppercase text-muted font-black mb-2">Preview</div>
                <img src={captured} alt="AR capture" className="w-full rounded-md" />
                <a
                  href={captured}
                  download="flitstore-tryon.png"
                  className="mt-3 inline-block text-sm font-bold text-primary"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARTryOnModal;
