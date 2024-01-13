import styled from "@emotion/styled";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import ChatDisplay from "./ChatDisplay";
import { Socket } from "socket.io-client";
import JoinChatModal from "./JoinChatModal";
import CreateChatModal from "./CreateChatModal";
import SearchUserModal from "./SearchUserModal";
import { Notif, OutgoingRequest } from "@/types/notif";
import MailboxModal from "./MailboxModal";

import { FaPlus, FaUserPlus } from "react-icons/fa";
import { IoIosChatboxes, IoMdMail } from "react-icons/io";
import { TbDotsVertical } from "react-icons/tb";
import { colors } from "@/utils/colors";
import ScrollableDropdown from "./ScrollableDropdown";
import MoreOptionsDropdown from "./MoreOptionsDropdown";
import { languagesList } from "@/utils/languages";
import { SingletonRouter } from "next/router";
import ChangeValuesModal from "./ChangeValuesModal";

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
      <LeftMenu>
        <ToolBar>
          <TopBarButton
            onClick={(e) => {
              e.stopPropagation();
              setJoinChatOpen(true);
              setMoreOptionsOpen(false);
            }}
          >
            <IoIosChatboxes color={colors.mainWhite}></IoIosChatboxes>
          </TopBarButton>
          <TopBarButton
            onClick={(e) => {
              e.stopPropagation();
              setCreateChatOpen(true);
              setMoreOptionsOpen(false);
            }}
          >
            <FaPlus color={colors.mainWhite}></FaPlus>
          </TopBarButton>
          <TopBarButton
            onClick={(e) => {
              e.stopPropagation();
              setSearchUserOpen(true);
              setMoreOptionsOpen(false);
            }}
          >
            <FaUserPlus color={colors.mainWhite}></FaUserPlus>
          </TopBarButton>
          <TopBarButton
            onClick={(e) => {
              e.stopPropagation();
              setMailboxOpen(true);
              setMoreOptionsOpen(false);
            }}
          >
            <IoMdMail color={colors.mainWhite}></IoMdMail>
          </TopBarButton>
          <DropdownButtonContainer>
            <TopBarButton
              onClick={(e) => {
                e.stopPropagation();
                setMoreOptionsOpen(true);
              }}
            >
              <TbDotsVertical color={colors.mainWhite}></TbDotsVertical>
            </TopBarButton>
            <MoreOptionsDropdown
              isOpen={moreOptionsOpen}
              close={() => {
                setMoreOptionsOpen(false);
              }}
              openValuesModal={() => {
                setChangeValuesOpen(true);
              }}
            ></MoreOptionsDropdown>
          </DropdownButtonContainer>
        </ToolBar>
        <Separator></Separator>
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
              <p>{chat.chatname}</p>
              {chat.unreads > 0 && <UnreadAlert></UnreadAlert>}
            </Chat>
          ))}
        </Chats>
      </LeftMenu>
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
  border: 1px solid ${colors.lightHoverGray};
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
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

const Chat = styled.div<{ isSelected: boolean }>`
  ${(props) => (props.isSelected ? `background: ${colors.darkHoverGray};` : "")}
  color: ${colors.mainWhite};
  font-size: 17px;
  margin: 0;
  padding: 17px 10px;
  border: 1px solid transparent;
  border-radius: 3px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: 0.3s;
  p {
    margin: 0;
  }

  :hover {
    background: ${colors.darkHoverGray};
  }
`;

const ToolBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
`;

const TopBarButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  border: none;
  padding: 0;
  background: ${colors.darkHoverGray};
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }

  :hover {
    background: ${colors.lightHoverGray};
  }
`;

const Separator = styled.div`
  height: 1px;
  width: 100%;
  background: ${colors.lightHoverGray};
`;

const DropdownButtonContainer = styled.div`
  position: relative;
`;

const UnreadAlert = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${colors.blue};
  margin-right: 32px;
`;
