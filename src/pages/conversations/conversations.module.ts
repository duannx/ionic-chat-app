import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConversationsPage } from './conversations';

@NgModule({
  declarations: [
    ConversationsPage,
  ],
  imports: [
    IonicPageModule.forChild(ConversationsPage),
  ],
})
export class ConversationsPageModule {}
