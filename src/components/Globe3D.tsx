'use client';

import { useEffect, useRef } from 'react';

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Globe properties
    let rotation = 0;
    const globeRadius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Create latitude and longitude lines
    const drawGlobe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw meridians (longitude lines)
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 + rotation;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.15)';
        ctx.lineWidth = 1;

        for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += 0.1) {
          const x = centerX + globeRadius * Math.cos(lat) * Math.sin(angle);
          const y = centerY + globeRadius * Math.sin(lat);
          const z = globeRadius * Math.cos(lat) * Math.cos(angle);

          if (z > 0) {
            if (lat === -Math.PI / 2) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
      }

      // Draw parallels (latitude lines)
      for (let i = -2; i <= 2; i++) {
        const lat = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.15)';
        ctx.lineWidth = 1;

        for (let lng = 0; lng <= Math.PI * 2; lng += 0.1) {
          const angle = lng + rotation;
          const x = centerX + globeRadius * Math.cos(lat) * Math.sin(angle);
          const y = centerY + globeRadius * Math.sin(lat);
          const z = globeRadius * Math.cos(lat) * Math.cos(angle);

          if (z > 0) {
            if (lng === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
      }

      // Draw subtle outer circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139, 115, 85, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // Animation loop
    const animate = () => {
      drawGlobe();
      rotation += 0.002; // Slow rotation
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  );
}
