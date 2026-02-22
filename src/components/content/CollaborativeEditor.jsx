import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LiveCursors from './LiveCursors';
import InlineComments from './InlineComments';
import { debounce } from 'lodash';
import { toast } from 'sonner';

export default function CollaborativeEditor({ 
  projectId, 
  initialContent, 
  currentUser, 
  profile,
  canEdit,
  onChange,
  onSave
}) {
  const [content, setContent] = useState(initialContent || '');
  const [lastRemoteContent, setLastRemoteContent] = useState(initialContent || '');
  const [isLocalChange, setIsLocalChange] = useState(false);
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);

  // Sync content when it changes externally (from real-time updates)
  useEffect(() => {
    if (initialContent !== lastRemoteContent && !isLocalChange) {
      setContent(initialContent || '');
      setLastRemoteContent(initialContent || '');
    }
    setIsLocalChange(false);
  }, [initialContent]);

  // Broadcast content changes to other collaborators
  const broadcastChangeMutation = useMutation({
    mutationFn: async (newContent) => {
      await base44.entities.ContentProject.update(projectId, {
        content: newContent,
        last_edited_by: currentUser.email,
        last_edited_at: new Date().toISOString()
      });
    }
  });

  // Debounced broadcast to avoid too many updates
  const debouncedBroadcast = useCallback(
    debounce((newContent) => {
      broadcastChangeMutation.mutate(newContent);
    }, 1000),
    [projectId]
  );

  // Handle local content changes
  const handleChange = (value) => {
    setIsLocalChange(true);
    setContent(value);
    onChange?.(value);
    
    // Broadcast to other collaborators
    if (canEdit) {
      debouncedBroadcast(value);
    }
  };

  // Subscribe to real-time content updates from other collaborators
  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = base44.entities.ContentProject.subscribe((event) => {
      if (event.type === 'update' && 
          event.data?.id === projectId && 
          event.data?.last_edited_by !== currentUser?.email) {
        // Another user made changes
        const newContent = event.data.content;
        if (newContent && newContent !== content) {
          // Simple conflict resolution: show notification and update
          setLastRemoteContent(newContent);
          setContent(newContent);
          onChange?.(newContent);
          toast.info(`${event.data.last_edited_by?.split('@')[0]} made changes`);
        }
      }
    });

    return unsubscribe;
  }, [projectId, currentUser, content]);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  return (
    <div ref={editorContainerRef} className="relative">
      {/* Live Cursors */}
      {currentUser && (
        <LiveCursors
          projectId={projectId}
          currentUser={currentUser}
          profile={profile}
          editorRef={editorContainerRef}
        />
      )}

      {/* Inline Comments */}
      {currentUser && (
        <InlineComments
          projectId={projectId}
          profile={profile}
          currentUser={currentUser}
          editorRef={editorContainerRef}
        />
      )}

      {/* Editor */}
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={handleChange}
        theme="snow"
        readOnly={!canEdit}
        modules={modules}
        className="bg-white rounded-lg shadow-sm collaborative-editor"
        style={{ minHeight: '500px' }}
      />

      <style>{`
        .collaborative-editor .ql-container {
          font-size: 16px;
          line-height: 1.8;
        }
        .collaborative-editor .ql-editor {
          min-height: 500px;
          padding: 2rem;
        }
        .collaborative-editor .ql-editor p {
          margin-bottom: 1rem;
        }
        .collaborative-editor .ql-editor h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .collaborative-editor .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        .collaborative-editor .ql-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}