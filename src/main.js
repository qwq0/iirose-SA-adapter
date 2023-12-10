import { IiroseProtocol } from "../lib/iirose_protocol.js";
import { saApi } from "./api.js";

/**
 * @typedef {import("../lib/chatService.d.ts").apiEventMap} saEventMap
 */

(async () =>
{
    let protocol = new IiroseProtocol();
    /** @type {WebSocket} */
    let ws = null;

    let lastRawData = "";
    protocol.event.raw.add(data =>
    {
        console.log(`[iirose-protocol] raw`, [data]);
    });
    Object.keys(protocol.event).forEach(key =>
    {
        if (key != "raw")
            protocol.event[key].add(e =>
            {
                console.log(`[iirose-protocol] event ${key}`, e);
            });
    });

    /**
     * @type {number | NodeJS.Timeout | null}
     */
    let reconnectingTimeoutId = null;

    /**
     * @param {string} userId
     * @param {string} password
     * @param {string} roomId
     */
    function rebindWebSocket(userId, password, roomId)
    {
        if (reconnectingTimeoutId != null)
        {
            // @ts-ignore
            clearTimeout(reconnectingTimeoutId);
            reconnectingTimeoutId = null;
        }
        if (ws)
            ws.close();

        ws = new WebSocket("wss://m.iirose.com:8778/");
        ws.binaryType = "arraybuffer";

        protocol.sendRaw.removeAll();
        protocol.sendRaw.add(data =>
        {
            ws.send(data);
        });

        ws.addEventListener("message", e =>
        {
            protocol.receiveRaw(e.data);
        });

        ws.addEventListener("error", e =>
        {
            (/** @type {WebSocket} */(e.target)).close();
        });

        ws.addEventListener("close", e =>
        {
            if (ws == e.target)
            {
                saApi.eventCallback.connectionStateChange({ state: "offline" });
                reconnectingTimeoutId = setTimeout(() =>
                {
                    reconnectingTimeoutId = null;
                    if (ws.readyState == WebSocket.CLOSED || ws.readyState == WebSocket.CLOSING)
                    {
                        console.log("[iirose_SA_adapter] reconnecting");
                        rebindWebSocket(userId, password, roomId);
                    }
                }, 10 * 1000);
            }
        });

        saApi.eventCallback.connectionStateChange({ state: "connecting" });

        ws.addEventListener("open", e =>
        {
            protocol.login(userId, password, roomId);
        });
    }

    let userId = "";
    let userPassword = "";

    saApi.setEventListener("userlogin", async e =>
    {
        userId = e.userId;
        userPassword = e.password;
        rebindWebSocket(e.userId, e.password, "");
        return /** @type {"succeed"} */("succeed");
    });

    saApi.setEventListener("sendTextMessage", async e =>
    {
        let sessionIdPart = e.sessionId.split("-");
        switch (sessionIdPart[0])
        {
            case "room": {
                if (sessionIdPart[1] == protocol.roomId)
                {
                    protocol.operate.sendRoomMessage(e.messageContent);
                    return "succeed";
                }
                else
                    return "fail";
            }
            case "private": {
                let targetUid = sessionIdPart[1];
                protocol.operate.sendPrivateMessage(targetUid, e.messageContent);
                saApi.eventCallback.receiveMessage({
                    senderId: protocol.userId,
                    messageContent: e.messageContent,
                    sessionId: e.sessionId
                });
                return "succeed";
            }
            case "global": {
                protocol.operate.sendGlobalChannelMessage(e.messageContent);
                return "succeed";
            }
            default:
                return "fail";
        }
    });

    protocol.event.switchRoom.add(e =>
    {
        rebindWebSocket(userId, userPassword, e.roomId);
    });

    protocol.event.logined.add(() =>
    {
        saApi.eventCallback.connectionStateChange({ state: "online" });
    });

    protocol.event.roomMessage.add(e =>
    { // 房间内别人发送的消息
        saApi.eventCallback.receiveMessage({
            senderId: e.senderId,
            messageContent: e.content,
            sessionId: "room-" + protocol.roomId,
            displayInfo: {
                senderName: e.senderName,
                senderAvatar: (e.senderAvatar.startsWith("https://") || e.senderAvatar.startsWith("http://") ? e.senderAvatar : undefined),
                sessionName: `房间 - ${protocol.roomId}`
            }
        });
    });


    protocol.event.selfRoomMessage.add(e =>
    { // 房间内自己发送的消息
        saApi.eventCallback.receiveMessage({
            senderId: protocol.userId,
            messageContent: e.content,
            sessionId: "room-" + protocol.roomId,
            displayInfo: {
                senderName: protocol.userName,
                sessionName: `房间 - ${protocol.roomId}`
            }
        });
    });

    protocol.event.privateMessage.add(e =>
    { // 私聊消息
        let avatar = (e.senderAvatar.startsWith("https://") || e.senderAvatar.startsWith("http://") ? e.senderAvatar : undefined);
        saApi.eventCallback.receiveMessage({
            senderId: e.senderId,
            messageContent: e.content,
            sessionId: "private-" + e.senderId,
            displayInfo: {
                senderName: e.senderName,
                senderAvatar: avatar,
                sessionName: `私聊 - ${e.senderName}`,
                sessionAvatar: avatar,
            }
        });
    });

    protocol.event.selfSendPrivateMessage.add(e =>
    { // 自己其他设备发送的私聊消息
        saApi.eventCallback.receiveMessage({
            senderId: protocol.userId,
            messageContent: e.content,
            sessionId: "private-" + e.targetId,
            displayInfo: {
                senderName: protocol.userName,
                sessionName: `私聊 - ${e.targetName}`,
                sessionAvatar: (e.targetAvatar.startsWith("https://") || e.targetAvatar.startsWith("http://") ? e.targetAvatar : undefined),
            }
        });
    });

    protocol.event.globalChannelMessage.add(e =>
    { // 全局频道消息
        saApi.eventCallback.receiveMessage({
            senderId: e.senderId,
            messageContent: e.content,
            sessionId: "global",
            displayInfo: {
                senderName: e.senderName,
                sessionName: "全局频道 (弹幕)"
            }
        });
    });

    console.log("[iirose_SA_adapter] on load");

    saApi.eventCallback.initComplete();
    saApi.eventCallback.connectionStateChange({ state: "waitingForLogin" });
})();