import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.Logger.LOG_LEVEL = 'DEBUG';

console.log("main.ts");
(<any>window).handleOpenURL = function(redirectUrl: any) {
  console.log('redirected url', redirectUrl);

  const params = new URL(redirectUrl).searchParams;

  if (params.has('code') && params.has('state')) {
    // const url = `https://app/authenticated-page/?code=${params.get('code')}&state=${params.get('state')}`;

    // document.location.href = url;

    console.log("handled auth response");
    (Auth as any)._handleAuthResponse(redirectUrl);
  }
};
Auth.configure(awsconfig);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
