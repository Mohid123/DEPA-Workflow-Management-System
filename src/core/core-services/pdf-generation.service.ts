import { Injectable } from '@angular/core';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  async generatePdf(formData: any, pdfImg: any, width: any): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    page.setWidth(width);
  
    const { height } = page.getSize();
    const fontSize = 16;
    const textPadding = 50;
  
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let pngImage = await pdfDoc.embedPng(pdfImg);
    const pngDims = pngImage.scale(0.4);
  
    const drawText = (page, text: string, y: number) => {
      page.drawText(text, {
        x: textPadding,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    };
  
    const addNewPageIfNeeded = (page, requiredSpace) => {
      const remainingSpace = height - requiredSpace;
      if (remainingSpace < 0) {
        const newPage = pdfDoc.addPage();
        newPage.setWidth(width);
        return newPage;
      }
      return page;
    };
  
    let currentY = height - textPadding;
    for (const [key, value] of Object.entries(formData)) {
      drawText(page, `${key}: ${value}`, currentY);
      currentY -= 2 * fontSize;
    }

    // Calculate the remaining space for the image
    const remainingSpaceForImage = currentY - pngDims.height - 50;

    if (remainingSpaceForImage < 0) {
      // Add a new page if there is not enough space for the image
      page = pdfDoc.addPage();
      page.setWidth(width);
      currentY = height - textPadding;

      pngImage = await pdfDoc.embedPng(pdfImg);
    } else {
      currentY = remainingSpaceForImage;
    }

    page.drawImage(pngImage, {
      x: page.getWidth() / 2 - pngDims.width / 2,
      y: page.getHeight() / 2 - pngDims.height + 310,
      width: pngDims.width,
      height: pngDims.height,
    });

    page = addNewPageIfNeeded(page, currentY - pngDims.height - 50);
  
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
  
}
