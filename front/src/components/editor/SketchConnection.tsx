import { useState } from 'react';
import { X } from 'lucide-react';
import { SketchConnection, ConnectionType } from './sketch-types';

interface SketchConnectionLineProps {
  connection: SketchConnection;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  onDelete: () => void;
}

const CONNECTION_COLORS: Record<ConnectionType, string> = {
  flow: '#007AFF',      // Blue - navigation/flow
  data: '#10B981',      // Green - data binding
  navigation: '#8B5CF6', // Purple - navigation
};

const CONNECTION_LABELS: Record<ConnectionType, string> = {
  flow: 'Flow',
  data: 'Data',
  navigation: 'Navigate',
};

export const SketchConnectionLine: React.FC<SketchConnectionLineProps> = ({
  connection,
  fromPoint,
  toPoint,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate control points for a smooth bezier curve
  const dx = toPoint.x - fromPoint.x;
  const dy = toPoint.y - fromPoint.y;

  // Make the curve more pronounced based on direction
  const curvature = Math.min(Math.abs(dx), Math.abs(dy)) * 0.5;

  // Control points for the curve
  const cp1x = fromPoint.x + (dx > 0 ? curvature : -curvature);
  const cp1y = fromPoint.y;
  const cp2x = toPoint.x - (dx > 0 ? curvature : -curvature);
  const cp2y = toPoint.y;

  // Path for the curved line
  const pathD = `M ${fromPoint.x} ${fromPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPoint.x} ${toPoint.y}`;

  // Calculate midpoint for label/delete button
  const midX = (fromPoint.x + toPoint.x) / 2;
  const midY = (fromPoint.y + toPoint.y) / 2;

  // Calculate arrow angle
  const angle = Math.atan2(toPoint.y - cp2y, toPoint.x - cp2x);
  const arrowLength = 10;
  const arrowWidth = 6;

  const arrowPoint1X = toPoint.x - arrowLength * Math.cos(angle - Math.PI / 6);
  const arrowPoint1Y = toPoint.y - arrowLength * Math.sin(angle - Math.PI / 6);
  const arrowPoint2X = toPoint.x - arrowLength * Math.cos(angle + Math.PI / 6);
  const arrowPoint2Y = toPoint.y - arrowLength * Math.sin(angle + Math.PI / 6);

  const color = CONNECTION_COLORS[connection.type];

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible wider path for easier hover detection */}
      <path
        d={pathD}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        className="pointer-events-auto"
      />

      {/* Main connection line */}
      <path
        d={pathD}
        stroke={color}
        strokeWidth={isHovered ? 3 : 2}
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-200 pointer-events-none"
        style={{
          filter: isHovered ? `drop-shadow(0 0 4px ${color}40)` : 'none',
        }}
      />

      {/* Arrow head */}
      <polygon
        points={`${toPoint.x},${toPoint.y} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
        fill={color}
        className="pointer-events-none"
      />

      {/* Connection type indicator (on hover) */}
      {isHovered && (
        <g className="pointer-events-none">
          {/* Background pill */}
          <rect
            x={midX - 35}
            y={midY - 12}
            width="70"
            height="24"
            rx="12"
            fill="white"
            stroke={color}
            strokeWidth="1.5"
            className="drop-shadow-md"
          />
          {/* Label text */}
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={color}
          >
            {connection.label || CONNECTION_LABELS[connection.type]}
          </text>
        </g>
      )}

      {/* Delete button (on hover) */}
      {isHovered && (
        <g
          className="pointer-events-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <circle
            cx={midX + 40}
            cy={midY}
            r="10"
            fill="#EF4444"
            className="hover:fill-red-600 transition-colors drop-shadow-md"
          />
          <foreignObject
            x={midX + 34}
            y={midY - 6}
            width="12"
            height="12"
          >
            <X className="w-3 h-3 text-white" />
          </foreignObject>
        </g>
      )}

      {/* Start point circle */}
      <circle
        cx={fromPoint.x}
        cy={fromPoint.y}
        r={isHovered ? 5 : 4}
        fill={color}
        className="transition-all duration-200 pointer-events-none"
      />
    </g>
  );
};

export default SketchConnectionLine;
