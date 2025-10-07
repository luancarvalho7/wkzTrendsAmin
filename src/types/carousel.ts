export interface CarouselData {
  dados_gerais: {
    nome: string;
    arroba: string;
    foto_perfil: string;
    template: string;
  };
  conteudos: SlideContent[];
}

export interface SlideContent {
  title: string;
  subtitle?: string;
  imagem_fundo: string;
  imagem_fundo2?: string;
  imagem_fundo3?: string;
}

export interface SlideStyles {
  titleColor: string;
  titleFontSize: string;
  titleFontFamily: string;
  titleFontWeight: string;
  titleTextAlign: string;
  subtitleColor: string;
  subtitleFontSize: string;
  subtitleFontFamily: string;
  subtitleFontWeight: string;
  subtitleTextAlign: string;
  backgroundColor: string;
  backgroundOpacity: string;
  overlayColor: string;
  overlayOpacity: string;
  [key: string]: string;
}

export interface SlideTransform {
  titleX: number;
  titleY: number;
  titleRotation: number;
  titleScale: number;
  subtitleX: number;
  subtitleY: number;
  subtitleRotation: number;
  subtitleScale: number;
  backgroundScale: number;
  backgroundX: number;
  backgroundY: number;
}

export interface LayoutState {
  elementOrder?: string[];
  positions?: {
    [elementId: string]: { x: number; y: number };
  };
}

export interface EditorSlide {
  id: number;
  content: SlideContent;
  styles: SlideStyles;
  transforms: SlideTransform;
  htmlTemplate: string;
  selectedBackgroundIndex: number;
  layoutState?: LayoutState;
  isAutoLayout?: boolean;
}

export interface EditorState {
  carouselData: CarouselData | null;
  slides: EditorSlide[];
  currentSlideIndex: number;
  currentTemplate: string;
  isLoading: boolean;
  error: string | null;
  history: EditorSlide[][];
  historyIndex: number;
}

export interface TemplateCache {
  [templateId: string]: string[];
}
