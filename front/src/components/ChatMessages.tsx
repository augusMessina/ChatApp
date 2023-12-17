import styled from "@emotion/styled";
import { FC, useEffect, useRef } from "react";

type MessagesProps = {
  messages: {
    id: string;
    author: {
      authorName: string;
      authorId: string;
    };
    timestamp: number;
    message: { language: string; content: string }[];
  }[];
  userLanguage: string;
  userId: string;
};

const ChatMessages: FC<MessagesProps> = ({
  messages,
  userLanguage,
  userId,
}) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  return (
    <MessagesDisplay ref={chatRef}>
      {messages && messages.length > 0 ? (
        <MessagesColumn>
          {messages.map((message) =>
            message.message.some(
              (message) => message.language === userLanguage
            ) ? (
              <Message
                key={message.id}
                position={
                  message.author.authorId === userId ? "flex-end" : "flex-start"
                }
              >
                <MessageHeader>
                  <UserBubble>{message.author.authorName}</UserBubble>
                </MessageHeader>
                <MessageBubble>
                  {
                    message.message.find(
                      (message) => message.language === userLanguage
                    )?.content
                  }
                </MessageBubble>
              </Message>
            ) : (
              <></>
            )
          )}
        </MessagesColumn>
      ) : (
        <h3>No messages to display</h3>
      )}
    </MessagesDisplay>
  );
};

export default ChatMessages;

const MessagesDisplay = styled.div`
  flex: 1;
  border: 2px solid black;
  border-radius: 6px;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
`;

const MessagesColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
`;

const Message = styled.div<{ position: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => props.position};
  align-self: ${(props) => props.position};
  gap: 1px;
`;

const MessageHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;

const UserBubble = styled.div``;

const MessageBubble = styled.div``;
