import styled from "@emotion/styled";
import { FC, useEffect, useRef, useState } from "react";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: string;
  chats: { id: string; chatname: string }[];
  setChats: (chats: { id: string; chatname: string }[]) => void;
};

type Chat = {
  id: string;
  chatname: string;
  allowedLanguages: string[];
  languages: string[];
  members: number;
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

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        close();
      }
    };
    document.addEventListener("click", checkIfClickedOutside);
    return () => {
      document.removeEventListener("click", checkIfClickedOutside);
    };
  }, [close, isOpen]);

  const createChat = async () => {
    const res = await fetch("http://localhost:8080/createChat", {
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
      setChats([...chats, { id: data.id, chatname: data.chatname }]);
      close();
    } else {
      close();
    }
  };

  return (
    <ModalContainer isOpen={isOpen} ref={modalRef}>
      <button onClick={() => close()}>Close</button>
      <label>Chat name:</label>
      <input
        onChange={(e) => {
          setChatname(e.target.value);
        }}
      ></input>
      <div>
        <label>Private</label>
        <input
          type="checkbox"
          onChange={(e) => {
            setIsPrivate(e.target.checked);
          }}
        ></input>
      </div>

      <button
        onClick={() => {
          createChat();
        }}
      >
        Create
      </button>
    </ModalContainer>
  );
};

export default CreateChatModal;

const ModalContainer = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "flex" : "none")};
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

const ChatsColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`;
