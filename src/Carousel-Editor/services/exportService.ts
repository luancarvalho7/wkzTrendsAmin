import { EditorSlide, CarouselData } from '../types/carousel';
import { placeholderService } from './placeholderService';

export class ExportService {
  async exportAsHTML(slides: EditorSlide[], carouselData: CarouselData): Promise<void> {
    const zip = await this.createZipFile(slides, carouselData);
    this.downloadFile(zip, 'carousel-slides.zip', 'application/zip');
  }

  async exportIndividualSlide(
    slide: EditorSlide,
    carouselData: CarouselData,
    index: number
  ): Promise<void> {
    const html = this.generateFinalHTML(slide, carouselData);
    const blob = new Blob([html], { type: 'text/html' });
    this.downloadFile(blob, `slide-${index + 1}.html`, 'text/html');
  }

  private generateFinalHTML(slide: EditorSlide, carouselData: CarouselData): string {
    return placeholderService.replacePlaceholders(
      slide.htmlTemplate,
      carouselData,
      slide.content,
      slide.styles,
      slide.transforms,
      slide.selectedBackgroundIndex
    );
  }

  private async createZipFile(slides: EditorSlide[], carouselData: CarouselData): Promise<Blob> {
    const files: { name: string; content: string }[] = [];

    slides.forEach((slide, index) => {
      const html = this.generateFinalHTML(slide, carouselData);
      files.push({
        name: `slide-${index + 1}.html`,
        content: html,
      });
    });

    const zipContent = await this.createBasicZip(files);
    return new Blob([zipContent], { type: 'application/zip' });
  }

  private async createBasicZip(files: { name: string; content: string }[]): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];

    for (const file of files) {
      const content = encoder.encode(file.content);
      const filename = encoder.encode(file.name);

      const header = new Uint8Array(30 + filename.length);
      const dataView = new DataView(header.buffer);

      dataView.setUint32(0, 0x04034b50, true);
      dataView.setUint16(4, 20, true);
      dataView.setUint16(6, 0, true);
      dataView.setUint16(8, 0, true);
      dataView.setUint16(10, 0, true);
      dataView.setUint16(12, 0, true);
      dataView.setUint32(14, 0, true);
      dataView.setUint32(18, content.length, true);
      dataView.setUint32(22, content.length, true);
      dataView.setUint16(26, filename.length, true);
      dataView.setUint16(28, 0, true);

      header.set(filename, 30);

      chunks.push(header);
      chunks.push(content);
    }

    const centralDirOffset = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const centralDirChunks: Uint8Array[] = [];
    let fileOffset = 0;

    for (const file of files) {
      const content = encoder.encode(file.content);
      const filename = encoder.encode(file.name);

      const centralHeader = new Uint8Array(46 + filename.length);
      const dataView = new DataView(centralHeader.buffer);

      dataView.setUint32(0, 0x02014b50, true);
      dataView.setUint16(4, 20, true);
      dataView.setUint16(6, 20, true);
      dataView.setUint16(8, 0, true);
      dataView.setUint16(10, 0, true);
      dataView.setUint16(12, 0, true);
      dataView.setUint16(14, 0, true);
      dataView.setUint32(16, 0, true);
      dataView.setUint32(20, content.length, true);
      dataView.setUint32(24, content.length, true);
      dataView.setUint16(28, filename.length, true);
      dataView.setUint16(30, 0, true);
      dataView.setUint16(32, 0, true);
      dataView.setUint16(34, 0, true);
      dataView.setUint16(36, 0, true);
      dataView.setUint32(38, 0, true);
      dataView.setUint32(42, fileOffset, true);

      centralHeader.set(filename, 46);

      centralDirChunks.push(centralHeader);
      fileOffset += 30 + filename.length + content.length;
    }

    const centralDirSize = centralDirChunks.reduce((sum, chunk) => sum + chunk.length, 0);

    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);

    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(4, 0, true);
    endView.setUint16(6, 0, true);
    endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true);
    endView.setUint32(12, centralDirSize, true);
    endView.setUint32(16, centralDirOffset, true);
    endView.setUint16(20, 0, true);

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0) +
                       centralDirChunks.reduce((sum, chunk) => sum + chunk.length, 0) +
                       endRecord.length;

    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of [...chunks, ...centralDirChunks, endRecord]) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  private downloadFile(blob: Blob, filename: string, mimeType: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
