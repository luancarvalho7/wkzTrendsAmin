import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { SlideContent } from '../../types/carousel';
import { EditableElement } from './InteractiveCanvas';
import ContentEditor from './ContentEditor';
import BackgroundSelector from './BackgroundSelector';

interface ItemPropertiesPanelProps {
  selectedElement: EditableElement;
  slideContent: SlideContent;
  selectedBackgroundIndex: number;
  onContentChange: (key: string, value: string) => void;
  onBackgroundChange: (imageUrl: string, index: number) => void;
}

const ItemPropertiesPanel: React.FC<ItemPropertiesPanelProps> = ({
  selectedElement,
  slideContent,
  selectedBackgroundIndex,
  onContentChange,
  onBackgroundChange,
}) => {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-black border-l border-white/20 flex flex-col items-center justify-center p-8 text-center">
        <MousePointer2 className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-lg font-medium text-white/60 mb-2">No Element Selected</h3>
        <p className="text-sm text-white/40">
          Click on an element in the preview to edit its properties
        </p>
        <div className="mt-6 space-y-2 text-xs text-white/30">
          <p>• Single click to select</p>
          <p>• Double click text to edit inline</p>
          <p>• Press ESC to deselect</p>
        </div>
      </div>
    );
  }

  if (selectedElement === 'background') {
    return (
      <div className="w-80 bg-black border-l border-white/20 flex flex-col overflow-y-auto">
        <div className="bg-black border-b border-white/20 px-4 py-3">
          <h3 className="text-sm font-medium text-white">Background Properties</h3>
          <p className="text-xs text-white/50 mt-1">Selected: Background Image</p>
        </div>
        <BackgroundSelector
          slideContent={slideContent}
          selectedIndex={selectedBackgroundIndex}
          onBackgroundChange={onBackgroundChange}
        />
      </div>
    );
  }

  if (selectedElement === 'title' || selectedElement === 'subtitle') {
    const elementLabel = selectedElement === 'title' ? 'Title' : 'Subtitle';

    return (
      <div className="w-80 bg-black border-l border-white/20 flex flex-col overflow-y-auto">
        <div className="bg-black border-b border-white/20 px-4 py-3">
          <h3 className="text-sm font-medium text-white">Text Properties</h3>
          <p className="text-xs text-white/50 mt-1">Selected: {elementLabel}</p>
        </div>
        <div className="p-4">
          <label className="block text-xs font-medium text-white/60 mb-2">
            {elementLabel} Text
          </label>
          <textarea
            value={selectedElement === 'title' ? slideContent.title : (slideContent.subtitle || '')}
            onChange={(e) => onContentChange(selectedElement, e.target.value)}
            className="w-full bg-white/10 text-white border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-white/40"
            rows={selectedElement === 'title' ? 4 : 3}
            placeholder={`Enter ${elementLabel.toLowerCase()} text...`}
          />
          <p className="text-xs text-white/40 mt-2">
            Tip: Double-click the text in the preview to edit inline
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ItemPropertiesPanel;
