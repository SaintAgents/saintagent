import React, { useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

// Convert lat/lng to 3D sphere coordinates
function latLngToSphere(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return { x, y, z };
}

export default function SpinningGlobe({ 
  users = [], 
  circles = [],
  geoFences = [],
  onUserClick,
  onCircleClick,
  className,
  size = 400,
  autoRotate = true,
  rotationSpeed = 0.002
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rotationRef = useRef({ x: 0.3, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Combine users and circles into bubbles
  const bubbles = [
    ...users.map(u => ({
      type: 'user',
      id: u.user_id || u.id,
      name: u.display_name || u.full_name || 'User',
      lat: u.latitude || (Math.random() * 180 - 90),
      lng: u.longitude || (Math.random() * 360 - 180),
      avatar: u.avatar_url,
      color: u.status === 'online' ? '#22c55e' : '#6366f1',
      size: 6,
      data: u
    })),
    ...circles.map(c => ({
      type: 'circle',
      id: c.id,
      name: c.name,
      lat: c.latitude || (Math.random() * 180 - 90),
      lng: c.longitude || (Math.random() * 360 - 180),
      color: '#f59e0b',
      size: 8 + Math.min(c.member_count || 0, 20),
      memberCount: c.member_count || 0,
      data: c
    }))
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw globe background - ocean
      const oceanGradient = ctx.createRadialGradient(centerX - 30, centerY - 30, 0, centerX, centerY, radius);
      oceanGradient.addColorStop(0, '#1e40af');
      oceanGradient.addColorStop(0.5, '#1e3a8a');
      oceanGradient.addColorStop(1, '#172554');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = oceanGradient;
      ctx.fill();

      // Draw simplified continents
      const continents = [
        // North America
        { points: [[60, -130], [70, -140], [70, -100], [60, -80], [50, -60], [30, -80], [25, -100], [30, -120], [40, -125], [50, -130]], color: '#22c55e' },
        // South America
        { points: [[10, -80], [5, -60], [-10, -40], [-20, -45], [-35, -60], [-55, -70], [-50, -75], [-35, -70], [-20, -70], [0, -80]], color: '#16a34a' },
        // Europe
        { points: [[70, 10], [60, 0], [50, -10], [40, 0], [45, 20], [55, 40], [65, 30], [70, 25]], color: '#15803d' },
        // Africa
        { points: [[35, -10], [30, 30], [20, 40], [5, 40], [-10, 40], [-30, 25], [-35, 20], [-25, 15], [-10, -10], [10, -20], [30, -10]], color: '#166534' },
        // Asia
        { points: [[70, 60], [70, 120], [60, 140], [50, 130], [30, 120], [20, 100], [25, 70], [40, 50], [50, 50], [60, 40], [70, 50]], color: '#14532d' },
        // Australia
        { points: [[-15, 130], [-20, 145], [-30, 150], [-35, 140], [-30, 115], [-20, 115]], color: '#15803d' },
      ];

      // Draw continents
      continents.forEach(continent => {
        ctx.beginPath();
        let firstVisible = true;
        let hasVisiblePoints = false;
        
        continent.points.forEach((point, i) => {
          const pos = latLngToSphere(point[0], point[1], radius);
          const rotated = rotatePoint(pos, rotationRef.current.x, rotationRef.current.y);
          
          if (rotated.z > -radius * 0.1) {
            hasVisiblePoints = true;
            const screenX = centerX + rotated.x;
            const screenY = centerY - rotated.y;
            
            if (firstVisible) {
              ctx.moveTo(screenX, screenY);
              firstVisible = false;
            } else {
              ctx.lineTo(screenX, screenY);
            }
          }
        });
        
        if (hasVisiblePoints) {
          ctx.closePath();
          ctx.fillStyle = continent.color + 'cc';
          ctx.fill();
          ctx.strokeStyle = continent.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw globe outline glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw latitude/longitude grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lng = 0; lng <= 360; lng += 5) {
          const pos = latLngToSphere(lat, lng, radius);
          const rotated = rotatePoint(pos, rotationRef.current.x, rotationRef.current.y);
          if (rotated.z > 0) {
            const screenX = centerX + rotated.x;
            const screenY = centerY - rotated.y;
            if (lng === 0) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          }
        }
        ctx.stroke();
      }

      // Longitude lines
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 5) {
          const pos = latLngToSphere(lat, lng, radius);
          const rotated = rotatePoint(pos, rotationRef.current.x, rotationRef.current.y);
          if (rotated.z > 0) {
            const screenX = centerX + rotated.x;
            const screenY = centerY - rotated.y;
            if (lat === -90) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          }
        }
        ctx.stroke();
      }

      // Draw geo-fences as highlighted regions
      geoFences.forEach(fence => {
        if (fence.coordinates?.length > 2) {
          ctx.beginPath();
          fence.coordinates.forEach((coord, i) => {
            const pos = latLngToSphere(coord.lat, coord.lng, radius);
            const rotated = rotatePoint(pos, rotationRef.current.x, rotationRef.current.y);
            if (rotated.z > 0) {
              const screenX = centerX + rotated.x;
              const screenY = centerY - rotated.y;
              if (i === 0) ctx.moveTo(screenX, screenY);
              else ctx.lineTo(screenX, screenY);
            }
          });
          ctx.closePath();
          ctx.fillStyle = (fence.color || '#00ff88') + '30';
          ctx.fill();
          ctx.strokeStyle = fence.color || '#00ff88';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Sort bubbles by z-depth (back to front)
      const sortedBubbles = bubbles.map(bubble => {
        const pos = latLngToSphere(bubble.lat, bubble.lng, radius);
        const rotated = rotatePoint(pos, rotationRef.current.x, rotationRef.current.y);
        return { ...bubble, screenPos: rotated, screenX: centerX + rotated.x, screenY: centerY - rotated.y };
      }).filter(b => b.screenPos.z > -radius * 0.2)
        .sort((a, b) => a.screenPos.z - b.screenPos.z);

      // Draw bubbles
      sortedBubbles.forEach(bubble => {
        const depthFactor = (bubble.screenPos.z + radius) / (2 * radius);
        const bubbleSize = bubble.size * (0.5 + depthFactor * 0.5);
        const opacity = 0.3 + depthFactor * 0.7;

        // Bubble glow
        const glowGradient = ctx.createRadialGradient(
          bubble.screenX, bubble.screenY, 0,
          bubble.screenX, bubble.screenY, bubbleSize * 2
        );
        glowGradient.addColorStop(0, bubble.color + Math.floor(opacity * 100).toString(16).padStart(2, '0'));
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(bubble.screenX, bubble.screenY, bubbleSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Bubble core
        ctx.beginPath();
        ctx.arc(bubble.screenX, bubble.screenY, bubbleSize, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Highlight
        ctx.beginPath();
        ctx.arc(bubble.screenX - bubbleSize * 0.3, bubble.screenY - bubbleSize * 0.3, bubbleSize * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });

      // Auto-rotate
      if (autoRotate && !isDragging.current) {
        rotationRef.current.y += rotationSpeed;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [size, bubbles, geoFences, autoRotate, rotationSpeed]);

  // Rotation helper
  function rotatePoint(point, rotX, rotY) {
    // Rotate around Y axis
    let x = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
    let z = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
    let y = point.y;

    // Rotate around X axis
    const newY = y * Math.cos(rotX) - z * Math.sin(rotX);
    const newZ = y * Math.sin(rotX) + z * Math.cos(rotX);

    return { x, y: newY, z: newZ };
  }

  // Mouse handlers for dragging
  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      const deltaX = e.clientX - lastMouse.current.x;
      const deltaY = e.clientY - lastMouse.current.y;
      rotationRef.current.y += deltaX * 0.005;
      rotationRef.current.x += deltaY * 0.005;
      rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }

    // Check for hover
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;

    let foundHover = null;
    bubbles.forEach(bubble => {
      const pos = latLngToSphere(bubble.lat, bubble.lng, radius);
      const rotated = rotatePoint(pos, rotationRef.current.x, rotationRef.current.y);
      if (rotated.z > 0) {
        const screenX = centerX + rotated.x;
        const screenY = centerY - rotated.y;
        const dist = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - screenY) ** 2);
        if (dist < bubble.size + 5) {
          foundHover = bubble;
          setTooltipPos({ x: e.clientX, y: e.clientY });
        }
      }
    });
    setHoveredItem(foundHover);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleClick = (e) => {
    if (hoveredItem) {
      if (hoveredItem.type === 'user' && onUserClick) {
        onUserClick(hoveredItem.data);
      } else if (hoveredItem.type === 'circle' && onCircleClick) {
        onCircleClick(hoveredItem.data);
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      
      {/* Tooltip */}
      {hoveredItem && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg bg-slate-900/95 border border-slate-700 text-white text-sm shadow-xl pointer-events-none"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="font-semibold">{hoveredItem.name}</div>
          {hoveredItem.type === 'circle' && (
            <div className="text-xs text-slate-400">{hoveredItem.memberCount} members</div>
          )}
          {hoveredItem.type === 'user' && hoveredItem.data?.status && (
            <div className={cn(
              "text-xs",
              hoveredItem.data.status === 'online' ? 'text-green-400' : 'text-slate-400'
            )}>
              {hoveredItem.data.status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}