import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ChatControllerProvider } from '../../providers/chat-controller/chat-controller';
import { Conversation } from '../../providers/classes/conversation';
import { FIREBASE_CONST } from '../../providers/chat-constant';
import { Subscription } from 'rxjs/Subscription';
@IonicPage()
@Component({
  selector: 'page-conversations',
  templateUrl: 'conversations.html',
})
export class ConversationsPage {
  conversations: Array<Conversation> = [];
  showConversation: Array<Conversation> = [];
  searchKeyword = "";
  covnersationSubscription: Subscription;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public chatController: ChatControllerProvider) {
    // this.chatController.user.id = "JNTu1dqlg8bRBUCt9PD9DJSH8VH2";
  }

  ionViewDidLoad() {
    this.covnersationSubscription = this.chatController.fetchConversationInUser(this.chatController.user.id, "desc").subscribe(data => {
      data.docChanges.forEach(change => {
        let conversationData = change.doc.data();
        if (change.type == FIREBASE_CONST.DOCUMENT_CHANGE_TYPE.ADD || change.type == FIREBASE_CONST.DOCUMENT_CHANGE_TYPE.MODIFY) {
          let conversation = new Conversation();
          conversation.mappingFirebaseData(conversationData);
          conversation.id = change.doc.id;

          //Check if conversation have already exists in array. Then remove old conversation
          let index = this.conversations.findIndex(elm => {
            return conversation.id == elm.id;
          })
          if (index > -1) {
            this.conversations.splice(index, 1);
          }

          //Find new index for new conversation and add it to array
          let newIndex = this.findNewConversationIndexInArray(conversation, this.conversations);
          this.conversations.splice(newIndex, 0, conversation);
          this.chatController.userConversations = this.conversations;

          console.log(change.type, index, newIndex, conversation, this.conversations);
          if (conversation.userIds.length == 2) {
            conversation.userIds.forEach(useriId => {
              if (useriId != this.chatController.user.id) {
                this.chatController.getUserById(useriId).then(user => {
                  conversation.name = user.name;
                  conversation.image = user.thumbnail;
                })
              }
            });
          }
        }

        // if (change.type == FIREBASE_CONST.DOCUMENT_CHANGE_TYPE.MODIFY) {
        //   let index = this.conversations.findIndex(elm => {
        //     return elm.id == conversationData.id;
        //   })
        //   if (index > -1) {
        //     this.conversations[index].mappingFirebaseData(conversationData);
        //   }
        // }
        if (change.type == FIREBASE_CONST.DOCUMENT_CHANGE_TYPE.REMOVE) {
          let index = this.conversations.findIndex(elm => {
            return elm.id == conversationData.id;
          })
          if (index > -1) {
            this.conversations.splice(index, 1);
          }
        }
      });
      this.filterConversation();
    });
  }

  ionViewDidLeave() {
    // if (this.covnersationSubscription) {
    //   this.covnersationSubscription.unsubscribe();
    // }
  }

  findNewConversationIndexInArray(conversation: Conversation, array: Array<Conversation>) {
    let length = array.length;
    if (length == 0) return 0;
    if (conversation.lastMessageTime.getTime() >= array[0].lastMessageTime.getTime()) return 0;
    if (conversation.lastMessageTime.getTime() < array[length - 1].lastMessageTime.getTime()) return length;
    if (conversation.lastMessageTime.getTime() < array[Math.floor(length / 2)].lastMessageTime.getTime()) {
      return Math.floor(length / 2) + this.findNewConversationIndexInArray(conversation, array.slice(Math.floor(length / 2), length - 1));
    } else {
      return 1 + this.findNewConversationIndexInArray(conversation, array.slice(1, Math.floor(length / 2)));
    }
  }

  filterConversation() {
    this.showConversation = this.conversations.filter(conversation => {
      return this.chatController.bodauTiengViet(conversation.name.toLowerCase()).includes(this.chatController.bodauTiengViet(this.searchKeyword.trim().toLowerCase()));
    })
  }

  createConversation() {
    let modal = this.modalCtrl.create("CreateConversationPage");
    modal.present();
    modal.onDidDismiss(data => {
      if (data && data.conversation) {
        this.navCtrl.push("ChatDetailPage", { conversation: data.conversation });
      }
    })
  }
  getTime(date: Date) {
    let today = new Date();
    if (today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate()) {
      return this.getDateString(date.getHours()) + ":" + this.getDateString(date.getMinutes());
    } else {
      return this.getDateString(date.getDate()) + " Thg " + (date.getMonth() + 1);
    }
  }

  getDateString(number) {
    if (number < 10) return "0" + number;
    else return number;
  }

  gotoDetail(conversation: Conversation) {
    this.navCtrl.push("ChatDetailPage", { conversation: conversation });
  }
}
