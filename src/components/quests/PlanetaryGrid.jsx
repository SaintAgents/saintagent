import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

// Planetary Grid visualization showing user nodes lighting up
export default function PlanetaryGrid({ 
  activeNodes = 0, 
  totalNodes = 144000,
  userNodeActive = false,
  className 
}) {
  const canvasRef = useRef(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(p => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(5, 5, 10, 0.95)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw Earth outline
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(20, 60, 100, 0.3)');
    gradient.addColorStop(0.7, 'rgba(10, 40, 80, 0.2)');
    gradient.addColorStop(1, 'rgba(5, 20, 40, 0.1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw grid lines (sacred geometry)
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.15)';
    ctx.lineWidth = 0.5;
    
    // Latitude lines
    for (let i = -3; i <= 3; i++) {
      const y = centerY + (i * radius / 4);
      const xOffset = Math.sqrt(radius * radius - (i * radius / 4) ** 2) || 0;
      ctx.beginPath();
      ctx.ellipse(centerX, y, xOffset, xOffset * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Longitude lines
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * Math.cos(angle), radius, angle, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw crystalline grid overlay
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.lineWidth = 1;
    
    // Icosahedral vertices (simplified)
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices = [];
    const scale = radius * 0.8;
    
    // Generate icosahedron vertices
    [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
     [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
     [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]].forEach(([x, y, z]) => {
      const len = Math.sqrt(x*x + y*y + z*z);
      // Project to 2D with rotation
      const rotAngle = animationPhase * Math.PI / 180 * 0.5;
      const rx = x * Math.cos(rotAngle) - z * Math.sin(rotAngle);
      const rz = x * Math.sin(rotAngle) + z * Math.cos(rotAngle);
      vertices.push({
        x: centerX + (rx / len) * scale * 0.8,
        y: centerY + (y / len) * scale * 0.5,
        z: rz
      });
    });
    
    // Draw edges between nearby vertices
    ctx.beginPath();
    vertices.forEach((v1, i) => {
      vertices.slice(i + 1).forEach(v2 => {
        const dist = Math.sqrt((v1.x - v2.x)**2 + (v1.y - v2.y)**2);
        if (dist < scale * 0.7) {
          ctx.moveTo(v1.x, v1.y);
          ctx.lineTo(v2.x, v2.y);
        }
      });
    });
    ctx.stroke();
    
    // Draw active nodes
    const nodePercentage = Math.min(activeNodes / totalNodes, 1);
    const displayNodes = Math.min(144, Math.ceil(nodePercentage * 144)); // Show up to 144 visual nodes
    
    for (let i = 0; i < displayNodes; i++) {
      // Fibonacci spiral distribution
      const golden = (1 + Math.sqrt(5)) / 2;
      const theta = 2 * Math.PI * i / (golden * golden);
      const r = radius * 0.9 * Math.sqrt(i / 144);
      
      const nx = centerX + r * Math.cos(theta + animationPhase * 0.02);
      const ny = centerY + r * Math.sin(theta + animationPhase * 0.02) * 0.6;
      
      // Node glow
      const nodeGradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, 8);
      nodeGradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
      nodeGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
      nodeGradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      ctx.fillStyle = nodeGradient;
      ctx.fill();
      
      // Core
      ctx.beginPath();
      ctx.arc(nx, ny, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
    }
    
    // Draw user's node (larger, pulsing)
    if (userNodeActive) {
      const pulseSize = 12 + Math.sin(animationPhase * 0.1) * 4;
      const userGradient = ctx.createRadialGradient(centerX, centerY - radius * 0.3, 0, centerX, centerY - radius * 0.3, pulseSize * 2);
      userGradient.addColorStop(0, 'rgba(0, 255, 136, 1)');
      userGradient.addColorStop(0.3, 'rgba(168, 85, 247, 0.8)');
      userGradient.addColorStop(0.6, 'rgba(255, 215, 0, 0.4)');
      userGradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY - radius * 0.3, pulseSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = userGradient;
      ctx.fill();
      
      // User node core
      ctx.beginPath();
      ctx.arc(centerX, centerY - radius * 0.3, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // "YOU" label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', centerX, centerY - radius * 0.3 + 25);
    }
    
    // Draw connection lines from user to nearby nodes
    if (userNodeActive && displayNodes > 0) {
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < Math.min(5, displayNodes); i++) {
        const golden = (1 + Math.sqrt(5)) / 2;
        const theta = 2 * Math.PI * i / (golden * golden);
        const r = radius * 0.9 * Math.sqrt(i / 144);
        const nx = centerX + r * Math.cos(theta + animationPhase * 0.02);
        const ny = centerY + r * Math.sin(theta + animationPhase * 0.02) * 0.6;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius * 0.3);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      }
    }
    
  }, [animationPhase, activeNodes, totalNodes, userNodeActive]);

  const percentage = ((activeNodes / totalNodes) * 100).toFixed(4);

  return (
    <div className={cn("relative", className)}>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400}
        className="w-full max-w-[400px] mx-auto rounded-2xl"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-violet-500/30">
          <p className="text-amber-400 font-bold text-lg">{activeNodes.toLocaleString()} / 144,000</p>
          <p className="text-violet-300 text-xs">Nodes Activated ({percentage}%)</p>
        </div>
      </div>
    </div>
  );
}