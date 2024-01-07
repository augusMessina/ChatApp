import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: ISODateString;
  chats: { id: string; chatname: string }[];
  setChats: (chats: { id: string; chatname: string }[]) => void;
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
      setChats([...chats, { id: data.id, chatname: data.chatname }]);
      closeModal();
    }
  };

  return (
    <ModalBackground isOpen={isOpen}>
      <ModalContainer ref={modalRef}>
        <button onClick={() => closeModal()}>Close</button>
        <div>
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
        </div>

        {chatType === "public" && (
          <PublicChatContainer>
            <input
              onChange={(e) => {
                setSearchName(e.target.value);
              }}
              placeholder="Enter chat name..."
            ></input>
            <Scrollable>
              {publicChats.length > 0 && (
                <ChatsColumn>
                  {publicChats.map((chat) => (
                    <ChatJoin key={chat.id}>
                      <p>{chat.chatname}</p>
                      <button
                        onClick={() => {
                          joinChat(chat.id, chat.chatname);
                        }}
                        disabled={chats.some((chat2) => chat2.id === chat.id)}
                      >
                        Join
                      </button>
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
            <input
              onChange={(e) => {
                setChatname(e.target.value);
              }}
              placeholder="Enter chat name..."
            ></input>
            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Enter chat password..."
            ></input>
            <button
              onClick={() => {
                joinChat(undefined, chatname, password);
              }}
            >
              Join
            </button>
          </PublicChatContainer>
        )}
      </ModalContainer>
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
  background: #000000b5;
`;

const ModalContainer = styled.div`
  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
  padding: 32px;
  border: 2px solid black;
`;

const PublicChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
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
`;

const ChatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  height: fit-content;
`;

const ChatJoin = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;
