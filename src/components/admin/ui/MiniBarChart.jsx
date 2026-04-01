import { useState } from "react";

export function MiniBarChart({ data = [], labels = [], color = "#6366f1", height = 120, title }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const maxVal = Math.max(...data, 1);
  const barWidth = 100 / (data.length || 1);

  return (
    <div className="w-full">
      {title && <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>}
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-slate-100 w-full" />
          ))}
        </div>
        
        {/* Bars */}
        <div className="relative flex items-end justify-between h-full gap-1 px-1">
          {data.map((value, idx) => {
            const barHeight = (value / maxVal) * 100;
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={idx}
                className="relative flex flex-col items-center justify-end flex-1 group cursor-pointer"
                style={{ height: "100%" }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                    {value}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
                <div
                  className="w-full rounded-t-md transition-all duration-300 ease-out"
                  style={{
                    height: `${Math.max(barHeight, 2)}%`,
                    backgroundColor: color,
                    opacity: isHovered ? 1 : 0.75,
                    transform: isHovered ? "scaleY(1.05)" : "scaleY(1)",
                    transformOrigin: "bottom",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex justify-between mt-2 px-1">
          {labels.map((label, idx) => (
            <span
              key={idx}
              className={`text-[10px] flex-1 text-center font-medium transition-colors ${
                hoveredIndex === idx ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function MiniLineChart({ data = [], labels = [], color = "#6366f1", height = 120, title }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const maxVal = Math.max(...data, 1);
  const points = data.map((value, idx) => ({
    x: (idx / Math.max(data.length - 1, 1)) * 100,
    y: 100 - (value / maxVal) * 100,
    value,
  }));

  const pathD = points.length > 1
    ? points.reduce((acc, point, idx) => {
        if (idx === 0) return `M ${point.x} ${point.y}`;
        const prevPoint = points[idx - 1];
        const cpx1 = prevPoint.x + (point.x - prevPoint.x) * 0.4;
        const cpx2 = point.x - (point.x - prevPoint.x) * 0.4;
        return `${acc} C ${cpx1} ${prevPoint.y}, ${cpx2} ${point.y}, ${point.x} ${point.y}`;
      }, "")
    : "";

  const areaD = pathD
    ? `${pathD} L 100 100 L 0 100 Z`
    : "";

  return (
    <div className="w-full">
      {title && <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.02 }} />
            </linearGradient>
          </defs>
          {areaD && <path d={areaD} fill={`url(#gradient-${title})`} />}
          {pathD && (
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          )}
          {points.map((point, idx) => (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === idx ? 4 : 2.5}
              fill="white"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>
        
        {/* Tooltip overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shadow-lg pointer-events-none"
            style={{
              left: `${points[hoveredIndex].x}%`,
              top: `${points[hoveredIndex].y * height / 100 - 28}px`,
            }}
          >
            {points[hoveredIndex].value}
          </div>
        )}
      </div>
      
      {labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((label, idx) => (
            <span
              key={idx}
              className={`text-[10px] flex-1 text-center font-medium transition-colors ${
                hoveredIndex === idx ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DonutChart({ segments = [], size = 140, strokeWidth = 20, title }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {title && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>}
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {segments.map((segment, idx) => {
            const segmentLength = (segment.value / total) * circumference;
            const dashOffset = circumference - cumulativeOffset;
            cumulativeOffset += segmentLength;
            
            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-900">{total}</span>
          <span className="text-[10px] text-slate-400 font-medium">Total</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="text-xs text-slate-600">{segment.label}: <strong>{segment.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HorizontalBarChart({ items = [], maxValue, color = "#6366f1", title }) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="w-full">
      {title && <p className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>}
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="mb-1 flex items-center justify-between">
              <span className="truncate text-sm font-medium text-slate-700">{item.label}</span>
              <span className="ml-2 text-sm font-bold text-slate-900">{item.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color ?? color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
