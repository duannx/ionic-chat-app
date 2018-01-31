import { MESSAGE_STATE } from "./chat-constant";

export const TEST_USER_CREDENTIAL = [
    {
        uid: "222",
        displayName: "Shigeo Tokuda",
        email: "tokuda@gmail.com",
        phoneNumber: "",
        photoUrl: "https://s3-ap-southeast-1.amazonaws.com/img.spiderum.com/sp-images/4a436ef091de11e7988bd356390290a7.jpg"
    },
    {
        uid: "111",
        displayName: "Mia Khalifa",
        email: "mia@gmail.com",
        phoneNumber: "",
        photoUrl: "https://i.ytimg.com/vi/tBXHSAOxl7g/maxresdefault.jpg"
    }
];

export const TEST_USERS = [
    {
        id: "111",
        name: "Mia Khalifa",
        email: "mia@gmail.com",
        phone: "",
        avatar: "https://i.ytimg.com/vi/tBXHSAOxl7g/maxresdefault.jpg",
        thumbnail: "https://i.ytimg.com/vi/tBXHSAOxl7g/maxresdefault.jpg",
        isOnline: true,
        lastOnline: new Date(),
    }, {
        id: "222",
        name: "Shigeo Tokuda",
        email: "tokuda@gmail.com",
        phone: "",
        avatar: "https://s3-ap-southeast-1.amazonaws.com/img.spiderum.com/sp-images/4a436ef091de11e7988bd356390290a7.jpg",
        thumbnail: "https://s3-ap-southeast-1.amazonaws.com/img.spiderum.com/sp-images/4a436ef091de11e7988bd356390290a7.jpg",
        isOnline: true,
        lastOnline: new Date(),
    }
]

export const TEST_CONVERSATIONS = [
    {
        id: "111",
        name: "Mia and Tokuda",
        image: "",
        userIds: ["111", "222"],
        time: new Date()
    }
]

export const TEST_MESSAGES = {
    "111": [
        {
            id: 1,
            userId: "111",
            content: "Hello",
            state: MESSAGE_STATE.SEEN.id,
            time: new Date("2018-01-25T10:00:00"),
            order: 1
        },
        {
            id: 2,
            userId: "111",
            content: "I am Mia Khalifa, a village girl from Libian. Nice to meet you. :-*",
            state: MESSAGE_STATE.SEEN.id,
            time: new Date("2018-01-25T10:00:05"),
            order: 2
        },
        {
            id: 3,
            userId: "222",
            content: "Hi there!",
            state: MESSAGE_STATE.SEEN.id,
            time: new Date("2018-01-25T10:00:12"),
            order: 3
        },
        {
            id: 4,
            userId: "222",
            content: "How's it going?",
            state: MESSAGE_STATE.SEEN.id,
            time: new Date("2018-01-25T10:00:15"),
            order: 4
        },
        {
            id: 5,
            userId: "222",
            content: "Send nudes please!",
            state: MESSAGE_STATE.SENDED.id,
            time: new Date("2018-01-25T10:00:20"),
            order: 5
        },
        {
            id: 6,
            userId: "111",
            content: ":-)",
            state: MESSAGE_STATE.SENDED.id,
            time: new Date("2018-01-25T10:01:00"),
            order: 6
        },
        {
            id: 7,
            userId: "222",
            content: "(ɔ◔‿◔)ɔ ♥",
            state: MESSAGE_STATE.SEEN.id,
            time: new Date("2018-01-25T10:02:00"),
            order: 7
        }
    ]
}