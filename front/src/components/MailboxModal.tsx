import { Notif } from "@/types/notif";
import { breakpoints } from "@/utils/breakpoints";
import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import { Dispatch, FC, SetStateAction, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
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
        unreads: number;
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
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_BACK_IP}:8080/acceptFriendRequest`,
      {
        method: "POST",
        body: JSON.stringify({
          id_sender,
          user_id: userId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      setChats((prev) => [
        { chatname: username_sender, id: data.chat_id, unreads: 0 },
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
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_BACK_IP}:8080/acceptChatInvitation`,
      {
        method: "POST",
        body: JSON.stringify({
          id_chat,
          user_id: userId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      socket.emit("joined-chat", {
        chatId: id_chat,
        userId,
      });
      setChats((prev) => [{ chatname, id: id_chat, unreads: 0 }, ...prev]);
    }
  };

  const declineRequest = async (id_sender: string, id_chat?: string) => {
    const res = await fetch(
      `http://${process.env.NEXT_PUBLIC_BACK_IP}:8080/declineRequest`,
      {
        method: "POST",
        body: JSON.stringify({
          id_chat,
          id_user: userId,
          id_sender: id_sender,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      setMailbox(
        mailbox.filter(
          (mail) => mail.id_sender !== id_sender && mail.id_chat !== id_chat
        )
      );
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
            }}
          >
            <IoMdClose color={colors.darkText}></IoMdClose>
          </CloseButton>

          <ModalContainer ref={modalRef}>
            <Title>Mailbox</Title>
            <PublicChatContainer>
              <Scrollable>
                {mailbox.length > 0 ? (
                  <ChatsColumn>
                    {mailbox.map((mail) => (
                      <ChatJoin
                        key={`${mail.id_sender}-${mail.type}-${
                          mail.id_chat ?? ""
                        }`}
                      >
                        <FromArea columnOnMobile={false}>
                          <UserBubble>{mail.username_sender}</UserBubble>
                          {mail.type === "FRIEND" ? (
                            <span>Friend Request</span>
                          ) : (
                            <span>Chat invitation to: {mail.chatname}</span>
                          )}
                        </FromArea>
                        <FromArea columnOnMobile>
                          {mail.type === "FRIEND" ? (
                            <ModalButton
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
                            </ModalButton>
                          ) : (
                            <ModalButton
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
                            </ModalButton>
                          )}
                          <ModalButton
                            onClick={() => {
                              declineRequest(mail.id_sender, mail.id_chat);
                            }}
                          >
                            Decline
                          </ModalButton>
                        </FromArea>
                      </ChatJoin>
                    ))}
                  </ChatsColumn>
                ) : (
                  <h3>No pending notifications</h3>
                )}
              </Scrollable>
            </PublicChatContainer>
          </ModalContainer>
        </OuterContainer>
      </Wrap>
    </ModalBackground>
  );
};

export default MailboxModal;

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
  min-height: 400px;
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
  min-height: 400px;
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
  width: 100%;
  height: 100%;
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
  height: 100%;

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

const FromArea = styled.div<{ columnOnMobile: boolean }>`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;

  span {
    font-style: italic;
    color: ${colors.darkText};
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    ${(props) => props.columnOnMobile && "flex-direction: column;"}

    span {
      font-size: 12px;
    }
  }
`;

const UserBubble = styled.p`
  padding: 12px 20px;
  background: ${colors.darkHoverGray};
  color: ${colors.mainWhite};
  border-radius: 5px;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;

    padding: 4px 8px;
  }
`;
