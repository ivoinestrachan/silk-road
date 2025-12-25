'use client';

import CornerBorder from './CornerBorder';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onResetView }: ZoomControlsProps) {
  return (
    <div className="fixed right-4 z-[10001] flex flex-col gap-2" style={{ bottom: '396px' }}>
      <CornerBorder cornerColor="#F6FAF6" cornerSize="12px">
        <button
          onClick={onZoomIn}
          className="w-12 h-12 bg-[#000000]/30 backdrop-blur-sm rounded-lg shadow-2xl hover:bg-[#000000]/40 transition-all flex items-center justify-center"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </CornerBorder>

      <CornerBorder cornerColor="#F6FAF6" cornerSize="12px">
        <button
          onClick={onResetView}
          className="w-12 h-12 bg-[#000000]/30 backdrop-blur-sm rounded-lg shadow-2xl hover:bg-[#000000]/40 transition-all flex items-center justify-center"
          title="Reset View"
          aria-label="Reset View"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </CornerBorder>

      <CornerBorder cornerColor="#F6FAF6" cornerSize="12px">
        <button
          onClick={onZoomOut}
          className="w-12 h-12 bg-[#000000]/30 backdrop-blur-sm rounded-lg shadow-2xl hover:bg-[#000000]/40 transition-all flex items-center justify-center"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </CornerBorder>
    </div>
  );
}
