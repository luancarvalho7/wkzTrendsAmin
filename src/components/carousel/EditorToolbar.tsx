import React from 'react';
import { ZoomIn, ZoomOut, Download, Undo, Redo, Home, Grid3x3, Move, RotateCcw } from 'lucide-react';

interface EditorToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onBackToFeed: () => void;
  isAutoLayout: boolean;
  onToggleAutoLayout: () => void;
  onResetLayout: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onBackToFeed,
  isAutoLayout,
  onToggleAutoLayout,
  onResetLayout,
}) => {
  return (
    <div className="bg-black border-b border-white/20 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBackToFeed}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleAutoLayout}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isAutoLayout
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={isAutoLayout ? 'Auto Layout: ON' : 'Auto Layout: OFF'}
        >
          {isAutoLayout ? <Grid3x3 className="w-4 h-4" /> : <Move className="w-4 h-4" />}
          <span className="text-sm">{isAutoLayout ? 'Auto' : 'Free'}</span>
        </button>

        <button
          onClick={onResetLayout}
          className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
          title="Reset Layout"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>

        <div className="h-6 w-px bg-white/20 mx-2" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <Undo className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <Redo className="w-5 h-5 text-white" />
        </button>

        <div className="h-6 w-px bg-white/20 mx-2" />

        <button
          onClick={onZoomOut}
          className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-medium min-w-16 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>

        <div className="h-6 w-px bg-white/20 mx-2" />

        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
