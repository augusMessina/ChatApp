import styled from "@emotion/styled";
import { FC, useState } from "react";
import ChatDisplay from "./ChatDisplay";
import { Socket } from "socket.io-client";
import JoinChatModal from "./JoinChatModal";
import CreateChatModal from "./CreateChatModa";

type ChatDisplayProps = {
  chats: { id: string; chatname: string }[];
  setChats: (chats: { id: string; chatname: string }[]) => void;
  userId: string;
  userLanguage: string;
  socket: Socket;
};

const ChatConitainer: FC<ChatDisplayProps> = ({
  chats,
  setChats,
  userId,
  userLanguage,
  socket,
}) => {
  const [currentChat, setCurrentChat] = useState<string>(
    chats.length > 0 ? chats[0].id : ""
  );

  const [joinChatOpen, setJoinChatOpen] = useState(false);
  const [createChatOpen, setCreateChatOpen] = useState(false);

  const closeJoinChat = () => {
    setJoinChatOpen(false);
  };

  const closeCreateChat = () => {
    setCreateChatOpen(false);
  };

  return (
    <ChatLayout>
      <JoinChatModal
        isOpen={joinChatOpen}
        close={closeJoinChat}
        userId={userId}
        chats={chats}
        setChats={setChats}
      ></JoinChatModal>
      <CreateChatModal
        isOpen={createChatOpen}
        close={closeCreateChat}
        userId={userId}
        chats={chats}
        setChats={setChats}
      ></CreateChatModal>
      <LeftMenu>
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
        <ToolBar>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setJoinChatOpen(true);
            }}
          >
            Join
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCreateChatOpen(true);
            }}
          >
            Create
          </button>
          <button>Options</button>
        </ToolBar>
      </LeftMenu>
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

const LeftMenu = styled.div`
  max-width: 400px;
  flex: 1;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px;
  gap: 8px;
`;

const Chats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  gap: 8px;
  flex: 1;
`;

const ToolBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: 8px;
`;
