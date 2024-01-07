import styled from "@emotion/styled";
import { Dispatch, FC, SetStateAction, useState } from "react";
import ChatDisplay from "./ChatDisplay";
import { Socket } from "socket.io-client";
import JoinChatModal from "./JoinChatModal";
import CreateChatModal from "./CreateChatModal";
import SearchUserModal from "./SearchUserModal";
import { Notif, OutgoingRequest } from "@/types/notif";
import MailboxModal from "./MailboxModal";

type ChatDisplayProps = {
  chats: { id: string; chatname: string }[];
  setChats: Dispatch<
    SetStateAction<
      {
        id: string;
        chatname: string;
      }[]
    >
  >;
  mailbox: Notif[];
  setMailbox: Dispatch<SetStateAction<Notif[]>>;
  friendList: { friendId: string; friendName: string }[];
  setFriendList: Dispatch<
    SetStateAction<
      {
        friendId: string;
        friendName: string;
      }[]
    >
  >;
  outgoingRequests: OutgoingRequest[];
  setOutgoingRequests: (newReqs: OutgoingRequest[]) => void;
  userId: string;
  userLanguage: string;
  socket: Socket;
};

const ChatConitainer: FC<ChatDisplayProps> = ({
  chats,
  setChats,
  mailbox,
  setMailbox,
  friendList,
  setFriendList,
  outgoingRequests,
  setOutgoingRequests,
  userId,
  userLanguage,
  socket,
}) => {
  const [currentChat, setCurrentChat] = useState<string>(
    chats.length > 0 ? chats[0].id : ""
  );

  const [joinChatOpen, setJoinChatOpen] = useState(false);
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const [searchUserOpen, setSearchUserOpen] = useState(false);
  const [mailboxOpen, setMailboxOpen] = useState(false);

  const closeJoinChat = () => {
    setJoinChatOpen(false);
  };

  const closeCreateChat = () => {
    setCreateChatOpen(false);
  };

  const closeSearchUser = () => {
    setSearchUserOpen(false);
  };

  const closeMailbox = () => {
    setMailboxOpen(false);
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
      <SearchUserModal
        isOpen={searchUserOpen}
        close={closeSearchUser}
        userId={userId}
        outgoingRequests={outgoingRequests}
        setOutgoingRequests={setOutgoingRequests}
        mailbox={mailbox}
        socket={socket}
      ></SearchUserModal>
      <MailboxModal
        isOpen={mailboxOpen}
        close={closeMailbox}
        userId={userId}
        mailbox={mailbox}
        setMailbox={setMailbox}
        setChats={setChats}
        setFriendList={setFriendList}
        socket={socket}
      ></MailboxModal>
      <LeftMenu>
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSearchUserOpen(true);
            }}
          >
            Add
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMailboxOpen(true);
            }}
          >
            Mailbox
          </button>
          <button>Options</button>
        </ToolBar>
        <Chats>
          {chats.map((chat) => (
            <Chat
              key={chat.id}
              onClick={() => {
                socket.emit("leave", currentChat);
                setCurrentChat(chat.id);
              }}
              isSelected={currentChat === chat.id}
            >
              {chat.chatname}
            </Chat>
          ))}
        </Chats>
      </LeftMenu>
      <ChatDisplay
        chatId={currentChat}
        userId={userId}
        userLanguage={userLanguage}
        socket={socket}
        friendList={friendList}
        outgoingRequests={outgoingRequests}
        setOutgoingRequests={setOutgoingRequests}
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

const Chat = styled.p<{ isSelected: boolean }>`
  ${(props) => (props.isSelected ? "background: #fabada;" : "")}
`;

const ToolBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: 8px;
`;
