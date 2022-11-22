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

  loading: boolean;

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

    this.loading = true;

    this.firebaseSvc.Login(user).then(res => {

      user.id = res.user.uid;
      user.emailVerified = res.user.emailVerified;
      this.utilsSvc.saveLocalStorage('user', user);
      this.loading = false;


      if (!user.emailVerified) {
        this.utilsSvc.routerLink('/email-verification');
        this.firebaseSvc.sendEmailVerification();
      } else {
        this.getUserData(user);
      }




    }, err => {

      this.loading = false;
      let error = this.utilsSvc.getError(err);

      if (error !== 'El correo electrónico que ingresaste ya está registrado') {
        this.utilsSvc.presentToast(error);
      }

    })
  }





  /**
   * It gets the user data from the firebase database and stores it in the local storage
   * @param {User} user - User - this is the user object that is returned from the firebase
   * authentication service.
   */
  getUserData(user: User) {
    this.loading = true;
    let currentDevice = this.utilsSvc.getFromLocalStorage('currentDevice');

    let ref = this.firebaseSvc.getDataById('users', user.id).valueChanges().subscribe((res: any) => {

      this.loading = false;

      res.emailVerified = user.emailVerified;
      let deviceExist = res.devices.filter(device => device.uuid == currentDevice.uuid).length;


      //Valida si el dispositivo actual existe en los dispositivos del usuario
      if (deviceExist) {
        this.utilsSvc.saveLocalStorage('user', res);
        this.getLicense(res);

      } else {
        //Si el usuario tiene menos de 3 dispositivos, se añade uno nuevo. Si tiene 3, no le permite iniciar.
        if (res.devices.length == 3) {
          this.utilsSvc.presentToast('No se pudo iniciar. Tienes 3 dispositivos vinculados a esta cuenta, elimina alguno para iniciar en este.')
        } else {
          res.devices.push(currentDevice);
          this.updateDevices(res);
        }

      }




      ref.unsubscribe();

    }, err => {
      this.loading = false;
      this.utilsSvc.presentToast(err);
    })
  }


  getLicense(user: User) {
    this.loading = true;

    let ref = this.firebaseSvc.getCollectionConditional('licenses',
      ref => ref.where('userId', '==', user.id)).subscribe(data => {

        
        
        this.loading = false;

        let license = data.map(e => {
          return {
            id: e.payload.doc.id,
            userId: e.payload.doc.data()['userId'],
            dateInit: e.payload.doc.data()['dateInit'],
            dateEnd: e.payload.doc.data()['dateEnd'],
            months: e.payload.doc.data()['months']
          };
        })[0];

    
        
        if (license) {
          user.license = license;
          this.utilsSvc.saveLocalStorage('user', user);
        }else{
          user.license = null;
          this.utilsSvc.saveLocalStorage('user', user);
        }
        
        ref.unsubscribe();

        this.utilsSvc.routerLink('/tabs/profile');
        this.resetForm();
      })
  }


  updateDevices(user: User) {

    let data = {
      id: this.utilsSvc.getCurrentUser().id,
      devices: user.devices
    }
    
    this.loading = true;

    this.firebaseSvc.UpdateCollection('users', data)
      .then(res => {

        this.loading = false;
        this.utilsSvc.saveLocalStorage('user', user);
        this.getLicense(user);

      }, err => {
        this.loading = false;
        console.log(err);

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
