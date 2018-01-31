import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, Content } from 'ionic-angular';
import { Conversation } from '../../providers/classes/conversation';
import { ChatControllerProvider } from '../../providers/chat-controller/chat-controller';
import { TEST_CONVERSATIONS } from '../../providers/testData';
import { MESSAGE_STATE, FIREBASE_CONST, MESSAGE_TYPE } from '../../providers/chat-constant';
import { User } from '../../providers/classes/user';
import { Message } from '../../providers/classes/message';

import { Keyboard } from '@ionic-native/keyboard';

import * as autosize from 'autosize';
import * as $ from "jquery";
import 'jquery.easing';
import { Subscription } from 'rxjs/Subscription';
@IonicPage({
  // segment: 'chat-detail/:id'
})
@Component({
  selector: 'page-chat-detail',
  templateUrl: 'chat-detail.html',
})
export class ChatDetailPage {
  conversation: Conversation = new Conversation();
  messageState = MESSAGE_STATE;
  messageType = MESSAGE_TYPE;
  lastUser: User;
  messagePerPage = 25;
  chatListPaddingTop = 60;
  showSpiner = false;
  isLoadAllMessage = false;
  firstFetchedData = true;

  messageSubscription: Subscription;

  @ViewChild("textInput") textInputRef: ElementRef;
  @ViewChild("chatList") chatListRef: ElementRef;
  @ViewChild('inputFile') inputFileRef: ElementRef;
  @ViewChild(Content) content: Content;

