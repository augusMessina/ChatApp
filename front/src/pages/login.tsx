import styled from "@emotion/styled";
import { FC, useState } from "react";
import { signIn } from "next-auth/react";
import { colors } from "@/utils/colors";
import { validateEmail } from "@/utils/validateEmail";
import { breakpoints } from "@/utils/breakpoints";
import { useRouter } from "next/router";

const LogInPage: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState("");

  const router = useRouter();

  return (
    <MainContainer>
      <TitleContainer>
        <Title>TranslateGPT</Title>
        <Subtitle>
          The chat app that uses ChatGPT for translating messages
        </Subtitle>
      </TitleContainer>
      <Separator></Separator>
      <LoginSection>
        <FormContainer
          onSubmit={async (e) => {
            e.preventDefault();
            if (password.length < 8) {
              setShowError("Password must contain at least 8 characters");
            } else if (!validateEmail(email)) {
              setShowError("Not valid email");
            } else {
              const data = await signIn("credentials", {
                email,
                password,
                redirect: false,
              });

              if (data?.ok) {
                router.push("/");
              } else {
                setShowError(
                  "Something went wrong, check if the credentials are correct"
                );
              }
            }
          }}
        >
          <LoginInput
            placeholder="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setShowError("");
            }}
          ></LoginInput>
          <LoginInput
            placeholder="password"
            type="password"
            wideOnContent={password.length > 0}
            onChange={(e) => {
              setPassword(e.target.value);
              setShowError("");
            }}
          ></LoginInput>
          {showError && <Error>{showError}</Error>}
          <LoginButton type="submit">Access</LoginButton>
        </FormContainer>
        <SocialLogin>
          <SecondaryLoginButton
            onClick={() => {
              signIn("github", {
                redirect: true,
                callbackUrl: "/",
              });
            }}
          >
            Sign in with Github
          </SecondaryLoginButton>
        </SocialLogin>
      </LoginSection>
    </MainContainer>
  );
};

export default LogInPage;

const MainContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: 100%;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 64px;
    padding-right: 16px;
    padding-left: 16px;
    gap: 48px;
    box-sizing: border-box;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    align-items: center;
  }
`;

const Title = styled.h1`
  color: ${colors.mainWhite};
  font-size: 60px;
  margin: 0;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  color: ${colors.mainWhite};
  margin: 0;
  font-style: italic;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;
    text-align: center;
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

const LoginSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 340px;
  gap: 40px;
  width: 100%;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const SocialLogin = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const LoginInput = styled.input<{ wideOnContent?: boolean }>`
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
  font-weight: 500;
  font-size: 16px;
  transition: 0.4s;

  :focus {
    border: 1px solid ${colors.mainWhite};
    border-radius: 3px;
    letter-spacing: ${(props) => (props.wideOnContent ? "2px" : "normal")};
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
  font-weight: 500;
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
