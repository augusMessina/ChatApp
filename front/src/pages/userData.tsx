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
import { checkUsernameValid } from "@/utils/checkUsernameValid";
import { breakpoints } from "@/utils/breakpoints";
import { TailSpin } from "react-loader-spinner";

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
      userEmail: session.user.email,
    },
  };
};

const UserDataPage: FC<{
  session: Session;
  userId: string;
  userEmail: string;
  isFirstTime: boolean;
}> = ({ userId, userEmail }) => {
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("");
  const [showError, setShowError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { update, data: session } = useSession();

  const router = useRouter();

  const setUserdata = async () => {
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_BACK_IP}:8080/setUserData`,
      {
        method: "POST",
        body: JSON.stringify({ username, language, id: userId }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.message && data.message === "username already taken") {
        setShowError("Username already in use");
        return;
      }
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
    <PageContainer>
      {isLoading ? (
        <LoaderContainer>
          <TailSpin color={colors.mainWhite}></TailSpin>
        </LoaderContainer>
      ) : (
        <MainContainer>
          <TitleContainer>
            <Title>
              Looks like it's your <br></br> first time here, <br></br>{" "}
              {userEmail}
            </Title>
            <TitleMobile>
              Looks like it's your first time here, <br />
              {userEmail}
            </TitleMobile>
          </TitleContainer>
          <Separator></Separator>
          <LoginSection>
            <FormContainer>
              <LoginInput
                placeholder="Username"
                onChange={(e) => {
                  setUsername(e.target.value);
                  setShowError("");
                }}
              ></LoginInput>

              <CustomSelect
                defaultText="Language"
                items={languagesList}
                onChange={(item) => {
                  setLanguage(item);
                  setShowError("");
                }}
              ></CustomSelect>
              {showError && <Error>{showError}</Error>}

              <LoginButton
                onClick={async () => {
                  if (language !== "") {
                    const isValid = checkUsernameValid(username);
                    if (isValid === "valid") {
                      setIsLoading(true);
                      await setUserdata();
                      setIsLoading(false);
                    } else {
                      setShowError(isValid);
                    }
                  } else {
                    setShowError("Choose a language");
                  }
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
      )}
    </PageContainer>
  );
};

export default UserDataPage;

const PageContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const LoaderContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const MainContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 20px;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 64px;
    padding-right: 16px;
    padding-left: 16px;
    gap: 32px;
    box-sizing: border-box;
  }
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

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    display: none;
  }
`;

const TitleMobile = styled.h1`
  color: ${colors.mainWhite};
  margin: 0;
  font-size: 20px;
  text-align: center;
  display: none;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    display: inline;
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 400px;
  background: ${colors.darkText};

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    width: 90%;
    height: 1px;
  }
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
    outline: none;
    border: 1px solid ${colors.mainWhite};
    border-radius: 3px;
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;
    padding: 8px 4px;
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

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;
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

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;
  }
`;

const Error = styled.p`
  color: ${colors.red};
  margin: 8px;
  text-align: center;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;
  }
`;
