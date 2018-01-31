import { Injectable } from '@angular/core';

import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { TEST_USER_CREDENTIAL, TEST_CONVERSATIONS, TEST_MESSAGES, TEST_USERS } from '../testData';
import { FIREBASE_PATH, MESSAGE_STATE } from '../chat-constant';
import { Message } from '../classes/message';
import { Conversation } from '../classes/conversation';

export interface FirebaseQuery {
  field: string;
  operator: firebase.firestore.WhereFilterOp;
  value: string;
}
export interface FirebaseOrder {
  field: string;
  direction: firebase.firestore.OrderByDirection;
}

@Injectable()
export class FirebaseControllerProvider {
  db: firebase.firestore.Firestore;
  auth: firebase.auth.Auth;
  storage: firebase.storage.Storage;
  timestampPlaceholder = firebase.firestore.FieldValue.serverTimestamp();
  isUseFakeData = false;


  separator = "/";
  constructor() {
    firebase.initializeApp({
      apiKey: "AIzaSyDMEZoEtmor-T166lP9bGCR9FxqQP4eGik",
      authDomain: "bistrodancerapp.firebaseapp.com",
      databaseURL: "https://bistrodancerapp.firebaseio.com",
      projectId: "bistrodancerapp",
      storageBucket: "bistrodancerapp.appspot.com",
      messagingSenderId: "773087969883"
    });
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.storage = firebase.storage();
  }

  getNewFirebaseDocumentId() {
    return this.db.collection('_').doc().id;
  }

  addDocument(collection: string, value: any, documentId?: string): Promise<any> {
    // console.log("firebase add document", collection, documentId);
    return new Promise((resolve, reject) => {
      if (documentId) {
        value["id"] = documentId;
        return this.db.collection(collection).doc(documentId).set(value).then(success => {
          resolve(documentId)
        }, error => {
          reject(error);
        })
      } else {
        let newRef = this.db.collection(collection).doc();
        value["id"] = newRef.id;
        return newRef.set(value).then(success => {
          resolve(newRef.id);
        }, error => {
          reject(error);
        })
      }
    })

  }

  getDocument(path: string): Promise<any> {
    // console.log("firebase get document", path);
    return new Promise((resolve, reject) => {
      this.db.doc(path).get().then(success => {
        if (success.exists) {
          let result = success.data();
          if (!result.id) {
            result.id = success.id
          }
          resolve(result);
        } else {
          reject("Bản ghi " + path + " không tồn tại");
        }
      }, error => {
        console.log("get fail", error);
        reject(error);
      })
    })
  }

  updateDocument(path: string, data: any): Promise<any> {
    // console.log("firebase update document", path);
    return new Promise((resolve, reject) => {
      this.db.doc(path).update(data).then(success => {
        // console.log("update succsess", success);
        resolve();
      }, error => {
        console.log("update fail", error);
        reject();
      })
    })
  }

  deleteDocument(path: string): Promise<any> {
    // console.log("firebase delete document", path);
    return new Promise((resolve, reject) => {
      this.db.doc(path).delete().then(success => {
        // console.log("delete succsess", success);
        resolve();
      }, error => {
        console.log("delete fail", error);
        reject();
      })
    })
  }

  getCollection(path: string, queries?: Array<FirebaseQuery>, orders?: Array<FirebaseOrder>, limit?: number,
    startAt?: any, startAfter?: any, endAt?: any, endBefore?: any): Promise<any> {
    // console.log("firebase get collection", path);
    return new Promise((resolve, reject) => {
      let ref = this.db.collection(path) as firebase.firestore.Query;
      if (queries) {
        queries.forEach(query => {
          ref = ref.where(query.field, query.operator, query.value);
        });
      }

      if (orders) {
        orders.forEach(order => {
          ref = ref.orderBy(order.field, order.direction);
        });
      }

      if (startAt) {
        ref = ref.startAt(startAt);
      }
      if (startAfter) {
        ref = ref.startAfter(startAfter);
      }
      if (endAt) {
        ref = ref.endAt(endAt);
      }
      if (endBefore) {
        ref = ref.endBefore(endBefore);
      }

      if (limit) {
        ref = ref.limit(limit);
      }
      ref.get().then(querySnapshot => {
        // console.log("firebase get collection success", querySnapshot);
        let result = [];
        querySnapshot.forEach(doc => {
          let element = doc.data();
          element.id = doc.id;
          result.push(element);
        })
        // this.progressController.subtract();
        resolve(result);
      }, error => {
        // this.progressController.subtract();
        console.log("get collection fail", error);
        reject(error);
      })
    })
  }

