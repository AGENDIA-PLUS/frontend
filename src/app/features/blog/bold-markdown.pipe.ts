import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Convierte **texto** en <strong>texto</strong> para los párrafos del blog.
 * Seguro usar bypassSecurityTrustHtml aquí porque el contenido es
 * enteramente estático y escrito por nosotros (blog.data.ts) — nunca
 * proviene de un usuario ni de una fuente externa.
 */
@Pipe({ name: 'boldMarkdown', standalone: true })
export class BoldMarkdownPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    const withBold = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return this.sanitizer.bypassSecurityTrustHtml(withBold);
  }
}
