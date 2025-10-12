import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { CarouselData, EditorSlide, SlideStyles, SlideTransform, EditableElementInfo } from '../types/carousel';
import { templateService } from '../services/templateService';
import { placeholderService } from '../services/placeholderService';
import { exportService } from '../services/exportService';
import EditorToolbar from './EditorToolbar';
import FigmaStyleCanvas from './FigmaStyleCanvas';
import TemplateSelector from './TemplateSelector';
import ItemPropertiesPanel from './ItemPropertiesPanel';
import LayersPanel from './LayersPanel';

interface CarouselEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  carouselData: CarouselData;
}

const CarouselEditorModal: React.FC<CarouselEditorModalProps> = ({
  isOpen,
  onClose,
  carouselData,
}) => {
  const [slides, setSlides] = useState<EditorSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoom, setZoom] = useState(0.35);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [history, setHistory] = useState<EditorSlide[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState<EditableElementInfo | null>(null);
  const [elementStyles, setElementStyles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    console.log('CarouselEditorModal mounted');
    console.log('Received carouselData:', carouselData);

    if (!carouselData.dados_gerais || !carouselData.conteudos) {
      console.error('Invalid carousel data structure:', carouselData);
      setError('Invalid carousel data structure received');
      setIsLoading(false);
      return;
    }

    const loadTemplate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const templateId = carouselData.dados_gerais.template;
        console.log('Loading template:', templateId);
        setCurrentTemplate(templateId);

        const templates = await templateService.fetchTemplate(templateId);
        console.log('Templates loaded:', templates.length);

        const initialSlides: EditorSlide[] = carouselData.conteudos.map((content, index) => {
          const template = templates[index];
          const hasSubtitle = template.includes('{{subtitle}}') || template.includes('data-editable="subtitle"');

          let processedContent = { ...content };
          if (!hasSubtitle && content.title && content.subtitle) {
            processedContent.title = `${content.title}\n\n${content.subtitle}`;
            console.log(`Merged title and subtitle for slide ${index + 1}`);
          }

          return {
            id: index,
            content: processedContent,
            styles: {},
            transforms: getDefaultTransforms(),
            htmlTemplate: template,
            selectedBackgroundIndex: 0,
          };
        });

        setSlides(initialSlides);
        setHistory([initialSlides]);
        setHistoryIndex(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [isOpen, carouselData]);

  const getDefaultTransforms = (): SlideTransform => ({
    titleX: 0,
    titleY: 0,
    titleRotation: 0,
    titleScale: 1,
    subtitleX: 0,
    subtitleY: 0,
    subtitleRotation: 0,
    subtitleScale: 1,
    backgroundScale: 1,
    backgroundX: 0,
    backgroundY: 0,
  });

  const saveToHistory = useCallback((newSlides: EditorSlide[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newSlides]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const updateSlide = useCallback((
    index: number,
    updates: Partial<EditorSlide>
  ) => {
    setSlides(prevSlides => {
      const newSlides = [...prevSlides];
      newSlides[index] = { ...newSlides[index], ...updates };
      return newSlides;
    });
  }, []);

  const handleStyleChange = useCallback((key: string, value: string) => {
    console.log('Style change:', key, value);
    const currentSlide = slides[currentSlideIndex];
    const newStyles = { ...currentSlide.styles, [key]: value };
    updateSlide(currentSlideIndex, { styles: newStyles });
    saveToHistory(slides.map((s, i) => i === currentSlideIndex ? { ...s, styles: newStyles } : s));
  }, [slides, currentSlideIndex, updateSlide, saveToHistory]);

  const handleContentChange = useCallback((element: EditableElementInfo, content: string) => {
    console.log('Content change for element:', element.selector, content);

    const currentSlide = slides[currentSlideIndex];
    const updatedContent = { ...currentSlide.content };

    if (element.label === 'Title' || element.selector.includes('title')) {
      updatedContent.title = content;
    } else if (element.label === 'Subtitle' || element.selector.includes('subtitle')) {
      updatedContent.subtitle = content;
    }

    updateSlide(currentSlideIndex, { content: updatedContent });
    saveToHistory(slides.map((s, i) => i === currentSlideIndex ? { ...s, content: updatedContent } : s));
  }, [slides, currentSlideIndex, updateSlide, saveToHistory]);

  const handleTextContentChange = useCallback((content: string) => {
    if (!selectedElement) return;
    handleContentChange(selectedElement, content);
  }, [selectedElement, handleContentChange]);

  const handleLayerElementSelect = useCallback((element: EditableElementInfo, slideIndex: number) => {
    setCurrentSlideIndex(slideIndex);
    setSelectedElement(element);
    setElementStyles({});
  }, []);

  const handleElementStyleChange = useCallback((element: EditableElementInfo, styles: Record<string, string>) => {
    console.log('Style change for element:', element.selector, styles);
    const currentSlide = slides[currentSlideIndex];
    const newStyles = { ...currentSlide.styles, [element.selector]: styles };
    updateSlide(currentSlideIndex, { styles: newStyles });
    setElementStyles(styles);

    saveToHistory(slides.map((s, i) => i === currentSlideIndex ? { ...s, styles: newStyles } : s));
  }, [slides, currentSlideIndex, updateSlide, saveToHistory]);

  const handleStylePropertyChange = useCallback((property: string, value: string) => {
    if (!selectedElement) return;
    console.log('handleStylePropertyChange:', property, value);

    const updatedStyles = { ...elementStyles, [property]: value };
    setElementStyles(updatedStyles);

    const currentSlide = slides[currentSlideIndex];
    const newStyles = { ...currentSlide.styles, [selectedElement.selector]: updatedStyles };
    updateSlide(currentSlideIndex, { styles: newStyles });

    saveToHistory(slides.map((s, i) => i === currentSlideIndex ? { ...s, styles: newStyles } : s));
  }, [selectedElement, elementStyles, slides, currentSlideIndex, updateSlide, saveToHistory]);

  const handleBackgroundChange = useCallback((imageUrl: string, index: number) => {
    updateSlide(currentSlideIndex, {
      selectedBackgroundIndex: index,
    });
    saveToHistory(slides.map((s, i) => i === currentSlideIndex ? { ...s, selectedBackgroundIndex: index } : s));
  }, [slides, currentSlideIndex, updateSlide, saveToHistory]);

  const handleElementSelect = useCallback((element: EditableElementInfo | null) => {
    console.log('Element selected:', element);
    setSelectedElement(element);
    if (!element) {
      setElementStyles({});
    } else {
      const slideIndex = element.slideIndex !== undefined ? element.slideIndex : currentSlideIndex;
      const currentSlide = slides[slideIndex];
      const savedStyles = currentSlide.styles?.[element.selector];

      if (savedStyles && typeof savedStyles === 'object') {
        console.log('Loading saved styles for element:', element.selector, savedStyles);
        setElementStyles(savedStyles as Record<string, string>);
      } else {
        const doc = element.element.ownerDocument;
        const win = doc.defaultView || window;
        const computed = win.getComputedStyle(element.element);
        const styles = {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          fontWeight: computed.fontWeight,
          textAlign: computed.textAlign,
          opacity: computed.opacity,
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          margin: computed.margin,
          width: computed.width,
          height: computed.height,
          backgroundImage: computed.backgroundImage,
          backgroundSize: computed.backgroundSize,
          backgroundPosition: computed.backgroundPosition,
        };
        console.log('Loaded computed styles:', styles);
        setElementStyles(styles);
      }
    }
  }, [slides, currentSlideIndex]);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlideIndex(index);
    setSelectedElement(null);
  }, []);

  const handleTemplateChange = async (templateId: string) => {
    if (templateId === currentTemplate) return;

    setIsLoading(true);
    setError(null);

    try {
      const templates = await templateService.fetchTemplate(templateId);
      const updatedSlides = slides.map((slide, index) => {
        const template = templates[index];
        const hasSubtitle = template.includes('{{subtitle}}') || template.includes('data-editable="subtitle"');
        const originalContent = carouselData.conteudos[index];

        let processedContent = slide.content;
        if (!hasSubtitle && originalContent.title && originalContent.subtitle) {
          processedContent = {
            ...slide.content,
            title: `${originalContent.title}\n\n${originalContent.subtitle}`,
          };
        } else if (hasSubtitle) {
          processedContent = {
            ...slide.content,
            title: originalContent.title,
            subtitle: originalContent.subtitle,
          };
        }

        return {
          ...slide,
          content: processedContent,
          htmlTemplate: template,
        };
      });

      setSlides(updatedSlides);
      setCurrentTemplate(templateId);
      setSelectedElement(null);
      setElementStyles({});
      saveToHistory(updatedSlides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.05, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.05, 0.1));

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSlides(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSlides(history[historyIndex + 1]);
    }
  };

  const handleExport = async () => {
    try {
      await exportService.exportAsHTML(slides, carouselData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export');
    }
  };

  const handleClose = () => {
    const hasChanges = historyIndex > 0;
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmLeave) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2 text-white">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading editor...</p>
        </div>
      </div>
    );
  }

  const allSlidesHtml = slides.map((slide) =>
    placeholderService.replacePlaceholders(
      slide.htmlTemplate,
      carouselData,
      slide.content,
      slide.styles,
      slide.transforms,
      slide.selectedBackgroundIndex
    )
  );

  const slidesData = slides.map((slide, index) => ({
    id: slide.id,
    htmlContent: allSlidesHtml[index],
  }));

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <div className="h-screen flex flex-col">
        <div className="bg-black border-b border-white/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Carousel Editor</h1>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <EditorToolbar
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onExport={handleExport}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onBackToFeed={handleClose}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-black border-r border-white/20 flex flex-col overflow-y-auto">
            <TemplateSelector
              currentTemplate={currentTemplate}
              onTemplateChange={handleTemplateChange}
              isLoading={isLoading}
            />
            <LayersPanel
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              selectedElement={selectedElement}
              onSlideSelect={setCurrentSlideIndex}
              onElementSelect={handleLayerElementSelect}
            />
          </div>

          <div className="flex-1">
            <FigmaStyleCanvas
              slides={slidesData}
              zoom={zoom}
              onZoomChange={setZoom}
              selectedElement={selectedElement}
              onElementSelect={handleElementSelect}
              onStyleChange={handleElementStyleChange}
              onContentChange={handleContentChange}
              currentSlideIndex={currentSlideIndex}
              onSlideIndexChange={setCurrentSlideIndex}
            />
          </div>

          <ItemPropertiesPanel
            selectedElement={selectedElement}
            slideContent={slides[currentSlideIndex]?.content}
            elementStyles={elementStyles}
            selectedBackgroundIndex={slides[currentSlideIndex]?.selectedBackgroundIndex || 0}
            onStyleChange={handleStylePropertyChange}
            onContentChange={handleTextContentChange}
            onBackgroundChange={handleBackgroundChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CarouselEditorModal;
