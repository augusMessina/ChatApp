import styled from "@emotion/styled";
import { FC, useState } from "react";
import { signIn } from "next-auth/react";
import { colors } from "@/utils/colors";

const LogInPage: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
            await signIn("credentials", {
              email,
              password,
              redirect: true,
              callbackUrl: "/",
            });
          }}
        >
          <LoginInput
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
          ></LoginInput>
          <LoginInput
            placeholder="password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          ></LoginInput>
          <LoginButton type="submit">Access</LoginButton>
        </FormContainer>
        <SocialLogin>
          <LoginButton>Sign in with Google</LoginButton>
          <LoginButton
            onClick={() => {
              signIn("github", {
                redirect: true,
                callbackUrl: "/",
              });
            }}
          >
            Sign in with Github
          </LoginButton>
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
  font-size: 60px;
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${colors.mainWhite};
  margin: 0;
  font-style: italic;
`;

const Separator = styled.div`
  width: 1px;
  height: 400px;
  background: ${colors.darkText};
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
  font-weight: 500;
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
  font-weight: 500;
  cursor: pointer;
  border-radius: 3px;
  transition: 0.3s;

  :hover {
    background: ${colors.lightHoverGray};
  }
`;
