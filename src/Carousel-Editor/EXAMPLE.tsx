/**
 * EXAMPLE: How to use the Carousel Editor
 *
 * This file shows a complete example of integrating the Carousel Editor
 * into your React application.
 */

import React, { useState } from 'react';
import { CarouselEditorModal, CarouselData } from './index';

function ExampleComponent() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Example carousel data structure
  const exampleData: CarouselData = {
    dados_gerais: {
      nome: "My Brand",
      arroba: "mybrand",
      foto_perfil: "https://example.com/profile.jpg",
      template: "1",
      background_images: [
        "https://example.com/bg1.jpg",
        "https://example.com/bg2.jpg",
        "https://example.com/bg3.jpg",
      ],
    },
    conteudos: [
      {
        title: "First Slide Title",
        subtitle: "First Slide Subtitle",
        text: "Additional text for the first slide",
        imagem_fundo: "https://example.com/slide1-bg.jpg",
        imagem_fundo2: "https://example.com/slide1-bg-alt1.jpg",
        imagem_fundo3: "https://example.com/slide1-bg-alt2.jpg",
      },
      {
        title: "Second Slide Title",
        subtitle: "Second Slide Subtitle",
        text: "Additional text for the second slide",
        imagem_fundo: "https://example.com/slide2-bg.jpg",
        imagem_fundo2: "https://example.com/slide2-bg-alt1.jpg",
        imagem_fundo3: "https://example.com/slide2-bg-alt2.jpg",
      },
      {
        title: "Third Slide Title",
        subtitle: "Third Slide Subtitle",
        text: "Additional text for the third slide",
        imagem_fundo: "https://example.com/slide3-bg.jpg",
        imagem_fundo2: "https://example.com/slide3-bg-alt1.jpg",
        imagem_fundo3: "https://example.com/slide3-bg-alt2.jpg",
      },
    ],
  };

  return (
    <div>
      {/* Button to open the editor */}
      <button
        onClick={() => setIsEditorOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Open Carousel Editor
      </button>

      {/* The Carousel Editor Modal */}
      <CarouselEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        carouselData={exampleData}
      />
    </div>
  );
}

export default ExampleComponent;
