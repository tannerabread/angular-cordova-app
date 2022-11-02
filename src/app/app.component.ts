import { Component } from '@angular/core';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { Globals } from './globals';

// import awsconfig from '../aws-exports';
// Amplify.configure(awsconfig);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [Globals],
})
export class AppComponent {
  title = 'angularApp';
  // user = {};
  user = { username: '' };

  constructor() {
    console.log('AppComponent constructor');
    this.hubListen();
    this.getCurrentUser();
  }

  private setUser = (user: any) => {
    console.log('setUser', JSON.stringify(user));
    this.user = user;
    console.log('this.user', this.user.username);
    this.detectChange();
  };

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

  getCurrentUser() {
    console.log('getCurrentUser');
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log('user', user);
        this.setUser(user);
      })
      .catch((err) => console.log('err', err));
  }

  detectChange() {
    console.log('detectChange');
    const currentValue = document.getElementById('userDiv')!.innerText;
    if (currentValue !== this.user.username) {
      console.log('change detected');
      document.getElementById('userDiv')!.innerText = `user: ${this.user.username}`;
    }
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
        console.log('user', user);
        this.setUser(user);
      })
      .catch((err) => console.log('err', err));
  }

  signOut() {
    console.log('signOut');
    Auth.signOut();
    this.setUser({ username: '' });
  }
}
