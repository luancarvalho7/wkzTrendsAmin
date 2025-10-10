import { EditableElementInfo } from '../types/carousel';

const IGNORED_TAGS = ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'STYLE', 'META', 'LINK'];
const MIN_TEXT_LENGTH = 1;

export function detectEditableElements(doc: Document): EditableElementInfo[] {
  const elements: EditableElementInfo[] = [];
  const seenElements = new Set<HTMLElement>();
  const win = doc.defaultView || window;

  function isVisible(el: HTMLElement): boolean {
    const style = win.getComputedStyle(el);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           el.offsetWidth > 0 &&
           el.offsetHeight > 0;
  }

  function hasTextContent(el: HTMLElement): boolean {
    const text = el.textContent?.trim() || '';
    return text.length >= MIN_TEXT_LENGTH;
  }

  function isTextElement(el: HTMLElement): boolean {
    const directText = Array.from(el.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent?.trim() || '')
      .join('');

    return directText.length >= MIN_TEXT_LENGTH;
  }

  function hasBackgroundImage(el: HTMLElement): boolean {
    const style = win.getComputedStyle(el);
    return style.backgroundImage !== 'none';
  }

  function hasBackgroundColor(el: HTMLElement): boolean {
    const style = win.getComputedStyle(el);
    const bgColor = style.backgroundColor;
    return bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
  }

  function containsImage(el: HTMLElement): boolean {
    return el.tagName === 'IMG' ||
           (el.children.length === 1 && el.children[0].tagName === 'IMG');
  }

  function getElementLabel(el: HTMLElement, type: EditableElementInfo['type']): string {
    if (el.hasAttribute('data-editable')) {
      const label = el.getAttribute('data-editable') || '';
      return label.charAt(0).toUpperCase() + label.slice(1);
    }

    const id = el.id;
    if (id) {
      return id.split(/[-_]/).map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }

    const classList = Array.from(el.classList);
    const meaningfulClass = classList.find(cls =>
      !cls.startsWith('absolute') &&
      !cls.startsWith('relative') &&
      !cls.startsWith('flex') &&
      !cls.startsWith('w-') &&
      !cls.startsWith('h-') &&
      !cls.startsWith('p-') &&
      !cls.startsWith('m-') &&
      !cls.startsWith('text-') &&
      !cls.startsWith('bg-')
    );

    if (meaningfulClass) {
      return meaningfulClass.split(/[-_]/).map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }

    if (type === 'text') {
      const text = el.textContent?.trim() || '';
      if (text.length > 0) {
        const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;
        return preview;
      }
    }

    return `${el.tagName.toLowerCase()}`;
  }

  function generateSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;

    if (el.hasAttribute('data-editable')) {
      return `[data-editable="${el.getAttribute('data-editable')}"]`;
    }

    const parent = el.parentElement;
    if (!parent || parent === doc.body) {
      const siblings = Array.from(doc.body.children);
      const index = siblings.indexOf(el);
      return `body > ${el.tagName.toLowerCase()}:nth-child(${index + 1})`;
    }

    const siblings = Array.from(parent.children);
    const sameTagSiblings = siblings.filter(s => s.tagName === el.tagName);

    if (sameTagSiblings.length === 1) {
      return `${generateSelector(parent)} > ${el.tagName.toLowerCase()}`;
    }

    const index = sameTagSiblings.indexOf(el);
    return `${generateSelector(parent)} > ${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
  }

  function traverse(element: Element, depth: number = 0) {
    if (depth > 20) return;
    if (!(element instanceof HTMLElement)) return;
    if (IGNORED_TAGS.includes(element.tagName)) return;
    if (seenElements.has(element)) return;

    const visible = isVisible(element);
    if (!visible) {
      console.log('Element not visible:', element.tagName, element.className);
      return;
    }

    let elementAdded = false;

    if (hasBackgroundImage(element) || hasBackgroundColor(element)) {
      seenElements.add(element);
      elements.push({
        type: 'background',
        selector: generateSelector(element),
        label: getElementLabel(element, 'background') + ' (Background)',
        element: element,
      });
      elementAdded = true;
      console.log('Found background element:', element.tagName, element.className);
    }

    if (containsImage(element)) {
      if (!elementAdded) seenElements.add(element);
      const imgEl = element.tagName === 'IMG' ? element : element.querySelector('img');
      if (imgEl) {
        elements.push({
          type: 'image',
          selector: generateSelector(element),
          label: getElementLabel(element, 'image') + ' (Image)',
          element: element,
        });
        elementAdded = true;
        console.log('Found image element:', element.tagName, element.className);
      }
    }

    if (isTextElement(element) && !containsImage(element)) {
      const hasTextChildren = Array.from(element.children).some(child =>
        child instanceof HTMLElement && isTextElement(child)
      );

      if (!hasTextChildren) {
        if (!elementAdded) seenElements.add(element);
        elements.push({
          type: 'text',
          selector: generateSelector(element),
          label: getElementLabel(element, 'text'),
          element: element,
        });
        elementAdded = true;
        console.log('Found text element:', element.tagName, element.textContent?.substring(0, 30));
        return;
      }
    }

    for (const child of Array.from(element.children)) {
      traverse(child, depth + 1);
    }
  }

  console.log('Starting element detection...');
  traverse(doc.body);
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
  };
}

export function applyStylesToElement(element: HTMLElement, styles: Record<string, string>) {
  Object.entries(styles).forEach(([key, value]) => {
    if (value) {
      element.style[key as any] = value;
    }
  });
}
