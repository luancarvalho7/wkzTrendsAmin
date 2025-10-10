import { EditableElementInfo } from '../types/carousel';

export function detectEditableElements(doc: Document): EditableElementInfo[] {
  const elements: EditableElementInfo[] = [];
  const win = doc.defaultView || window;

  console.log('Starting element detection...');
  console.log('Document body:', doc.body);
  console.log('Body children:', doc.body?.children.length);

  const knownSelectors = [
    { selector: '.title', type: 'text' as const, label: 'Title' },
    { selector: '.subtitle', type: 'text' as const, label: 'Subtitle' },
    { selector: '.photo', type: 'background' as const, label: 'Background Image' },
  ];

  knownSelectors.forEach(({ selector, type, label }) => {
    const element = doc.querySelector(selector) as HTMLElement;
    if (element) {
      console.log(`Found ${label}:`, element);
      elements.push({
        type,
        selector,
        label,
        element,
      });
    } else {
      console.log(`${label} not found with selector: ${selector}`);
    }
  });

  if (elements.length === 0) {
    console.log('No known elements found, trying to find any text elements...');

    const allElements = doc.body.querySelectorAll('*');
    console.log('Total elements in body:', allElements.length);

    allElements.forEach((el, index) => {
      if (!(el instanceof HTMLElement)) return;

      const tag = el.tagName.toLowerCase();
      const classes = Array.from(el.classList).join(' ');
      const text = el.textContent?.trim().substring(0, 50);

      console.log(`Element ${index}: ${tag}, classes: "${classes}", text: "${text}"`);

      if (el.textContent && el.textContent.trim().length > 5) {
        const directTextNodes = Array.from(el.childNodes).filter(
          node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
        );

        if (directTextNodes.length > 0) {
          console.log('  -> Has direct text, could be editable');
        }
      }

      const style = win.getComputedStyle(el);
      if (style.backgroundImage && style.backgroundImage !== 'none') {
        console.log('  -> Has background image:', style.backgroundImage.substring(0, 50));
      }
    });
  }

  console.log('Detection complete. Found elements:', elements.length);
  return elements;
}

export function getElementStyles(element: HTMLElement): Record<string, string> {
  const doc = element.ownerDocument;
  const win = doc.defaultView || window;
  const computed = win.getComputedStyle(element);

  return {
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
    display: computed.display,
    justifyContent: computed.justifyContent,
    alignItems: computed.alignItems,
    flexDirection: computed.flexDirection,
    gap: computed.gap,
    backgroundImage: computed.backgroundImage,
    backgroundSize: computed.backgroundSize,
    backgroundPosition: computed.backgroundPosition,
  };
}

export function applyStylesToElement(element: HTMLElement, styles: Record<string, string>) {
  Object.entries(styles).forEach(([key, value]) => {
    if (value) {
      element.style[key as any] = value;
    }
  });
}
