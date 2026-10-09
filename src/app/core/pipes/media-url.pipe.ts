import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Resolves an uploaded-media URL (as returned by the backend, e.g. "/uploads/images/x.jpg")
 * into one the browser can actually load.
 *
 * The backend always returns relative paths. In production, nginx serves the app and
 * /uploads from the same origin, so relative paths just work. In local dev, the Angular
 * dev server (4200) and Spring Boot (8080) are different origins, so relative paths need
 * the backend's origin prefixed -- otherwise the browser requests the image from the
 * frontend dev server, which doesn't have it, and the <img>/<video> renders blank.
 *
 * Absolute URLs (http://, https://, data:, blob:) are passed through unchanged.
 */
@Pipe({
  name: 'mediaUrl',
  standalone: true
})
export class MediaUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    if (!url) return '';
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    return `${environment.mediaBaseUrl}${url}`;
  }
}
