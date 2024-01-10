import styled from "@emotion/styled";
import { FC, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { languagesList } from "@/utils/languages";
import CustomSelect from "@/components/CustomSelect";
import { colors } from "@/utils/colors";

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
    },
  };
};

const UserDataPage: FC<{
  session: Session;
  userId: string;
  isFirstTime: boolean;
}> = ({ userId }) => {
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
      <TitleContainer>
        <Title>
          Looks like it's your <br></br> first time here
        </Title>
      </TitleContainer>
      <Separator></Separator>
      <LoginSection>
        <FormContainer>
          <LoginInput
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
          ></LoginInput>
          <CustomSelect
            defaultText="Language"
            items={languagesList}
            onChange={(item) => setLanguage(item)}
          ></CustomSelect>
          <LoginButton
            onClick={async () => {
              await setUserdata();
            }}
            type="submit"
          >
            Set values
          </LoginButton>
        </FormContainer>
        <SecondaryLoginButton
          onClick={() => {
            signOut();
          }}
        >
          Cancel
        </SecondaryLoginButton>
      </LoginSection>
    </MainContainer>
  );
};

export default UserDataPage;

const MainContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 20px;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
`;

const Title = styled.h1`
  color: ${colors.mainWhite};
  font-size: 40px;
  margin: 0;
`;

const Separator = styled.div`
  width: 1px;
  height: 400px;
  background: ${colors.darkText};
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const LoginSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 340px;
  gap: 20px;
  width: 100%;
`;

const LoginInput = styled.input`
  padding: 12px 20px;
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  color: ${colors.mainWhite};
  border-color: ${colors.mainWhite};
  border-style: solid;
  border-image: none;
  border-width: 1px;
  border-color: transparent;
  border-bottom: 1px solid ${colors.mainWhite};
  font-size: 16px;
  transition: 0.4s;

  :focus {
    border: 1px solid ${colors.mainWhite};
    border-radius: 3px;
  }
`;

const LoginButton = styled.button`
  padding: 12px 20px;
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border: 1px solid ${colors.mainWhite};
  color: ${colors.mainWhite};
  font-size: 16px;
  cursor: pointer;
  border-radius: 3px;
  transition: 0.3s;

  :hover {
    background: ${colors.lightHoverGray};
  }
`;

const SecondaryLoginButton = styled.button`
  padding: 12px 20px;
  width: 100%;
  box-sizing: border-box;
  background: ${colors.lightHoverGray};
  border: none;
  color: ${colors.mainWhite};
  font-size: 16px;
  cursor: pointer;
  border-radius: 3px;
  transition: 0.3s;

  :hover {
    background: ${colors.darkHoverGray};
  }
`;
