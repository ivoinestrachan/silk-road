'use client';

interface CornerBorderProps {
  children: React.ReactNode;
  className?: string;
  cornerColor?: string;
  cornerSize?: string;
  cornerThickness?: string;
  style?: React.CSSProperties;
}

export default function CornerBorder({
  children,
  className = '',
  cornerColor = '#3f6053',
  cornerSize = '24px',
  cornerThickness = '3px',
  style
}: CornerBorderProps) {
  const combinedStyle = {
    ...style,
    '--corner-color': cornerColor,
    '--corner-size': cornerSize,
  } as React.CSSProperties;

  return (
    <div className={`relative ${className}`} style={combinedStyle}>
      {/* Top-left corner */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: '-1px',
          left: '-1px',
          width: cornerSize,
          height: cornerSize,
          borderTop: `${cornerThickness} solid ${cornerColor}`,
          borderLeft: `${cornerThickness} solid ${cornerColor}`,
        }}
      />

      {/* Top-right corner */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          top: '-1px',
          right: '-1px',
          width: cornerSize,
          height: cornerSize,
          borderTop: `${cornerThickness} solid ${cornerColor}`,
          borderRight: `${cornerThickness} solid ${cornerColor}`,
        }}
      />

      {/* Bottom-left corner */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          bottom: '-1px',
          left: '-1px',
          width: cornerSize,
          height: cornerSize,
          borderBottom: `${cornerThickness} solid ${cornerColor}`,
          borderLeft: `${cornerThickness} solid ${cornerColor}`,
        }}
      />

      {/* Bottom-right corner */}
      <div
        className="absolute pointer-events-none z-10"
        style={{
          bottom: '-1px',
          right: '-1px',
          width: cornerSize,
          height: cornerSize,
          borderBottom: `${cornerThickness} solid ${cornerColor}`,
          borderRight: `${cornerThickness} solid ${cornerColor}`,
        }}
      />

      {children}
    </div>
  );
}
