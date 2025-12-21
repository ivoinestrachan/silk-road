'use client';

import { ReactNode } from 'react';

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
      className="fixed z-[10001] bg-[#1e1e1e] rounded-none border border-[#3f3f46] shadow-2xl overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width,
        maxHeight: height === 'auto' ? '80vh' : height,
      }}
    >
      {/* Windows-style title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d30] border-b border-[#3f3f46] select-none">
        <div className="flex items-center gap-2">
          <h3 className="text-xs text-[#cccccc] font-normal">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-11 h-7 flex items-center justify-center hover:bg-[#e81123] text-[#cccccc] hover:text-white transition-colors"
          title="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.5 0.5L9.5 9.5M9.5 0.5L0.5 9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Content area */}
      <div className="overflow-y-auto max-h-[calc(80vh-31px)] p-6 bg-[#1e1e1e] text-[#cccccc]">
        {children}
      </div>
    </div>
  );
}
