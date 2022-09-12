import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {


  email = new FormControl('', [Validators.required, Validators.email])
  password = new FormControl('', [Validators.required]);

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {

    /* This is a listener that listens for the enter key to be pressed. If the enter key is pressed, and
    the validator() function returns true, the login() function is called. */
    window.addEventListener('keyup', e => {
      if (e.key == 'Enter' && this.validator()) {
        this.login()
      }
    })

  }

  ngOnInit() {
  }



  /**
   * The function takes the user's email and password, and then uses the firebaseSvc to login the user
   */
  login() {

    let user: User = {
      id: '',
      email: this.email.value,
      password: this.password.value,
      emailVerified: null
    }

    this.utilsSvc.presentLoading();

    this.firebaseSvc.Login(user).then(res => {

      user.id = res.user.uid;
      user.emailVerified = res.user.emailVerified;
      this.utilsSvc.dismissLoading();

      this.getUserData(user);

    }, err => {
      let error = this.utilsSvc.getError(err);

      this.utilsSvc.dismissLoading();
      this.utilsSvc.presentToast(error);
    })
  }





  /**
   * It gets the user data from the firebase database and stores it in the local storage
   * @param {User} user - User - this is the user object that is returned from the firebase
   * authentication service.
   */
  getUserData(user: User) {
    this.utilsSvc.presentLoading();

    let ref = this.firebaseSvc.getDataById('users', user.id).valueChanges().subscribe(res => {

      localStorage.setItem('user', JSON.stringify(res))

      if (user.emailVerified) {
        this.utilsSvc.routerLink('/tabs/profile');
      } else {
        this.utilsSvc.routerLink('/email-verification');
      }

      this.resetForm();
      ref.unsubscribe();

      this.utilsSvc.dismissLoading();

    }, err => {
      this.utilsSvc.dismissLoading();
      this.utilsSvc.presentToast(err);
    })
  }



  /**
   * The resetForm() function resets the email and password form controls
   */
  resetForm() {
    this.email.reset();
    this.password.reset();
  }



  /**
   * If the email or password is invalid, return false. Otherwise, return true
   * @returns A boolean value.
   */
  validator() {
    if (this.email.invalid) {
      return false;
    }
    if (this.password.invalid) {
      return false;
    }

    return true;
  }
}
