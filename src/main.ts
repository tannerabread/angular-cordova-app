import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

import { Auth } from 'aws-amplify';
import awsconfig from './aws-exports';

console.log("main.ts");
(<any>window).handleOpenURL = function(redirectUrl: any) {
  console.log('redirected url', redirectUrl);

  const params = new URL(redirectUrl).searchParams;

  if (params.has('code') && params.has('state')) {
    const url = `https://app/building?code=${params.get('code')}&state=${params.get('state')}`;

    // document.location.href = url;

    (Auth as any)._handleAuthResponse(url);
  }
};
Auth.configure(awsconfig);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
