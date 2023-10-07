import { IiroseProtocol } from "../lib/iirose_protocol.js";
import { saApi } from "./api.js";

(async () =>
{
    let protocol = new IiroseProtocol();
    /** @type {WebSocket} */
    let ws = null;

    let lastRawData = "";
    protocol.event.raw.add(data =>
    {
        lastRawData = data;
    });
    Object.keys(protocol.event).forEach(key =>
    {
        if (key != "raw")
            protocol.event[key].add(e =>
            {
                console.log(`[iirose-protocol] event ${key}`, e, lastRawData);
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
                saApi.eventCallback.connectionStateChange("offline");
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

        saApi.eventCallback.connectionStateChange("connecting");

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
    });

    protocol.event.switchRoom.add(e =>
    {
        rebindWebSocket(userId, userPassword, e.roomId);
    });

    protocol.event.logined.add(() =>
    {
        saApi.eventCallback.connectionStateChange("online");
    });

    protocol.event.roomMessage.add(e =>
    {
        saApi.eventCallback.receiveMessage({
            senderId: e.senderId,
            messageContent: e.content,
            sessionId: "room-" + protocol.roomId
        });
    });


    protocol.event.selfRoomMessage.add(e =>
    {
        saApi.eventCallback.receiveMessage({
            senderId: protocol.userId,
            messageContent: e.content,
            sessionId: "room-" + protocol.roomId
        });
    });

    protocol.event.privateMessage.add(e =>
    {
        saApi.eventCallback.receiveMessage({
            senderId: e.senderId,
            messageContent: e.content,
            sessionId: "private-" + e.senderId
        });
    });

    protocol.event.globalChannelMessage.add(e =>
    {
        saApi.eventCallback.receiveMessage({
            senderId: e.senderId,
            messageContent: e.content,
            sessionId: "global"
        });
    });

    console.log("[iirose_SA_adapter] on load");

    saApi.eventCallback.initComplete();
    saApi.eventCallback.connectionStateChange("waitingForLogin");
})();