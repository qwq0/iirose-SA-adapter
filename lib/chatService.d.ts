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
        connectionStateChange(
            e: {
                state: "online" | "offline" | "connecting" | "waitingForLogin";
            }
        ): Promise<void>;

        /**
         * 收到消息
         */
        receiveMessage(
            e: {
                sessionId: string;
                senderId: string;
                messageContent: string;
                messageId?: string;
                displayInfo?: {
                    senderName?: string;
                    senderAvatar?: string;
                    sessionName?: string;
                    sessionAvatar?: string;
                };
            }
        ): Promise<void>;

        /**
         * 收到离线消息
         */
        receiveOfflineMessage(
            e: {
                sessionId: string;
                senderId: string;
                sendingTime: number;
                messageContent: string;
                messageId?: string;
                displayInfo?: {
                    senderName?: string;
                    senderAvatar?: string;
                    sessionName?: string;
                    sessionAvatar?: string;
                };
            }
        ): Promise<void>;

        /**
         * 登录指纹改变
         * 将在下次登录时传递给聊天服务
         */
        loginFingerprintChange(
            e: {
                /**
                 * 为null表示清空指纹
                 */
                fingerprint: string | null;
                /**
                 * 为true表示登录时无需密码
                 */
                justFingerprint?: boolean;
            }
        ): Promise<void>;
    },


    setEventListener<K extends keyof apiEventMap>(
        eventName: K,
        callback: (event: apiEventMap[K]["param"]) => Promise<apiEventMap[K]["ret"]> | apiEventMap[K]["ret"]
    ): Promise<void>;
};

export interface apiEventMap
{
    /**
     * 用户尝试登录
     */
    userlogin: {
        param: {
            userId: string,
            password: string | null,
            fingerprint?: string,
        };
        ret: "succeed" | "fail";
    },

    /**
     * 用户尝试发送文本消息
     * 应当返回发送成功或者失败
     * 返回当前消息的id
     */
    sendTextMessage: {
        param: {
            sessionId: string,
            messageContent: string,
        };
        ret: "succeed" | "fail";
    },
}