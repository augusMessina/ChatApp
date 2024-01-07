import styled from "@emotion/styled";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { FC, useEffect, useState } from "react";
import ChatContainer from "@/components/ChatContainer";
import { Notif, OutgoingRequest } from "../types/notif";
import { io } from "socket.io-client";
import { signOut } from "next-auth/react";

const socket = io("ws://localhost:8080");

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user?.email) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (!session?.user?.name || session.user.name === "default_username") {
    return {
      redirect: {
        destination: "/userData",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
};

type HomeProps = {
  user: {
    email: string;
    username: string;
    id: string;
    chats: { id: string; chatname: string }[];
    friendList: { friendId: string; friendName: string }[];
    mailbox: Notif[];
    outgoingRequests: OutgoingRequest[];
    language: string;
  };
};

const Home: FC<HomeProps> = ({ user }) => {
  const [chats, setChats] = useState(user.chats);
  const [mailbox, setMailbox] = useState(user.mailbox);
  const [friendList, setFriendList] = useState(user.friendList);
  const [outgoingRequests, setOutgoingRequests] = useState(
    user.outgoingRequests
  );

  useEffect(() => {
    socket.emit("login", user.id);
    socket.on(
      "chat-new-message",
      (data: { chatId: string; chatname: string }) => {
        setChats((prevChats) => {
          if (prevChats.length > 1) {
            const newChats = [...prevChats]; // Create a shallow copy
            const index = newChats.findIndex((chat) => chat.id === data.chatId);

            if (index !== -1) {
              newChats.splice(index, 1);
            }
            newChats.unshift({ id: data.chatId, chatname: data.chatname });
            return newChats;
          }
          return prevChats;
        });
      }
    );
    socket.on("new-notif", (newNotif: Notif) => {
      setMailbox([newNotif, ...mailbox]);
    });
    socket.on(
      "accepted-fr",
      (data: { chat_id: string; friend_id: string; friend_name: string }) => {
        setChats([{ id: data.chat_id, chatname: data.friend_name }, ...chats]);
        setFriendList([
          ...friendList,
          { friendId: data.friend_id, friendName: data.friend_name },
        ]);
      }
    );
  }, [user, chats, friendList, mailbox]);

  return (
    <MainContainer>
      <button
        onClick={() => {
          signOut();
        }}
      >
        logout
      </button>
      <ChatContainer
        chats={chats}
        setChats={setChats}
        mailbox={mailbox}
        setMailbox={setMailbox}
        friendList={friendList}
        setFriendList={setFriendList}
        outgoingRequests={outgoingRequests}
        setOutgoingRequests={setOutgoingRequests}
        userId={user.id}
        userLanguage={user.language}
        socket={socket}
      ></ChatContainer>
    </MainContainer>
  );
};

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export default Home;
