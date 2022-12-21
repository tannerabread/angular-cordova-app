# Angular - Cordova - Amplify - Android

This is a sample repo used to find a solution for the below issue. There are instructions after the overview and analysis for setting up this repo with `cordova-plugin-customurlscheme` that can be modified to adapt to `cordova-plugin-inappbrowser` with a small amount of configuration. Currently, I have not left instructions on how to do the latter but the main command line steps would still be relevant.

[Related issue](https://github.com/aws-amplify/amplify-js/issues/10301)

# Overview

There are 2 main paths tried throughout this process, both involving a cordova plugin which seem to have limitations/compatibility issues with the amplify library. The first one is through a Custom URL Scheme and using the private method `_handleAuthResponse`. The second is through an inappbrowser and the successful construction of a `urlOpener` that can be passed to `Amplify.configure`

## Custom URL Scheme
The first attempt was using `cordova-plugin-customurlscheme` which has a detailed reproduction setup below. This method uses the private amplify method `_handleAuthResponse` to try to manually start the auth flow when the customurlscheme returns the URL with the code/state.

The implementation is fairly simple and along with the `_handleAuthResponse` method also relies on the supplied `handleOpenURL` method supplied by the plugin in `main.ts`:
```js
(<any>window).handleOpenURL = function(redirectUrl: any) {
  const params = new URL(redirectUrl).searchParams;

  if (params.has('code') && params.has('state')) {
    console.log("handled auth response");
    (Auth as any)._handleAuthResponse(redirectUrl);
  }
};
```
Additionally, in `app.component.ts` the Hub listener needs to be called in the constructor as an async function:
```js
export class AppComponent {
  // ...
  constructor() {
    this.hubListen();
    // ...
  }

  // ...

  private hubListen = async () => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      console.log('Hub auth event: ', event);
      console.log('Hub auth data: ', data);
      switch (event) {
        case 'parsingCallbackUrl':
          console.log('parsingCallbackUrl', JSON.stringify(data));
          break;
        case 'signIn':
          console.log('signIn event, data:', data);
          this.setUser(data);
          break;
        case 'signIn_failure':
          console.log('SIGN IN FAILURE');
          break;
        case 'signOut':
          console.log('logged out');
          break;
        case 'customOAuthState':
          this.setUser(data);
          break;
        case 'codeFlow':
          console.log('codeFlow', data);
          this.getCurrentUser();
          break;
        default:
          console.log('default event', event);
          break;
      }
    });
  };

  // ...
}
```
Calling `Auth.currentAuthenticatedUser()` from within this async Hub listener seemed to solve the problem and correctly log in the user, but the auth events are not fired as they should be. 

Through debugging this method, the problem looks to be coming in during the method `_handleAuthResponse` when the library tries to replace the window history state [here](https://github.com/aws-amplify/amplify-js/blob/fb85783a034a95b167fa15b305369f3224b05300/packages/auth/src/Auth.ts#L2503). Therefore, the redirect to the desired `redirectSignIn` never happens, noted in [this comment](https://github.com/aws-amplify/amplify-js/issues/10301#issuecomment-1305674316). 

The last event that is shown from the Hub 'auth' listener is `codeFlow`, before the library throws [this error](https://github.com/aws-amplify/amplify-js/blob/fb85783a034a95b167fa15b305369f3224b05300/packages/auth/src/Auth.ts#L2535) from failing the replace on the history state above. This error bypasses the calls to the `signIn` and `cognitoHostedUI` 'auth' Hub listener events. It then fails to replace the window history state again in the catch block [here](https://github.com/aws-amplify/amplify-js/blob/fb85783a034a95b167fa15b305369f3224b05300/packages/auth/src/Auth.ts#L2539), so does not call the `signIn_failure`, `cognitoHostedUI_failure`, or `customState_failure` events in the 'auth' Hub listener.

This method of handling federated signIn in a cordova app is not advised because it uses the private method `_handleAuthResponse`. Additionally, the presence of a custom URL breaks the window state replacement and in turn also the auth flow for the amplify library.

## In App Browser
After some discussions internally through the Amplify team, a custom `urlOpener` utilizing an `inAppBrowser` that could be passed to the `Amplify.configure` method emerged as the preferred route to solving this issue. This is similar to the solution we already use for React Native (both CLI and Expo flavors), as seen [here](https://docs.amplify.aws/lib/auth/social/q/platform/react-native/#full-samples:~:text=app%20browser%20available.-,Sample,-1).

Current implementations have led to failure as cordova doesn't have the `Linking` method like React Native does and we can't return `Linking.openUrl` from the `urlOpener`. The `cordova-plugin-inappbrowser` makes it easy enough to do the browser portion of the login flow with an implementation like the following:
```js
async function urlOpener(url: string, redirectUrl: string) {
  const ref = (window as any).cordova.InAppBrowser.open(
    url,
    '_blank',
    'location=yes'
  );

  let newUrl = '';
  const mycallback = async function (event: any) {
    newUrl = event.url;
    // Only resolve promise if URL contains 'code' and 'state'
    // but not 'redirect_uri'
    if (
      newUrl.includes('code') &&
      newUrl.includes('state') &&
      !newUrl.includes('redirect_uri')
    ) {
      console.log('success');
      // close the inappbrowser 'ref' then return the url to be
      // used in Amplify.configure
      ref.close();
      return Promise.resolve(newUrl);
    } else {
      console.log('error');
      return Promise.reject('error');
    }
  };
  ref.addEventListener('loadstop', mycallback);
}
```
The problem with the above is that if the `ref.close()` method is called before the Promise is resolved, it does not seem to return the promise. If those two lines are swapped, then `ref.close()` will never be reached and the app will remain in a state with the inappbrowser open.

### Considerations for urlOpener
The default `urlOpener` returns a Promise that resolves to a `windowProxy` as [seen here](https://github.com/aws-amplify/amplify-js/blob/e1b0b5be3e8ccb3c76e8e2e2f43f910d40d73254/packages/auth/src/OAuth/urlOpener.ts). I haven't been able to successfully return the same type as a windowProxy to get this to work and from all investigations it seems the urlOpener only wants a [Promise\<any>](https://github.com/aws-amplify/amplify-js/blob/e1b0b5be3e8ccb3c76e8e2e2f43f910d40d73254/packages/auth/src/types/Auth.ts#L130) returned.

## Final thoughts
It seems the key to solving this problem would be to use the `urlOpener` method and return something like the `windowProxy` resolved promise and at the same time close the inappbrowser.

# Set up for this repo using `cordova-plugin-customurlscheme`
## Create a directory for the full project
The directory should be home to the angular app (this repo) and the cordova app that we will build from the angular app.
```bash
mkdir projectFolder
cd projectFolder
```


## Set up Cordova and Plugin
To [get started](https://cordova.apache.org/#getstarted) with cordova on your machine, run the following
```bash
npm install -g cordova
cordova create cordovaApp
cd cordovaApp
cordova platform add android
cordova plugin add cordova-plugin-customurlscheme --variable URL_SCHEME=commissioning
```
The above commands set up the basic project directory you need to build your angular app into a cordova app


## Clone and prepare the Angular App
Return to the root of the project and clone the repo, navigate to the angular app, and install the dependencies
```bash
cd ..
git clone https://github.com/tannerabread/angular-cordova-app.git
cd angular-cordova-app
npm install
```


## Set up Amplify
Follow the [setup guide](https://docs.amplify.aws/start/getting-started/setup/q/integration/angular/#create-a-new-amplify-backend) for initializing Amplify in an Angular project and the [OAuth setup](https://docs.amplify.aws/lib/auth/social/q/platform/js/) for Google

Make the following modifications to the auth configuration in the CLI:
```bash
Enter your redirect signin URI:
`commissioning://authenticated-page/`
Enter your redirect signout URI:
`commissioning://`
```

Push your changes to amplify
```bash
amplify push
```


## Build the Angular App to Cordova
Build the Angular App into the Cordova project
```bash
ng build --base-href . --output-path ../cordovaApp/www/
```
Inside the `<body>` tag in `/cordovaApp/www/index.html`, add the following script
```html
<script type="text/javascript" src="cordova.js"></script>
```
Inside of `/cordovaApp/config.xml` add the following inside of the `<widget>` tag
```xml
<allow-intent href="commissioning://*" />
<platform name="android">
  <preference name="AndroidLaunchMode" value="singleTask" />
</platform>
```
Build the cordova app with plugins:
```bash
cordova prepare
```


## Run the app on an Android Emulator
Start an Android Emulator 

This is easiest inside Android Studio for logcat filtering

Run the app on the emulator by entering the following in the root of `cordovaApp`
```bash
cordova run android
```
Start the logcat tab and filter results by `io.cordova.hellocordova`

## Witness Results
Watch the logcat logs while trying the different functions of the app

Currently, the only way federatedSignIn will set the user is if the `Check Status` button is pressed after redirecting to the app


### Logs/Flow (Federated)
#### Startup
Startup logs with debugger on
```bash
[INFO:CONSOLE(1)] "main.ts", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.940 Amplify - amplify config [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.941 AuthClass - configure Auth", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.941 Parser - parse config [object Object],to amplifyconfig,[object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.942 Hub - Dispatching to auth with  [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.943 Hub - Dispatching to auth with  [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "AppComponent constructor", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "getCurrentUser", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.954 AuthClass - getting current authenticated user", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.970 AuthClass - get current authenticated userpool user", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.974 AuthClass - Failed to get user from user pool", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 10:41.975 AuthClass - The user is not authenticated by the error No current user", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "err The user is not authenticated", source: https://localhost/main.a4c36dc0014de841.js (1)
```


Login link clicked, Federated button pressed, Continue with Google pressed
```bash
[INFO:CONSOLE(1)] "redirected url commissioning://authenticated-page/?code=56b7af76-e1ed-4a6d-aad4-61fd0f094afc&state=4I48gm5wMfOzMODncIrwrR9aiGapsj4n", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "handled auth response", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.961 Hub - Dispatching to auth with  [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.961 Hub - Dispatching to auth with  [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "Hub auth event:  parsingCallbackUrl", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "Hub auth data:  [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "parsingCallbackUrl {"url":"commissioning://authenticated-page/?code=56b7af76-e1ed-4a6d-aad4-61fd0f094afc&state=4I48gm5wMfOzMODncIrwrR9aiGapsj4n"}", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.963 OAuth - Starting code flow with commissioning://authenticated-page/?code=56b7af76-e1ed-4a6d-aad4-61fd0f094afc&state=4I48gm5wMfOzMODncIrwrR9aiGapsj4n", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.963 Hub - Dispatching to auth with  [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.964 Hub - Dispatching to auth with  [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "Hub auth event:  codeFlow", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "Hub auth data:  [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "codeFlow [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "getCurrentUser", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.964 AuthClass - getting current authenticated user", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.964 OAuth - Calling token endpoint: https://newangularappb3668fa8-b3668fa8-dev.auth.us-east-1.amazoncognito.com/oauth2/token with [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.965 AuthClass - get current authenticated userpool user", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:15.965 AuthClass - OAuth signIn in progress, waiting for resolution...", source: https://localhost/main.a4c36dc0014de841.js (1)
Unable to open '/data/app/~~XavysfJqmog16aS461oNcA==/io.cordova.hellocordova-L71veqwwjZVtRsYnzX8c4g==/base.dm': No such file or directory
GoogleInputMethodService.onStartInput():1903 onStartInput(EditorInfo{inputType=0x0(NULL) imeOptions=0x12000000 privateImeOptions=null actionName=UNSPECIFIED actionLabel=null actionId=0 initialSelStart=-1 initialSelEnd=-1 initialCapsMode=0x0 hintText=null label=null packageName=io.cordova.hellocordova fieldId=100 fieldName=null extras=null}, false)
[INFO:CONSOLE(1)] "[DEBUG] 13:16.436 Credentials - set credentials from session", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:16.931 Credentials - Load credentials successfully [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:16.932 AuthClass - AWS credentials [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "[DEBUG] 13:16.933 AuthClass - Error in cognito hosted auth response [object DOMException]", source: https://localhost/main.a4c36dc0014de841.js (1)
```
"Fails" with last line about cognito hosted auth response


Wait a couple of seconds and the following shows up
```bash
[INFO:CONSOLE(1)] "[DEBUG] 13:25.971 AuthClass - OAuth signIn in progress timeout", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "user [object Object]", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "setUser {"username":"google_116877351873073868879","pool":{"userPoolId":"us-east-1_f1spVqN2X","clientId":"<client_id>","client":{"endpoint":"https://cognito-idp.us-east-1.amazonaws.com/","fetchOptions":{}},"advancedSecurityDataCollectionFlag":true,"storage":{"amplify-redirected-from-hosted-ui":"true","CognitoIdentityServiceProvider.4m1oj9493jh31d7booat6tdjb3.LastAuthUser":"google_116877351873073868879","CognitoIdentityServiceProvider.4m1oj9493jh31d7booat6tdjb3.google_116877351873073868879.refreshToken":"<long_refresh_token>"
2022-11-01 20:13:26.345 26267-26267 chromium                io.cordova.hellocordova              I  
[INFO:CONSOLE(1)] "this.user google_116877351873073868879", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "detectChange", source: https://localhost/main.a4c36dc0014de841.js (1)
[INFO:CONSOLE(1)] "change detected", source: https://localhost/main.a4c36dc0014de841.js (1)
```