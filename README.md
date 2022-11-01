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

![image](https://user-images.githubusercontent.com/30082936/199230731-df417934-a24e-4254-81a3-7616929391a1.png)

Startup screen

![image](https://user-images.githubusercontent.com/30082936/199231898-7d6433b6-8dde-47f1-9d1f-e553db4f7b8d.png)



#### Federated Login Flow
Login linked clicked (navigates to login page)

![image](https://user-images.githubusercontent.com/30082936/199232258-305c6d10-c5f6-4410-8d2e-9e0a4b8eeefc.png)

Federated button pressed

![image](https://user-images.githubusercontent.com/30082936/199232310-258c0918-7d59-400b-870f-e1e70f1761f3.png)

logged in through google (redirected back to app but user not filled out)

![image](https://user-images.githubusercontent.com/30082936/199232370-b41cd122-a802-4176-a4da-0393aa728789.png)

Note: error in cognito hosted auth response

![image](https://user-images.githubusercontent.com/30082936/199231093-ef631cd5-a970-467c-87f8-08c9b5eecd4a.png)



#### Check Status Button
Check Status button pressed (calls set user function, user displayed on screen)

![image](https://user-images.githubusercontent.com/30082936/199233013-b649e444-5997-4244-9d41-4413caa7aa83.png)

Note: even with the previous error, the user/login is properly captured by Amplify

![image](https://user-images.githubusercontent.com/30082936/199231189-ddd47754-4314-4989-80bd-84325f88b89d.png)
