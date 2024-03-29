import { breakpoints } from "@/utils/breakpoints";
import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { FC, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: string;
  chats: { id: string; chatname: string; unreads: number }[];
  setChats: (
    chats: { id: string; chatname: string; unreads: number }[]
  ) => void;
};

const CreateChatModal: FC<ModalProps> = ({
  isOpen,
  close,
  userId,
  chats,
  setChats,
}) => {
  const [chatname, setChatname] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showError, setShowError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        close();
      }
    };
    const checkIfEscPressed = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    document.addEventListener("click", checkIfClickedOutside);
    document.addEventListener("keydown", checkIfEscPressed);
    return () => {
      document.removeEventListener("click", checkIfClickedOutside);
      document.removeEventListener("keydown", checkIfEscPressed);
    };
  }, [close, isOpen]);

  const createChat = async () => {
    const res = await fetch("/api/createChat", {
      method: "POST",
      body: JSON.stringify({
        chatname: chatname,
        password: isPrivate,
        user_id: userId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.message && data.message === "chatname already taken") {
        setShowError(
          "Chat name already taken, choose another or make it private"
        );
        return;
      }
      setChats([
        { id: data.id, chatname: data.chatname, unreads: 0 },
        ...chats,
      ]);
      close();
      setChatname("");
      setShowError("");
      setIsPrivate(false);
    } else {
      close();
    }
  };

  return (
    <ModalBackground isOpen={isOpen}>
      <Wrap>
        <OuterContainer>
          <CloseButton
            onClick={(e) => {
              e.stopPropagation();
              close();
              setChatname("");
              setIsPrivate(false);
              setShowError("");
            }}
          >
            <IoMdClose color={colors.darkText}></IoMdClose>
          </CloseButton>

          <ModalContainer ref={modalRef}>
            <Title>Create a chat</Title>

            <InputsDiv>
              <ModalInput
                onChange={(e) => {
                  setChatname(e.target.value);
                  setShowError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createChat();
                }}
                value={chatname}
                placeholder="Chat name..."
                maxLength={16}
              ></ModalInput>
              <Toggle
                isActive={isPrivate}
                onClick={() => {
                  setIsPrivate(!isPrivate);
                }}
              >
                Private
              </Toggle>
            </InputsDiv>

            {showError !== "" && <Error>{showError}</Error>}

            <ModalButton
              onClick={() => {
                createChat();
              }}
            >
              Create
            </ModalButton>
          </ModalContainer>
        </OuterContainer>
      </Wrap>
    </ModalBackground>
  );
};

export default CreateChatModal;

const ModalBackground = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  z-index: 11;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #00000066;
`;

const Wrap = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
`;

const OuterContainer = styled.div`
  position: relative;
  max-width: 600px;
  width: 100%;
  max-height: 600px;
`;

const ModalContainer = styled.div`
  display: flex;
  background: ${colors.lightHoverGray};
  color: ${colors.mainWhite};
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
  padding: 32px 16px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 10px;
`;

const Title = styled.h3`
  text-align: center;
  color: ${colors.mainWhite};
  margin-top: 8px;
  margin-bottom: 16px;
`;

const InputsDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  gap: 8px;
`;

const Toggle = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.isActive ? colors.darkText : "transparent")};
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  flex: 1;
  width: 100%;

  :hover {
    background: ${(props) => (props.isActive ? "" : colors.darkHoverGray)};
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    padding: 8px 14px;
    font-size: 14px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${colors.lightHoverGray};

  svg {
    width: 16px;
    height: 16px;
  }

  :hover {
    background: ${colors.darkHoverGray};
  }
`;

const ModalInput = styled.input`
  padding: 12px 20px;
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
  flex: 3;
  width: 100%;
  box-sizing: border-box;

  :focus {
    border: 1px solid ${colors.mainWhite};
    border-radius: 3px;
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    padding: 12px 8px;
    font-size: 14px;
  }
`;

const ModalButton = styled.button`
  padding: 12px 20px;
  width: 100%;
  box-sizing: border-box;
  background: ${(props) => (props.disabled ? colors.darkText : "transparent")};
  border: 1px solid
    ${(props) => (!props.disabled ? colors.mainWhite : "transparent")};
  color: ${(props) =>
    !props.disabled ? colors.mainWhite : colors.darkHoverGray};
  font-size: 16px;
  font-weight: 500;
  ${(props) => !props.disabled && "cursor: pointer;"}
  border-radius: 3px;
  transition: 0.3s;

  :hover {
    background: ${(props) => !props.disabled && colors.darkText};
  }
`;

const Error = styled.p`
  color: ${colors.red};
  margin: 8px;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    margin: 4px;
    font-size: 12px;
  }
`;
