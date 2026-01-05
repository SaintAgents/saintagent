import React, { useRef, useEffect, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, User } from "lucide-react";

// Rank colors for nodes
const RANK_COLORS = {
  guardian: '#f59e0b',
  ascended: '#fcd34d',
  oracle: '#818cf8',
  sage: '#a78bfa',
  master: '#f97316',
  practitioner: '#34d399',
  adept: '#4ade80',
  initiate: '#60a5fa',
  seeker: '#94a3b8',
};

export default function NetworkMapView({ profiles, currentUserId, onNodeClick }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const nodesRef = useRef([]);

  // Generate node positions using force-directed layout simulation
  const nodes = useMemo(() => {
    if (!profiles.length) return [];
    
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Position nodes in a spiral pattern based on rank
    const rankOrder = ['guardian', 'ascended', 'oracle', 'sage', 'master', 'practitioner', 'adept', 'initiate', 'seeker'];
    
    return profiles.map((profile, i) => {
      const rankIdx = rankOrder.indexOf(profile.rp_rank_code || 'seeker');
      const angle = (i / profiles.length) * Math.PI * 2 + (rankIdx * 0.5);
      const radius = 100 + rankIdx * 30 + Math.random() * 50;
      
      return {
        id: profile.user_id,
        profile,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 20 - rankIdx * 1.5 + 8,
        color: RANK_COLORS[profile.rp_rank_code] || RANK_COLORS.seeker,
      };
    });
  }, [profiles]);

  // Generate connections between nodes (based on shared skills or followers)
  const connections = useMemo(() => {
    const conns = [];
    const maxConnections = Math.min(profiles.length * 2, 100);
    
    for (let i = 0; i < Math.min(profiles.length, 50); i++) {
      const p1 = profiles[i];
      for (let j = i + 1; j < Math.min(profiles.length, 50); j++) {
        if (conns.length >= maxConnections) break;
        const p2 = profiles[j];
        
        // Connect if they share skills or are in same region
        const sharedSkills = (p1.skills || []).filter(s => (p2.skills || []).includes(s));
        const sameRegion = p1.region && p1.region === p2.region;
        
        if (sharedSkills.length > 0 || sameRegion) {
          conns.push({
            from: p1.user_id,
            to: p2.user_id,
            strength: sharedSkills.length + (sameRegion ? 1 : 0),
          });
        }
      }
    }
    return conns;
  }, [profiles]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Draw the network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Apply transformations
      ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-400, -300);
      
      // Draw connections
      connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.05 + conn.strength * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Draw nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode === node.id;
        const isCurrentUser = node.id === currentUserId;
        
        // Glow effect
        if (isHovered || isCurrentUser) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            node.x, node.y, node.radius,
            node.x, node.y, node.radius + 15
          );
          gradient.addColorStop(0, node.color + '40');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Border
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isHovered ? 3 : 1;
        ctx.stroke();
        
        // Draw avatar if available
        if (node.profile.avatar_url && node.radius > 10) {
          // Avatar would be drawn here - simplified for performance
        }
        
        // Draw name on hover
        if (isHovered) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.profile.display_name || 'Anonymous', node.x, node.y - node.radius - 10);
          
          ctx.font = '10px Inter, sans-serif';
          ctx.fillStyle = node.color;
          ctx.fillText(node.profile.rp_rank_code || 'seeker', node.x, node.y - node.radius - 22);
        }
      });
      
      ctx.restore();
    };
    
    draw();
  }, [nodes, connections, zoom, offset, hoveredNode, currentUserId]);

  // Handle mouse interactions
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (dragging) {
      setOffset({
        x: offset.x + (e.clientX - dragStart.x),
        y: offset.y + (e.clientY - dragStart.y),
      });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Transform mouse coordinates
    const transformedX = (mouseX - canvas.width / 2 - offset.x) / zoom + 400;
    const transformedY = (mouseY - canvas.height / 2 - offset.y) / zoom + 300;
    
    // Check if hovering over a node
    let found = null;
    for (const node of nodesRef.current) {
      const dx = transformedX - node.x;
      const dy = transformedY - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius) {
        found = node.id;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleClick = (e) => {
    if (hoveredNode && onNodeClick) {
      const node = nodes.find(n => n.id === hoveredNode);
      if (node) {
        onNodeClick(node.profile);
      }
    }
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-[#050505] rounded-xl border border-[rgba(0,255,136,0.2)] overflow-hidden">
      <canvas
        ref={canvasRef}
        className={cn("w-full h-full", hoveredNode ? "cursor-pointer" : "cursor-grab", dragging && "cursor-grabbing")}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="outline"
          className="bg-[#0a0a0a] border-[rgba(0,255,136,0.3)] hover:border-[#00ff88] h-8 w-8"
          onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
        >
          <ZoomIn className="w-4 h-4 text-[#00ff88]" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="bg-[#0a0a0a] border-[rgba(0,255,136,0.3)] hover:border-[#00ff88] h-8 w-8"
          onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
        >
          <ZoomOut className="w-4 h-4 text-[#00ff88]" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="bg-[#0a0a0a] border-[rgba(0,255,136,0.3)] hover:border-[#00ff88] h-8 w-8"
          onClick={resetView}
        >
          <Maximize2 className="w-4 h-4 text-[#00ff88]" />
        </Button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[#0a0a0a]/90 rounded-lg p-3 border border-[rgba(0,255,136,0.2)]">
        <p className="text-[10px] text-slate-400 mb-2 font-medium">RANK HIERARCHY</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(RANK_COLORS).slice(0, 5).map(([rank, color]) => (
            <div key={rank} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-slate-400 capitalize">{rank}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hover info */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-[#0a0a0a]/90 rounded-lg p-3 border border-[rgba(0,255,136,0.3)]">
          <p className="text-xs text-[#00ff88]">Click to view profile</p>
        </div>
      )}
    </div>
  );
}