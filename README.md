# Angular - Cordova - Amplify - Android

This is a sample app that displays how to use the Amplify Auth library with a federated login in a Cordova app built from an Angular project. It uses 'cordova-plugin-customurlscheme' to navigate from the browser back to the app and send the code/state.


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