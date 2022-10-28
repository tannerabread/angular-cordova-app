import { Component } from '@angular/core';
import { Auth, Hub } from 'aws-amplify';
import { Globals } from './globals';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ Globals ]
})
export class AppComponent {
  title = 'angularApp';
  // user = {};
  user = {username: ''};

  constructor() {
    console.log('AppComponent constructor');
    this.hubListen();
  }

  private setUser = (user: any) => {
    console.log('setUser', user);
    this.user = user;
    console.log('this.user', this.user.username);
  }

  private hubListen = () => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      console.log('Hub auth: ', { event, data });
      switch (event) {
        case "parsingCallbackUrl":
          console.log('parsingCallbackUrl', data);
          this.setUser(data);
          break;
        case 'signIn':
          console.log("signIn event, data:", data);
          this.setUser(data);
          break;
        case 'signOut':
          console.log('logged out');
          break;
        case 'customOAuthState':
          this.setUser(data);
          break;
        case 'codeFlow':
          console.log('codeFlow', data);
          this.setUser(data);
          break;
        default:
          console.log("default event", event);
          break;
      }
    });

    Auth.currentAuthenticatedUser()
      .then(currentUser => this.setUser(currentUser))
      .catch(() => console.log('Not signed in'));
  }

  goFederated() {
    console.log('goFederated');
    Auth.federatedSignIn()
    .then((user) => console.log('user', user))
    .catch((err) => console.log('err', err));
  }

  checkStatus() {
    console.log('checkStatus');
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log('user', user)
        this.setUser(user);
      })
      .catch((err) => console.log('err', err));
  }

  signOut() {
    console.log('signOut');
    Auth.signOut()
    this.setUser({username: ''});
  }
}
