import React from 'react';
import { X, Move, Type, Palette } from 'lucide-react';

interface ElementStylePanelProps {
  selectedElement: string;
  elementStyles: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: string;
    x?: number;
    y?: number;
  };
  onStyleChange: (property: string, value: string | number) => void;
  onClose: () => void;
}

const ElementStylePanel: React.FC<ElementStylePanelProps> = ({
  selectedElement,
  elementStyles,
  onStyleChange,
  onClose,
}) => {
  const getElementDisplayName = (id: string) => {
    const names: Record<string, string> = {
      title: 'Título',
      subtitle: 'Subtítulo',
      background: 'Background',
    };
    return names[id] || id;
  };

  return (
    <div className="w-80 bg-black border-l border-white/20 flex flex-col">
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <h3 className="text-white font-semibold">
            {getElementDisplayName(selectedElement)}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {selectedElement !== 'background' && (
          <>
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4 text-white" />
                <h4 className="text-white font-medium">Tipografia</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-white/70 text-sm block mb-2">
                    Tamanho da Fonte
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={parseInt(elementStyles.fontSize || '24')}
                    onChange={(e) => onStyleChange('fontSize', `${e.target.value}px`)}
                    className="w-full"
                  />
                  <span className="text-white/50 text-xs">
                    {elementStyles.fontSize || '24px'}
                  </span>
                </div>

                <div>
                  <label className="text-white/70 text-sm block mb-2">
                    Peso da Fonte
                  </label>
                  <select
                    value={elementStyles.fontWeight || '400'}
                    onChange={(e) => onStyleChange('fontWeight', e.target.value)}
                    className="w-full bg-white/10 text-white rounded px-3 py-2 border border-white/20"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra-Bold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/70 text-sm block mb-2">
                    Alinhamento
                  </label>
                  <div className="flex space-x-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => onStyleChange('textAlign', align)}
                        className={`flex-1 px-3 py-2 rounded transition-colors ${
                          elementStyles.textAlign === align
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Palette className="w-4 h-4 text-white" />
                <h4 className="text-white font-medium">Cor</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-white/70 text-sm block mb-2">
                    Cor do Texto
                  </label>
                  <input
                    type="color"
                    value={elementStyles.color || '#000000'}
                    onChange={(e) => onStyleChange('color', e.target.value)}
                    className="w-full h-12 rounded border border-white/20 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Move className="w-4 h-4 text-white" />
            <h4 className="text-white font-medium">Posição</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-white/70 text-sm block mb-2">
                Posição X
              </label>
              <input
                type="number"
                value={elementStyles.x || 0}
                onChange={(e) => onStyleChange('x', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/10 text-white rounded px-3 py-2 border border-white/20"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm block mb-2">
                Posição Y
              </label>
              <input
                type="number"
                value={elementStyles.y || 0}
                onChange={(e) => onStyleChange('y', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/10 text-white rounded px-3 py-2 border border-white/20"
              />
            </div>

            <button
              onClick={() => {
                onStyleChange('x', 0);
                onStyleChange('y', 0);
              }}
              className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            >
              Resetar Posição
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementStylePanel;
