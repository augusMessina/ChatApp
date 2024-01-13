import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { IoMdClose } from "react-icons/io";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: ISODateString;
  chats: { id: string; chatname: string; unreads: number }[];
  setChats: (
    chats: { id: string; chatname: string; unreads: number }[]
  ) => void;
  socket: Socket;
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
  socket,
}) => {
  const [searchName, setSearchName] = useState("");
  const [chatname, setChatname] = useState("");
  const [password, setPassword] = useState("");
  const [publicChats, setPublicChats] = useState<Chat[]>([]);
  const [chatType, setChatType] = useState<"public" | "private">("public");
  const modalRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => {
    close();
    setChatType("public");
  }, [close]);

  useEffect(() => {
    const getPublicChats = async () => {
      const res = await fetch("http://localhost:8080/getPublicChats", {
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
    const res = await fetch("http://localhost:8080/joinChat", {
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
      socket.emit("joined-chat", {
        chatId,
        userId,
      });
      const data = await res.json();
      setChats([
        { id: data.id, chatname: data.chatname, unreads: 0 },
        ...chats,
      ]);
      closeModal();
    }
  };

  return (
    <ModalBackground isOpen={isOpen}>
      <Wrap>
        <OuterContainer>
          <CloseButton onClick={() => closeModal()}>
            <IoMdClose color={colors.darkText}></IoMdClose>
          </CloseButton>

          <ModalContainer ref={modalRef}>
            <Title>Join a chat</Title>
            <CheckboxContainer>
              <label>
                <input
                  type="checkbox"
                  checked={chatType === "public"}
                  onChange={() => {
                    setChatType("public");
                  }}
                ></input>
                Public
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={chatType === "private"}
                  onChange={() => {
                    setChatType("private");
                  }}
                ></input>
                Private
              </label>
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
`;

const ChatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  height: fit-content;
  width: 100%;
`;

const ChatJoin = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid ${colors.darkText};
  padding-bottom: 8px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 24px;
  height: 24px;
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
