import styled from "@emotion/styled";
import {
  Dispatch,
  FC,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import ChatMessages from "./ChatMessages";
import { Socket } from "socket.io-client";
import ScrollableDropdown from "./ScrollableDropdown";
import { sendFriendRequest } from "@/utils/send-friend-request";
import { OutgoingRequest } from "@/types/notif";
import { sendChatInvitation } from "@/utils/send-chat-invitation";
import { useChat } from "ai/react";
import AreYouSureModal from "./AreYouSureModal";
import { colors } from "@/utils/colors";

import { FaUserMinus } from "react-icons/fa";
import { IoSendSharp } from "react-icons/io5";
import { MdGroupOff } from "react-icons/md";
import { MdGroupAdd } from "react-icons/md";
import { MdGroups } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { TailSpin } from "react-loader-spinner";
import { breakpoints } from "@/utils/breakpoints";
import { NONAME } from "dns";

type ChatDisplayProps = {
  chatId: string;
  userId: string;
  userLanguage: string;
  socket: Socket;
  friendList: {
    friendId: string;
    friendName: string;
  }[];
  outgoingRequests: OutgoingRequest[];
  setOutgoingRequests: (newReq: OutgoingRequest[]) => void;
  setChats: Dispatch<
    SetStateAction<
      {
        id: string;
        chatname: string;
        unreads: number;
      }[]
    >
  >;
  setFriendList: Dispatch<
    SetStateAction<
      {
        friendId: string;
        friendName: string;
      }[]
    >
  >;
  setChatId: Dispatch<SetStateAction<string>>;
  openLeftMenu: () => void;
};

type Message = {
  id: string;
  author: {
    authorName: string;
    authorId: string;
  };
  timestamp: number;
  message: { language: string; content: string }[];
};

const ChatDisplay: FC<ChatDisplayProps> = ({
  chatId,
  userId,
  userLanguage,
  socket,
  friendList,
  outgoingRequests,
  setOutgoingRequests,
  setChats,
  setFriendList,
  setChatId,
  openLeftMenu,
}) => {
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatname, setChatname] = useState<string>("");
  const [members, setMembers] = useState<{ id: string; username: string }[]>(
    []
  );
  const [chatLang, setChatLang] = useState<string[]>([]);
  const [isFriendChat, setIsFriendChat] = useState(false);
  const [chatKey, setChatKey] = useState("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatUnreads, setChatUnreads] = useState(0);

  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);
  const [inviteDropdownOpen, setInviteDropdownOpen] = useState(false);

  const [sureFriendModalOpen, setSureFriendModalOpen] = useState(false);
  const [sureChatModalOpen, setSureChatModalOpen] = useState(false);

  const [shiftPressed, setShiftPressed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.on("new-message", (newMessage: Message) => {
      setChatMessages([...chatMessages, newMessage]);
    });
    socket.on(
      "new-member",
      (newMember: {
        memberId: string;
        memberName: string;
        memberLan: string;
      }) => {
        setMembers([
          ...members,
          { id: newMember.memberId, username: newMember.memberName },
        ]);
        if (!chatLang.includes(newMember.memberLan)) {
          setChatLang([...chatLang, newMember.memberLan]);
        }
      }
    );

    socket.on("left-chat", (memberId: string) => {
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    });

    socket.on(
      "member-data-updated",
      (data: { memberName: string; memberId: string; chatLangs: string[] }) => {
        setMembers(
          members.map((member) => {
            if (member.id === data.memberId) {
              return { ...member, username: data.memberName };
            }
            return member;
          })
        );
        setChatLang(data.chatLangs ?? chatLang);
        if (isFriendChat) {
          setChatname(data.memberName);
        }
      }
    );
  }, [chatMessages, chatLang, members, socket, isFriendChat]);

  useEffect(() => {
    const getChatData = async (chatId: string) => {
      const res = await fetch("http://localhost:8080/getChatData", {
        method: "POST",
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setChatname(data.chatname);
      setChatMessages(data.messages);
      setMembers(data.members);
      setChatKey(data.password ?? "");
      setIsFriendChat(data.isFriendChat);
      setChatLang(data.languages);
      setChatUnreads(data.chatUnreads);
    };

    if (chatId) {
      socket.emit("join", chatId);
      getChatData(chatId);
    }
  }, [chatId, socket, userId]);

  const handleMesageSubmit = async () => {
    let translation: { language: string; message: string }[] = [];
    if (chatLang.length > 1) {
      setIsLoading(true);
      const aiRes = await fetch("/api/translator", {
        method: "POST",
        body: JSON.stringify({
          newMessage: {
            language: userLanguage,
            message: newMessage,
            to: chatLang.filter((lang) => lang !== userLanguage),
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await aiRes.json();
      translation = data.translation;
    }
    socket.emit("new-message", {
      chatId,
      message: [
        { language: userLanguage, content: newMessage },
        ...translation.map((trans) => ({
          language: trans.language,
          content: trans.message,
        })),
      ],
      authorId: userId,
    });
    setNewMessage("");
    setChatUnreads(0);
    setIsLoading(false);
  };

  return (
    <ChatDisplayContainer>
      <AreYouSureModal
        question={`Are you sure you want to delete`}
        highlight={
          members.filter((member) => member.id !== userId)[0]?.username
        }
        isOpen={sureFriendModalOpen}
        close={() => {
          setSureFriendModalOpen(false);
        }}
        onYes={async () => {
          const friendId = members.filter((member) => member.id !== userId)[0]
            .id;
          const res = await fetch("http://localhost:8080/deleteFriend", {
            method: "POST",
            body: JSON.stringify({
              friend_id: friendId,
              user_id: userId,
              chat_id: chatId,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            socket.emit("unfriended", { userId, friendId, chatId });
            setChats((prev) => prev.filter((chat) => chat.id !== chatId));
            setFriendList((prev) =>
              prev.filter((friend) => friend.friendId !== friendId)
            );
            setChatname("");
            setChatId("");
          }
        }}
      ></AreYouSureModal>
      <AreYouSureModal
        question={`Are you sure you want to leave`}
        highlight={chatname}
        isOpen={sureChatModalOpen}
        close={() => {
          setSureChatModalOpen(false);
        }}
        onYes={async () => {
          const res = await fetch("http://localhost:8080/leaveChat", {
            method: "POST",
            body: JSON.stringify({
              user_id: userId,
              chat_id: chatId,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            socket.emit("leave", chatId);
            socket.emit("left-chat", { userId, chatId });
            setChats((prev) => prev.filter((chat) => chat.id !== chatId));
            setChatname("");
            setChatId("");
          }
        }}
      ></AreYouSureModal>
      <ChatHeader>
        <div style={{ flex: 1 }}>
          <MobileTopBarButton
            onClick={(e) => {
              e.stopPropagation();
              openLeftMenu();
            }}
          >
            <GiHamburgerMenu color={colors.mainWhite} />
          </MobileTopBarButton>
        </div>

        <h2>{chatname}</h2>
        <HeaderButtons isHidden={!chatId}>
          {chatKey && (
            <ChatKey
              onClick={() => {
                navigator.clipboard.writeText(chatKey);
              }}
            >
              {chatKey}
            </ChatKey>
          )}
          {!isFriendChat && (
            <DropdownButtonContainer>
              <TopBarButton
                onClick={(e) => {
                  e.stopPropagation();
                  setInviteDropdownOpen(false);
                  setMembersDropdownOpen(true);
                }}
              >
                <MdGroups color={colors.mainWhite}></MdGroups>
              </TopBarButton>
              <ScrollableDropdown
                items={members
                  .filter((member) => member.id !== userId)
                  .map((member) => ({
                    label: member.username,
                    id: member.id,
                    buttonLabel: "Send friend request",
                  }))}
                isOpen={membersDropdownOpen}
                close={() => setMembersDropdownOpen(false)}
                emptyText="No members besides you"
                title="Members"
                onButtonClick={(memberId: string) =>
                  sendFriendRequest(
                    userId,
                    memberId,
                    socket,
                    outgoingRequests,
                    setOutgoingRequests
                  )
                }
                disabledCondition={(memberId) =>
                  friendList.some((friend) => friend.friendId === memberId) ||
                  outgoingRequests.some(
                    (request) => request.id_receiver === memberId
                  )
                }
                width={300}
                height={400}
              ></ScrollableDropdown>
            </DropdownButtonContainer>
          )}
          {!isFriendChat && (
            <DropdownButtonContainer>
              <TopBarButton
                onClick={(e) => {
                  e.stopPropagation();
                  setMembersDropdownOpen(false);
                  setInviteDropdownOpen(true);
                }}
              >
                <MdGroupAdd color={colors.mainWhite}></MdGroupAdd>
              </TopBarButton>
              <ScrollableDropdown
                items={friendList.map((friend) => ({
                  label: friend.friendName,
                  id: friend.friendId,
                  buttonLabel: "Invite to chat",
                }))}
                title="Invite"
                isOpen={inviteDropdownOpen}
                close={() => setInviteDropdownOpen(false)}
                emptyText="No friends available for invitation"
                onButtonClick={(friendId: string) =>
                  sendChatInvitation(
                    userId,
                    friendId,
                    chatId,
                    chatname,
                    socket,
                    outgoingRequests,
                    setOutgoingRequests
                  )
                }
                disabledCondition={(friendId) =>
                  members.some((member) => member.id === friendId) ||
                  outgoingRequests.some(
                    (request) =>
                      request.type === "CHAT" &&
                      request.id_receiver === friendId &&
                      request.id_chat === chatId
                  )
                }
                width={300}
                height={400}
              ></ScrollableDropdown>
            </DropdownButtonContainer>
          )}

          {isFriendChat ? (
            <TopBarButton
              onClick={(e) => {
                e.stopPropagation();
                setSureFriendModalOpen(true);
              }}
            >
              <FaUserMinus color={colors.red}></FaUserMinus>
            </TopBarButton>
          ) : (
            <TopBarButton
              onClick={(e) => {
                e.stopPropagation();
                setSureChatModalOpen(true);
              }}
            >
              <MdGroupOff color={colors.red}></MdGroupOff>
            </TopBarButton>
          )}
        </HeaderButtons>
      </ChatHeader>

      {chatId && <Separator></Separator>}
      {!chatId && (
        <EmptyText>
          <p>No chat selected</p>
        </EmptyText>
      )}
      {chatId && (
        <ChatMessages
          messages={chatMessages}
          userId={userId}
          userLanguage={userLanguage}
          unreads={chatUnreads}
        ></ChatMessages>
      )}

      {chatId && (
        <InputArea>
          <TextArea
            onChange={(e) => {
              // if (!e.target.value.endsWith("\n") || shiftPressed)
              setNewMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Shift") {
                setShiftPressed(true);
              }
              if (e.key === "Enter" && !shiftPressed && newMessage !== "") {
                handleMesageSubmit();
              }
              // if (newMessage.endsWith("\n") && e.key === "Backspace") {
              //   const trimmedMessage = newMessage.slice(0, -1);
              //   setNewMessage(trimmedMessage);
              // }
            }}
            onKeyUp={(e) => {
              if (e.key === "Shift") {
                setShiftPressed(false);
              }
            }}
            value={newMessage}
            maxLength={300}
            disabled={isLoading}
          ></TextArea>
          <SendButton
            disabled={newMessage === "" || isLoading}
            onClick={async (e) => {
              await handleMesageSubmit();
            }}
          >
            {!isLoading ? (
              <IoSendSharp color={colors.mainWhite}></IoSendSharp>
            ) : (
              <TailSpin color={colors.mainWhite}></TailSpin>
            )}
          </SendButton>
        </InputArea>
      )}
    </ChatDisplayContainer>
  );
};

export default ChatDisplay;

const ChatDisplayContainer = styled.div`
  flex: 1;
  border: 1px solid ${colors.lightHoverGray};
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  gap: 8px;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;

  > h2 {
    flex: 1;
    text-align: center;
    color: ${colors.mainWhite};
    margin: 0;
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    h2 {
      font-size: 16px;
    }
  }
`;

const Gap = styled.div`
  visibility: hidden;
  flex: 1;
`;

const HeaderButtons = styled.div<{ isHidden: boolean }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  flex: 1;
  ${(props) => (props.isHidden ? "visibility: hidden;" : "")}

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    h2 {
      font-size: 12px;
    }
    gap: 8px;
  }
`;

const DropdownButtonContainer = styled.div`
  position: relative;
`;

const DropdownContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: -404px;
  height: 400px;
  width: 300px;
  background: white;
  border: 2px solid black;
  box-sizing: border-box;
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

const InputArea = styled.form`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const TextArea = styled.textarea`
  flex: 1;
  width: 100%;
  background: ${colors.lightHoverGray};
  padding: 12px;
  color: ${colors.mainWhite};
  border: 1px solid transparent;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  font-size: 16px;
  resize: none;
  height: fit-content;
  box-sizing: border-box;

  :focus {
    outline: none;
    border: 1px solid ${colors.darkText};
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    padding: 8px;
    font-size: 14px;
  }
`;

const SendButton = styled.button`
  border: none;
  border: 1px solid ${colors.lightHoverGray};
  background: ${colors.lightHoverGray};
  color: ${colors.mainWhite};
  font-size: 14px;
  padding: 0 20px;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  ${(props) => !props.disabled && "cursor: pointer;"}

  svg {
    width: 20px;
    height: 20px;
  }

  :hover {
    ${(props) => !props.disabled && `background: ${colors.darkText};`}
    ${(props) => !props.disabled && `border: 1px solid ${colors.darkText};`}
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    padding: 0 16px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const TopBarButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  border: none;
  padding: 0;
  background: ${colors.darkHoverGray};
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }

  :hover {
    background: ${colors.lightHoverGray};
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    width: 28px;
    height: 28px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const MobileTopBarButton = styled(TopBarButton)`
  visibility: hidden;
  @media screen and (max-width: ${breakpoints.smallScreen}) {
    visibility: visible;
  }
`;

const Separator = styled.div`
  height: 1px;
  width: 100%;
  background: ${colors.lightHoverGray};
`;

const ChatKey = styled.h2`
  font-style: italic;
  font-weight: normal;
  color: ${colors.darkText};
  cursor: pointer;
  padding: 8px 8px;
  border-radius: 5px;
  margin: 0;

  :hover {
    background: ${colors.lightHoverGray};
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    padding: 4px 4px;
  }
`;

const EmptyText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  p {
    font-style: italic;
    font-weight: normal;
    color: ${colors.darkText};
    font-size: 24px;
  }
`;
