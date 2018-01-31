import { MESSAGE_STATE, MESSAGE_TYPE } from "../chat-constant";
import { User } from "./user";

export class Message {
    id: string;
    userId: string;
    user: User;
    content: string;
    state: number;
    time: Date;
    type: number;

    //Just store in client
    showAvatar: boolean;
    showState: boolean;
    classList: Array<string>;

    constructor() {
        this.reset();
    }

    reset() {
        this.id = "";
        this.userId = "";
        this.user = new User();
        this.content = "";
        this.state = MESSAGE_STATE.CREATED.id;
        this.time = new Date("2001-01-01");
        this.showAvatar = true;
        this.showState = false;
        this.classList = [];
        this.type = MESSAGE_TYPE.TEXT.id;
    }

    mappingFirebaseData(data) {
        if (data) {
            this.id = data.id ? data.id : "";
            this.userId = data.userId ? data.userId : "";
            this.content = data.content ? data.content : "";
            this.state = data.state ? data.state : MESSAGE_STATE.CREATED;
            this.time = data.time ? data.time : new Date("2001-01-01");
            this.type = data.type ? data.type : MESSAGE_TYPE.TEXT.id;
        }
    }
}