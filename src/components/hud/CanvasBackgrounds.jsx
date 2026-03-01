import React from 'react';

// Starfield canvas component for cosmic background effect
function StarfieldCanvas({ rankCode = 'seeker' }) {
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
  
  // Rank-based star colors
  const rankColors = {
    seeker: ['#6b7280', '#9ca3af', '#00d4ff'],
    initiate: ['#60a5fa', '#93c5fd', '#00d4ff'],
    adept: ['#34d399', '#6ee7b7', '#00ff88'],
    practitioner: ['#10b981', '#a7f3d0', '#00ff88'],
    master: ['#f59e0b', '#fcd34d', '#fef3c7'],
    sage: ['#8b5cf6', '#c4b5fd', '#f59e0b'],
    oracle: ['#6366f1', '#a5b4fc', '#fde68a'],
    ascended: ['#fef3c7', '#fde68a', '#f59e0b'],
    guardian: ['#f59e0b', '#fcd34d', '#ffffff']
  };
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const stars = [];
    const numStars = 150;
    const colors = rankColors[rankCode] || rankColors.seeker;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Initialize stars with varying depths
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 3 + 0.5,
        baseSize: Math.random() * 2 + 0.5,
        colorIdx: Math.floor(Math.random() * colors.length),
        twinkle: Math.random() * Math.PI * 2,
        baseTwinkleSpeed: Math.random() * 0.02 + 0.01,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.01 + 0.005,
        wobbleAmplitude: Math.random() * 20 + 10
      });
    }
    
    const animate = () => {
      const { speed, brightness, variance } = settingsRef.current;
      ctx.fillStyle = `rgba(5, 5, 5, ${0.08 + variance * 0.04})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach((star, i) => {
        const twinkleSpeed = star.baseTwinkleSpeed * (1 + variance * Math.sin(Date.now() * 0.001 + i));
        star.twinkle += twinkleSpeed * speed;
        star.wobblePhase += star.wobbleSpeed * speed;
        
        star.x -= star.z * 0.15 * speed;
        
        const wobbleY = variance > 0.3 ? Math.sin(star.wobblePhase) * star.wobbleAmplitude * variance : 0;
        
        if (star.x < 0) {
          star.x = canvas.width;
          star.y = Math.random() * canvas.height;
        }
        
        const sizeVariation = 1 + Math.sin(star.twinkle * 2) * variance * 0.5;
        const size = star.baseSize * sizeVariation;
        
        const twinkleIntensity = 0.4 + variance * 0.3;
        const alpha = (0.5 + Math.sin(star.twinkle) * twinkleIntensity) * brightness;
        const glowSize = size * (1 + Math.sin(star.twinkle) * (0.3 + variance * 0.4));
        
        let color = colors[star.colorIdx];
        if (variance > 0.6) {
          const cycleIdx = Math.floor((star.colorIdx + star.twinkle * 0.1) % colors.length);
          color = colors[cycleIdx];
        }
        
        const drawY = star.y + wobbleY;
        
        const glowMultiplier = 3 + variance * 2;
        const gradient = ctx.createRadialGradient(star.x, drawY, 0, star.x, drawY, glowSize * glowMultiplier);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.3 + variance * 0.2, color + '60');
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(star.x, drawY, glowSize * glowMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha * (0.3 + variance * 0.2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(star.x, drawY, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rankCode]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.7, zIndex: -1 }}
    />
  );
}

// Matrix Rain Canvas
function MatrixRainCanvas() {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const settingsRef = React.useRef({ speed: 1, brightness: 0.8, variance: 0.5 });
  
  React.useEffect(() => {
    try {
      const savedSpeed = parseFloat(localStorage.getItem('matrixSpeed')) || 1;
      const savedBrightness = parseFloat(localStorage.getItem('matrixBrightness')) || 0.8;
      const savedVariance = parseFloat(localStorage.getItem('matrixVariance')) || 0.5;
      settingsRef.current = { speed: savedSpeed, brightness: savedBrightness, variance: savedVariance };
    } catch {}
    
    const handleSettingsChange = (e) => {
      if (e.detail) {
        settingsRef.current = { 
          speed: e.detail.speed ?? settingsRef.current.speed, 
          brightness: e.detail.brightness ?? settingsRef.current.brightness,
          variance: e.detail.variance ?? settingsRef.current.variance
        };
      }
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
    };
    resize();
    window.addEventListener('resize', resize);
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';
    const charArray = chars.split('');
    
    const baseFontSize = 14;
    const columns = Math.floor(canvas.width / baseFontSize);
    
    const drops = Array(columns).fill(1);
    
    const columnProps = Array(columns).fill(0).map(() => ({
      baseSpeed: Math.random() * 0.2 + 0.15,
      fontSize: baseFontSize,
      hueShift: 0,
      trailLength: 15
    }));
    
    const draw = () => {
      const { speed, brightness, variance } = settingsRef.current;
      
      columnProps.forEach((prop, i) => {
        prop.fontSize = baseFontSize + (Math.sin(Date.now() * 0.001 + i) * variance * 6);
        prop.hueShift = variance * 30 * Math.sin(Date.now() * 0.0005 + i * 0.5);
        prop.trailLength = Math.floor(10 + variance * 20 + Math.sin(Date.now() * 0.002 + i) * variance * 10);
      });
      
      ctx.fillStyle = `rgba(0, 0, 0, ${0.03 + (1 - variance) * 0.04})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < drops.length; i++) {
        const prop = columnProps[i];
        ctx.font = `${Math.floor(prop.fontSize)}px monospace`;
        
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        
        const x = i * baseFontSize;
        const y = drops[i] * baseFontSize;
        
        const greenVal = Math.floor(255 * brightness);
        const redVal = Math.floor(Math.max(0, prop.hueShift) * brightness);
        const blueVal = Math.floor(Math.max(0, -prop.hueShift + 50 * variance) * brightness);
        
        ctx.fillStyle = `rgb(${redVal}, ${greenVal}, ${blueVal})`;
        ctx.shadowColor = `rgb(${redVal}, ${greenVal}, ${blueVal})`;
        ctx.shadowBlur = (10 + variance * 10) * brightness;
        ctx.fillText(char, x, y);
        
        ctx.shadowBlur = 0;
        for (let j = 1; j < prop.trailLength; j++) {
          const trailY = y - (j * baseFontSize);
          if (trailY > 0) {
            const opacity = (1 - (j / prop.trailLength)) * brightness;
            ctx.fillStyle = `rgba(${redVal}, ${greenVal}, ${blueVal}, ${opacity * 0.5})`;
            const trailChar = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(trailChar, x, trailY);
          }
        }
        
        const resetThreshold = 0.97 - variance * 0.03;
        if (y > canvas.height && Math.random() > resetThreshold) {
          drops[i] = 0;
        }
        
        const speedVariation = 1 + (Math.sin(Date.now() * 0.003 + i * 2) * variance * 0.5);
        drops[i] += prop.baseSpeed * speed * speedVariation;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
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

// Nebula canvas effect
function NebulaCanvas() {
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
    const particles = [];
    const baseColors = ['#00ff88', '#00d4ff', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];
    const numParticles = 60;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseSize: Math.random() * 150 + 50,
        colorIdx: Math.floor(Math.random() * baseColors.length),
        baseVx: (Math.random() - 0.5) * 0.3,
        baseVy: (Math.random() - 0.5) * 0.3,
        baseOpacity: Math.random() * 0.15 + 0.05,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        orbitPhase: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 50 + 20
      });
    }
    
    const animate = () => {
      const { speed, brightness, variance } = settingsRef.current;
      ctx.fillStyle = `rgba(5, 5, 5, ${0.02 + variance * 0.02})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.pulsePhase += p.pulseSpeed * speed;
        p.orbitPhase += 0.005 * speed * (1 + variance);
        
        const orbitX = variance > 0.3 ? Math.cos(p.orbitPhase) * p.orbitRadius * variance : 0;
        const orbitY = variance > 0.3 ? Math.sin(p.orbitPhase) * p.orbitRadius * variance : 0;
        
        p.x += p.baseVx * speed * (1 + variance * Math.sin(p.pulsePhase));
        p.y += p.baseVy * speed * (1 + variance * Math.cos(p.pulsePhase));
        
        if (p.x < -p.baseSize) p.x = canvas.width + p.baseSize;
        if (p.x > canvas.width + p.baseSize) p.x = -p.baseSize;
        if (p.y < -p.baseSize) p.y = canvas.height + p.baseSize;
        if (p.y > canvas.height + p.baseSize) p.y = -p.baseSize;
        
        const sizePulse = 1 + Math.sin(p.pulsePhase) * variance * 0.4;
        const size = p.baseSize * sizePulse;
        
        const opacityPulse = 1 + Math.sin(p.pulsePhase * 1.5) * variance * 0.5;
        const adjustedOpacity = p.baseOpacity * brightness * opacityPulse;
        
        let color = baseColors[p.colorIdx];
        if (variance > 0.5) {
          const cycleIdx = Math.floor((p.colorIdx + Date.now() * 0.0001 * variance) % baseColors.length);
          color = baseColors[cycleIdx];
        }
        
        const drawX = p.x + orbitX;
        const drawY = p.y + orbitY;
        
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, size);
        gradient.addColorStop(0, color + Math.floor(Math.min(1, adjustedOpacity) * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5 + variance * 0.3, color + Math.floor(adjustedOpacity * 0.3 * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
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
      style={{ opacity: 0.8, zIndex: -1 }}
    />
  );
}

// Circuit board effect
function CircuitCanvas() {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const settingsRef = React.useRef({ speed: 1, brightness: 0.8, variance: 0.5 });
  const gridDataRef = React.useRef(null);
  
  React.useEffect(() => {
    try {
      settingsRef.current = {
        speed: parseFloat(localStorage.getItem('matrixSpeed')) || 1,
        brightness: parseFloat(localStorage.getItem('matrixBrightness')) || 0.8,
        variance: parseFloat(localStorage.getItem('matrixVariance')) || 0.5
      };
    } catch {}
    const handleSettingsChange = (e) => {
      if (e.detail) {
        const newVariance = e.detail.variance ?? settingsRef.current.variance;
        const oldVariance = settingsRef.current.variance;
        settingsRef.current = { 
          speed: e.detail.speed ?? 1, 
          brightness: e.detail.brightness ?? 0.8,
          variance: newVariance
        };
        if (Math.abs(newVariance - oldVariance) > 0.05 && gridDataRef.current) {
          gridDataRef.current.needsRegen = true;
        }
      }
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
      if (gridDataRef.current) gridDataRef.current.needsRegen = true;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const generateGrid = (variance) => {
      const nodes = [];
      const traces = [];
      const gridLines = [];
      
      const baseSpacing = 80;
      const gridSpacing = baseSpacing - (variance * 40);
      const cols = Math.ceil(canvas.width / gridSpacing) + 1;
      const rows = Math.ceil(canvas.height / gridSpacing) + 1;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gridSpacing;
          const y = row * gridSpacing;
          const offsetX = (Math.random() - 0.5) * (10 + variance * 30);
          const offsetY = (Math.random() - 0.5) * (10 + variance * 30);
          nodes.push({
            x: x + offsetX,
            y: y + offsetY,
            baseX: x,
            baseY: y,
            gridX: col,
            gridY: row,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.01 + Math.random() * variance * 0.03,
            size: Math.random() * (2 + variance * 3) + 2,
            isJunction: Math.random() > (0.8 - variance * 0.3)
          });
        }
      }
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const idx = row * cols + col;
          if (Math.random() > variance * 0.3) {
            gridLines.push({ from: idx, to: idx + 1, type: 'horizontal' });
          }
        }
      }
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          if (Math.random() > variance * 0.3) {
            gridLines.push({ from: idx, to: idx + cols, type: 'vertical' });
          }
        }
      }
      
      const diagThreshold = 0.7 - variance * 0.5;
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const idx = row * cols + col;
          if (Math.random() > diagThreshold) {
            gridLines.push({ from: idx, to: idx + cols + 1, type: 'diagonal' });
          }
          if (Math.random() > diagThreshold) {
            gridLines.push({ from: idx + 1, to: idx + cols, type: 'diagonal' });
          }
        }
      }
      
      if (variance > 0.4) {
        for (let row = 0; row < rows - 2; row++) {
          for (let col = 0; col < cols - 2; col++) {
            const idx = row * cols + col;
            if (Math.random() > (1 - variance * 0.5)) {
              gridLines.push({ from: idx, to: idx + cols * 2 + 2, type: 'long_diagonal' });
            }
            if (Math.random() > (1 - variance * 0.5)) {
              gridLines.push({ from: idx + 2, to: idx + cols * 2, type: 'long_diagonal' });
            }
          }
        }
      }
      
      const traceThreshold = 0.9 - variance * 0.4;
      gridLines.forEach((line, i) => {
        if (Math.random() > traceThreshold) {
          traces.push({ 
            lineIdx: i, 
            progress: 0, 
            active: false, 
            delay: Math.random() * 200,
            speed: (Math.random() * 0.02 + 0.01) * (1 + variance)
          });
        }
      });
      
      return { nodes, traces, gridLines, cols, needsRegen: false };
    };
    
    gridDataRef.current = generateGrid(settingsRef.current.variance);
    
    let frame = 0;
    const animate = () => {
      const { speed, brightness, variance } = settingsRef.current;
      
      if (gridDataRef.current.needsRegen) {
        gridDataRef.current = generateGrid(variance);
      }
      
      const { nodes, traces, gridLines } = gridDataRef.current;
      
      frame++;
      ctx.fillStyle = `rgba(5, 5, 5, ${0.03 + variance * 0.02})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const greenVal = Math.floor(255 * brightness);
      const tealVal = Math.floor(200 * brightness);
      
      gridLines.forEach((line, idx) => {
        const from = nodes[line.from];
        const to = nodes[line.to];
        if (!from || !to) return;
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        const lineOpacity = line.type === 'horizontal' || line.type === 'vertical' ? 0.12 : 0.06;
        ctx.strokeStyle = `rgba(0, ${greenVal}, 136, ${lineOpacity * brightness})`;
        ctx.lineWidth = line.type === 'long_diagonal' ? 0.3 : (line.type === 'diagonal' ? 0.5 : 1);
        ctx.stroke();
      });
      
      traces.forEach(trace => {
        const line = gridLines[trace.lineIdx];
        if (!line) return;
        const from = nodes[line.from];
        const to = nodes[line.to];
        if (!from || !to) return;
        
        const triggerFrame = Math.floor((80 - variance * 40) / speed);
        if (frame % Math.max(1, triggerFrame) === Math.floor(trace.delay / speed) % Math.max(1, triggerFrame)) {
          trace.active = true;
          trace.progress = 0;
        }
        
        if (trace.active) {
          trace.progress += trace.speed * speed;
          if (trace.progress >= 1) {
            trace.active = false;
            const endNode = line.to;
            traces.forEach(t => {
              const tLine = gridLines[t.lineIdx];
              if (tLine && (tLine.from === endNode || tLine.to === endNode) && Math.random() > (0.8 - variance * 0.3)) {
                t.active = true;
                t.progress = 0;
              }
            });
          }
          
          const px = from.x + (to.x - from.x) * trace.progress;
          const py = from.y + (to.y - from.y) * trace.progress;
          
          ctx.beginPath();
          ctx.arc(px, py, 3 + variance * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(0, ${greenVal}, 136)`;
          ctx.shadowColor = `rgb(0, ${greenVal}, 136)`;
          ctx.shadowBlur = (15 + variance * 10) * brightness;
          ctx.fill();
          
          const trailLen = Math.floor(5 + variance * 5);
          for (let t = 1; t <= trailLen; t++) {
            const trailProgress = trace.progress - t * 0.04;
            if (trailProgress > 0) {
              const tx = from.x + (to.x - from.x) * trailProgress;
              const ty = from.y + (to.y - from.y) * trailProgress;
              ctx.beginPath();
              ctx.arc(tx, ty, 1.5 + variance, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, ${tealVal}, 255, ${(1 - t/trailLen) * 0.5 * brightness})`;
              ctx.fill();
            }
          }
          ctx.shadowBlur = 0;
        }
      });
      
      nodes.forEach(node => {
        node.pulse += node.pulseSpeed * speed;
        const baseBrightness = node.isJunction ? 0.7 : 0.4;
        const glow = (baseBrightness + Math.sin(node.pulse) * (0.2 + variance * 0.2)) * brightness;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.isJunction ? node.size * 1.5 : node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, ${greenVal}, 136, ${glow})`;
        if (node.isJunction) {
          ctx.shadowColor = `rgb(0, ${greenVal}, 136)`;
          ctx.shadowBlur = (6 + variance * 6) * brightness;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
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
      style={{ opacity: 0.7, zIndex: -1 }}
    />
  );
}

export default function CanvasBackgrounds({ theme, bgEffect, rankCode }) {
  const showStarfield = (theme === 'dark' || theme === 'hacker') && bgEffect === 'starfield';
  const showMatrixRain = (theme === 'dark' || theme === 'hacker') && bgEffect === 'matrix';
  const showNebula = (theme === 'dark' || theme === 'hacker') && bgEffect === 'nebula';
  const showCircuit = (theme === 'dark' || theme === 'hacker') && bgEffect === 'circuit';

  return (
    <>
      {showStarfield && <StarfieldCanvas rankCode={rankCode} />}
      {showMatrixRain && <MatrixRainCanvas />}
      {showNebula && <NebulaCanvas />}
      {showCircuit && <CircuitCanvas />}
    </>
  );
}