import styled from "@emotion/styled";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { FC, useEffect, useState } from "react";
import ChatContainer from "@/components/ChatContainer";
import { Notif, OutgoingRequest } from "../types/notif";
import { io } from "socket.io-client";

const socket = io(`ws://${process.env.NEXT_PUBLIC_BACK_IP}:8080`);

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
    name: string;
    id: string;
    chats: { id: string; chatname: string; unreads: number }[];
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

    socket.on("new-notif", (newNotif: Notif) => {
      setMailbox([newNotif, ...mailbox]);
    });
    socket.on(
      "accepted-fr",
      (data: { chat_id: string; friend_id: string; friend_name: string }) => {
        setChats([
          { id: data.chat_id, chatname: data.friend_name, unreads: 0 },
          ...chats,
        ]);
        setFriendList([
          ...friendList,
          { friendId: data.friend_id, friendName: data.friend_name },
        ]);
      }
    );
    socket.on(
      "friend-data-updated",
      (data: { friendId: string; friendName: string; chatId: string }) => {
        setFriendList(
          friendList.map((friend) => {
            if (friend.friendId === data.friendId) {
              return { ...friend, friendName: data.friendName };
            }
            return friend;
          })
        );

        setChats(
          chats.map((chat) => {
            if (chat.id === data.chatId) {
              return { ...chat, chatname: data.friendName };
            }
            return chat;
          })
        );
      }
    );
  }, [user, chats, friendList, mailbox]);

  return (
    <MainContainer>
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
        username={user.name}
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
