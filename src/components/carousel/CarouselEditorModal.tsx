import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { CarouselData, EditorSlide, SlideStyles, SlideTransform } from '../../types/carousel';
import { templateService } from '../../services/templateService';
import { placeholderService } from '../../services/placeholderService';
import { exportService } from '../../services/exportService';
import EditorToolbar from './EditorToolbar';
import SlideCanvas from './SlideCanvas';
import SlideNavigator from './SlideNavigator';
import StylePanel from './StylePanel';
import TemplateSelector from './TemplateSelector';
import BackgroundSelector from './BackgroundSelector';
import ContentEditor from './ContentEditor';

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
  const [activeStyleTab, setActiveStyleTab] = useState<'text' | 'colors' | 'background'>('text');

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

        const initialSlides: EditorSlide[] = carouselData.conteudos.map((content, index) => ({
          id: index,
          content: { ...content },
          styles: getDefaultStyles(),
          transforms: getDefaultTransforms(),
          htmlTemplate: templates[index],
          selectedBackgroundIndex: 0,
        }));

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

  const getDefaultStyles = (): SlideStyles => ({
    titleColor: '#000000',
    titleFontSize: '32px',
    titleFontFamily: 'Arial, sans-serif',
    titleFontWeight: 'bold',
    titleTextAlign: 'center',
    subtitleColor: '#333333',
    subtitleFontSize: '18px',
    subtitleFontFamily: 'Arial, sans-serif',
    subtitleFontWeight: 'normal',
    subtitleTextAlign: 'center',
    backgroundColor: 'transparent',
    backgroundOpacity: '1',
    overlayColor: 'transparent',
    overlayOpacity: '0',
  });

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

  const handleContentChange = useCallback((key: string, value: string) => {
    const currentSlide = slides[currentSlideIndex];
    const newContent = { ...currentSlide.content, [key]: value };
    updateSlide(currentSlideIndex, { content: newContent });
    saveToHistory(slides.map((s, i) => i === currentSlideIndex ? { ...s, content: newContent } : s));
  }, [slides, currentSlideIndex, updateSlide, saveToHistory]);

  const handleBackgroundChange = useCallback((imageUrl: string, index: number) => {
    const currentSlide = slides[currentSlideIndex];
    const newContent = { ...currentSlide.content, imagem_fundo: imageUrl };
    updateSlide(currentSlideIndex, {
      content: newContent,
      selectedBackgroundIndex: index,
    });
    saveToHistory(slides.map((s, i) => i === currentSlideIndex ? { ...s, content: newContent, selectedBackgroundIndex: index } : s));
  }, [slides, currentSlideIndex, updateSlide, saveToHistory]);

  const handleTemplateChange = async (templateId: string) => {
    if (templateId === currentTemplate) return;

    setIsLoading(true);
    setError(null);

    try {
      const templates = await templateService.fetchTemplate(templateId);
      const updatedSlides = slides.map((slide, index) => ({
        ...slide,
        htmlTemplate: templates[index],
      }));

      setSlides(updatedSlides);
      setCurrentTemplate(templateId);
      saveToHistory(updatedSlides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.05, 0.6));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.05, 0.2));

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading editor...</p>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];
  const currentHtml = currentSlide
    ? placeholderService.replacePlaceholders(
        currentSlide.htmlTemplate,
        carouselData,
        currentSlide.content,
        currentSlide.styles,
        currentSlide.transforms
      )
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="h-screen flex flex-col">
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Carousel Editor</h1>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
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
          <div className="w-80 bg-gray-800 flex flex-col overflow-y-auto">
            <TemplateSelector
              currentTemplate={currentTemplate}
              onTemplateChange={handleTemplateChange}
              isLoading={isLoading}
            />
            {currentSlide && (
              <>
                <ContentEditor
                  content={currentSlide.content}
                  onContentChange={handleContentChange}
                />
                <BackgroundSelector
                  slideContent={currentSlide.content}
                  selectedIndex={currentSlide.selectedBackgroundIndex}
                  onBackgroundChange={handleBackgroundChange}
                />
              </>
            )}
            <SlideNavigator
              slides={slides}
              currentIndex={currentSlideIndex}
              onSlideChange={setCurrentSlideIndex}
            />
          </div>

          <div className="flex-1">
            <SlideCanvas htmlContent={currentHtml} zoom={zoom} />
          </div>

          {currentSlide && (
            <StylePanel
              styles={currentSlide.styles}
              onStyleChange={handleStyleChange}
              activeTab={activeStyleTab}
              onTabChange={setActiveStyleTab}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CarouselEditorModal;
