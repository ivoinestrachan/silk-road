'use client';

import { ReactNode } from 'react';
import { HiX } from 'react-icons/hi';

interface MiniBrowserModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  position?: { x: number; y: number };
  width?: string;
  height?: string;
}

export default function MiniBrowserModal({
  title,
  children,
  onClose,
  position = { x: window.innerWidth - 280, y: 100 },
  width = '500px',
  height = 'auto',
}: MiniBrowserModalProps) {
  return (
    <div
      className="fixed z-[10001] bg-[#0a0e0a] rounded border border-[#00ff41]/30 shadow-[0_0_30px_rgba(0,255,65,0.15)] overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width,
        maxHeight: height === 'auto' ? '80vh' : height,
      }}
    >
      {/* Dark terminal-style title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#050805] border-b border-[#00ff41]/20 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#00ff41] rounded-sm animate-pulse" />
            <div className="w-2 h-2 bg-[#00ff41]/40 rounded-sm" />
            <div className="w-2 h-2 bg-[#00ff41]/40 rounded-sm" />
          </div>
          <div className="h-3 w-px bg-[#00ff41]/30" />
          <h3 className="font-mono text-xs text-[#00ff41] tracking-wider uppercase">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-[#00ff41]/70 hover:text-[#00ff41] hover:bg-[#00ff41]/10 transition-all p-1 rounded"
          title="Close"
        >
          <HiX className="text-sm" />
        </button>
      </div>

      {/* Content area with terminal styling */}
      <div className="overflow-y-auto max-h-[calc(80vh-40px)] p-6 bg-[#0a0e0a]">
        {children}
      </div>

      {/* Scan line effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff41]/5 to-transparent animate-scan" />
    </div>
  );
}
