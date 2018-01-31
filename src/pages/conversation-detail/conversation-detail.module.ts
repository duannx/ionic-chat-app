import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConversationDetailPage } from './conversation-detail';

@NgModule({
  declarations: [
    ConversationDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(ConversationDetailPage),
  ],
})
export class ConversationDetailPageModule {}
