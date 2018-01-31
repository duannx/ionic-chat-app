import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ChatControllerProvider } from '../../providers/chat-controller/chat-controller';
import { Keyboard } from '@ionic-native/keyboard';

@IonicPage()
@Component({
  selector: 'page-fs-login',
  templateUrl: 'fs-login.html',
})
export class FsLoginPage {


  // Nhan vien chay ban
  account = "chayban1@gmail.com";
  password = "123456";

  //Nhan vien bep bar
  // account = "duandz@gmail.com";
  // password = "123456";

  loginForm: FormGroup;
  isSubmitted = false;
  accountErrorMessage = "";
  passwordErrorMessage = "";

  constructor(
    private mPlatform: Platform,
    private mKeyboard: Keyboard,
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private chatController: ChatControllerProvider,
    private loadingCtrl: LoadingController
  ) {
    this.loginForm = this.formBuilder.group({
      account: ["", Validators.compose([Validators.maxLength(100), Validators.minLength(6), Validators.required])],
      password: ["", Validators.compose([Validators.minLength(6), Validators.required])]
    });
    if (this.chatController.getFirebaseCurrentUser()) {
      console.log("current user", this.chatController.getFirebaseCurrentUser());
      this.navCtrl.setRoot("ConversationsPage");
      this.chatController.getUserById(this.chatController.getFirebaseCurrentUser().uid).then(user => {
        this.chatController.user = user;
      })
    }
  }

  login() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      let loading = this.loadingCtrl.create({
        content: "Đang đăng nhập",
        dismissOnPageChange: true
      })
      loading.present();
      this.chatController.loginWithEmailAndPassword(this.account.toLowerCase().trim(), this.password.trim()).then(uid => {
        this.chatController.getUserById(uid).then(user => {
          this.chatController.user = user;
          loading.dismiss();
          this.navCtrl.setRoot("ConversationsPage");
        })
      })
    } else {
      this.checkForm();
    }
  }

  checkForm() {
    let accountError = this.loginForm.controls.account.errors;
    if (accountError) {
      if (accountError.hasOwnProperty('required')) {
        this.accountErrorMessage = "Vui lòng điền tài khoản";
      } else {
        this.accountErrorMessage = "Tài khoản không hợp lệ";
      }
    }
    let passwordError = this.loginForm.controls.password.errors;
    if (passwordError) {
      if (passwordError.hasOwnProperty('required')) {
        this.passwordErrorMessage = "Vui lòng điền mật khẩu";
      } else {
        this.passwordErrorMessage = "Mật khẩu phải có độ dài tối thiểu 6 kí tự";
      }
    }
  }
}
