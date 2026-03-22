import React from 'react';

// Sacred geometry fractal background — animated rotating fractal patterns
export default function FractalCanvas() {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const settingsRef = React.useRef({ speed: 1, brightness: 0.8, variance: 0.5 });

  React.useEffect(() => {
    try {
      settingsRef.current = {
        speed: parseFloat(localStorage.getItem('matrixSpeed')) || 1,
        brightness: parseFloat(localStorage.getItem('matrixBrightness')) || 0.8,
        variance: parseFloat(localStorage.getItem('matrixVariance')) || 0.5
      };
    } catch {}
    const handler = (e) => {
      if (e.detail) settingsRef.current = {
        speed: e.detail.speed ?? 1,
        brightness: e.detail.brightness ?? 0.8,
        variance: e.detail.variance ?? 0.5
      };
    };
    document.addEventListener('matrixSettingsChange', handler);
    return () => document.removeEventListener('matrixSettingsChange', handler);
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    // Sacred geometry helper — draw a Flower of Life-style pattern
    const drawFlowerOfLife = (cx, cy, r, depth, rot, alpha, color) => {
      if (depth <= 0 || alpha < 0.01) return;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 0.5 + depth * 0.3;
      ctx.stroke();

      if (depth > 1) {
        const petals = 6;
        for (let i = 0; i < petals; i++) {
          const angle = rot + (i / petals) * Math.PI * 2;
          const nx = cx + r * Math.cos(angle);
          const ny = cy + r * Math.sin(angle);
          drawFlowerOfLife(nx, ny, r * 0.5, depth - 1, rot + 0.1, alpha * 0.7, color);
        }
      }
    };

    // Spirograph / fractal spiral
    const drawSpiral = (cx, cy, maxR, turns, points, rot, alpha, hue, brightness) => {
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const t = i / points;
        const angle = t * Math.PI * 2 * turns + rot;
        const r = t * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `hsla(${hue}, 80%, ${50 * brightness}%, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // Recursive fractal tree / branch
    const drawBranch = (x, y, len, angle, depth, alpha, hue, brightness) => {
      if (depth <= 0 || alpha < 0.02) return;
      const x2 = x + len * Math.cos(angle);
      const y2 = y + len * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue}, 70%, ${50 * brightness}%, ${alpha})`;
      ctx.lineWidth = depth * 0.5;
      ctx.stroke();

      const spread = 0.5 + settingsRef.current.variance * 0.5;
      drawBranch(x2, y2, len * 0.7, angle - spread, depth - 1, alpha * 0.8, hue + 15, brightness);
      drawBranch(x2, y2, len * 0.7, angle + spread, depth - 1, alpha * 0.8, hue + 15, brightness);
    };

    const animate = () => {
      const { speed, brightness, variance } = settingsRef.current;
      time += 0.005 * speed;

      // Fade trail
      ctx.fillStyle = `rgba(5, 5, 5, ${0.04 + (1 - variance) * 0.03})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseR = Math.min(canvas.width, canvas.height) * 0.25;

      ctx.globalAlpha = 1;

      // Layer 1: Rotating sacred geometry circles
      const numRings = 3 + Math.floor(variance * 4);
      for (let ring = 0; ring < numRings; ring++) {
        const ringR = baseR * (0.3 + ring * 0.25);
        const segments = 6 + Math.floor(variance * 6);
        const rot = time * (0.3 + ring * 0.1) * (ring % 2 === 0 ? 1 : -1);
        const alpha = (0.15 + variance * 0.1) * brightness;
        const hue = (ring * 60 + time * 30) % 360;

        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2 + rot;
          const px = cx + ringR * Math.cos(angle);
          const py = cy + ringR * Math.sin(angle);
          const circleR = ringR * (0.3 + variance * 0.2) * (1 + Math.sin(time * 2 + i) * 0.2);

          ctx.beginPath();
          ctx.arc(px, py, circleR, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${hue}, 80%, ${50 * brightness}%, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Inner detail at high variance
          if (variance > 0.4 && ring < 2) {
            const innerSegs = 3 + Math.floor(variance * 3);
            for (let j = 0; j < innerSegs; j++) {
              const ia = (j / innerSegs) * Math.PI * 2 + rot * 2;
              const ix = px + circleR * 0.5 * Math.cos(ia);
              const iy = py + circleR * 0.5 * Math.sin(ia);
              ctx.beginPath();
              ctx.arc(ix, iy, circleR * 0.25, 0, Math.PI * 2);
              ctx.strokeStyle = `hsla(${hue + 120}, 70%, ${50 * brightness}%, ${alpha * 0.5})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        // Connecting lines between ring nodes
        for (let i = 0; i < segments; i++) {
          const angle1 = (i / segments) * Math.PI * 2 + rot;
          const angle2 = ((i + 1) / segments) * Math.PI * 2 + rot;
          const x1 = cx + ringR * Math.cos(angle1);
          const y1 = cy + ringR * Math.sin(angle1);
          const x2 = cx + ringR * Math.cos(angle2);
          const y2 = cy + ringR * Math.sin(angle2);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsla(${hue}, 60%, ${40 * brightness}%, ${alpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Layer 2: Fractal spirals
      const spiralCount = 2 + Math.floor(variance * 3);
      for (let s = 0; s < spiralCount; s++) {
        const sRot = time * (0.5 + s * 0.2) + (s * Math.PI * 2) / spiralCount;
        const hue = (s * 72 + time * 20) % 360;
        const spiralR = baseR * (0.8 + variance * 0.5);
        const turns = 3 + variance * 4;
        drawSpiral(cx, cy, spiralR, turns, 200, sRot, 0.12 * brightness, hue, brightness);
      }

      // Layer 3: Fractal trees at corners (variance > 0.3)
      if (variance > 0.3) {
        const treeAlpha = (variance - 0.3) * 0.3 * brightness;
        const treeDepth = Math.floor(4 + variance * 4);
        const treeLen = 40 + variance * 30;

        // Bottom center
        drawBranch(cx, canvas.height, treeLen, -Math.PI / 2 + Math.sin(time) * 0.2, treeDepth, treeAlpha, (time * 40) % 360, brightness);

        // Additional corner trees at high variance
        if (variance > 0.6) {
          drawBranch(0, canvas.height, treeLen * 0.7, -Math.PI / 4 + Math.sin(time * 0.7) * 0.15, treeDepth - 1, treeAlpha * 0.6, (time * 40 + 120) % 360, brightness);
          drawBranch(canvas.width, canvas.height, treeLen * 0.7, -Math.PI * 3 / 4 + Math.sin(time * 0.7) * 0.15, treeDepth - 1, treeAlpha * 0.6, (time * 40 + 240) % 360, brightness);
        }
      }

      // Layer 4: Central pulse glow
      const pulseR = 20 + Math.sin(time * 3) * 10 * (1 + variance);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR * 3);
      gradient.addColorStop(0, `hsla(${(time * 50) % 360}, 80%, ${50 * brightness}%, ${0.15 * brightness})`);
      gradient.addColorStop(0.5, `hsla(${(time * 50 + 60) % 360}, 60%, ${30 * brightness}%, ${0.05 * brightness})`);
      gradient.addColorStop(1, 'transparent');
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.8, zIndex: -1 }}
    />
  );
}