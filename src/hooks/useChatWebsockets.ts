import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "src/types/ChatMessage";
import { io, Socket } from "socket.io-client";
import { ConnectionStatus } from "../enums/ConnectionStatus";
import { WebSocketEvent } from "../enums/WebSocketEvent";
import { socketClient } from "../utils/socketClient";

interface ServerToClientEvents {
  [WebSocketEvent.ChatMsg]: (msg: string) => void;
  [WebSocketEvent.UserJoined]: (username: string) => void;
  [WebSocketEvent.UserLeft]: (username: string) => void;
}

interface ClientToServerEvents {
  [WebSocketEvent.ChatMsg]: (msg: string) => void;
  [WebSocketEvent.AddUser]: (username: string) => void;
}

type ConnectionStatusT = ConnectionStatus.Connected | ConnectionStatus.Disonnected;

function useChatWebsockets() {
  const [status, setStatus] = useState<ConnectionStatusT>(ConnectionStatus.Disonnected);
  const socket = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  >>(socketClient);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    setStatus(socket.current.connected ? ConnectionStatus.Connected : ConnectionStatus.Disonnected)
  }, [socket.current.connected]);

  const connectMsgHandler = () => {
    setStatus(ConnectionStatus.Connected);
    console.log("Connected - Client ID:", socket?.current?.id);
  }

  const disconnectMsgHandler = () => {
    setStatus(ConnectionStatus.Disonnected);
    console.log("Disonnected - Client ID:", socket?.current?.id);
  }

  const connectErrorMsgHandler = () => {
    setStatus(ConnectionStatus.Disonnected);
    console.error("Connect error - Client ID:", socket?.current?.id);
  }

  const chatMsgHandler = (data: string) => {
    console.log('Incoming message', data, socket?.current?.id);
    const message: ChatMessage = JSON.parse(data);
    setChatMessages((prevMessages) => [...prevMessages, message]);
  }

  const connect = () => {
    socket.current = io("http://localhost:9000");
    socket.current.on("connect", connectMsgHandler);
    socket.current.on("disconnect", disconnectMsgHandler);
    socket.current.on("connect_error", connectErrorMsgHandler);
    socket.current.on(WebSocketEvent.ChatMsg, chatMsgHandler);
  };

  const disconnect = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current.off(WebSocketEvent.ChatMsg, chatMsgHandler);
      socket.current.off("disconnect", disconnectMsgHandler);
      socket.current.off("connect_error", connectErrorMsgHandler);
      socket.current.off("connect", connectMsgHandler);
    }
  };

  const sendUserMessage = (user: string, message: string) => {
    if (socket.current?.connected) {
      console.log(`${user} => ${message}`);
      const userMessage: ChatMessage = {
        id: window.crypto.randomUUID(),
        user,
        message,
      };
      socket.current.emit(WebSocketEvent.ChatMsg, JSON.stringify(userMessage));
    }
  };

  return { connect, disconnect, sendUserMessage, chatMessages, status };
}

export default useChatWebsockets;
