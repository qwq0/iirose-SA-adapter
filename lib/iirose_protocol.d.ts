/**
 * 事件处理器
 * 可以定多个事件响应函数
 * @template {*} T
 */
declare class EventHandler<T extends unknown> {
    /**
     * 回调列表
     * @type {Array<function(T): void>}
     */
    cbList: Array<(arg0: T) => void>;
    /**
     * 单次回调列表
     * @type {Array<function(T): void>}
     */
    onceCbList: Array<(arg0: T) => void>;
    /**
     * 添加响应函数
     * @param {function(T): void} cb
     */
    add(cb: (arg0: T) => void): void;
    /**
     * 添加单次响应函数
     * 触发一次事件后将不再响应
     * @param {function(T): void} cb
     */
    addOnce(cb: (arg0: T) => void): void;
    /**
     * 返回一个Primise
     * 下次响应时此primise将解决
     * @returns {Promise<T>}
     */
    oncePromise(): Promise<T>;
    /**
     * 移除响应函数
     * @param {function(T): void} cb
     */
    remove(cb: (arg0: T) => void): void;
    /**
     * 移除所有响应函数
     */
    removeAll(): void;
    /**
     * 触发事件
     * @param {T} e
     */
    trigger(e: T): void;
    /**
     * 存在监听器
     * @returns {boolean}
     */
    existListener(): boolean;
    #private;
}

declare const reverseStateTable$1: {
    n: string;
    "0": string;
    "1": string;
    "2": string;
    "3": string;
    "4": string;
    "5": string;
    "6": string;
    "7": string;
    "8": string;
    "9": string;
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
};

/**
 * @typedef {typeof import("../serverToClient/receiveMessage.js").reverseStateTable} reverseStateTable
 */
/**
 * 协议上下文的所有事件
 */
declare class ContextEvent {
    /**
     * 收到封包时触发
     * @type {EventHandler<string>}
     */
    raw: EventHandler<string>;
    /**
     * 已登录
     * @type {EventHandler<void>}
     */
    logined: EventHandler<void>;
    /**
     * 收到房间消息
     * @type {EventHandler<{
     *  senderId: string,
     *  senderName: string,
     *  content: string,
     *  messageId: string
     * }>}
     */
    roomMessage: EventHandler<{
        senderId: string;
        senderName: string;
        content: string;
        messageId: string;
    }>;
    /**
     * 收到自己发送的房间消息
     * @type {EventHandler<{
     *  content: string,
     *  messageId: string
     * }>}
     */
    selfRoomMessage: EventHandler<{
        content: string;
        messageId: string;
    }>;
    /**
     * 收到私聊消息
     * @type {EventHandler<{
     *  senderId: string,
     *  senderName: string,
     *  content: string,
     *  messageId: string
     * }>}
     */
    privateMessage: EventHandler<{
        senderId: string;
        senderName: string;
        content: string;
        messageId: string;
    }>;
    /**
     * 接受到自己发送给自己的私聊消息
     * @type {EventHandler<{
     *  content: string,
     *  messageId: string
     * }>}
     */
    selfPrivateMessage: EventHandler<{
        content: string;
        messageId: string;
    }>;
    /**
     * 收到全局频道(弹幕)消息
     * @type {EventHandler<{
     *  senderId: string,
     *  senderName: string,
     *  content: string
     * }>}
     */
    globalChannelMessage: EventHandler<{
        senderId: string;
        senderName: string;
        content: string;
    }>;
    /**
     * 需要切换房间
     * @type {EventHandler<{
     *  roomId: string,
     *  roomName: string
     * }>}
     */
    switchRoom: EventHandler<{
        roomId: string;
        roomName: string;
    }>;
    /**
     * 房间里的用户动作(进出房间)
     * @type {EventHandler<{
     *  targetUserId: string,
     *  targetUserName: string,
     *  action: "arrive" | "leave",
     *  leaveForRoom?: {
     *      roomId: string
     *  }
     * }>}
     */
    userInRoomAction: EventHandler<{
        targetUserId: string;
        targetUserName: string;
        action: "arrive" | "leave";
        leaveForRoom?: {
            roomId: string;
        };
    }>;
    /**
     * 房间里的用户切换状态
     * @type {EventHandler<{
     *  targetUserId: string,
     *  targetUserName: string,
     *  fromState: reverseStateTable[string],
     *  toState: reverseStateTable[string],
     * }>}
     */
    userInRoomSwitchState: EventHandler<{
        targetUserId: string;
        targetUserName: string;
        fromState: reverseStateTable[string];
        toState: reverseStateTable[string];
    }>;
    /**
     * 房间里的用户撤回消息
     * @type {EventHandler<{
     *  senderUid: string,
     *  messageId: string
     * }>}
     */
    withdrawRoomMessage: EventHandler<{
        senderUid: string;
        messageId: string;
    }>;
    /**
     * 私聊中撤回消息
     * @type {EventHandler<{
     *  sessionUid: string,
     *  senderUid: string,
     *  messageId: string
     * }>}
     */
    withdrawPrivateMessage: EventHandler<{
        sessionUid: string;
        senderUid: string;
        messageId: string;
    }>;
    /**
     * 收到保活包时
     * @type {EventHandler<void>}
     */
    alive: EventHandler<void>;
}
type reverseStateTable = typeof reverseStateTable$1;

