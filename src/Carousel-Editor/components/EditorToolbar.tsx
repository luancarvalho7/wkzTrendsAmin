import React from 'react';
import { ZoomIn, ZoomOut, Download, Undo, Redo, Home } from 'lucide-react';

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
}) => {
  return (
    <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBackToFeed}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
        <div className="h-6 w-px bg-gray-700" />
        <h1 className="text-xl font-bold text-white">Carousel Editor</h1>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <Undo className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <Redo className="w-5 h-5 text-white" />
        </button>

        <div className="h-6 w-px bg-gray-700 mx-2" />

        <button
          onClick={onZoomOut}
          className="p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-medium min-w-16 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>

        <div className="h-6 w-px bg-gray-700 mx-2" />

        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
