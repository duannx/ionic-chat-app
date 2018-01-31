import { LONG_TIME_AGO } from "../chat-constant";

export class User {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    thumbnail: string;
    isOnline: boolean;
    lastOnline: Date;
    constructor() {
        this.reset();
    }
    reset() {
        this.id = "";
        this.name = "";
        this.email = "";
        this.phone = "";
        this.avatar = "";
        this.thumbnail = "";
        this.isOnline = false;
        this.lastOnline = LONG_TIME_AGO;
    }

    mappingFirebaseData(data) {
        if (data) {
            this.id = data.id ? data.id : "";
            this.name = data.name ? data.name : "";
            this.email = data.email ? data.email : "";
            this.phone = data.phone ? data.phone : "";
            this.avatar = data.avatar ? data.avatar : "";
            this.thumbnail = data.thumbnail ? data.thumbnail : this.avatar;
            this.isOnline = data.isOnline ? data.isOnline : false;
            this.lastOnline = data.lastOnline ? data.lastOnline : LONG_TIME_AGO;
        }
    }
}
