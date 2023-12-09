import styled from "@emotion/styled";
import { FC, useState } from "react";
import ChatDisplay from "./ChatDisplay";
import { Socket } from "socket.io-client";

type ChatDisplayProps = {
  chats: { id: string; chatname: string }[];
  userId: string;
  userLanguage: string;
  socket: Socket;
};

const ChatConitainer: FC<ChatDisplayProps> = ({
  chats,
  userId,
  userLanguage,
  socket,
}) => {
  const [currentChat, setCurrentChat] = useState<string>(
    chats.length > 0 ? chats[0].id : ""
  );

  return (
    <ChatLayout>
      <Chats>
        {chats.map((chat) => (
          <p
            key={chat.id}
            onClick={() => {
              setCurrentChat(chat.id);
            }}
          >
            {chat.chatname}
          </p>
        ))}
      </Chats>
      <ChatDisplay
        chatId={currentChat}
        userId={userId}
        userLanguage={userLanguage}
        socket={socket}
      ></ChatDisplay>
    </ChatLayout>
  );
};

export default ChatConitainer;

const ChatLayout = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
`;

const Chats = styled.div`
  max-width: 400px;
  flex: 1;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  padding: 8px;
`;
