import { colors } from "@/utils/colors";
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
  unreads: number;
};

const ChatMessages: FC<MessagesProps> = ({
  messages,
  userLanguage,
  userId,
  unreads,
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const unreadsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (unreadsRef.current && unreads > 0) unreadsRef.current.scrollIntoView();
  }, [unreads]);

  return (
    <MessagesDisplay ref={chatRef}>
      {messages && messages.length > 0 ? (
        <MessagesColumn>
          {messages.map((message, index) => {
            const timestampDate = new Date(message.timestamp);
            return (
              message.message.some(
                (message) => message.language === userLanguage
              ) && (
                <MessageContainer key={message.id}>
                  {(index === 0 ||
                    (index > 0 &&
                      (timestampDate.getDate() !==
                        new Date(messages[index - 1].timestamp).getDate() ||
                        timestampDate.getMonth() !==
                          new Date(messages[index - 1].timestamp).getMonth() ||
                        timestampDate.getFullYear() !==
                          new Date(
                            messages[index - 1].timestamp
                          ).getFullYear()))) && (
                    <p>{`${String(timestampDate.getMonth() + 1).padStart(
                      2,
                      "0"
                    )}/${String(timestampDate.getDate()).padStart(
                      2,
                      "0"
                    )}/${timestampDate.getFullYear()}`}</p>
                  )}
                  {index === messages.length - unreads && (
                    <UnreadsSeparatorContainer ref={unreadsRef}>
                      <UnreadsSeparator></UnreadsSeparator>
                      <p>New messages</p>
                      <UnreadsSeparator></UnreadsSeparator>
                    </UnreadsSeparatorContainer>
                  )}
                  <Message
                    position={
                      message.author.authorId === userId
                        ? "flex-end"
                        : "flex-start"
                    }
                  >
                    <MessageHeader>
                      {message.author.authorId === userId && (
                        <p>{`${String(timestampDate.getHours()).padStart(
                          2,
                          "0"
                        )}:${String(timestampDate.getMinutes()).padStart(
                          2,
                          "0"
                        )}`}</p>
                      )}
                      <UserBubble>{message.author.authorName}</UserBubble>
                      {message.author.authorId !== userId && (
                        <p>{`${timestampDate.getHours()}:${timestampDate.getMinutes()}`}</p>
                      )}
                    </MessageHeader>
                    <MessageBubble>
                      {
                        message.message.find(
                          (message) => message.language === userLanguage
                        )?.content
                      }
                    </MessageBubble>
                  </Message>
                </MessageContainer>
              )
            );
          })}
        </MessagesColumn>
      ) : (
        <></>
      )}
    </MessagesDisplay>
  );
};

export default ChatMessages;

const MessagesDisplay = styled.div`
  flex: 1;
  border-radius: 6px;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  ::-webkit-scrollbar {
    background: ${colors.background};
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.lightHoverGray};
    border-radius: 9999px;
  }
`;

const MessagesColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 32px;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 32px;
  width: 100%;

  > p {
    color: ${colors.darkText};
    margin: 0;
    font-weight: bold;
  }
`;

const Message = styled.div<{ position: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => props.position};
  align-self: ${(props) => props.position};
  gap: 7px;
`;

const MessageHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;

  p {
    color: ${colors.darkText};
    font-style: italic;
    font-size: 12px;
    margin: 0;
  }
`;

const UserBubble = styled.div`
  color: ${colors.mainWhite};
  font-weight: bold;
`;

const MessageBubble = styled.div`
  color: ${colors.mainWhite};
  background: ${colors.lightHoverGray};
  border-radius: 7px;
  max-width: 500px;
  padding: 4px 8px;
`;

const UnreadsSeparatorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;

  p {
    color: ${colors.blue};
    font-style: italic;
    flex: 1;
    white-space: nowrap;
    text-align: center;
    margin: 0;
  }
`;

const UnreadsSeparator = styled.div`
  height: 1px;
  width: 100%;
  background: ${colors.blue};
`;
