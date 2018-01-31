import { User } from "./user";
import { Message } from "./message";
import { LONG_TIME_AGO } from "../chat-constant";

export class Conversation {
    id: string;
    name: string;
    image: string;
    userIds: Array<string>;
    users: Array<User>;
    messages: Array<Message>;
    time: Date;
    lastMessageContent: string;
    lastUserId: string;
    lastMessageTime: Date;
    isRead: boolean;
    constructor() {
        this.reset();
    }

    reset() {
        this.id = "";
        this.name = "";
        this.image = "";
        this.users = [];
        this.messages = [];
        this.userIds = [];
        this.time = new Date();
        this.lastMessageContent = "";
        this.lastUserId = "";
        this.lastMessageTime = LONG_TIME_AGO;
        this.isRead = true;
    }

    mappingFirebaseData(data) {
        if (data) {
            this.id = data.id ? data.id : "";
            this.name = data.name ? data.name : "";
            this.image = data.image ? data.image : "";
            this.userIds = data.userIds ? data.userIds : [];
            this.time = data.time ? data.time : new Date();
            this.lastMessageContent = data.lastMessageContent ? data.lastMessageContent : "";
            this.lastUserId = data.lastUserId ? data.lastUserId : "";
            this.lastMessageTime = data.lastMessageTime ? data.lastMessageTime : LONG_TIME_AGO;
            this.isRead = data.isRead;
        }
    }
}
