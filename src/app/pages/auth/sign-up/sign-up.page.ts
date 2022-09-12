import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  fullName = new FormControl('', [Validators.required, Validators.minLength(4)])
  email = new FormControl('', [Validators.required, Validators.email])
  password = new FormControl('', [Validators.required, Validators.minLength(6)]);
  docType = new FormControl('', [Validators.required])
  docNumber = new FormControl('', [Validators.required])
  license = new FormControl('')

  
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {

    /* This is a listener that listens for the enter key to be pressed. If the enter key is pressed, and
    the validator() function returns true, the createUser() function is called. */
    window.addEventListener('keyup', e => {
      if (e.key == 'Enter' && this.validator()) {
        this.createUser()
      }
    })

  }

  ngOnInit() {
  }


  /**
   * It creates a new user in Firebase Authentication and then saves the user's information in the
   * database
   */
  createUser() {

    let user: User = {
      id: '',
      email: this.email.value,
      password: this.password.value,
      fullName: this.fullName.value,
      docType: this.docType.value,
      docNumber: this.docNumber.value,
      license: this.license.value
    }

    this.utilsSvc.presentLoading();

    this.firebaseSvc.createUser(user).then(res => {
      
      user.id = res.user.uid;
      this.saveUserInfo(user);

      this.utilsSvc.dismissLoading();

    }, err => {
      
      let error = this.utilsSvc.getError(err);

      this.utilsSvc.dismissLoading();
      this.utilsSvc.presentToast(error);
    })
  }



  /**
   * The function takes a user object as a parameter, then calls the presentLoading() function from the
   * UtilsService to display a loading spinner, then calls the addToCollectionById() function from the
   * FirebaseService to add the user object to the users collection in the Firestore database, then
   * calls the sendEmailVerification() function from the FirebaseService to send an email verification
   * to the user, then calls the routerLink() function from the UtilsService to navigate to the
   * email-verification page, then calls the dismissLoading() function from the UtilsService to dismiss
   * the loading spinner
   * @param {User} user - User - this is the user object that we created earlier.
   */
  saveUserInfo(user: User){
    this.utilsSvc.presentLoading();
    this.firebaseSvc.addToCollectionById('users', user).then(res =>{
      localStorage.setItem('user', JSON.stringify(user));
      this.firebaseSvc.sendEmailVerification();
      this.utilsSvc.routerLink('/email-verification');
      this.utilsSvc.dismissLoading();
    }, err =>{
      this.utilsSvc.dismissLoading();
    })
  }

  /**
   * The resetForm() function resets form controls
   */
  resetForm() {
    this.email.reset();
    this.password.reset();
    this.fullName.reset();
    this.docType.reset();
    this.docNumber.reset();
    this.license.reset();
  }



  /**
   * If the form field are invalid, return false. Otherwise, return true
   * @returns A boolean value.
   */
  validator() {
    if (this.email.invalid) {
      return false;
    }
    if (this.password.invalid) {
      return false;
    }
    if (this.fullName.invalid) {
      return false;
    }
    if (this.docType.invalid) {
      return false;
    }
    if (this.docNumber.invalid) {
      return false;
    }

    return true;
  }
}

