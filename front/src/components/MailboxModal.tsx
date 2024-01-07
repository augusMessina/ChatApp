import { Notif, NotifType, OutgoingRequest } from "@/types/notif";
import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: ISODateString;
  mailbox: Notif[];
  setMailbox: Dispatch<SetStateAction<Notif[]>>;
  setFriendList: Dispatch<
    SetStateAction<
      {
        friendId: string;
        friendName: string;
      }[]
    >
  >;
  socket: Socket;
  setChats: Dispatch<
    SetStateAction<
      {
        id: string;
        chatname: string;
      }[]
    >
  >;
};

type User = {
  id: string;
  username: string;
  language: string;
};

const MailboxModal: FC<ModalProps> = ({
  isOpen,
  close,
  userId,
  mailbox,
  setMailbox,
  setFriendList,
  socket,
  setChats,
}) => {
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
  }, [isOpen, close]);

  const acceptFriendRequest = async (
    id_sender: string,
    username_sender: string
  ) => {
    const res = await fetch("http://localhost:8080/acceptFriendRequest", {
      method: "POST",
      body: JSON.stringify({
        id_sender,
        user_id: userId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      setChats((prev) => [
        { chatname: username_sender, id: data.chat_id },
        ...prev,
      ]);
      setFriendList((prev) => [
        ...prev,
        { friendId: id_sender, friendName: username_sender },
      ]);
      socket.emit("accepted-fr", {
        id_sender,
        user_id: userId,
        chat_id: data.chat_id,
      });
    }
  };

  const acceptChatInvitation = async (id_chat: string, chatname: string) => {
    const res = await fetch("http://localhost:8080/acceptChatInvitation", {
      method: "POST",
      body: JSON.stringify({
        id_chat,
        user_id: userId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      setChats((prev) => [{ chatname, id: id_chat }, ...prev]);
      // socket.emit("accepted-fr", {
      //   id_sender,
      //   user_id: userId,
      //   chat_id: data.chat_id,
      // });
    }
  };

  return (
    <ModalBackground isOpen={isOpen}>
      <ModalContainer ref={modalRef}>
        <button onClick={() => close()}>Close</button>

        <PublicChatContainer>
          <h3>Here you can see your notifications</h3>
          <Scrollable>
            {mailbox.length > 0 ? (
              <ChatsColumn>
                {mailbox.map((mail) => (
                  <ChatJoin
                    key={`${mail.id_sender}-${mail.type}-${mail.id_chat ?? ""}`}
                  >
                    <p>From: {mail.username_sender}</p>
                    {mail.type === "CHAT" && <p> | to {mail.chatname}</p>}
                    {mail.type === "FRIEND" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptFriendRequest(
                            mail.id_sender,
                            mail.username_sender
                          );
                          setMailbox((prev) => {
                            return prev.filter(
                              (notif) =>
                                !(
                                  notif.type === mail.type &&
                                  notif.id_sender === mail.id_sender &&
                                  notif.id_chat === mail.id_chat
                                )
                            );
                          });
                        }}
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptChatInvitation(
                            mail.id_chat as string,
                            mail.chatname as string
                          );
                          setMailbox((prev) => {
                            return prev.filter(
                              (notif) =>
                                !(
                                  notif.type === mail.type &&
                                  notif.id_sender === mail.id_sender &&
                                  notif.id_chat === mail.id_chat
                                )
                            );
                          });
                        }}
                      >
                        Join
                      </button>
                    )}
                  </ChatJoin>
                ))}
              </ChatsColumn>
            ) : (
              <h4>No notifs found</h4>
            )}
          </Scrollable>
        </PublicChatContainer>
      </ModalContainer>
    </ModalBackground>
  );
};

export default MailboxModal;

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
