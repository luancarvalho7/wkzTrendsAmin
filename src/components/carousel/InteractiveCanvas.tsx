import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditableElementInfo } from '../../types/carousel';
import { detectEditableElements, getElementStyles, applyStylesToElement } from '../../utils/elementDetector';

interface InteractiveCanvasProps {
  htmlContent: string;
  zoom: number;
  selectedElement: EditableElementInfo | null;
  onElementSelect: (element: EditableElementInfo | null) => void;
  onStyleChange?: (element: EditableElementInfo, styles: Record<string, string>) => void;
  onContentChange?: (element: EditableElementInfo, content: string) => void;
}

interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  info: EditableElementInfo;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  htmlContent,
  zoom,
  selectedElement,
  onElementSelect,
  onStyleChange,
  onContentChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementBounds, setElementBounds] = useState<ElementBounds[]>([]);
  const [editableElements, setEditableElements] = useState<EditableElementInfo[]>([]);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineText, setInlineText] = useState('');
  const elementStylesCache = useRef<Map<string, Record<string, string>>>(new Map());
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef<number>(0);
  const lastClickedElementRef = useRef<EditableElementInfo | null>(null);

  const setupIframeContent = useCallback(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      const elements = detectEditableElements(doc);
      console.log('Detected editable elements:', elements);
      setEditableElements(elements);
      updateElementBounds(elements);

      elements.forEach(el => {
        const styles = getElementStyles(el.element);
        elementStylesCache.current.set(el.selector, styles);
      });

      setupClickHandlers(elements, doc);
    }, 100);
  }, [htmlContent]);

  useEffect(() => {
    setupIframeContent();
  }, [setupIframeContent]);

  useEffect(() => {
    updateElementBounds(editableElements);
  }, [zoom]);

  const setupClickHandlers = useCallback((elements: EditableElementInfo[], doc: Document) => {
    elements.forEach(elementInfo => {
      const element = doc.querySelector(elementInfo.selector) as HTMLElement;
      if (!element) return;

      element.style.cursor = 'pointer';

      element.addEventListener('mouseenter', () => {
        if (!isEditingInline && selectedElement?.selector !== elementInfo.selector) {
          element.style.outline = '2px solid rgba(59, 130, 246, 0.3)';
        }
      });

      element.addEventListener('mouseleave', () => {
        if (selectedElement?.selector !== elementInfo.selector) {
          element.style.outline = 'none';
        }
      });

      element.addEventListener('click', (e) => {
        e.stopPropagation();
        handleElementClick(elementInfo);
      });
    });
  }, [isEditingInline, selectedElement]);

  const handleElementClick = useCallback((elementInfo: EditableElementInfo) => {
    if (isEditingInline) return;

    if (lastClickedElementRef.current?.selector === elementInfo.selector) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
      lastClickedElementRef.current = elementInfo;
    }

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 2 && elementInfo.type === 'text') {
        startInlineEditing(elementInfo);
      } else {
        onElementSelect(elementInfo);
      }
      clickCountRef.current = 0;
      lastClickedElementRef.current = null;
    }, 300);
  }, [isEditingInline, onElementSelect]);

  const updateElementBounds = useCallback((elements: EditableElementInfo[]) => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const bounds: ElementBounds[] = [];

    elements.forEach(info => {
      const element = doc.querySelector(info.selector) as HTMLElement;
      if (element) {
        const rect = element.getBoundingClientRect();
        bounds.push({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          info,
        });
      }
    });

    setElementBounds(bounds);
  }, []);

  const startInlineEditing = useCallback((elementInfo: EditableElementInfo) => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const targetElement = doc.querySelector(elementInfo.selector) as HTMLElement;
    if (!targetElement) return;

    const currentText = targetElement.textContent || '';
    setInlineText(currentText);
    setIsEditingInline(true);
    onElementSelect(elementInfo);
  }, [onElementSelect]);

  const finishInlineEditing = useCallback(() => {
    if (selectedElement && selectedElement.type === 'text') {
      if (onContentChange) {
        onContentChange(selectedElement, inlineText);
      }

      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          const element = doc.querySelector(selectedElement.selector) as HTMLElement;
          if (element) {
            element.textContent = inlineText;
          }
        }
      }
    }
    setIsEditingInline(false);
  }, [selectedElement, inlineText, onContentChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isEditingInline) {
        finishInlineEditing();
      } else {
        onElementSelect(null);
      }
    } else if (e.key === 'Enter' && !e.shiftKey && isEditingInline) {
      e.preventDefault();
      finishInlineEditing();
    }
  }, [isEditingInline, finishInlineEditing, onElementSelect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onElementSelect(null);
        if (isEditingInline) {
          finishInlineEditing();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onElementSelect, isEditingInline, finishInlineEditing]);

  useEffect(() => {
    if (!iframeRef.current || !selectedElement) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    editableElements.forEach(info => {
      const element = doc.querySelector(info.selector) as HTMLElement;
      if (element) {
        if (info.selector === selectedElement.selector) {
          element.style.outline = '3px solid #3b82f6';
        } else {
          element.style.outline = 'none';
        }
      }
    });
  }, [selectedElement, editableElements]);

  const getSelectedBound = () => {
    if (!selectedElement) return null;
    return elementBounds.find(b => b.info.selector === selectedElement.selector);
  };

  const selectedBound = getSelectedBound();

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full bg-gray-900 overflow-auto p-8 relative"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease',
          position: 'relative',
        }}
      >
        <iframe
          ref={iframeRef}
          title="Slide Preview"
          className="bg-white rounded-lg shadow-2xl"
          style={{
            width: '1080px',
            height: '1350px',
            border: 'none',
            pointerEvents: 'auto',
          }}
          sandbox="allow-same-origin allow-scripts"
        />

        {selectedBound && !isEditingInline && (
          <div
            style={{
              position: 'absolute',
              left: `${selectedBound.x}px`,
              top: `${selectedBound.y}px`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div className="absolute -top-7 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {selectedBound.info.label}
            </div>
          </div>
        )}

        {isEditingInline && selectedBound && selectedElement?.type === 'text' && (
          <textarea
            value={inlineText}
            onChange={(e) => setInlineText(e.target.value)}
            onBlur={finishInlineEditing}
            autoFocus
            style={{
              position: 'absolute',
              left: `${selectedBound.x}px`,
              top: `${selectedBound.y}px`,
              width: `${selectedBound.width}px`,
              height: `${selectedBound.height}px`,
              border: '3px solid #10b981',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '8px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.3)',
              zIndex: 20,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default InteractiveCanvas;
