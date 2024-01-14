import styled from "@emotion/styled";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import ChatDisplay from "./ChatDisplay";
import { Socket } from "socket.io-client";
import JoinChatModal from "./JoinChatModal";
import CreateChatModal from "./CreateChatModal";
import SearchUserModal from "./SearchUserModal";
import { Notif, OutgoingRequest } from "@/types/notif";
import MailboxModal from "./MailboxModal";

import { colors } from "@/utils/colors";
import ChangeValuesModal from "./ChangeValuesModal";
import { breakpoints } from "@/utils/breakpoints";
import LeftMenu from "./LeftMenu";

type ChatDisplayProps = {
  chats: { id: string; chatname: string; unreads: number }[];
  setChats: Dispatch<
    SetStateAction<
      {
        id: string;
        chatname: string;
        unreads: number;
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
  username: string;
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
  username,
  socket,
}) => {
  const [currentChat, setCurrentChat] = useState<string>(
    chats.length > 0 ? chats[0].id : ""
  );

  const [currentAnimation, setCurrentAnimation] = useState({
    animationName: "",
    animationEasingFunction: "",
    animationDuration: "",
    animationFillMode: "",
  });

  const [joinChatOpen, setJoinChatOpen] = useState(false);
  const [createChatOpen, setCreateChatOpen] = useState(false);
  const [searchUserOpen, setSearchUserOpen] = useState(false);
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [changeValuesOpen, setChangeValuesOpen] = useState(false);

  useEffect(() => {
    socket.on("unfriended", (data: { friendId: string; chatId: string }) => {
      setChats((prev) => prev.filter((chat) => chat.id !== data.chatId));
      setFriendList((prev) =>
        prev.filter((friend) => friend.friendId !== data.friendId)
      );
      socket.emit("leave", currentChat);
      setCurrentChat("");
    });
    socket.on(
      "chat-new-message",
      (data: { chatId: string; chatname: string }) => {
        setChats((prevChats) => {
          if (prevChats.length > 1) {
            const newChats = [...prevChats]; // Create a shallow copy
            const index = newChats.findIndex((chat) => chat.id === data.chatId);
            const chatUnreads = newChats[index].unreads;
            if (index !== -1) {
              newChats.splice(index, 1);
            }

            newChats.unshift({
              id: data.chatId,
              chatname: data.chatname,
              unreads: data.chatId !== currentChat ? chatUnreads + 1 : 0,
            });
            return newChats;
          }
          return prevChats;
        });
        if (data.chatId === currentChat) {
          socket.emit("read-chat", { userId, chatId: currentChat });
        }
      }
    );
  });

  useEffect(() => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChat ? { ...chat, unreads: 0 } : chat
      )
    );
  }, [currentChat, setChats]);

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
      <ChatRelative>
        <LeftMenu
          chats={chats}
          currentChat={currentChat}
          subModalOpen={
            joinChatOpen ||
            createChatOpen ||
            searchUserOpen ||
            mailboxOpen ||
            changeValuesOpen
          }
          close={() => {
            setCurrentAnimation({
              animationName: "slide-out",
              animationEasingFunction: "ease",
              animationDuration: ".3s",
              animationFillMode: "forwards",
            });
          }}
          currentAnimation={currentAnimation}
          moreOptionsOpen={moreOptionsOpen}
          setChangeValuesOpen={setChangeValuesOpen}
          setCreateChatOpen={setCreateChatOpen}
          setCurrentChat={setCurrentChat}
          setJoinChatOpen={setJoinChatOpen}
          setMailboxOpen={setMailboxOpen}
          setMoreOptionsOpen={setMoreOptionsOpen}
          setSearchUserOpen={setSearchUserOpen}
          socket={socket}
        ></LeftMenu>

        <ChatDisplay
          chatId={currentChat}
          setChatId={setCurrentChat}
          setChats={setChats}
          setFriendList={setFriendList}
          userId={userId}
          userLanguage={userLanguage}
          socket={socket}
          friendList={friendList}
          outgoingRequests={outgoingRequests}
          setOutgoingRequests={setOutgoingRequests}
          openLeftMenu={() => {
            setCurrentAnimation({
              animationName: "slide-in",
              animationEasingFunction: "ease",
              animationDuration: ".3s",
              animationFillMode: "forwards",
            });
          }}
        ></ChatDisplay>
      </ChatRelative>
      <JoinChatModal
        isOpen={joinChatOpen}
        close={closeJoinChat}
        userId={userId}
        chats={chats}
        setChats={setChats}
        socket={socket}
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
      <ChangeValuesModal
        isOpen={changeValuesOpen}
        close={() => setChangeValuesOpen(false)}
        userId={userId}
        language={userLanguage}
        username={username}
        socket={socket}
      ></ChangeValuesModal>
    </ChatLayout>
  );
};

export default ChatConitainer;

const ChatLayout = styled.div`
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    padding: 0;
  }
`;

const ChatRelative = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 16px;
`;
