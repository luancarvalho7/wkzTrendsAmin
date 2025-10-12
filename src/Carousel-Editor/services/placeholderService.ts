import { CarouselData, SlideContent, SlideStyles, SlideTransform } from '../types/carousel';

export class PlaceholderService {
  private formatTextWithBreaks(text: string): string {
    if (!text) return '';

    let formatted = text
      .replace(/\.\s+/g, '.<br><br>')
      .replace(/:(?!\/{2})/g, ':<br>');

    return formatted;
  }

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

    const hasBackgroundImage = selectedBackgroundIndex === 0
      ? slideContent.imagem_fundo
      : selectedBackgroundIndex === 1
        ? slideContent.imagem_fundo2
        : slideContent.imagem_fundo3;

    const titleText = slideContent.title || '';
    const subtitleText = slideContent.subtitle || '';

    const formattedTitle = !hasBackgroundImage ? this.formatTextWithBreaks(titleText) : titleText;
    const formattedSubtitle = !hasBackgroundImage ? this.formatTextWithBreaks(subtitleText) : subtitleText;

    processedHtml = processedHtml.replace(/\{\{title\}\}/gi, formattedTitle);
    processedHtml = processedHtml.replace(/\{\{TITLE\}\}/g, formattedTitle.toUpperCase());
    processedHtml = processedHtml.replace(/\{\{subtitle\}\}/gi, formattedSubtitle);
    processedHtml = processedHtml.replace(/\{\{SUBTITLE\}\}/g, formattedSubtitle.toUpperCase());

    const selectedBgUrl = selectedBackgroundIndex === 0
      ? slideContent.imagem_fundo
      : selectedBackgroundIndex === 1
        ? slideContent.imagem_fundo2
        : slideContent.imagem_fundo3;

    processedHtml = processedHtml.replace(/\{\{imagem_fundo\}\}/gi, selectedBgUrl || '');

    const defaultBgUrl = 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2025/01/Santos-Neymar-braco-Cruzado.jpg';
    processedHtml = processedHtml.replace(new RegExp(defaultBgUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), selectedBgUrl || '');

    const currentMonthYear = this.getCurrentMonthYear();
    processedHtml = processedHtml.replace(/\{\{mesano\}\}/gi, currentMonthYear);
    processedHtml = processedHtml.replace(/\{\{MESANO\}\}/g, currentMonthYear.toUpperCase());

    const hasStyles = styles && Object.keys(styles).length > 0;
    if (hasStyles) {
      processedHtml = this.injectStyles(processedHtml, styles, transforms);
    }

