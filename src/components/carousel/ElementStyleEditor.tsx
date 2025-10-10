import React from 'react';
import { EditableElementInfo } from '../../types/carousel';

interface ElementStyleEditorProps {
  element: EditableElementInfo;
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
}

const ElementStyleEditor: React.FC<ElementStyleEditorProps> = ({
  element,
  styles,
  onStyleChange,
}) => {
  const renderColorControl = (label: string, property: string) => {
    const value = styles[property] || '#000000';
    return (
      <div>
        <label className="block text-xs font-medium text-white/60 mb-2">{label}</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onStyleChange(property, e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-white/20"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onStyleChange(property, e.target.value)}
            className="flex-1 bg-white/10 text-white text-sm border border-white/20 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
      </div>
    );
  };

  const renderRangeControl = (label: string, property: string, min: number, max: number, unit: string = 'px') => {
    const numericValue = parseInt(styles[property]) || min;
    return (
      <div>
        <label className="block text-xs font-medium text-white/60 mb-2">{label}</label>
        <input
          type="range"
          min={min}
          max={max}
          value={numericValue}
          onChange={(e) => onStyleChange(property, `${e.target.value}${unit}`)}
          className="w-full"
        />
        <div className="text-white text-xs mt-1">{numericValue}{unit}</div>
      </div>
    );
  };

  const renderSelectControl = (label: string, property: string, options: { value: string; label: string }[]) => {
    const value = styles[property] || options[0].value;
    return (
      <div>
        <label className="block text-xs font-medium text-white/60 mb-2">{label}</label>
        <select
          value={value}
          onChange={(e) => onStyleChange(property, e.target.value)}
          className="w-full bg-white/10 text-white text-sm border border-white/20 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderOpacityControl = (label: string, property: string) => {
    const value = parseFloat(styles[property]) || 1;
    return (
      <div>
        <label className="block text-xs font-medium text-white/60 mb-2">{label}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onStyleChange(property, e.target.value)}
          className="w-full"
        />
        <div className="text-white text-xs mt-1">{Math.round(value * 100)}%</div>
      </div>
    );
  };

  const renderTextControl = (label: string, property: string, placeholder: string = '') => {
    const value = styles[property] || '';
    return (
      <div>
        <label className="block text-xs font-medium text-white/60 mb-2">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onStyleChange(property, e.target.value)}
          className="w-full bg-white/10 text-white text-sm border border-white/20 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
      </div>
    );
  };

  if (element.type === 'text') {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Typography</h4>
          {renderColorControl('Color', 'color')}
          {renderRangeControl('Font Size', 'fontSize', 8, 72)}
          {renderSelectControl('Font Weight', 'fontWeight', [
            { value: '300', label: 'Light' },
            { value: '400', label: 'Normal' },
            { value: '500', label: 'Medium' },
            { value: '600', label: 'Semi Bold' },
            { value: '700', label: 'Bold' },
            { value: '800', label: 'Extra Bold' },
          ])}
          {renderSelectControl('Text Align', 'textAlign', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
            { value: 'justify', label: 'Justify' },
          ])}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Background</h4>
          {renderColorControl('Background Color', 'backgroundColor')}
          {renderOpacityControl('Opacity', 'opacity')}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Spacing</h4>
          {renderTextControl('Padding', 'padding', '10px')}
          {renderTextControl('Margin', 'margin', '0px')}
          {renderTextControl('Border Radius', 'borderRadius', '0px')}
        </div>
      </div>
    );
  }

  if (element.type === 'background') {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Background</h4>
          {renderColorControl('Background Color', 'backgroundColor')}
          {renderOpacityControl('Opacity', 'opacity')}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Layout</h4>
          {renderTextControl('Width', 'width', '100%')}
          {renderTextControl('Height', 'height', 'auto')}
          {renderTextControl('Border Radius', 'borderRadius', '0px')}
        </div>
      </div>
    );
  }

  if (element.type === 'image') {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Image</h4>
          {renderTextControl('Width', 'width', '100%')}
          {renderTextControl('Height', 'height', 'auto')}
          {renderTextControl('Border Radius', 'borderRadius', '0px')}
          {renderOpacityControl('Opacity', 'opacity')}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Background</h4>
          {renderColorControl('Background Color', 'backgroundColor')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Appearance</h4>
        {renderColorControl('Background Color', 'backgroundColor')}
        {renderOpacityControl('Opacity', 'opacity')}
      </div>

      <div className="border-t border-white/10 pt-4 space-y-3">
        <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Layout</h4>
        {renderTextControl('Width', 'width', 'auto')}
        {renderTextControl('Height', 'height', 'auto')}
        {renderTextControl('Border Radius', 'borderRadius', '0px')}
        {renderTextControl('Padding', 'padding', '0px')}
      </div>
    </div>
  );
};

export default ElementStyleEditor;
