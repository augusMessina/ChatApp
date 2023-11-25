import styled from "@emotion/styled";
import { FC, useState } from "react";
import { signIn } from "next-auth/react";

const LogInPage: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <MainContainer>
      <FormContainer>
        <input
          placeholder="e-mail"
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <input
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button
          onClick={async () => {
            await signIn("credentials", {
              email,
              password,
              redirect: true,
              callbackUrl: "/",
            });
          }}
        >
          Access
        </button>
      </FormContainer>
    </MainContainer>
  );
};

export default LogInPage;

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