    return processedHtml;
  }

  private injectStyles(html: string, styles: SlideStyles, transforms: SlideTransform): string {
    const titleStyles: string[] = [];
    const subtitleStyles: string[] = [];
    const backgroundStyles: string[] = [];
    const customSelectorStyles: Record<string, string[]> = {};

    if (styles.titleColor) titleStyles.push(`color: ${styles.titleColor} !important;`);
    if (styles.titleFontSize) titleStyles.push(`font-size: ${styles.titleFontSize} !important;`);
    if (styles.titleFontFamily) titleStyles.push(`font-family: ${styles.titleFontFamily} !important;`);
    if (styles.titleFontWeight) titleStyles.push(`font-weight: ${styles.titleFontWeight} !important;`);
    if (styles.titleTextAlign) titleStyles.push(`text-align: ${styles.titleTextAlign} !important;`);

    titleStyles.push('display: flex !important;');
    titleStyles.push('flex-direction: column !important;');
    titleStyles.push('justify-content: center !important;');

    if (styles.subtitleColor) subtitleStyles.push(`color: ${styles.subtitleColor} !important;`);
    if (styles.subtitleFontSize) subtitleStyles.push(`font-size: ${styles.subtitleFontSize} !important;`);
    if (styles.subtitleFontFamily) subtitleStyles.push(`font-family: ${styles.subtitleFontFamily} !important;`);
    if (styles.subtitleFontWeight) subtitleStyles.push(`font-weight: ${styles.subtitleFontWeight} !important;`);
    if (styles.subtitleTextAlign) subtitleStyles.push(`text-align: ${styles.subtitleTextAlign} !important;`);

    subtitleStyles.push('display: flex !important;');
    subtitleStyles.push('flex-direction: column !important;');
    subtitleStyles.push('justify-content: center !important;');

    if (styles.backgroundColor) backgroundStyles.push(`background-color: ${styles.backgroundColor} !important;`);
    if (styles.backgroundOpacity) backgroundStyles.push(`opacity: ${styles.backgroundOpacity} !important;`);

    Object.entries(styles).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const selector = key;
        const styleObj = value as Record<string, string>;
        const stylesList: string[] = [];

        Object.entries(styleObj).forEach(([prop, val]) => {
          if (val) {
            const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            stylesList.push(`${cssProp}: ${val} !important;`);
          }
        });

        if (stylesList.length > 0) {
          customSelectorStyles[selector] = stylesList;
        }
      }
    });

    const titleTransformParts: string[] = [];
    if (transforms.titleX || transforms.titleY) {
      titleTransformParts.push(`translate(${transforms.titleX || 0}px, ${transforms.titleY || 0}px)`);
    }
    if (transforms.titleRotation) {
      titleTransformParts.push(`rotate(${transforms.titleRotation}deg)`);
    }
    if (transforms.titleScale && transforms.titleScale !== 1) {
      titleTransformParts.push(`scale(${transforms.titleScale})`);
    }
    if (titleTransformParts.length > 0) {
      titleStyles.push(`transform: ${titleTransformParts.join(' ')} !important;`);
    }

    const subtitleTransformParts: string[] = [];
    if (transforms.subtitleX || transforms.subtitleY) {
      subtitleTransformParts.push(`translate(${transforms.subtitleX || 0}px, ${transforms.subtitleY || 0}px)`);
    }
    if (transforms.subtitleRotation) {
      subtitleTransformParts.push(`rotate(${transforms.subtitleRotation}deg)`);
    }
    if (transforms.subtitleScale && transforms.subtitleScale !== 1) {
      subtitleTransformParts.push(`scale(${transforms.subtitleScale})`);
    }
    if (subtitleTransformParts.length > 0) {
      subtitleStyles.push(`transform: ${subtitleTransformParts.join(' ')} !important;`);
    }

    const backgroundTransformParts: string[] = [];
    if (transforms.backgroundX || transforms.backgroundY) {
      backgroundTransformParts.push(`translate(${transforms.backgroundX || 0}px, ${transforms.backgroundY || 0}px)`);
    }
    if (transforms.backgroundScale && transforms.backgroundScale !== 1) {
      backgroundTransformParts.push(`scale(${transforms.backgroundScale})`);
    }
    if (backgroundTransformParts.length > 0) {
      backgroundStyles.push(`transform: ${backgroundTransformParts.join(' ')} !important;`);
    }

    let cssRules = '';

    if (titleStyles.length > 0) {
      cssRules += `
        [data-editable="title"],
        *[class*="title"],
        *[id*="title"],
        h1, h2, h3 {
          ${titleStyles.join('\n          ')}
        }
      `;
    }

    if (subtitleStyles.length > 0) {
      cssRules += `
        [data-editable="subtitle"],
        *[class*="subtitle"],
        *[id*="subtitle"],
        p, span {
          ${subtitleStyles.join('\n          ')}
        }
      `;
    }

    if (backgroundStyles.length > 0) {
      cssRules += `
        [data-editable="background"] {
          ${backgroundStyles.join('\n          ')}
        }
      `;
    }

    Object.entries(customSelectorStyles).forEach(([selector, stylesList]) => {
      cssRules += `
        ${selector} {
          ${stylesList.join('\n          ')}
        }
      `;
    });

    if (styles.overlayColor || styles.overlayOpacity) {
      cssRules += `
        [data-editable="overlay"]::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          ${styles.overlayColor ? `background-color: ${styles.overlayColor};` : ''}
          ${styles.overlayOpacity ? `opacity: ${styles.overlayOpacity};` : ''}
          pointer-events: none;
        }
      `;
    }

    const styleTag = cssRules ? `<style id="editor-styles">${cssRules}</style>` : '';

    if (html.includes('</head>')) {
      return html.replace('</head>', `${styleTag}</head>`);
    } else if (html.includes('<body')) {
      return html.replace('<body', `${styleTag}<body`);
    } else {
      return styleTag + html;
    }
  }

  private getCurrentMonthYear(): string {
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const now = new Date();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${month} de ${year}`;
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
