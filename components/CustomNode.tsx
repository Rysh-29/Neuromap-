import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';

const CustomNode = ({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`
        px-4 py-3 shadow-lg rounded-lg min-w-[150px]
        border-2 transition-all duration-200
        ${selected 
          ? 'border-primary bg-surfaceHighlight shadow-primary/20' 
          : 'border-border bg-surface hover:border-zinc-500'}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-400" />
      
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md ${selected ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-400'}`}>
           <FileText size={14} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-tight">
            {data.label || "Untitled Concept"}
          </span>
          {data.content && data.content !== '<p><br></p>' && (
             <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mt-0.5">
               Has Notes
             </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-zinc-400" />
    </div>
  );
};

export default memo(CustomNode);