  fetchCollection(path: string, queries?: Array<FirebaseQuery>, orders?: Array<FirebaseOrder>, limit?: number,
    startAt?: any, startAfter?: any, endAt?: any, endBefore?: any): Observable<any> {
    console.log("fetch data", path);
    return Observable.create(observer => {
      //Chú ý rằng trong query chỉ áp dụng range filter cho 1 field (<, >, <=, >=)
      //Nếu query có range filter thì orderBy đầu tiên phải order theo field của range filter đó
      let ref = this.db.collection(path) as firebase.firestore.Query;
      if (queries) {
        queries.forEach(query => {
          ref = ref.where(query.field, query.operator, query.value);
        });
      }
      if (orders) {
        orders.forEach(order => {
          ref = ref.orderBy(order.field, order.direction);
        });
      }

      if (startAt) {
        ref = ref.startAt(startAt);
      }
      if (startAfter) {
        ref = ref.startAfter(startAfter);
      }
      if (endAt) {
        ref = ref.endAt(endAt);
      }
      if (endBefore) {
        ref = ref.endBefore(endBefore);
      }

      if (limit) {
        ref = ref.limit(limit);
      }
      ref.onSnapshot(observer);
    });
  }

  loginWithFacebook(accesstoken): Promise<any> {
    if (this.isUseFakeData) {

    } else {
      let facebookCredential = firebase.auth.FacebookAuthProvider.credential(accesstoken);
      return firebase.auth().signInWithCredential(facebookCredential);
    }
  }

  loginWithGoogle(accesstoken): Promise<any> {
    if (this.isUseFakeData) {

    } else {
      let googleCredential = firebase.auth.GoogleAuthProvider.credential(null, accesstoken);
      return this.auth.signInWithCredential(googleCredential);
    }
  }

  loginWithAccountPassword(email: string, password: string): Promise<any> {
    if (this.isUseFakeData) {
      return Promise.resolve(TEST_USER_CREDENTIAL[0]);
    } else {
      return this.auth.signInWithEmailAndPassword(email, password);
    }
  }

  getConversationById(id: string): Promise<any> {
    if (this.isUseFakeData) {
      return Promise.resolve(TEST_CONVERSATIONS[0]);
    } else {
      return this.getDocument(FIREBASE_PATH.CONVERSATION + this.separator + id);
    }
  }

  getMessageInConversation(conversationId: string, orderDirection: firebase.firestore.OrderByDirection, startAt: any, endAt: any, numberOfMessage?: number): Promise<any> {
    if (this.isUseFakeData) {
      return Promise.resolve(TEST_MESSAGES[conversationId]);
    } else {
      console.log("getMessageInConversation", orderDirection, startAt, endAt, numberOfMessage);
      return this.getCollection(
        FIREBASE_PATH.CONVERSATION + this.separator + conversationId + this.separator + FIREBASE_PATH.MESSAGE, null,
        [{
          field: "time",
          direction: orderDirection
        }],
        numberOfMessage, startAt, null, endAt, null);

    }
  }

  loadMoreMessage(conversationId: string, orderDirection: firebase.firestore.OrderByDirection, startAfter?: any, endBefore?: any, numberOfMessage?: number): Promise<any> {
    if (this.isUseFakeData) {
      return Promise.resolve(TEST_MESSAGES[conversationId]);
    } else {
      return this.getCollection(
        FIREBASE_PATH.CONVERSATION + this.separator + conversationId + this.separator + FIREBASE_PATH.MESSAGE, null,
        [{
          field: "time",
          direction: orderDirection
        }],
        numberOfMessage, null, startAfter, null, endBefore);

    }
  }

  getUserById(userId: string): Promise<any> {
    if (this.isUseFakeData) {
      let index = TEST_USERS.findIndex(elm => {
        return elm.id == userId;
      })
      if (index > -1) return Promise.resolve(TEST_USERS[index]);
      else return Promise.resolve(TEST_USERS[0]);
    } else {
      return this.getDocument(FIREBASE_PATH.USER + this.separator + userId);
    }
  }

  addMessage(conversationId: string, message: Message) {
    return this.addDocument(FIREBASE_PATH.CONVERSATION + this.separator + conversationId + this.separator + FIREBASE_PATH.MESSAGE, {
      content: message.content,
      state: MESSAGE_STATE.SENDED.id,
      time: this.timestampPlaceholder,
      userId: message.userId,
      type: message.type
    });
  }

  createCounter(path: string, numShards: number) {
    let ref = this.db.doc(path);
    var batch = this.db.batch();

    // Initialize the counter document
    let refValue = {};
    refValue[FIREBASE_PATH.NUM_SHARD] = numShards;
    batch.set(ref, refValue);

    // Initialize each shard with count=0
    for (let i = 0; i < numShards; i++) {
      let shardRef = ref.collection(FIREBASE_PATH.SHARD).doc(i.toString());
      batch.set(shardRef, { count: 0 });
    }

    // Commit the write batch
    return batch.commit();
  }

  incrementCounter(path: string, numShards: number) {
    let ref = this.db.doc(path);
    // Select a shard of the counter at random
    const shard_id = Math.floor(Math.random() * numShards).toString();
    const shard_ref = ref.collection(FIREBASE_PATH.SHARD).doc(shard_id);

    // Update count in a transaction
    return this.db.runTransaction(t => {
      return t.get(shard_ref).then(doc => {
        const new_count = doc.data().count + 1;
        t.update(shard_ref, { count: new_count });
      });
    });
  }

