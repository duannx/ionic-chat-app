import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../classes/user';
import { Conversation } from '../classes/conversation';
import { FirebaseControllerProvider } from '../firebase-controller/firebase-controller';
import { Message } from '../classes/message';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ChatControllerProvider {
  user: User;
  userCollection: Map<string, User>;
  userConversations: Array<Conversation> = [];
  conversationCollection: Map<string, Conversation>;
  isUseFakeData = true;
  constructor(
    public firebaseService: FirebaseControllerProvider
  ) {
    this.user = new User();
    this.userCollection = new Map<string, User>();
    this.conversationCollection = new Map<string, Conversation>();
    // this.firebaseService.createCounter(this.firebaseService.db.doc("conversations/I2EW73UPckPdA4k0MMIf/counters/message"), 2);
  }

  loginWithEmailAndPassword(email, password): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebaseService.loginWithAccountPassword(email, password).then(data => {
        resolve(data.uid);
      }, error => {
        reject(error);
      }).catch(error => {
        reject(error);
      })
    })

  }

  loginWithFacebook() {

  }

  loginWithGoogle() {

  }

  getConversationById(id: string): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      //First find in cached data
      if (this.conversationCollection.get(id)) resolve(this.conversationCollection.get(id));
      else {
        this.firebaseService.getConversationById(id).then(data => {
          let conversation = new Conversation();
          conversation.mappingFirebaseData(data);
          resolve(conversation);
        }, error => {
          reject(error);
        }).catch(error => {
          reject(error);
        })
      }
    })
  }

  getMessageInConversation(conversationId: string, orderDirection: any, startAt: any, endAt: any, numberOfMessage?: number): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getMessageInConversation(conversationId, orderDirection, startAt, endAt, numberOfMessage).then(data => {
        if (data) {
          let results = [];
          data.forEach(messageData => {
            let message = new Message();
            message.mappingFirebaseData(messageData);
            results.push(message);
          });
          resolve(results);
        } else {
          reject();
        }
      }, error => {
        reject(error);
      }).catch((error) => {
        reject(error)
      })
    })
  }

  loadMoreMessage(conversationId: string, orderDirection: any, startAfter?: any, endBefore?: any, numberOfMessage?: number): Promise<Array<Message>> {
    return new Promise((resolve, reject) => {
      this.firebaseService.loadMoreMessage(conversationId, orderDirection, startAfter, endBefore, numberOfMessage).then(data => {
        if (data) {
          let results = [];
          data.forEach(messageData => {
            let message = new Message();
            message.mappingFirebaseData(messageData);
            results.push(message);
          });
          resolve(results);
        } else {
          reject();
        }
      }, error => {
        reject(error);
      }).catch((error) => {
        reject(error)
      })
    })
  }

  fetchMessageInConversation(conversationId: string, orderDirection: any, startAt?: number, endAt?: number, numberOfMessage?: number): Observable<any> {
    return this.firebaseService.fetchMessageInConversation(conversationId, orderDirection, startAt, endAt, numberOfMessage);
  }

  getUserById(userId: string): Promise<User> {
    return new Promise((resolve, reject) => {
      if (this.userCollection.get(userId)) resolve(this.userCollection.get(userId));
      else {
        this.firebaseService.getUserById(userId).then(data => {
          let user = new User();
          user.mappingFirebaseData(data);
          this.userCollection.set(user.id, user);
          resolve(user);
        }, error => {
          reject(error);
        }).catch(error => {
          reject(error);
        })
      }

    })
  }

  addMessage(conversationId: string, message: Message) {
    return this.firebaseService.addMessage(conversationId, message);
  }

  createConversationMessageCounter(conversationId: string, numShards: number) {
    return this.firebaseService.createConversationMessageCounter(conversationId, numShards);
  }

  incrementConversationMessageCounter(conversationId: string, numShards: number) {
    return this.firebaseService.incrementConversationMessageCounter(conversationId, numShards);
  }

  getConversationMessageCount(conversationId: string) {
    return this.firebaseService.getConversationMessageCount(conversationId);
  }

  getConversationNumShards(conversationId) {
    return this.firebaseService.getConversationShardNumber(conversationId);
  }

  getFirebaseCurrentUser() {
    return this.firebaseService.getCurrentUser();
  }

  createConversation(conversation: Conversation): Promise<string> {
    return this.firebaseService.createConversation(conversation);
  }

  createUserConversation(ownerId: string, conversation: Conversation): Promise<string> {
    return this.firebaseService.createUserConversation(ownerId, conversation);
  }

  getAllUser(): Promise<Array<User>> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getAllUser().then(data => {
        let results = [];
        data.forEach(userData => {
          let user = new User();
          user.mappingFirebaseData(userData);
          this.userCollection.set(user.id, user);
          results.push(user);
        });
        resolve(results);
      }, error => {
        reject(error);
      })
    })
  }

  fetchConversationInUser(userId: string, orderDirection: any, startAt?: number, endAt?: number, limit?: number): Observable<any> {
    return this.firebaseService.fetchConversations(userId, orderDirection, startAt, endAt, limit);
  }

  updateUserConversation(userId: string, conversationId: string, value) {
    return this.firebaseService.updateUserConversation(userId, conversationId, value);
  }

  updateConversation(conversationId: string, value) {
    return this.firebaseService.updateConversation(conversationId, value);
  }

  uploadFileToStorage(file: File) {
    return this.firebaseService.uploadFileToStorage(file);
  }

  bodauTiengViet(str: string): string {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    // str = str.replace(/\W+/g, ' ');
    // str = str.replace(/\s/g, '-');
    return str;
  }
}
