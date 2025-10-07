import { CarouselData, SlideContent, SlideStyles, SlideTransform } from '../types/carousel';

export class PlaceholderService {
  replacePlaceholders(
    html: string,
    data: CarouselData,
    slideContent: SlideContent,
    styles: SlideStyles,
    transforms: SlideTransform,
    selectedBackgroundIndex: number = 0
  ): string {
    let processedHtml = html;

    processedHtml = processedHtml.replace(/\{\{nome\}\}/gi, data.dados_gerais.nome);
    processedHtml = processedHtml.replace(/\{\{NOME\}\}/g, data.dados_gerais.nome.toUpperCase());
    processedHtml = processedHtml.replace(/\{\{arroba\}\}/gi, data.dados_gerais.arroba);
    processedHtml = processedHtml.replace(/@\{\{arroba\}\}/gi, `@${data.dados_gerais.arroba}`);
    processedHtml = processedHtml.replace(/\{\{foto_perfil\}\}/gi, data.dados_gerais.foto_perfil);

    processedHtml = processedHtml.replace(/\{\{title\}\}/gi, slideContent.title || '');
    processedHtml = processedHtml.replace(/\{\{TITLE\}\}/g, (slideContent.title || '').toUpperCase());
    processedHtml = processedHtml.replace(/\{\{subtitle\}\}/gi, slideContent.subtitle || '');
    processedHtml = processedHtml.replace(/\{\{SUBTITLE\}\}/g, (slideContent.subtitle || '').toUpperCase());

    const selectedBgUrl = selectedBackgroundIndex === 0
      ? slideContent.imagem_fundo
      : selectedBackgroundIndex === 1
        ? slideContent.imagem_fundo2
        : slideContent.imagem_fundo3;

    processedHtml = processedHtml.replace(/\{\{imagem_fundo\}\}/gi, selectedBgUrl || '');

    const defaultBgUrl = 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2025/01/Santos-Neymar-braco-Cruzado.jpg';
    processedHtml = processedHtml.replace(new RegExp(defaultBgUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), selectedBgUrl || '');

    const hasStyles = styles && Object.keys(styles).length > 0;
    if (hasStyles) {
      processedHtml = this.injectStyles(processedHtml, styles, transforms);
    }

    return processedHtml;
  }

  private injectStyles(html: string, styles: SlideStyles, transforms: SlideTransform): string {
    const styleTag = `
      <style id="editor-styles">
        :root {
          --title-color: ${styles.titleColor || '#000000'};
          --title-font-size: ${styles.titleFontSize || '24px'};
          --title-font-family: ${styles.titleFontFamily || 'Arial, sans-serif'};
          --title-font-weight: ${styles.titleFontWeight || 'bold'};
          --title-text-align: ${styles.titleTextAlign || 'center'};
          --title-transform-x: ${transforms.titleX || 0}px;
          --title-transform-y: ${transforms.titleY || 0}px;
          --title-rotation: ${transforms.titleRotation || 0}deg;
          --title-scale: ${transforms.titleScale || 1};

          --subtitle-color: ${styles.subtitleColor || '#333333'};
          --subtitle-font-size: ${styles.subtitleFontSize || '16px'};
          --subtitle-font-family: ${styles.subtitleFontFamily || 'Arial, sans-serif'};
          --subtitle-font-weight: ${styles.subtitleFontWeight || 'normal'};
          --subtitle-text-align: ${styles.subtitleTextAlign || 'center'};
          --subtitle-transform-x: ${transforms.subtitleX || 0}px;
          --subtitle-transform-y: ${transforms.subtitleY || 0}px;
          --subtitle-rotation: ${transforms.subtitleRotation || 0}deg;
          --subtitle-scale: ${transforms.subtitleScale || 1};

          --background-color: ${styles.backgroundColor || 'transparent'};
          --background-opacity: ${styles.backgroundOpacity || '1'};
          --overlay-color: ${styles.overlayColor || 'transparent'};
          --overlay-opacity: ${styles.overlayOpacity || '0'};
          --background-scale: ${transforms.backgroundScale || 1};
          --background-transform-x: ${transforms.backgroundX || 0}px;
          --background-transform-y: ${transforms.backgroundY || 0}px;
        }

        [data-editable="title"],
        *[class*="title"],
        *[id*="title"],
        h1, h2, h3 {
          color: var(--title-color) !important;
          font-size: var(--title-font-size) !important;
          font-family: var(--title-font-family) !important;
          font-weight: var(--title-font-weight) !important;
          text-align: var(--title-text-align) !important;
          transform: translate(var(--title-transform-x), var(--title-transform-y))
                     rotate(var(--title-rotation))
                     scale(var(--title-scale)) !important;
        }

        [data-editable="subtitle"],
        *[class*="subtitle"],
        *[id*="subtitle"],
        p, span {
          color: var(--subtitle-color) !important;
          font-size: var(--subtitle-font-size) !important;
          font-family: var(--subtitle-font-family) !important;
          font-weight: var(--subtitle-font-weight) !important;
          text-align: var(--subtitle-text-align) !important;
          transform: translate(var(--subtitle-transform-x), var(--subtitle-transform-y))
                     rotate(var(--subtitle-rotation))
                     scale(var(--subtitle-scale)) !important;
        }

        [data-editable="background"] {
          background-color: var(--background-color) !important;
          opacity: var(--background-opacity) !important;
          transform: translate(var(--background-transform-x), var(--background-transform-y))
                     scale(var(--background-scale)) !important;
        }

        [data-editable="overlay"]::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--overlay-color);
          opacity: var(--overlay-opacity);
          pointer-events: none;
        }
      </style>
    `;

    if (html.includes('</head>')) {
      return html.replace('</head>', `${styleTag}</head>`);
    } else if (html.includes('<body')) {
      return html.replace('<body', `${styleTag}<body`);
    } else {
      return styleTag + html;
    }
  }

  extractEditableContent(html: string): { title?: string; subtitle?: string } {
    const titleMatch = html.match(/data-editable="title"[^>]*>([^<]*)</i);
    const subtitleMatch = html.match(/data-editable="subtitle"[^>]*>([^<]*)</i);

    return {
      title: titleMatch ? titleMatch[1].trim() : undefined,
      subtitle: subtitleMatch ? subtitleMatch[1].trim() : undefined,
    };
  }
}

export const placeholderService = new PlaceholderService();
