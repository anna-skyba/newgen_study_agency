
import { Routes, UrlSegment } from '@angular/router';
import { AppComponent } from './app.component';

const pageNames = new Set([
  'about',
  'universities',
  'quiz',
  'pricing',
  'reviews',
  'contact'
]);

export const routes: Routes = [
  {
    matcher: (segments: UrlSegment[]) => {
      // Головна сторінка
      if (segments.length === 0) {
        return { consumed: [] };
      }

      // Інші вкладки
      if (
          segments.length === 1 &&
          pageNames.has(segments[0].path)
      ) {
        return { consumed: segments };
      }

      return null;
    },
    component: AppComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
