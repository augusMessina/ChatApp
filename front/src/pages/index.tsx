import styled from "@emotion/styled";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { FC, useEffect, useState } from "react";
import ChatContainer from "@/components/ChatContainer";
import { Notif } from "../types/notif";
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
    language: string;
  };
};

const Home: FC<HomeProps> = ({ user }) => {
  const [chats, setChats] = useState(user.chats);

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
