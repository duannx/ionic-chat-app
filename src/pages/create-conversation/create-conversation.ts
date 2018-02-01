import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ViewController } from 'ionic-angular';
import { ChatControllerProvider } from '../../providers/chat-controller/chat-controller';
import { User } from '../../providers/classes/user';
import { Conversation } from '../../providers/classes/conversation';
@IonicPage()
@Component({
  selector: 'page-create-conversation',
  templateUrl: 'create-conversation.html',
})
export class CreateConversationPage {
  users: Array<User> = [];
  showUsers: Array<User> = [];
  searchKeyword = "";
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public chatController: ChatControllerProvider,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateConversationPage');
  }

  ionViewDidEnter() {
    let loading = this.loadingCtrl.create({
      content: "Đang tải..."
    })
    loading.present();
    this.chatController.getAllUser().then(data => {
      if (data) {
        //remove current user from list
        let index = data.findIndex(elm => {
          return elm.id == this.chatController.user.id;
        })
        if (index > -1) {
          data.splice(index, 1);
        }
        this.users = data;
        this.showUsers = data;
      }
      loading.dismiss();
    }, error => {
      loading.dismiss();
    });
  }

  onInput() {
    this.showUsers = this.users.filter(user => {
      return this.chatController.bodauTiengViet(user.name.toLowerCase()).includes(this.chatController.bodauTiengViet(this.searchKeyword.trim().toLowerCase()))
        || user.email.toLowerCase().includes(this.searchKeyword.trim().toLowerCase())
    })
  }

  goback() {
    this.viewCtrl.dismiss();
  }

  done() {
    let userSelected: Array<User> = [];
    userSelected = this.users.filter(user => {
      return user["selected"];
    });
    if (userSelected.length > 0) {
      // let loading = this.loadingCtrl.create({
      //   content: "Xin đợi"
      // })
      // loading.present();

      console.log("userSelected", userSelected);
      let conversation = new Conversation();
      userSelected.push(this.chatController.user);

      if (userSelected.length == 2 && userSelected[0].avatar) {
        conversation.image = userSelected[0].avatar;
      } else {
        conversation.image = "assets/imgs/conversation.png";
      }
      for (let i = 0; i < userSelected.length; i++) {
        let user = userSelected[i];
        conversation.userIds.push(user.id);
        if (i == 0) conversation.name += user.name;
        else {
          if (i == userSelected.length - 1) conversation.name += " and " + user.name;
          else {
            conversation.name += ", " + user.name;
          }
        }
      }
      //Find if conversation exist in userConversation
      let index = this.chatController.userConversations.findIndex(elm => {
        if (elm.userIds.length != conversation.userIds.length) return false;
        let result = true;
        for (let i = 0; i < elm.userIds.length; i++) {
          if (conversation.userIds.indexOf(elm.userIds[i]) == -1) {
            return false;
          }
        }
        return result;
      })

      if (index > -1) {
        console.log("find a fucker", this.chatController.userConversations[index]);
        conversation = this.chatController.userConversations[index];
        this.viewCtrl.dismiss({ conversation: conversation });
      }
      else {
        let loading = this.loadingCtrl.create({ content: "Xin đợi..." });
        loading.present();
        this.chatController.createConversation(conversation).then(id => {
          loading.dismiss();
          conversation.id = id;
          //Add conversation foreach user
          conversation.userIds.forEach(uid => {
            this.chatController.createUserConversation(uid, conversation);
          });
          this.viewCtrl.dismiss({ conversation: conversation });
          console.log("conversationId", id, conversation, conversation.userIds, conversation.userIds.length);
        }, error=>{
          console.log(error);
        })
      }

    } else {
      this.goback();
    }

  }

}
