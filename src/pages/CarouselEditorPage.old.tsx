import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CarouselData, EditorSlide, SlideStyles, SlideTransform, EditableElementInfo } from '../Carousel-Editor';
import { templateService, placeholderService, exportService } from '../Carousel-Editor';
import EditorToolbar from '../Carousel-Editor/components/EditorToolbar';
import InteractiveCanvas from '../Carousel-Editor/components/InteractiveCanvas';
import SlideNavigator from '../Carousel-Editor/components/SlideNavigator';
import TemplateSelector from '../Carousel-Editor/components/TemplateSelector';
import ItemPropertiesPanel from '../Carousel-Editor/components/ItemPropertiesPanel';
import LayersPanel from '../Carousel-Editor/components/LayersPanel';

type EditableElement = EditableElementInfo | null;

const CarouselEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const carouselData = location.state?.carouselData as CarouselData | undefined;

  const [slides, setSlides] = useState<EditorSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoom, setZoom] = useState(0.4);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [history, setHistory] = useState<EditorSlide[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState<EditableElement>(null);
  const [selectedElementStyles, setSelectedElementStyles] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('CarouselEditorPage mounted');
    console.log('Received carouselData:', carouselData);

    if (!carouselData) {
      console.error('No carousel data provided, redirecting to home');
      navigate('/');
      return;
    }

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
  }, [carouselData, navigate]);

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
    newHistory.push(newSlides);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const updateSlide = useCallback((
    index: number,
    updates: Partial<EditorSlide>
  ) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setSlides(newSlides);
    saveToHistory(newSlides);
  }, [slides, saveToHistory]);

  const handleStyleChange = (key: string, value: string) => {
    const currentSlide = slides[currentSlideIndex];
    updateSlide(currentSlideIndex, {
      styles: { ...currentSlide.styles, [key]: value },
    });
  };

  const handleContentChange = (key: string, value: string) => {
    const currentSlide = slides[currentSlideIndex];
    updateSlide(currentSlideIndex, {
      content: { ...currentSlide.content, [key]: value },
    });
  };

  const handleBackgroundChange = (imageUrl: string, index: number) => {
    const currentSlide = slides[currentSlideIndex];
    updateSlide(currentSlideIndex, {
      content: { ...currentSlide.content, imagem_fundo: imageUrl },
      selectedBackgroundIndex: index,
    });
  };

  const handleElementSelect = (element: EditableElement, elementStyles?: Record<string, string>) => {
    setSelectedElement(element);
    if (elementStyles) {
      setSelectedElementStyles(elementStyles);
    } else if (element && element.element) {
      const doc = element.element.ownerDocument;
      const win = doc.defaultView || window;
      const computed = win.getComputedStyle(element.element);
      setSelectedElementStyles({
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
      });
    } else {
      setSelectedElementStyles({});
    }
  };

  const handleElementStyleChange = (property: string, value: string) => {
    if (!selectedElement) return;

    setSelectedElementStyles(prev => ({ ...prev, [property]: value }));

    const currentSlide = slides[currentSlideIndex];
    const updatedStyles = { ...currentSlide.styles, [property]: value };

    updateSlide(currentSlideIndex, {
      styles: updatedStyles,
    });
  };

  const handleSlideChange = (index: number) => {
    setCurrentSlideIndex(index);
    setSelectedElement(null);
  };

  const handleLayerElementSelect = (element: EditableElementInfo, slideIndex: number) => {
    if (slideIndex !== currentSlideIndex) {
      setCurrentSlideIndex(slideIndex);
    }
    setSelectedElement(element);
  };

  const handleTemplateChange = async (templateId: string) => {
    if (templateId === currentTemplate || !carouselData) return;

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

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 1));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.2));

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
    if (!carouselData) return;

    try {
      await exportService.exportAsHTML(slides, carouselData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export');
    }
  };

  const handleBackToFeed = () => {
    const hasChanges = historyIndex > 0;
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/');
  };

  if (!carouselData) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
        currentSlide.transforms,
        currentSlide.selectedBackgroundIndex
      )
    : '';

  return (
    <div className="h-screen flex flex-col bg-black">
      <EditorToolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onBackToFeed={handleBackToFeed}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-black border-r border-white/20 flex flex-col overflow-y-auto">
          <TemplateSelector
            currentTemplate={currentTemplate}
            onTemplateChange={handleTemplateChange}
            isLoading={isLoading}
          />
          <SlideNavigator
            slides={slides}
            currentIndex={currentSlideIndex}
            onSlideChange={handleSlideChange}
          />
          <LayersPanel
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            selectedElement={selectedElement}
            onSlideSelect={handleSlideChange}
            onElementSelect={handleLayerElementSelect}
          />
        </div>

        <div className="flex-1">
          <InteractiveCanvas
            htmlContent={currentHtml}
            zoom={zoom}
            selectedElement={selectedElement}
            selectedElementStyles={selectedElementStyles}
            onElementSelect={handleElementSelect}
            onContentChange={handleContentChange}
          />
        </div>

        {currentSlide && (
          <ItemPropertiesPanel
            selectedElement={selectedElement}
            slideContent={currentSlide.content}
            elementStyles={selectedElementStyles}
            selectedBackgroundIndex={currentSlide.selectedBackgroundIndex}
            onContentChange={handleContentChange}
            onBackgroundChange={handleBackgroundChange}
            onStyleChange={handleElementStyleChange}
          />
        )}
      </div>
    </div>
  );
};

export default CarouselEditorPage;
