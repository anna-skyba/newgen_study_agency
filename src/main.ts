import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { RootComponent } from './app/root.component';
import { routes } from './app/app.routes';

bootstrapApplication(RootComponent, {
  providers: [
    provideRouter(routes)
  ]
}).catch(error => {
  console.error('Angular application error:', error);
});
