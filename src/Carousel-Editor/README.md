# Carousel Editor

A complete, standalone carousel editor component for creating and editing Instagram carousel posts.

## Features

- 🎨 Visual editor with interactive canvas
- 🖼️ Multiple templates support
- ✏️ Inline text editing
- 🎯 Element selection and styling
- 📱 Responsive design
- 💾 Export to HTML
- 🔄 Undo/Redo functionality
- 🖱️ Drag and transform elements

## Installation

Copy the entire `Carousel-Editor` folder to your project's `src` directory.

## Dependencies

Make sure you have these dependencies installed:

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "lucide-react": "^0.344.0",
  "framer-motion": "^11.0.3"
}
```

## Usage

### Basic Example

```tsx
import { CarouselEditorModal } from './Carousel-Editor';
import type { CarouselData } from './Carousel-Editor';

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const carouselData: CarouselData = {
    dados_gerais: {
      background_images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ],
    },
    conteudos: [
      {
        title: 'Slide 1 Title',
        subtitle: 'Slide 1 Subtitle',
        text: 'Slide 1 content',
      },
      {
        title: 'Slide 2 Title',
        subtitle: 'Slide 2 Subtitle',
        text: 'Slide 2 content',
      },
    ],
  };

  return (
    <>
      <button onClick={() => setIsEditorOpen(true)}>
        Open Editor
      </button>

      <CarouselEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        carouselData={carouselData}
      />
    </>
  );
}
```

## Data Structure

### CarouselData

```typescript
interface CarouselData {
  dados_gerais: {
    background_images: string[];
  };
  conteudos: Array<{
    title: string;
    subtitle?: string;
    text?: string;
  }>;
}
```

## Templates

Templates are stored in the `templates` folder. Each template is an HTML file with special placeholders:

- `{{title}}` - Main title
- `{{subtitle}}` - Subtitle
- `{{text}}` - Body text
- `{{background_image}}` - Background image URL
- `data-editable="type"` - Marks editable elements

### Adding Custom Templates

1. Create an HTML file in the `templates` folder
2. Use the placeholders for dynamic content
3. Mark editable elements with `data-editable` attribute
4. Update the template service to load your new template

## Customization

### Styling

The editor uses Tailwind CSS classes. You can customize:

- Colors in component files
- Layout in `CarouselEditorModal.tsx`
- Canvas appearance in `InteractiveCanvas.tsx`

### Templates

Templates can be completely customized. They are standard HTML files with placeholders that get replaced with actual content.

## File Structure

```
Carousel-Editor/
├── components/
│   ├── BackgroundSelector.tsx
│   ├── CarouselEditorModal.tsx
│   ├── ContentEditor.tsx
│   ├── EditorToolbar.tsx
│   ├── ElementStyleEditor.tsx
│   ├── InteractiveCanvas.tsx
│   ├── ItemPropertiesPanel.tsx
│   ├── SlideCanvas.tsx
│   ├── SlideNavigator.tsx
│   ├── StylePanel.tsx
│   └── TemplateSelector.tsx
├── services/
│   ├── exportService.ts
│   ├── placeholderService.ts
│   └── templateService.ts
├── types/
│   └── carousel.ts
├── utils/
│   └── elementDetector.ts
├── templates/
│   └── (HTML template files)
├── index.ts
└── README.md
```

## API Reference

### CarouselEditorModal Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when editor is closed |
| `carouselData` | `CarouselData` | Yes | Initial data for the carousel |

## Services

### templateService

```typescript
// Fetch a template by ID
await templateService.fetchTemplate('template1');
```

### placeholderService

```typescript
// Replace placeholders in HTML
placeholderService.replacePlaceholders(
  htmlTemplate,
  carouselData,
  slideContent,
  styles,
  transforms,
  backgroundIndex
);
```

### exportService

```typescript
// Export slides as HTML files
await exportService.exportAsHTML(slides, carouselData);

// Export individual slide
await exportService.exportIndividualSlide(slide, index, carouselData);
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This component is part of your project and follows your project's license.

## Support

For issues or questions, refer to your project's main repository.
