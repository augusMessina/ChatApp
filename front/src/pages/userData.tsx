import styled from "@emotion/styled";
import { FC, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session: session,
      userId: session.user.id,
      isFirstTime:
        !session.user.name ||
        session.user.name === "default_username" ||
        !session.user.language ||
        session.user.language === "no_language",
    },
  };
};

const UserDataPage: FC<{
  session: Session;
  userId: string;
  isFirstTime: boolean;
}> = ({ userId, isFirstTime }) => {
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("");

  const { update, data: session } = useSession();

  const router = useRouter();

  const setUserdata = async () => {
    const res = await fetch("http://localhost:8080/setUserData", {
      method: "POST",
      body: JSON.stringify({ username, language, id: userId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      await update({
        ...session,
        user: {
          ...session?.user,
          name: username,
        },
      });

      router.replace("/");
    }
  };

  return (
    <MainContainer>
      {isFirstTime && (
        <button
          style={{ marginRight: "24px" }}
          onClick={() => {
            signOut();
          }}
        >
          Cancel
        </button>
      )}
      <FormContainer>
        <input
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <input
          placeholder="language"
          onChange={(e) => setLanguage(e.target.value)}
        ></input>
        <button
          onClick={async () => {
            await setUserdata();
          }}
          type="submit"
        >
          Set values
        </button>
      </FormContainer>
    </MainContainer>
  );
};

export default UserDataPage;

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
