import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FsLoginPage } from './fs-login'; 


@NgModule({
  declarations: [
    FsLoginPage,
  ],
  imports: [
    IonicPageModule.forChild(FsLoginPage)
  ],
})
export class FsLoginPageModule { }
