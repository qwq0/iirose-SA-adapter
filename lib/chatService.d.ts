/*
    此文件是chatService(聊天服务)中可用的接口
*/

export interface api
{
    /**
     * 当聊天服务出现对应事件时
     * 应当调用这些接口
     */
    eventCallback: {
        /**
         * 初始化完成
         * 这意味着用户可以发送消息
         * 操作队列中的操作将被依次发送到聊天服务中
         */
        initComplete(): Promise<void>;

        /**
         * 连接状态改变
         * 调用此方法将改变显示的连接状态
         */
        connectionStateChange(state: "online" | "offline" | "connecting" | "waitingForLogin"): Promise<void>;

        /**
         * 收到消息
         */
        receiveMessage(messageInfo: {
            sessionId: string,
            senderId: string,
            messageContent: string,
            messageId?: string,
        }): Promise<void>;

        /**
         * 收到离线消息
         */
        receiveOfflineMessage(messageInfo: {
            sessionId: string,
            senderId: string,
            sendingTime: number,
            messageContent: string,
            messageId?: string,
        }): Promise<void>;

        /**
         * 登录指纹改变
         * 将在下次登录时传递给聊天服务
         * @param fingerprint 为null表示清空指纹
         * @param justFingerprint 为true表示登录时无需密码
         */
        loginFingerprintChange(fingerprint: string | null, justFingerprint?: boolean): Promise<void>;
    },

    /**
     * 用户尝试登录
     */
    setEventListener(eventName: "userlogin",
        callback: (event: {
            userId: string,
            password: string | null,
            fingerprint?: string,
        }) => Promise<string | void>
    ): Promise<void>;

    /**
     * 用户尝试发送文本消息
     * 应当返回发送成功或者失败
     * 返回当前消息的id
     */
    setEventListener(eventName: "sendTextMessage",
        callback: (event: {
            sessionId: string,
            messageContent: string,
        }) => Promise<string | void>
    ): Promise<void>;
}