import { Notif, NotifType, OutgoingRequest } from "@/types/notif";
import { colors } from "@/utils/colors";
import { sendFriendRequest } from "@/utils/send-friend-request";
import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
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
      <Wrap>
        <OuterContainer>
          <CloseButton onClick={() => close()}>
            <IoMdClose color={colors.darkText}></IoMdClose>
          </CloseButton>
          <ModalContainer ref={modalRef}>
            <Title>Search users</Title>
            <PublicChatContainer>
              <ModalInput
                onChange={(e) => {
                  setSearchName(e.target.value);
                }}
                placeholder="Enter user name..."
              ></ModalInput>
              <Scrollable>
                {users.length > 0 ? (
                  <ChatsColumn>
                    {users.map((user) => (
                      <ChatJoin key={user.id}>
                        <p>{user.username}</p>
                        <ModalButton
                          style={{
                            width: "unset",
                            padding: "8px 20px",
                            boxSizing: "border-box",
                          }}
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
                                mail.type === "FRIEND" &&
                                mail.id_sender === user.id
                            )
                          }
                        >
                          Send friend request
                        </ModalButton>
                      </ChatJoin>
                    ))}
                  </ChatsColumn>
                ) : (
                  <h3>No users found</h3>
                )}
              </Scrollable>
            </PublicChatContainer>
          </ModalContainer>
        </OuterContainer>
      </Wrap>
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
