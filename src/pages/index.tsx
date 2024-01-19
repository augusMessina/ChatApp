import styled from "@emotion/styled";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { FC, useEffect, useState } from "react";
import ChatContainer from "@/components/ChatContainer";
import { Notif, OutgoingRequest } from "../types/notif";
import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Pusher from "pusher-js";
import Head from "next/head";

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
});

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

  return (
    <MainContainer>
      <Head>
        <title>{`Tradunite of ${user.name}`}</title>
      </Head>
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
        pusher={pusher}
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
