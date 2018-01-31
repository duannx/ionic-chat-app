export const LONG_TIME_AGO = new Date("2001-01-01T16:20:00");

export const FIREBASE_CONST = {
    DOCUMENT_CHANGE_TYPE: {
        ADD: "added",
        MODIFY: "modified",
        REMOVE: "removed"
    }
}

export const MESSAGE_STATE = {
    CREATED: {
        id: 1,
        state: "created"
    },
    SENDED: {
        id: 2,
        state: "sended"
    },
    SEEN: {
        id: 3,
        state: "seen"
    }
}

export const MESSAGE_TYPE = {
    TEXT: {
        id: 1,
        type: "Text message"
    },
    IMAGE: {
        id: 2,
        type: "Image message"
    },
    SYSTEM: {
        id: 3,
        type: "SYSTEM message"
    },
}

export const FIREBASE_PATH = {
    CONVERSATION: "conversations",
    MESSAGE: "messages",
    USER: "users",
    COUNTER: "counters",
    SHARD: "shards",
    NUM_SHARD: "num_shards"
}