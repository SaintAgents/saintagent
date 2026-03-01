import React from 'react';

// Fractal canvas effect with recursive geometric shapes
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
    const handleSettingsChange = (e) => {
      if (e.detail) settingsRef.current = { 
        speed: e.detail.speed ?? 1, 
        brightness: e.detail.brightness ?? 0.8,
        variance: e.detail.variance ?? 0.5
      };
    };
    document.addEventListener('matrixSettingsChange', handleSettingsChange);
    return () => document.removeEventListener('matrixSettingsChange', handleSettingsChange);
  }, []);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFractals();
    };
    resize();
    window.addEventListener('resize', resize);
    
    const colors = ['#00ff88', '#00d4ff', '#a855f7', '#ec4899', '#f59e0b'];
    
    // Draw recursive fractal triangle
    const drawSierpinskiTriangle = (x, y, size, depth, rotation, colorIdx, opacity) => {
      if (depth === 0 || size < 2) return;
      
      const { brightness, variance } = settingsRef.current;
      const color = colors[colorIdx % colors.length];
      const alpha = opacity * brightness;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.closePath();
      
      ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1 + variance;
      ctx.shadowColor = color;
      ctx.shadowBlur = (8 + variance * 8) * brightness;
      ctx.stroke();
      
      ctx.restore();
      
      // Recurse to 3 smaller triangles
      const halfSize = size / 2;
      const nextDepth = depth - 1;
      const nextOpacity = opacity * (0.85 - variance * 0.1);
      const rotationDelta = variance * 0.1;
      
      drawSierpinskiTriangle(x, y - size / 4, halfSize, nextDepth, rotation + rotationDelta, colorIdx, nextOpacity);
      drawSierpinskiTriangle(x - size / 4, y + size / 4, halfSize, nextDepth, rotation - rotationDelta, colorIdx + 1, nextOpacity);
      drawSierpinskiTriangle(x + size / 4, y + size / 4, halfSize, nextDepth, rotation + rotationDelta, colorIdx + 2, nextOpacity);
    };
    
    // Draw recursive fractal squares
    const drawFractalSquares = (x, y, size, depth, rotation, colorIdx, opacity) => {
      if (depth === 0 || size < 3) return;
      
      const { brightness, variance } = settingsRef.current;
      const color = colors[colorIdx % colors.length];
      const alpha = opacity * brightness;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 1 + variance * 0.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = (6 + variance * 6) * brightness;
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      
      ctx.restore();
      
      // Recurse to 4 corner squares
      const nextSize = size * (0.4 + variance * 0.05);
      const offset = size * (0.3 + variance * 0.05);
      const nextDepth = depth - 1;
      const nextOpacity = opacity * (0.8 - variance * 0.1);
      const rotationDelta = variance * 0.15;
      
      drawFractalSquares(x - offset, y - offset, nextSize, nextDepth, rotation + rotationDelta, colorIdx + 1, nextOpacity);
      drawFractalSquares(x + offset, y - offset, nextSize, nextDepth, rotation - rotationDelta, colorIdx + 2, nextOpacity);
      drawFractalSquares(x - offset, y + offset, nextSize, nextDepth, rotation - rotationDelta, colorIdx + 3, nextOpacity);
      drawFractalSquares(x + offset, y + offset, nextSize, nextDepth, rotation + rotationDelta, colorIdx + 4, nextOpacity);
    };
    
    let time = 0;
    let fractals = [];
    
    const initFractals = () => {
      fractals = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, baseSize: 280, type: 'triangle', colorStart: 0, phase: 0 },
        { x: canvas.width * 0.7, y: canvas.height * 0.4, baseSize: 250, type: 'square', colorStart: 2, phase: Math.PI },
        { x: canvas.width * 0.5, y: canvas.height * 0.7, baseSize: 300, type: 'triangle', colorStart: 4, phase: Math.PI * 1.5 }
      ];
    };
    initFractals();
    
    const animate = () => {
      const { speed, brightness, variance } = settingsRef.current;
      
      time += 0.005 * speed;
      ctx.fillStyle = `rgba(5, 5, 5, ${0.04 + variance * 0.02})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      fractals.forEach((fractal, i) => {
        const rotation = time * (0.5 + i * 0.2) * (1 + variance * 0.5);
        const pulse = 1 + Math.sin(time * 2 + fractal.phase) * (0.15 + variance * 0.15);
        const size = fractal.baseSize * pulse;
        const maxDepth = Math.floor(4 + variance * 2);
        
        if (fractal.type === 'triangle') {
          drawSierpinskiTriangle(fractal.x, fractal.y, size, maxDepth, rotation, fractal.colorStart, 0.6);
        } else {
          drawFractalSquares(fractal.x, fractal.y, size, maxDepth, rotation, fractal.colorStart, 0.6);
        }
      });
      
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
      style={{ opacity: 0.9, zIndex: -1 }}
    />
  );
}