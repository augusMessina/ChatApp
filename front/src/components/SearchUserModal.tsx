import { Notif, NotifType, OutgoingRequest } from "@/types/notif";
import { sendFriendRequest } from "@/utils/send-friend-request";
import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: ISODateString;
  outgoingRequests: OutgoingRequest[];
  setOutgoingRequests: (newReqs: OutgoingRequest[]) => void;
  mailbox: Notif[];
  socket: Socket;
};

type User = {
  id: string;
  username: string;
  language: string;
};

const SearchUserModal: FC<ModalProps> = ({
  isOpen,
  close,
  userId,
  outgoingRequests,
  setOutgoingRequests,
  mailbox,
  socket,
}) => {
  const [searchName, setSearchName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getPublicUsers = async () => {
      const res = await fetch("http://localhost:8080/getPublicUsers", {
        method: "POST",
        body: JSON.stringify({
          username: searchName,
          userId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setUsers(data.users);
    };

    if (isOpen) {
      getPublicUsers();
    }
  }, [isOpen, searchName, userId]);

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

  return (
    <ModalBackground isOpen={isOpen}>
      <ModalContainer ref={modalRef}>
        <button onClick={() => close()}>Close</button>

        <PublicChatContainer>
          <input
            onChange={(e) => {
              setSearchName(e.target.value);
            }}
            placeholder="Enter user name..."
          ></input>
          <Scrollable>
            {users.length > 0 ? (
              <ChatsColumn>
                {users.map((user) => (
                  <ChatJoin key={user.id}>
                    <p>{user.username}</p>
                    <button
                      onClick={() => {
                        sendFriendRequest(
                          userId,
                          user.id,
                          socket,
                          outgoingRequests,
                          setOutgoingRequests
                        );
                      }}
                      disabled={
                        outgoingRequests.some(
                          (request) =>
                            request.type === "FRIEND" &&
                            request.id_receiver === user.id
                        ) ||
                        mailbox.some(
                          (mail) =>
                            mail.type === "FRIEND" && mail.id_sender === user.id
                        )
                      }
                    >
                      Send friend request
                    </button>
                  </ChatJoin>
                ))}
              </ChatsColumn>
            ) : (
              <h3>No users found</h3>
            )}
          </Scrollable>
        </PublicChatContainer>
      </ModalContainer>
    </ModalBackground>
  );
};

export default SearchUserModal;

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
