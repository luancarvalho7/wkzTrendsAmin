import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditableElementInfo } from '../types/carousel';
import { detectEditableElements, getElementStyles } from '../utils/elementDetector';

interface InteractiveCanvasProps {
  htmlContent: string;
  zoom: number;
  selectedElement: EditableElementInfo | null;
  onElementSelect: (element: EditableElementInfo | null) => void;
  onContentChange?: (element: EditableElementInfo, content: string) => void;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
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
  onContentChange,
  iframeRef: externalIframeRef,
}) => {
  const internalIframeRef = useRef<HTMLIFrameElement>(null);
  const iframeRef = externalIframeRef || internalIframeRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementBounds, setElementBounds] = useState<ElementBounds[]>([]);
  const [editableElements, setEditableElements] = useState<EditableElementInfo[]>([]);
  const elementStylesCache = useRef<Map<string, Record<string, string>>>(new Map());
  const editingElementRef = useRef<HTMLElement | null>(null);
  const originalContentRef = useRef<string>('');

  const finishInlineEditing = useCallback(() => {
    if (editingElementRef.current) {
      const element = editingElementRef.current;
      const newContent = element.textContent || '';

      element.contentEditable = 'false';
      element.style.outline = '';
      element.style.backgroundColor = '';

      if (selectedElement && onContentChange && newContent !== originalContentRef.current) {
        onContentChange(selectedElement, newContent);
      }

      editingElementRef.current = null;
      originalContentRef.current = '';
    }
  }, [selectedElement, onContentChange]);

  const startInlineEditing = useCallback((elementInfo: EditableElementInfo) => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const targetElement = doc.querySelector(elementInfo.selector) as HTMLElement;
    if (!targetElement) return;

    originalContentRef.current = targetElement.textContent || '';
    editingElementRef.current = targetElement;

    targetElement.contentEditable = 'true';
    targetElement.style.outline = '3px solid #10b981';
    targetElement.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
    targetElement.focus();

    const range = doc.createRange();
    const selection = doc.getSelection();
    if (selection) {
      range.selectNodeContents(targetElement);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    onElementSelect(elementInfo);
  }, [onElementSelect]);

  const handleElementClick = useCallback((elementInfo: EditableElementInfo) => {
    console.log('handleElementClick called for:', elementInfo.label);

    if (editingElementRef.current) {
      finishInlineEditing();
    }

    if (elementInfo.type === 'text') {
      startInlineEditing(elementInfo);
    } else {
      onElementSelect(elementInfo);
    }
  }, [onElementSelect, startInlineEditing, finishInlineEditing]);

  const setupIframeContent = useCallback(() => {
    console.log('setupIframeContent called');
    if (!iframeRef.current) {
      console.log('No iframe ref');
      return;
    }

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) {
      console.log('No document');
      return;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      const elements = detectEditableElements(doc);
      console.log('Detected editable elements:', elements.length, elements);
      setEditableElements(elements);
      updateElementBounds(elements);

      elements.forEach(el => {
        const styles = getElementStyles(el.element);
        elementStylesCache.current.set(el.selector, styles);
      });

      elements.forEach(elementInfo => {
        const element = doc.querySelector(elementInfo.selector) as HTMLElement;
        if (!element) {
          console.log('Element not found for selector:', elementInfo.selector);
          return;
        }

        console.log('Setting up click handler for:', elementInfo.label, elementInfo.selector);
        element.style.cursor = 'pointer';
        element.style.transition = 'outline 0.2s ease';

        const mouseEnterHandler = () => {
          if (element !== editingElementRef.current && selectedElement?.selector !== elementInfo.selector) {
            element.style.outline = '2px solid rgba(59, 130, 246, 0.5)';
          }
        };

        const mouseLeaveHandler = () => {
          if (selectedElement?.selector !== elementInfo.selector) {
            element.style.outline = 'none';
          }
        };

        const clickHandler = (e: Event) => {
          console.log('Click event fired on:', elementInfo.label);
          e.stopPropagation();
          e.preventDefault();
          handleElementClick(elementInfo);
        };

        element.addEventListener('mouseenter', mouseEnterHandler);
        element.addEventListener('mouseleave', mouseLeaveHandler);
        element.addEventListener('click', clickHandler);

        console.log('Event listeners attached to:', elementInfo.label);
      });

      if (selectedElement) {
        const selectedEl = doc.querySelector(selectedElement.selector) as HTMLElement;
        if (selectedEl) {
          selectedEl.style.outline = '3px solid #3b82f6';
          selectedEl.style.outlineOffset = '2px';
        }
      }
    }, 100);
  }, [htmlContent, handleElementClick, selectedElement]);

  useEffect(() => {
    setupIframeContent();
  }, [setupIframeContent]);

  useEffect(() => {
    updateElementBounds(editableElements);
  }, [zoom]);

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editingElementRef.current) {
        if (editingElementRef.current) {
          editingElementRef.current.textContent = originalContentRef.current;
        }
        finishInlineEditing();
      } else {
        onElementSelect(null);
      }
    }
  }, [finishInlineEditing, onElementSelect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isPropertiesPanel = target.closest('.properties-panel');
      const isInsideContainer = containerRef.current && containerRef.current.contains(target);

      if (!isInsideContainer && !isPropertiesPanel) {
        if (editingElementRef.current) {
          finishInlineEditing();
        }
        onElementSelect(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onElementSelect, finishInlineEditing]);

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

        {selectedBound && !editingElementRef.current && (
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
      </div>
    </div>
  );
};

export default InteractiveCanvas;
