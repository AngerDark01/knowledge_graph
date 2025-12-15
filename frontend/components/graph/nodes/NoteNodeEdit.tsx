import React, { useState, useCallback } from 'react';
import { useGraphStore } from '@/stores/graph';

interface NoteNodeEditProps {
  id: string;
  initialContent: string;
  initialTitle: string;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

const NoteNodeEdit: React.FC<NoteNodeEditProps> = ({ 
  id, 
  initialContent, 
  initialTitle,
  isEditing,
  onEditingChange
}) => {
  const { updateNode } = useGraphStore();
  const [editContent, setEditContent] = useState(initialContent);
  const [editTitle, setEditTitle] = useState(initialTitle);

  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      updateNode(id, { 
        title: editTitle,
        content: editContent 
      });
    }
    onEditingChange(!isEditing);
  }, [isEditing, editContent, editTitle, id, onEditingChange, updateNode]);

  return (
    <>
      {!isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditingChange(true);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors nodrag"
          title="Edit content"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
      {isEditing && (
        <div className="absolute top-0 left-0 right-0 bottom-0 p-4 bg-white dark:bg-gray-800 z-10 rounded-xl">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-2 py-1 text-base font-semibold bg-transparent border-b border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100 mb-2"
            autoFocus
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleToggleEdit}
            className="w-full h-3/4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-sm resize-none"
            placeholder="Enter markdown content..."
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                handleToggleEdit();
              }
            }}
          />
          <div className="absolute bottom-2 right-2">
            <button
              onClick={handleToggleEdit}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteNodeEdit;