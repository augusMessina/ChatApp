import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { IoMdClose } from "react-icons/io";
import { breakpoints } from "@/utils/breakpoints";
import Pusher from "pusher-js";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: ISODateString;
  chats: { id: string; chatname: string; unreads: number }[];
  setChats: (
    chats: { id: string; chatname: string; unreads: number }[]
  ) => void;
};

type Chat = {
  id: string;
  chatname: string;
  allowedLanguages: string[];
  languages: string[];
  members: number;
};

const JoinChatModal: FC<ModalProps> = ({
  isOpen,
  close,
  userId,
  chats,
  setChats,
}) => {
  const [searchName, setSearchName] = useState("");
  const [chatname, setChatname] = useState("");
  const [password, setPassword] = useState("");
  const [publicChats, setPublicChats] = useState<Chat[]>([]);
  const [chatType, setChatType] = useState<"public" | "private">("public");
  const [showError, setShowError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    close();
    setChatType("public");
  }, [close]);

  useEffect(() => {
    const getPublicChats = async () => {
      const res = await fetch("/api/getPublicChats", {
        method: "POST",
        body: JSON.stringify({
          chatname: searchName,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setPublicChats(data.chats);
    };

    if (isOpen) {
      getPublicChats();
    }
  }, [isOpen, searchName]);

  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        closeModal();
      }
    };
    const checkIfEscPressed = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("click", checkIfClickedOutside);
    document.addEventListener("keydown", checkIfEscPressed);
    return () => {
      document.removeEventListener("click", checkIfClickedOutside);
      document.removeEventListener("keydown", checkIfEscPressed);
    };
  }, [closeModal, isOpen, close]);

  const joinChat = async (
    chatId?: string,
    chatname?: string,
    password?: string
  ) => {
    const res = await fetch("/api/joinChat", {
      method: "POST",
      body: JSON.stringify({
        chatId,
        userId,
        chatname,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.message && data.message === "user already in chat") {
        setShowError("You are already in this chat");
        return;
      }
      setChats([
        { id: data.id, chatname: data.chatname, unreads: 0 },
        ...chats,
      ]);
      setShowError("");
      closeModal();
    } else {
      setShowError("Chat not found");
    }
  };

  return (
    <ModalBackground isOpen={isOpen}>
      <Wrap>
        <OuterContainer>
          <CloseButton
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
          >
            <IoMdClose color={colors.darkText}></IoMdClose>
          </CloseButton>

          <ModalContainer ref={modalRef}>
            <Title>Join a chat</Title>
            <CheckboxContainer>
              <Toggle
                isActive={chatType === "public"}
                onClick={() => {
                  setChatType("public");
                }}
              >
                Public
              </Toggle>

              <Toggle
                isActive={chatType === "private"}
                onClick={() => {
                  setChatType("private");
                }}
              >
                Private
              </Toggle>
            </CheckboxContainer>

            {chatType === "public" && (
              <PublicChatContainer>
                <ModalInput
                  onChange={(e) => {
                    setSearchName(e.target.value);
                  }}
                  placeholder="Enter chat name..."
                ></ModalInput>
                <Scrollable>
                  {publicChats.length > 0 && (
                    <ChatsColumn>
                      {publicChats.map((chat) => (
                        <ChatJoin key={chat.id}>
                          <p>{chat.chatname}</p>
                          <ModalButton
                            style={{
                              width: "unset",
                              padding: "8px 20px",
                              boxSizing: "border-box",
                            }}
                            onClick={() => {
                              joinChat(chat.id, chat.chatname);
                            }}
                            disabled={chats.some(
                              (chat2) => chat2.id === chat.id
                            )}
                          >
                            Join
                          </ModalButton>
                        </ChatJoin>
                      ))}
                    </ChatsColumn>
                  )}

                  {publicChats.length === 0 && <h3>No chats available</h3>}
                </Scrollable>
              </PublicChatContainer>
            )}

            {chatType === "private" && (
              <PublicChatContainer>
                <ModalInput
                  onChange={(e) => {
                    setChatname(e.target.value);
                  }}
                  placeholder="Enter chat name..."
                ></ModalInput>
                <ModalInput
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  placeholder="Enter chat password..."
                ></ModalInput>
                {showError !== "" && <Error>{showError}</Error>}
                <ModalButton
                  onClick={() => {
                    joinChat(undefined, chatname, password);
                  }}
                >
                  Join
                </ModalButton>
              </PublicChatContainer>
            )}
          </ModalContainer>
        </OuterContainer>
      </Wrap>
    </ModalBackground>
  );
};

export default JoinChatModal;

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

const PublicChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
`;

const Scrollable = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 300px;
  width: 100%;

  h3 {
    font-style: italic;
    font-weight: normal;
    color: ${colors.darkText};
    text-align: center;
  }
  ::-webkit-scrollbar {
    background: ${colors.lightHoverGray};
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.darkText};
    border-radius: 9999px;
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    h3 {
      font-size: 14px;
    }
  }
`;

const ChatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  height: fit-content;
  width: 100%;
  padding-right: 8px;
  box-sizing: border-box;
`;

const ChatJoin = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid ${colors.darkText};
  padding-bottom: 8px;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    p {
      font-size: 12px;
    }
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

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    padding: 8px 4px;
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

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;
    padding: 4px 8px;
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

const Toggle = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.isActive ? colors.darkText : colors.background};
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;

  :hover {
    background: ${(props) => (props.isActive ? "" : colors.darkHoverGray)};
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    padding: 8px 14px;
    font-size: 14px;
  }
`;
