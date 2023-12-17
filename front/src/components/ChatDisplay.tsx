import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import { Socket } from "socket.io-client";

type ChatDisplayProps = {
  chatId: string;
  userId: string;
  userLanguage: string;
  socket: Socket;
};

type Message = {
  id: string;
  author: {
    authorName: string;
    authorId: string;
  };
  timestamp: number;
  message: { language: string; content: string }[];
};

const ChatDisplay: FC<ChatDisplayProps> = ({
  chatId,
  userId,
  userLanguage,
  socket,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatname, setChatname] = useState<string>("");
  const [chetKey, setChatKey] = useState("");
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    socket.on("new-message", (newMessage: Message) => {
      setMessages([...messages, newMessage]);
    });
  }, [messages, socket]);

  useEffect(() => {
    const getChatData = async (chatId: string) => {
      const res = await fetch("http://localhost:8080/getChatData", {
        method: "POST",
        body: JSON.stringify({
          id: chatId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      setChatname(data.chatname);
      setMessages(data.messages);
      setChatKey(data.password ?? "");
    };

    socket.emit("join", chatId);
    getChatData(chatId);
  }, [chatId, socket]);

  return (
    <ChatDisplayContainer>
      <h2>{chatname}</h2>
      {chetKey && <h2>{chetKey}</h2>}
      <ChatMessages
        messages={messages}
        userId={userId}
        userLanguage={userLanguage}
      ></ChatMessages>
      <InputArea
        onSubmit={(e) => {
          e.preventDefault();
          socket.emit("new-message", {
            chatId,
            message: [{ language: userLanguage, content: newMessage }],
            authorId: userId,
          });
          setNewMessage("");
        }}
      >
        <input
          onChange={(e) => {
            setNewMessage(e.target.value);
          }}
          value={newMessage}
        ></input>
        <button type="submit">Send</button>
      </InputArea>
    </ChatDisplayContainer>
  );
};

export default ChatDisplay;

const ChatDisplayContainer = styled.div`
  flex: 1;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 8px;
  gap: 16px;
`;

const InputArea = styled.form`
  display: flex;
  justify-content: center;
  width: 100%;

  input {
    flex: 1;
    padding: 16px 8px;
  }
`;
