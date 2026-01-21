import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Minus, Move, X, Maximize2 } from 'lucide-react';

// Card control modes: 'expanded', 'collapsed', 'stowed' (floating), 'hidden'
export function DexCardHeader({ 
  title, 
  icon: Icon, 
  mode, 
  onCollapse, 
  onExpand, 
  onStow, 
  onHide, 
  onDock,
  theme = 'lime',
  isLightTheme = false,
  isDragging = false,
  onDragStart
}) {
  const bgClass = isLightTheme ? 'bg-gray-100 border-gray-200' : 'bg-black/60 border-gray-800';
  const textClass = isLightTheme ? 'text-gray-700' : 'text-gray-300';
  
  return (
    <div 
      className={`flex items-center justify-between px-3 py-2 border-b ${bgClass} ${isDragging ? 'cursor-grabbing' : ''}`}
      onMouseDown={mode === 'stowed' ? onDragStart : undefined}
      style={mode === 'stowed' ? { cursor: 'move' } : {}}
    >
      <div className="flex items-center gap-2">
        {mode === 'stowed' && <Move className="w-3 h-3 text-gray-500" />}
        {Icon && <Icon className={`w-4 h-4 text-${theme}-400`} />}
        <span className={`text-xs font-medium ${textClass}`}>{title}</span>
      </div>
      <div className="flex items-center gap-1">
        {/* Collapse/Expand */}
        {mode === 'expanded' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={onCollapse}
            title="Collapse"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
        )}
        {mode === 'collapsed' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={onExpand}
            title="Expand"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        )}
        
        {/* Stow (float) */}
        {mode !== 'stowed' && (
          <Button
            variant="ghost"
            size="icon"
            className={`h-5 w-5 text-${theme}-400 hover:bg-${theme}-500/20`}
            onClick={onStow}
            title="Float window"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
        )}
        
        {/* Dock (back to grid) */}
        {mode === 'stowed' && (
          <Button
            variant="ghost"
            size="icon"
            className={`h-5 w-5 text-${theme}-400 hover:bg-${theme}-500/20`}
            onClick={onDock}
            title="Dock to grid"
          >
            <Minus className="w-3 h-3" />
          </Button>
        )}
        
        {/* Hide */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-red-400 hover:text-red-300 hover:bg-red-500/20"
          onClick={onHide}
          title="Hide"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function DexFloatingCard({
  id,
  title,
  icon,
  children,
  position,
  size,
  onPositionChange,
  onSizeChange,
  onDock,
  onHide,
  theme = 'lime',
  isLightTheme = false
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const cardRef = React.useRef(null);

  React.useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      onPositionChange({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
      });
    };
    
    const handleMouseUp = () => setIsDragging(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, size, onPositionChange]);

  React.useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e) => {
      onSizeChange({
        width: Math.max(300, e.clientX - position.x),
        height: Math.max(200, e.clientY - position.y)
      });
    };
    
    const handleMouseUp = () => setIsResizing(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position, onSizeChange]);

  const startDrag = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsDragging(true);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`fixed z-[100] rounded-xl overflow-hidden border border-${theme}-500/30 shadow-2xl shadow-${theme}-500/20`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: isLightTheme ? '#ffffff' : '#0a0a0f'
      }}
    >
      <DexCardHeader
        title={title}
        icon={icon}
        mode="stowed"
        onDock={onDock}
        onHide={onHide}
        theme={theme}
        isLightTheme={isLightTheme}
        isDragging={isDragging}
        onDragStart={startDrag}
      />
      
      <div className="h-[calc(100%-36px)] overflow-auto">
        {children}
      </div>
      
      {/* Resize Handle */}
      <div
        className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize ${isLightTheme ? 'bg-gray-300' : 'bg-gray-700'} rounded-tl`}
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
        }}
        style={{
          backgroundImage: 'linear-gradient(135deg, transparent 50%, currentColor 50%)',
          opacity: 0.5
        }}
      />
    </div>
  );
}

export function DexCard({
  id,
  title,
  icon,
  children,
  mode,
  onModeChange,
  theme = 'lime',
  isLightTheme = false,
  className = ''
}) {
  if (mode === 'hidden') return null;
  
  const bgClass = isLightTheme ? 'bg-white border-gray-200' : 'bg-black/40 border-gray-800/50';
  
  return (
    <div className={`rounded-xl border ${bgClass} backdrop-blur-xl overflow-hidden ${className}`}>
      <DexCardHeader
        title={title}
        icon={icon}
        mode={mode}
        onCollapse={() => onModeChange('collapsed')}
        onExpand={() => onModeChange('expanded')}
        onStow={() => onModeChange('stowed')}
        onHide={() => onModeChange('hidden')}
        theme={theme}
        isLightTheme={isLightTheme}
      />
      
      {mode === 'expanded' && (
        <div className="p-0">
          {children}
        </div>
      )}
    </div>
  );
}