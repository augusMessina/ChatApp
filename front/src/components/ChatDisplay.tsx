import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import { Socket } from "socket.io-client";
import ScrollableDropdown from "./ScrollableDropdown";
import { sendFriendRequest } from "@/utils/send-friend-request";
import { OutgoingRequest } from "@/types/notif";
import { sendChatInvitation } from "@/utils/send-chat-invitation";
import { useChat } from "ai/react";

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
}) => {
  const { messages, input } = useChat({ api: "/api/translator" });
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatname, setChatname] = useState<string>("");
  const [members, setMembers] = useState<{ id: string; username: string }[]>(
    []
  );
  const [chatLang, setChatLang] = useState<string[]>([]);
  const [isFriendChat, setIsFriendChat] = useState(false);
  const [chetKey, setChatKey] = useState("");
  const [newMessage, setNewMessage] = useState<string>("");

  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);
  const [inviteDropdownOpen, setInviteDropdownOpen] = useState(false);

  useEffect(() => {
    socket.on("new-message", (newMessage: Message) => {
      setChatMessages([...chatMessages, newMessage]);
    });
  }, [chatMessages, socket]);

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
    };

    if (chatId) {
      socket.emit("join", chatId);
      getChatData(chatId);
    }
  }, [chatId, socket, userId]);

  return (
    <ChatDisplayContainer>
      <ChatHeader>
        <Gap></Gap>
        <h2>{chatname}</h2>
        <HeaderButtons>
          {chetKey && <h2>{chetKey}</h2>}
          {!isFriendChat && (
            <DropdownButtonContainer>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMembersDropdownOpen(true);
                }}
              >
                Members
              </button>
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
                emptyText="No members"
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInviteDropdownOpen(true);
                }}
              >
                Invite
              </button>
              <ScrollableDropdown
                items={friendList.map((friend) => ({
                  label: friend.friendName,
                  id: friend.friendId,
                  buttonLabel: "Invite to chat",
                }))}
                isOpen={inviteDropdownOpen}
                close={() => setInviteDropdownOpen(false)}
                emptyText="No friends"
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
        </HeaderButtons>
      </ChatHeader>

      <ChatMessages
        messages={chatMessages}
        userId={userId}
        userLanguage={userLanguage}
      ></ChatMessages>

      {chatId && (
        <InputArea
          onSubmit={async (e) => {
            e.preventDefault();
            let translation: { language: string; message: string }[] = [];
            if (chatLang.length > 1) {
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
          }}
        >
          <input
            onChange={(e) => {
              setNewMessage(e.target.value);
            }}
            value={newMessage}
          ></input>
          <button type="submit">Send</button>
        </InputArea>
      )}
    </ChatDisplayContainer>
  );
};

export default ChatDisplay;

const ChatDisplayContainer = styled.div`
  flex: 1;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 8px;
  gap: 16px;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  > h2 {
    flex: 1;
    text-align: center;
  }
`;

const Gap = styled.div`
  visibility: hidden;
  flex: 1;
`;

const HeaderButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  flex: 1;
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

  input {
    flex: 1;
    padding: 16px 8px;
  }
`;
