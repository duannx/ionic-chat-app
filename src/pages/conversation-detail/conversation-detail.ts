import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { ChatControllerProvider } from '../../providers/chat-controller/chat-controller';
import { Conversation } from '../../providers/classes/conversation';
import { User } from '../../providers/classes/user';
import { Message } from '../../providers/classes/message';
import { MESSAGE_STATE, MESSAGE_TYPE } from '../../providers/chat-constant';

@IonicPage()
@Component({
  selector: 'page-conversation-detail',
  templateUrl: 'conversation-detail.html',
})
export class ConversationDetailPage {
  currentUser: User;
  conversation: Conversation = new Conversation();
  otherUser: User;
  conversationImage: string = "";
  showAvatarModal = false;
  @ViewChild('inputFileAvatar') inputFileRef: ElementRef;
  inputFile: HTMLInputElement;
  file: File;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public chatController: ChatControllerProvider,
    public alertCtrl: AlertController
  ) {
    this.currentUser = this.chatController.user;
    if (this.navParams.get("conversation")) {
      this.conversation = this.navParams.get("conversation");
    }
    else {
      // this.conversation.id = "GK8ZwGIj12n9oLIIu417";
      // this.conversation.name = "Bistro Dancer";
      // this.conversation.userIds = ["6bip4RAHX8ds1fD1ImQaVBiWMuR2", "JNTu1dqlg8bRBUCt9PD9DJSH8VH2"];
      // this.conversation.image = "assets/imgs/conversation.png";
    }
    this.conversationImage = this.conversation.image;
    this.conversation.users = [];
    this.conversation.userIds.forEach(userid => {
      this.chatController.getUserById(userid).then(user => {
        this.conversation.users.push(user);
        if (this.conversation.userIds.length == 2 && userid != this.chatController.user.id) {
          this.otherUser = user;
        }
        console.log("other user", this.otherUser);
      })
    })
  }

  ionViewDidLoad() {
    if (this.inputFileRef) {
      this.inputFile = this.inputFileRef.nativeElement;
    }
  }

  back() {
    this.navCtrl.pop();
  }


  avatarClick() {
    if (this.conversation.userIds.length > 2) {
      this.showAvatarModal = true;
    }
  }

  nameClick() {
    if (this.conversation.userIds.length > 2) {
      let alert = this.alertCtrl.create({
        message: "Thay đổi tên cuộc trò chuyện",
        inputs: [{
          type: "text",
          name: "name",
          value: this.conversation.name
        }],
        buttons: [{
          text: "Hủy",
          role: "cancel"
        }, {
          text: "OK",
          handler: (data) => {
            if (data && data.name) {
              this.conversation.name = data.name;
              //update to main conversation
              this.chatController.updateConversation(this.conversation.id, { name: data.name });
              //add a system message
              let message = new Message();
              message.content = this.chatController.user.name + " đã thay đổi tên cuộc trò chuyện: " + data.name;
              message.userId = this.chatController.user.id;
              message.state = MESSAGE_STATE.CREATED.id;
              message.time = new Date();
              message.type = MESSAGE_TYPE.SYSTEM.id;

              console.log("add message to firestore");
              this.chatController.addMessage(this.conversation.id, message).then(data => {
                message.state = MESSAGE_STATE.SENDED.id;
                message.id = data;
              })

              //Add notification for user in conversation
              this.conversation.userIds.forEach(userId => {
                this.chatController.updateUserConversation(userId, this.conversation.id, {
                  isRead: userId == this.chatController.user.id,
                  lastMessageContent: message.content,
                  lastUserId: message.userId,
                  lastMessageTime: this.chatController.firebaseService.timestampPlaceholder,
                  name: data.name
                })
              });
            }
          }
        }]
      })
      alert.present();
    }
  }

  onFilesChanged() {
    console.log("onFilesChanged", this.inputFile, this.inputFileRef);
    if (this.inputFile && this.inputFile.files.length > 0) {
      this.file = this.inputFile.files[0];
      var reader = new FileReader();

      reader.onload = (e) => {
        this.conversationImage = e.target["result"];
      }
      reader.readAsDataURL(this.file);
    }
  }

  cancelAvatar() {
    this.conversationImage = this.conversation.image;
    this.showAvatarModal = false;
  }

  doneAvatar() {
    if (this.file && this.conversationImage != this.conversation.image) {
      this.conversation.image = this.conversationImage;
      this.showAvatarModal = false;
      //upload image to firestore
      this.chatController.uploadFileToStorage(this.file).then(snapshot => {
        this.conversation.image = snapshot.downloadURL;

        //update to main conversation
        this.chatController.updateConversation(this.conversation.id, { image: this.conversation.image });
        //add a system message
        let message = new Message();
        message.content = this.chatController.user.name + " đã thay đổi ảnh đại diện cuộc trò chuyện!";
        message.userId = this.chatController.user.id;
        message.state = MESSAGE_STATE.CREATED.id;
        message.time = new Date();
        message.type = MESSAGE_TYPE.SYSTEM.id;

        console.log("add message to firestore");
        this.chatController.addMessage(this.conversation.id, message).then(data => {
          message.state = MESSAGE_STATE.SENDED.id;
          message.id = data;
        })

        //Add notification for user in conversation
        this.conversation.userIds.forEach(userId => {
          this.chatController.updateUserConversation(userId, this.conversation.id, {
            isRead: userId == this.chatController.user.id,
            lastMessageContent: message.content,
            lastUserId: message.userId,
            lastMessageTime: this.chatController.firebaseService.timestampPlaceholder,
            image: this.conversation.image
          })
        });
      })
    }else{
      this.cancelAvatar();
    }
  }

  backdropClick() {
    this.showAvatarModal = false;
  }
}
