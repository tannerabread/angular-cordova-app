# Angular - Cordova - Amplify - Android

This is a sample app that displays how to use the Amplify Auth library with a federated login in a Cordova app built from an Angular project. It uses 'cordova-plugin-customurlscheme' to navigate from the browser back to the app and send the code/state.

[Related issue](https://github.com/aws-amplify/amplify-js/issues/10301)


# Build steps
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