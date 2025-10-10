import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { EditableElementInfo } from '../../types/carousel';
import ElementStyleEditor from './ElementStyleEditor';

interface ItemPropertiesPanelProps {
  selectedElement: EditableElementInfo | null;
  elementStyles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
}

const ItemPropertiesPanel: React.FC<ItemPropertiesPanelProps> = ({
  selectedElement,
  elementStyles,
  onStyleChange,
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

  return (
    <div className="w-80 bg-black border-l border-white/20 flex flex-col overflow-y-auto">
      <div className="bg-black border-b border-white/20 px-4 py-3 sticky top-0 z-10">
        <h3 className="text-sm font-medium text-white">Element Properties</h3>
        <p className="text-xs text-white/50 mt-1">Selected: {selectedElement.label}</p>
        <div className="mt-2 text-xs text-white/40">
          <span className="font-mono bg-white/10 px-2 py-1 rounded">
            {selectedElement.type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <ElementStyleEditor
          element={selectedElement}
          styles={elementStyles}
          onStyleChange={onStyleChange}
        />
      </div>
    </div>
  );
};

export default ItemPropertiesPanel;
