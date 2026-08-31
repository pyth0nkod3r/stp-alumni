// lib/hooks/useWebSocket.js
"use client";

import useAuthStore from "@/lib/store/useAuthStore";
import usePresenceStore from "@/lib/store/usePresenceStore";
import { useEffect, useRef, useCallback, useState } from "react";

export function useWebSocket({ onNewMessage, onTyping, onReadReceipt, onPresence } = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const { token } = useAuthStore();

     const onNewMessageRef = useRef(onNewMessage);
    const onTypingRef = useRef(onTyping);
    const onReadReceiptRef = useRef(onReadReceipt);
    const onPresenceRef = useRef(onPresence);

    // Keep refs in sync on every render without triggering useEffect loop
    onNewMessageRef.current = onNewMessage;
    onTypingRef.current = onTyping;
    onReadReceiptRef.current = onReadReceipt;
    onPresenceRef.current = onPresence;


    const retryCountRef = useRef(0);

    const connect = useCallback(() => {
        if (!token) {
            return;
        }

        try {
            const wsUrl =
                process.env.NEXT_PUBLIC_WS_URL ||
                (process.env.NEXT_PUBLIC_API_URL
                    ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, "ws").replace(/\/api\/?$/, "/ws")
                    : "wss://api.blazingtorrent.org/ws");

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                retryCountRef.current = 0;
                // Authenticate immediately after connection
                try {
                    ws.send(JSON.stringify({ type: "auth", token }));
                } catch {
                    // Ignore send error
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    switch (data.type) {
                        case "authenticated":
                            setIsConnected(true);
                            break;
                        case "new_message":
                            onNewMessageRef.current?.(data);
                            break;
                        case "typing":
                            onTypingRef.current?.(data);
                            break;
                        case "read_receipt":
                            onReadReceiptRef.current?.(data);
                            break;
                        case "presence":
                            usePresenceStore.getState().setPresence(data.userId, data.status);
                            onPresenceRef.current?.(data);
                            break;
                        case "connected":
                            break;
                        case "message_sent":
                            break;
                        default:
                            break;
                    }
                } catch {
                    // Ignore parse error
                }
            };

            ws.onerror = () => {
                // Silently handle error — fall back to polling & REST
            };

            ws.onclose = () => {
                setIsConnected(false);
                if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
                
                // Exponential backoff up to 60s
                retryCountRef.current = Math.min(retryCountRef.current + 1, 6);
                const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 60000);
                reconnectTimeoutRef.current = setTimeout(connect, delay);
            };
            socketRef.current = ws;
        } catch {
            // Silently fallback
        }
    }, [token]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [connect]);

    const sendMessage = useCallback((conversationId, content) => {
        if (!conversationId || !content) {
            console.error("Missing conversationId or content");
            return false;
        }

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "message",
                conversationId,
                content
            }));
            return true;
        }
        console.warn("WebSocket not open, message not sent");
        return false;
    }, []);

    const sendTyping = useCallback((conversationId) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "typing",
                conversationId
            }));
            return true;
        }
        return false;
    }, []);

    const sendReadReceipt = useCallback((conversationId) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "read",
                conversationId
            }));
            return true;
        }
        return false;
    }, []);

    return {
        isConnected,
        sendMessage,
        sendTyping,
        sendReadReceipt
    };
}