const MINIO_BASE_URL = 'https://minio.workez.online/carousel-templates';
const TOTAL_SLIDES = 10;

export class TemplateService {
  private cache: Map<string, string[]> = new Map();

  async fetchTemplate(templateId: string): Promise<string[]> {
    if (this.cache.has(templateId)) {
      return this.cache.get(templateId)!;
    }

    const slides: string[] = [];
    const errors: string[] = [];

    for (let i = 1; i <= TOTAL_SLIDES; i++) {
      const url = `${MINIO_BASE_URL}/template${templateId}/Slide ${i}.html`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch slide ${i}: ${response.statusText}`);
        }

        const html = await response.text();
        slides.push(html);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Slide ${i}: ${errorMsg}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Failed to load some slides:\n${errors.join('\n')}`);
    }

    this.cache.set(templateId, slides);
    return slides;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCachedTemplate(templateId: string): string[] | null {
    return this.cache.get(templateId) || null;
  }
}

export const templateService = new TemplateService();
