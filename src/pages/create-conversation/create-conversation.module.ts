import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateConversationPage } from './create-conversation';

@NgModule({
  declarations: [
    CreateConversationPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateConversationPage),
  ],
})
export class CreateConversationPageModule {}
