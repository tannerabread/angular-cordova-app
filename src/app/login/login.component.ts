import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  signIn() {
    console.log('signIn');
    Auth.signIn('bannonta@amazon.com', 'password2')
    .then((user) => console.log('user', user))
    .catch((err) => console.log('err', err));
  }

  goFederated() {
    console.log('goFederated');
    Auth.federatedSignIn();
  }

}
