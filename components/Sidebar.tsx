import React, { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Node } from 'reactflow';
import { NodeData } from '../types';

interface SidebarProps {
  node: Node<NodeData> | null;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
  onDelete: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ node, onClose, onUpdate, onDelete }) => {
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');

  // Critical Fix: Only sync state from props when the node ID changes.
  // We do not want to sync on every render (which happens on every keystroke) 
  // because it will reset the cursor position in the inputs.
  useEffect(() => {
    if (node) {
      setLabel(node.data.label);
      setContent(node.data.content);
    }
  }, [node?.id]); // Only re-run when the selected node *changes identity*, not just data.

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    if (node) {
      onUpdate(node.id, { label: newLabel });
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (node) {
      onUpdate(node.id, { content: newContent });
    }
  };

  if (!node) return null;

  return (
    <div className="absolute top-4 right-4 bottom-4 w-96 bg-surface border border-border shadow-2xl rounded-xl flex flex-col z-50 animate-in slide-in-from-right-10 duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-surfaceHighlight/50 rounded-t-xl">
        <h2 className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Concept Details</h2>
        <div className="flex gap-2">
           <button 
            onClick={() => {
                if(window.confirm('Are you sure you want to delete this node?')) {
                    onDelete(node.id);
                }
            }}
            className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-zinc-500 rounded transition-colors"
            title="Delete Node"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-700 text-zinc-400 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Title</label>
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            placeholder="Enter concept name..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Rich Text Editor */}
        <div className="space-y-2 h-full flex flex-col">
          <label className="text-sm font-medium text-zinc-400">Notes</label>
          <div className="flex-1">
             <RichTextEditor value={content} onChange={handleContentChange} />
          </div>
        </div>
      </div>
    </div>
  );
};