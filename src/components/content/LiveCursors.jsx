import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Generate a random color for each user
const getColorForUser = (userId) => {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e'
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function LiveCursors({ projectId, currentUser, profile, editorRef }) {
  const [cursors, setCursors] = useState({});
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0 });
  const lastBroadcast = useRef(0);
  const queryClient = useQueryClient();

  // Store cursor position in LiveStatus entity for real-time sync
  const updateCursorMutation = useMutation({
    mutationFn: async (position) => {
      // Use LiveStatus entity to broadcast cursor position
      const existing = await base44.entities.LiveStatus.filter({
        user_id: currentUser.email,
        context_type: 'content_editor',
        context_id: projectId
      });

      const data = {
        user_id: currentUser.email,
        user_name: profile?.display_name || currentUser.full_name,
        user_avatar: profile?.avatar_url,
        context_type: 'content_editor',
        context_id: projectId,
        cursor_x: position.x,
        cursor_y: position.y,
        status: 'active',
        last_activity: new Date().toISOString()
      };

      if (existing.length > 0) {
        await base44.entities.LiveStatus.update(existing[0].id, data);
      } else {
        await base44.entities.LiveStatus.create(data);
      }
    }
  });

  // Subscribe to other users' cursor positions
  useEffect(() => {
    if (!projectId || !currentUser) return;

    // Initial fetch of active cursors
    const fetchCursors = async () => {
      const statuses = await base44.entities.LiveStatus.filter({
        context_type: 'content_editor',
        context_id: projectId
      });
      
      const cursorMap = {};
      const now = new Date();
      statuses.forEach(status => {
        // Only show cursors active in last 30 seconds
        const lastActivity = new Date(status.last_activity);
        if (status.user_id !== currentUser.email && (now - lastActivity) < 30000) {
          cursorMap[status.user_id] = {
            x: status.cursor_x,
            y: status.cursor_y,
            name: status.user_name,
            avatar: status.user_avatar,
            color: getColorForUser(status.user_id)
          };
        }
      });
      setCursors(cursorMap);
    };

    fetchCursors();
    const interval = setInterval(fetchCursors, 1000); // Poll every second

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.LiveStatus.subscribe((event) => {
      if (event.data?.context_type === 'content_editor' && 
          event.data?.context_id === projectId &&
          event.data?.user_id !== currentUser.email) {
        if (event.type === 'delete') {
          setCursors(prev => {
            const next = { ...prev };
            delete next[event.data.user_id];
            return next;
          });
        } else {
          setCursors(prev => ({
            ...prev,
            [event.data.user_id]: {
              x: event.data.cursor_x,
              y: event.data.cursor_y,
              name: event.data.user_name,
              avatar: event.data.user_avatar,
              color: getColorForUser(event.data.user_id)
            }
          }));
        }
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
      // Clean up our cursor when leaving
      base44.entities.LiveStatus.filter({
        user_id: currentUser.email,
        context_type: 'content_editor',
        context_id: projectId
      }).then(existing => {
        if (existing.length > 0) {
          base44.entities.LiveStatus.delete(existing[0].id);
        }
      });
    };
  }, [projectId, currentUser]);

  // Track mouse movement
  useEffect(() => {
    if (!editorRef?.current) return;

    const handleMouseMove = (e) => {
      const rect = editorRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMyPosition({ x, y });

      // Throttle broadcasts to once per 100ms
      const now = Date.now();
      if (now - lastBroadcast.current > 100) {
        lastBroadcast.current = now;
        updateCursorMutation.mutate({ x, y });
      }
    };

    const editor = editorRef.current;
    editor.addEventListener('mousemove', handleMouseMove);
    return () => editor.removeEventListener('mousemove', handleMouseMove);
  }, [editorRef]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {Object.entries(cursors).map(([userId, cursor]) => (
          <motion.div
            key={userId}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, x: cursor.x, y: cursor.y }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 500 }}
            className="absolute"
            style={{ left: 0, top: 0 }}
          >
            {/* Cursor pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={cursor.color}
              className="drop-shadow-md"
            >
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .68-.61.28-.88L5.72 2.92a.5.5 0 0 0-.22-.05c-.28 0-.5.22-.5.34z" />
            </svg>
            {/* Name label */}
            <div
              className="absolute left-5 top-4 px-2 py-0.5 rounded-md text-xs font-medium text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Active collaborators indicator component
export function ActiveCollaborators({ projectId, currentUser }) {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    const fetchActive = async () => {
      const statuses = await base44.entities.LiveStatus.filter({
        context_type: 'content_editor',
        context_id: projectId
      });
      
      const now = new Date();
      const active = statuses.filter(s => {
        const lastActivity = new Date(s.last_activity);
        return s.user_id !== currentUser?.email && (now - lastActivity) < 30000;
      });
      setActiveUsers(active);
    };

    fetchActive();
    const interval = setInterval(fetchActive, 5000);

    const unsubscribe = base44.entities.LiveStatus.subscribe((event) => {
      if (event.data?.context_type === 'content_editor' && 
          event.data?.context_id === projectId) {
        fetchActive();
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [projectId, currentUser]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map((user) => (
          <div
            key={user.user_id}
            className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
            style={{ boxShadow: `0 0 0 2px ${getColorForUser(user.user_id)}` }}
          >
            {user.user_avatar ? (
              <img src={user.user_avatar} alt={user.user_name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: getColorForUser(user.user_id) }}
              >
                {user.user_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        ))}
      </div>
      {activeUsers.length > 3 && (
        <span className="text-xs text-slate-500">+{activeUsers.length - 3}</span>
      )}
      <span className="text-xs text-emerald-600 font-medium ml-1">
        {activeUsers.length} editing
      </span>
    </div>
  );
}