  getCount(path: string) {
    let ref = this.db.doc(path);
    // Sum the count of each shard in the subcollection
    return ref.collection(FIREBASE_PATH.SHARD).get().then(snapshot => {
      let total_count = 0;
      let numShards = 0;
      snapshot.forEach(doc => {
        total_count += doc.data().count;
        numShards++;
      });

      return {
        count: total_count,
        numShards: numShards
      };
    });
  }

  createConversationMessageCounter(conversationId: string, numShards: number) {
    return this.createCounter(FIREBASE_PATH.CONVERSATION + this.separator + conversationId + this.separator
      + FIREBASE_PATH.COUNTER + this.separator + FIREBASE_PATH.MESSAGE, numShards)
  }

  incrementConversationMessageCounter(conversationId: string, numShards: number) {
    return this.incrementCounter(FIREBASE_PATH.CONVERSATION + this.separator + conversationId + this.separator
      + FIREBASE_PATH.COUNTER + this.separator + FIREBASE_PATH.MESSAGE, numShards)
  }

  getConversationMessageCount(conversationId: string) {
    return this.getCount(FIREBASE_PATH.CONVERSATION + this.separator + conversationId + this.separator
      + FIREBASE_PATH.COUNTER + this.separator + FIREBASE_PATH.MESSAGE);
  }

  getConversationShardNumber(conversationId: string) {
    return this.getDocument(FIREBASE_PATH.CONVERSATION + this.separator + conversationId + this.separator
      + FIREBASE_PATH.COUNTER + this.separator + FIREBASE_PATH.MESSAGE + this.separator + FIREBASE_PATH.NUM_SHARD);
  }

  fetchMessageInConversation(conversationId: string, orderDirection: firebase.firestore.OrderByDirection, startAt?: number, endAt?: number, numberOfMessage?: number): Observable<any> {
    if (this.isUseFakeData) {
      return Observable.of(TEST_MESSAGES[conversationId]);
    } else {
      console.log("fetchMessageInConversation", orderDirection, startAt, endAt, numberOfMessage);
      return this.fetchCollection(
        FIREBASE_PATH.CONVERSATION + this.separator + conversationId + this.separator + FIREBASE_PATH.MESSAGE, null,
        [{
          field: "time",
          direction: orderDirection
        }],
        numberOfMessage, startAt, null, endAt, null);

    }
  }

  fetchConversations(userId: string, orderDirection: firebase.firestore.OrderByDirection, startAt?: number, endAt?: number, limit?: number): Observable<any> {
    if (this.isUseFakeData) {
      return Observable.of(TEST_CONVERSATIONS);
    } else {
      console.log("fetchConversations", orderDirection, FIREBASE_PATH.USER + this.separator + userId + this.separator + FIREBASE_PATH.CONVERSATION);
      return this.fetchCollection(
        FIREBASE_PATH.USER + this.separator + userId + this.separator + FIREBASE_PATH.CONVERSATION, null,
        [{
          field: "lastMessageTime",
          direction: orderDirection
        }],
        limit, startAt, null, endAt, null);

    }
  }

  createConversation(conversation: Conversation): Promise<any> {
    return this.addDocument(FIREBASE_PATH.CONVERSATION, {
      image: conversation.image,
      name: conversation.name,
      time: this.timestampPlaceholder,
      userIds: conversation.userIds,
      lastMessageContent: conversation.lastMessageContent,
      lastUserId: conversation.lastUserId,
      lastMessageTime: conversation.lastMessageTime
    })
  }

  createUserConversation(ownerId: string, conversation: Conversation): Promise<any> {
    return this.addDocument(FIREBASE_PATH.USER + this.separator + ownerId + this.separator + FIREBASE_PATH.CONVERSATION, {
      image: conversation.image,
      name: conversation.name,
      time: conversation.time,
      userIds: conversation.userIds,
      lastMessageContent: conversation.lastMessageContent,
      lastUserId: conversation.lastUserId,
      lastMessageTime: conversation.lastMessageTime
    }, conversation.id);
  }

  updateUserConversation(ownerId: string, conversationId: string, value: string): Promise<any> {
    return this.updateDocument(FIREBASE_PATH.USER + this.separator + ownerId + this.separator + FIREBASE_PATH.CONVERSATION + this.separator + conversationId, value);
  }

  updateConversation(  conversationId: string, value: string): Promise<any> {
    return this.updateDocument(FIREBASE_PATH.CONVERSATION + this.separator + conversationId, value);
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  getAllUser(): Promise<any> {
    return this.getCollection(FIREBASE_PATH.USER);
  }

  uploadFileToStorage(file: File) {
    return this.storage.ref().child('chat-images/' + file.name + Date.now()).put(file);
  }

}