  textInput: HTMLInputElement;
  chatList: HTMLDivElement;
  inputFile: HTMLInputElement;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public chatController: ChatControllerProvider,
    public platform: Platform,
    public keyboard: Keyboard,
    public changeDetectorRef: ChangeDetectorRef,
    public loadingCtrl: LoadingController) {
    this.conversation = new Conversation();
    if (this.navParams.get("conversation")) {
      this.conversation = this.navParams.get("conversation");
      console.log("conversation", this.conversation);
    } else {
      // this.conversation.id = "GK8ZwGIj12n9oLIIu417";
      // this.chatController.user.id = "JNTu1dqlg8bRBUCt9PD9DJSH8VH2"
    }

  }

  ionViewDidLoad() {
    if (this.chatListRef) {
      this.chatList = this.chatListRef.nativeElement;
      this.chatList.addEventListener('scroll', (event) => {
        if (!this.firstFetchedData && !this.isLoadAllMessage && this.chatList.scrollTop <= 60 && !this.showSpiner) {
          this.showSpiner = true;
          let firstMessage = this.conversation.messages[0];

          this.chatController.loadMoreMessage(this.conversation.id, "desc", firstMessage ? firstMessage.time : new Date(0), null, this.messagePerPage).then(data => {
            if (data) {
              if (data.length < this.messagePerPage) {
                this.isLoadAllMessage = true;
              }
            }
            data.forEach(message => {
              message.showState = false;
              message.showAvatar = false;
              this.chatController.getUserById(message.userId).then(user => {
                message.user = user;
              })
              this.addMessageToArray(message);
            });
            setTimeout(() => {
              console.log($('#message-' + firstMessage.id).offset().top, this.content.contentTop);
              this.chatList.scrollTop = $('#message-' + firstMessage.id).offset().top - this.content.contentTop - this.chatListPaddingTop;
            }, 0)
            this.showSpiner = false;
          }, error => {
            this.showSpiner = false;
          });
        }
      })
    }
    if (this.textInputRef) {
      this.textInput = this.textInputRef.nativeElement;
      autosize(this.textInput);

      this.textInput.addEventListener("autosize:resized", (event) => {
        this.scrollToBottomChat();
      })

      this.textInput.addEventListener("focus", () => {
        this.scrollToBottomChat();
      })

      //for pc app
      if (this.platform.is('core')) {
        this.textInput.addEventListener("keyup", (event) => {
          if (event.keyCode == 13 && !event.shiftKey) {
            event.stopPropagation();
            this.send();
          }
        })
      }
    }
    if (this.inputFileRef) {
      this.inputFile = this.inputFileRef.nativeElement;
    }

    this.platform.ready().then(() => {
      this.keyboard.onKeyboardShow().subscribe(event => {
        this.scrollToBottomChat();
        $('.scroll-content').animate({
          bottom: event.keyboardHeight
        }, 100, 'easeOutQuint')
      })
      this.keyboard.onKeyboardHide().subscribe(event => {
        $('.scroll-content').animate({
          bottom: 0
        }, 100)
      })
    })
  }

  ionViewDidEnter() {
    let loading = this.loadingCtrl.create({
      content: "Đang tải..."
    });
    loading.present();
    //Get opposite user
    this.getLastUser();
    //If conversation already have message
    if (this.conversation.messages.length >= 10000) {
      //Check if message is lastest

    } else {
      //Get last 25 message in conversation 
      this.conversation.messages = [];
      this.messageSubscription = this.chatController.fetchMessageInConversation(this.conversation.id, "desc", null, null, this.messagePerPage).subscribe(data => {
        console.log("message fetched");
        //Update isRead to conversation
        this.chatController.updateUserConversation(this.chatController.user.id, this.conversation.id, {
          isRead: true
        })
        loading.dismiss();
        data.docChanges.forEach(change => {
          let messageData = change.doc.data();
          if (messageData.time) {
            if (change.type == FIREBASE_CONST.DOCUMENT_CHANGE_TYPE.ADD || change.type == FIREBASE_CONST.DOCUMENT_CHANGE_TYPE.MODIFY) {
              let message = new Message();
              message.mappingFirebaseData(messageData);
              message.id = change.doc.id;
              message.showState = false;
              message.showAvatar = false;
              this.chatController.getUserById(message.userId).then(user => {
                message.user = user;
              })
              // console.log("fectched data", messageData, change.type, message.showState, message);
              this.addMessageToArray(message);
            }


            // if (change.type == FIREBASE_CONST.DOCUMENT_CHANGE_TYPE.REMOVE) {
            //   let index = this.conversation.messages.findIndex(elm => {
            //     return elm.id == change.doc.id;
            //   })
            //   if (index > -1) {
            //     this.conversation.messages.splice(index, 1);
            //   }
            // }
          }
        });

        if (this.conversation.messages.length < this.messagePerPage) {
          console.log(this.conversation.messages.length);
          this.isLoadAllMessage = true;
        }

        setTimeout(() => {
          this.scrollToBottomChat();
        }, this.firstFetchedData ? 100 : 10);
        setTimeout(() => {
          this.firstFetchedData = false;
        }, 200);
      })
    }
  }

  ionViewDidLeave() {
    if (this.messageSubscription) this.messageSubscription.unsubscribe();
  }

  scrollToBottomChat(duration?: number) {
    console.log("scrollToBottomChat");
    $(this.chatList).animate({
      scrollTop: this.chatList.scrollHeight
    }, duration ? duration : 300)
  }

  getLastUser() {
    console.log("get last user", this.conversation.userIds);
    for (let i = 0; i < this.conversation.userIds.length; i++) {
      console.log("get last user", i);
      let id = this.conversation.userIds[i];
      if (id != this.chatController.user.id) {
        this.chatController.getUserById(id).then(user => {
          this.lastUser = user;
        });
        break;
      }
    }

  }

  send(content?: string, type?: number) {
    console.log("send", content, type);
    if (!content) {
      this.textInput.focus();
    }

    if (content || this.textInput.value.trim()) {
      let message = new Message();
      message.content = content ? content : this.textInput.value;
      message.userId = this.chatController.user.id;
      message.state = MESSAGE_STATE.CREATED.id;
      message.time = new Date();
      message.classList.push("own");
      message.classList.push("last-of-block");
      message.showState = true;
      message.showAvatar = false;
      message.type = type ? type : MESSAGE_TYPE.TEXT.id;

      //Change class of lastmessage
      let lastMessage = this.conversation.messages[this.conversation.messages.length - 1];
      if (lastMessage) {
        if (lastMessage.state != MESSAGE_STATE.CREATED.id) {
          lastMessage.showState = false;
        }
        if (lastMessage.userId == this.chatController.user.id) {
          this.removeItemFromArray("last-of-block", lastMessage.classList);
        } else {
          this.addItemToArray("first-of-block", message.classList);
        }
      } else {
        this.addItemToArray("first-of-block", message.classList);
      }
      this.conversation.messages.push(message);
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
          lastMessageTime: this.chatController.firebaseService.timestampPlaceholder
        })
      });

      setTimeout(() => {
        this.scrollToBottomChat();
      }, 1)
      //reset textbox value
      this.textInput.value = "";

      //dispatch input event for resize text area
      if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("input", false, true);
        this.textInput.dispatchEvent(evt);
      }
    }
  }

  addMessageToArray(message: Message) {
    //Add class to message by userId
    if (message.userId == this.chatController.user.id) {
      message.classList.push('own');
    } else {
      message.classList.push('others');
    }

    //Check if message have already exists in array. Then remove old message
    let index = this.conversation.messages.findIndex(elm => {
      return message.id == elm.id;
    })
    if (index > -1) {
      this.conversation.messages.splice(index, 1);
    }

    //Find new index for new message and add it to array
    let newIndex = this.findNewMessageIndexInArray(message, this.conversation.messages);
    this.conversation.messages.splice(newIndex, 0, message);

    //change class of closest element
    let prevMessage = this.conversation.messages[newIndex - 1];
    let nextMessage = this.conversation.messages[newIndex + 1];

    if (prevMessage) {
      //Disable show state of prevMessage
      if (prevMessage.state != MESSAGE_STATE.CREATED.id) {
        prevMessage.showState = false;
      }
      if (prevMessage.userId != message.userId) {
        //add class last-of-block to prevMessage
        this.addItemToArray("last-of-block", prevMessage.classList);
        //Show avatar for last-of-block
        prevMessage.showAvatar = true;
        //add class first-of-block to message
        this.addItemToArray("first-of-block", message.classList);
      } else {
        //remove class last-of-block to prevMessage
        this.removeItemFromArray("last-of-block", prevMessage.classList);
        //remove avatar from prevMessage last-of-block
        prevMessage.showAvatar = false;
      }
    } else {
      //Do not have prvMessage so this message is definitely first
      this.addItemToArray("first-of-block", message.classList);
    }

    if (nextMessage) {
      if (nextMessage.userId != message.userId) {
        //add class last-of-block to message
        this.addItemToArray("last-of-block", message.classList);
        //Show avatar for last-of-block
        message.showAvatar = true;
        //add class first-of-block to nextMessage
        this.addItemToArray("first-of-block", nextMessage.classList);
      } else {
        //remove class last-of-block to nextMessage
        this.removeItemFromArray("first-of-block", nextMessage.classList);
      }
    } else {
      //Do not have lastmessage so this fucker is last 
      this.addItemToArray("last-of-block", message.classList);
      //Show avatar for last-of-block
      message.showAvatar = true;
      message.showState = true;
    }
  }

  findNewMessageIndexInArray(message: Message, array: Array<Message>) {
    let length = array.length;
    if (length == 0) return 0;
    if (message.time.getTime() < array[0].time.getTime()) return 0;
    if (message.time.getTime() >= array[length - 1].time.getTime()) return length;
    if (message.time.getTime() >= array[Math.floor(length / 2)].time.getTime()) {
      return Math.floor(length / 2) + this.findNewMessageIndexInArray(message, array.slice(Math.floor(length / 2), length - 1));
    } else {
      return 1 + this.findNewMessageIndexInArray(message, array.slice(1, Math.floor(length / 2)));
    }
  }

  addItemToArray(item, array) {
    if (array.indexOf(item) == -1) array.push(item);
  }

  removeItemFromArray(item, array) {
    let index = array.indexOf(item);
    if (index > -1) array.splice(index, 1);
  }

  getLastTimeOnline(time: Date) {
    if (time) {
      let diff = Math.floor((Date.now() - time.getTime()) / 1000);
      if (diff <= 0) return "Just now";
      let hours = Math.floor(diff / 3600);
      let minutes = Math.floor((diff - hours * 3600) / 60);
      let seconds = diff - hours * 3600 - minutes * 60;
      return (hours ? hours + "h " : "") + (minutes + "m ");
    } else {
      return "Just now";
    }
  }

  back() {
    this.navCtrl.pop();
  }

  goToConversationDetail() {
    this.navCtrl.push("ConversationDetailPage", { conversation: this.conversation });
  }

  onFilesChanged(evnet) {
    if (this.inputFile && this.inputFile.files.length > 0) {
      let file = this.inputFile.files[0];
      this.chatController.uploadFileToStorage(file).then((snapshot) => {
        console.log('Uploaded a blob or file!', snapshot.downloadURL);
        this.send(snapshot.downloadURL, MESSAGE_TYPE.IMAGE.id);
      });
    }
  }
}
