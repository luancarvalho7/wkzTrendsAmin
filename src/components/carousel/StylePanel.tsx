import React from 'react';
import { Type, Palette, Image } from 'lucide-react';
import { SlideStyles } from '../../types/carousel';

interface StylePanelProps {
  styles: SlideStyles;
  onStyleChange: (key: string, value: string) => void;
  activeTab: 'text' | 'colors' | 'background';
  onTabChange: (tab: 'text' | 'colors' | 'background') => void;
}

const StylePanel: React.FC<StylePanelProps> = ({ styles, onStyleChange, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'text' as const, label: 'Text', icon: Type },
    { id: 'colors' as const, label: 'Colors', icon: Palette },
    { id: 'background' as const, label: 'Background', icon: Image },
  ];

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title Font Size</label>
              <input
                type="range"
                min="12"
                max="72"
                value={parseInt(styles.titleFontSize) || 24}
                onChange={(e) => onStyleChange('titleFontSize', `${e.target.value}px`)}
                className="w-full"
              />
              <div className="text-white text-sm mt-1">{styles.titleFontSize}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title Font Weight</label>
              <select
                value={styles.titleFontWeight || 'bold'}
                onChange={(e) => onStyleChange('titleFontWeight', e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="bolder">Bolder</option>
                <option value="lighter">Lighter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title Alignment</label>
              <select
                value={styles.titleTextAlign || 'center'}
                onChange={(e) => onStyleChange('titleTextAlign', e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle Font Size</label>
              <input
                type="range"
                min="10"
                max="48"
                value={parseInt(styles.subtitleFontSize) || 16}
                onChange={(e) => onStyleChange('subtitleFontSize', `${e.target.value}px`)}
                className="w-full"
              />
              <div className="text-white text-sm mt-1">{styles.subtitleFontSize}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle Font Weight</label>
              <select
                value={styles.subtitleFontWeight || 'normal'}
                onChange={(e) => onStyleChange('subtitleFontWeight', e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="bolder">Bolder</option>
                <option value="lighter">Lighter</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'colors' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={styles.titleColor || '#000000'}
                  onChange={(e) => onStyleChange('titleColor', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.titleColor || '#000000'}
                  onChange={(e) => onStyleChange('titleColor', e.target.value)}
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={styles.subtitleColor || '#333333'}
                  onChange={(e) => onStyleChange('subtitleColor', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.subtitleColor || '#333333'}
                  onChange={(e) => onStyleChange('subtitleColor', e.target.value)}
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={styles.backgroundColor || '#ffffff'}
                  onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.backgroundColor || '#ffffff'}
                  onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Overlay Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={styles.overlayColor || '#000000'}
                  onChange={(e) => onStyleChange('overlayColor', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.overlayColor || '#000000'}
                  onChange={(e) => onStyleChange('overlayColor', e.target.value)}
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Overlay Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parseFloat(styles.overlayOpacity) || 0}
                onChange={(e) => onStyleChange('overlayOpacity', e.target.value)}
                className="w-full"
              />
              <div className="text-white text-sm mt-1">{Math.round((parseFloat(styles.overlayOpacity) || 0) * 100)}%</div>
            </div>
          </>
        )}

        {activeTab === 'background' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Background Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parseFloat(styles.backgroundOpacity) || 1}
                onChange={(e) => onStyleChange('backgroundOpacity', e.target.value)}
                className="w-full"
              />
              <div className="text-white text-sm mt-1">{Math.round((parseFloat(styles.backgroundOpacity) || 1) * 100)}%</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StylePanel;
