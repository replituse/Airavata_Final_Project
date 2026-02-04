import { memo } from 'react';
import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
} from '@xyflow/react';

export const ConnectionEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate the angle for the arrow at the end of the path
  // We look at the last segment of the bezier curve
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return (
    <>
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto-start-reverse"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L6,3 L0,6 z" fill={style.stroke || '#3b82f6'} />
        </marker>
      </defs>
      <BaseEdge 
        path={edgePath} 
        markerEnd={`url(#arrow-${id})`} 
        style={{
          ...style,
          strokeWidth: 2,
        }} 
      />
    </>
  );
});
