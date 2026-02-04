import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { memo } from 'react';

// Common handle styles
const HandleStyle = "w-2 h-2 bg-primary border border-white opacity-0 group-hover:opacity-100 transition-opacity";

// Reservoir Node
export const ReservoirNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={clsx(
      "w-[40px] h-[30px] rounded-sm border shadow-sm flex flex-col items-center justify-center transition-all group",
      selected ? "border-primary ring-1 ring-primary/30 bg-blue-600" : "border-blue-400 bg-blue-500",
    )}>
      <Handle type="source" position={Position.Top} className={HandleStyle} />
      <Handle type="source" position={Position.Bottom} className={HandleStyle} />
      <Handle type="source" position={Position.Left} className={HandleStyle} />
      <Handle type="source" position={Position.Right} className={HandleStyle} />
      <div className="text-[10px] font-bold text-white">HW</div>
      <div className="absolute -top-6 text-[10px] font-medium text-blue-900">{data.label}</div>
    </div>
  );
});

// Basic Node
export const SimpleNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={clsx(
      "w-4 h-4 rounded-full border shadow-sm flex items-center justify-center transition-all relative group",
      selected ? "bg-primary border-primary ring-2 ring-primary/30" : "bg-white border-slate-400"
    )}>
      <Handle type="target" position={Position.Top} className={HandleStyle} />
      <Handle type="source" position={Position.Bottom} className={HandleStyle} />
      <Handle type="source" position={Position.Left} className={HandleStyle} />
      <Handle type="source" position={Position.Right} className={HandleStyle} />
      
      {/* Label tooltip on hover or always visible if selected? Let's do a floating label */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Node {data.nodeNumber}
      </div>
    </div>
  );
});

// Junction Node
export const JunctionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={clsx(
      "w-5 h-5 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group",
      selected ? "border-red-500 bg-red-100 ring-1 ring-red-500/30" : "border-red-500 bg-white"
    )}>
      <Handle type="target" position={Position.Top} className={clsx(HandleStyle, "!bg-red-500")} />
      <Handle type="source" position={Position.Bottom} className={clsx(HandleStyle, "!bg-red-500")} />
      <Handle type="source" position={Position.Left} className={clsx(HandleStyle, "!bg-red-500")} />
      <Handle type="source" position={Position.Right} className={clsx(HandleStyle, "!bg-red-500")} />
      
      <div className="text-[8px] font-bold text-red-600">{data.nodeNumber}</div>
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Node {data.nodeNumber}
        {data.type === 'junction' && ' (Junction)'}
      </div>
    </div>
  );
});

// Surge Tank
export const SurgeTankNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={clsx(
      "px-3 py-4 rounded-t-lg rounded-b-md border-2 shadow-md min-w-[60px] flex flex-col items-center justify-between transition-all bg-orange-50 group",
      selected ? "border-orange-500 ring-1 ring-orange-500/30" : "border-orange-400"
    )}>
      <Handle type="target" position={Position.Top} className={clsx(HandleStyle, "!bg-orange-500")} />
      <Handle type="target" position={Position.Bottom} className={clsx(HandleStyle, "!bg-orange-500")} />
      <Handle type="target" position={Position.Left} className={clsx(HandleStyle, "!bg-orange-500")} />
      <Handle type="target" position={Position.Right} className={clsx(HandleStyle, "!bg-orange-500")} />
      <div className="w-full h-2 border-b border-orange-200 mb-2"></div>
      <div className="text-xs font-bold text-orange-800">{data.label}</div>
      <div className="text-[10px] text-orange-600">ST</div>
    </div>
  );
});

// Flow Boundary
export const FlowBoundaryNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={clsx(
      "p-2 rounded border shadow-sm flex items-center gap-2 transition-all bg-green-50 group",
      selected ? "border-green-500 ring-1 ring-green-500/30" : "border-green-400"
    )}>
      <Handle type="source" position={Position.Top} className={clsx(HandleStyle, "!bg-green-500")} />
      <Handle type="source" position={Position.Bottom} className={clsx(HandleStyle, "!bg-green-500")} />
      <Handle type="source" position={Position.Left} className={clsx(HandleStyle, "!bg-green-500")} />
      <Handle type="source" position={Position.Right} className={clsx(HandleStyle, "!bg-green-500")} />
      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-green-600 border-b-[6px] border-b-transparent"></div>
      <div>
        <div className="text-xs font-bold text-green-800">{data.label}</div>
        <div className="text-[10px] text-green-600">Q-Sched: {data.scheduleNumber}</div>
      </div>
    </div>
  );
});
