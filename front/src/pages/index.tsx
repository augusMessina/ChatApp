import styled from "@emotion/styled";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { FC } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  console.log("soy yo", session);
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
      email: session.user.email,
    },
  };
};

const Home: FC = () => {
  return <MainContainer>Hola</MainContainer>;
};

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export default Home;