/**
 * 协议上下文
 */
declare class IiroseProtocol {
    /**
     * 当前协议登录的账号的id
     */
    userId: string;
    /**
     * 当前协议登录的账号的名称
     */
    userName: string;
    /**
     * 当前所在房间id
     */
    roomId: string;
    /**
     * 当前已登录
     */
    logined: boolean;
    /**
     * 选项
     */
    option: {
        /**
         * 活跃模式
         * @type {boolean}
         */
        activeMode: boolean;
    };
    /**
     * 协议向服务器发送数据包
     * @type {EventHandler<Uint8Array>}
     */
    sendRaw: EventHandler<Uint8Array>;
    /**
     * 所有事件
     */
    event: ContextEvent;
    /**
     * 所有操作
     * @template F
     * @typedef {F extends (arg0: any, ...rest: infer R) => any ? R : never} ParametersExceptFirst<F>
     * @type {{[x in (keyof typeof operateList)]: (...arg: ParametersExceptFirst<typeof operateList[x]>) => ReturnType<operateList[x]>}}
     */
    operate: {
        sendRoomMessage: (content: string, messageColor?: string | undefined) => void;
        sendPrivateMessage: (targetId: string, content: string, messageColor?: string | undefined) => void;
        demandMedia: (type: "video" | "music", info: {
            mediaUrl: string;
            durationInSeconds: number;
            title?: string;
            singerName?: string;
            coverUrl?: string;
            color?: string;
            lyricsUrl?: string;
        }, messageColor?: string | undefined) => void;
        buyRoseStock: (quantity: number) => void;
        sellRoseStock: (quantity: number) => void;
        getRoseStockInfo: () => Promise<{
            totalStockQuantity: number;
            totalStockValue: number;
            price: number;
            holdingQuantity: number;
            accountBalance: number;
        }>;
        throwDice: (targetBot: "艾洛" | "艾莉" | "艾瑞" | "艾薇" | "艾泽" | "艾花" | "艾A" | "艾B") => void;
        switchState: (state: "无状态" | "会话中" | "忙碌中" | "离开中" | "就餐中" | "通话中" | "移动中" | "如厕中" | "沐浴中" | "睡觉中" | "上课中" | "作业中" | "游戏中" | "看剧中" | "挂机中" | "自闭中" | "请撩我") => void;
    };
    /**
     * 登录账号
     * 确保调用前已经绑定双向流到sendRaw和receiveRaw
     * @param {string} username
     * @param {string} password
     * @param {string} roomId
     * @param {Object} [customInfo]
     */
    login(username: string, password: string, roomId: string, customInfo?: any): Promise<void>;
    /**
     * 发送数据包
     * @param {string} data
     */
    sendPacket(data: string): void;
    /**
     * 收到数据包
     * 未解压或其他处理
     * @param {Uint8Array | Buffer | ArrayBuffer} rawData
     */
    receiveRaw(rawData: Uint8Array | Buffer | ArrayBuffer): Promise<void>;
    #private;
}

export { IiroseProtocol };
