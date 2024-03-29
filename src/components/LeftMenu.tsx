import { breakpoints } from "@/utils/breakpoints";
import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { FC, useEffect, useRef, useState } from "react";
import { FaPlus, FaUserPlus } from "react-icons/fa";
import { IoIosChatboxes, IoMdMail } from "react-icons/io";
import { TbDotsVertical } from "react-icons/tb";
import { IoMdArrowRoundBack } from "react-icons/io";
import MoreOptionsDropdown from "./MoreOptionsDropdown";
import Pusher from "pusher-js";
import { Notif } from "@/types/notif";

type LeftMenuProps = {
  close: () => void;
  currentAnimation: { animationName: string };
  moreOptionsOpen: boolean;
  subModalOpen: boolean;
  setJoinChatOpen: (b: boolean) => void;
  setMoreOptionsOpen: (b: boolean) => void;
  setCreateChatOpen: (b: boolean) => void;
  setSearchUserOpen: (b: boolean) => void;
  setMailboxOpen: (b: boolean) => void;
  setChangeValuesOpen: (b: boolean) => void;
  chats: { id: string; chatname: string; unreads: number }[];
  currentChat: string;
  setCurrentChat: (s: string) => void;
  mailbox: Notif[];
  pusher: Pusher;
};

const LeftMenu: FC<LeftMenuProps> = ({
  close,
  currentAnimation,
  setJoinChatOpen,
  setMoreOptionsOpen,
  setCreateChatOpen,
  setSearchUserOpen,
  setMailboxOpen,
  moreOptionsOpen,
  setChangeValuesOpen,
  chats,
  currentChat,
  setCurrentChat,
  pusher,
  subModalOpen,
  mailbox,
}) => {
  const leftMenuRef = useRef<HTMLDivElement>(null);
  const [windowWith, setWindowWith] = useState<number>();

  useEffect(() => {
    setWindowWith(window.innerWidth);
  }, []);

  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      if (
        leftMenuRef.current &&
        !leftMenuRef.current.contains(e.target) &&
        currentAnimation.animationName &&
        currentAnimation.animationName === "slide-in" &&
        !subModalOpen
      ) {
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
  }, [close, currentAnimation, subModalOpen]);

  return (
    <LeftMenuContainer
      ref={leftMenuRef}
      style={windowWith && windowWith <= 1000 ? currentAnimation : {}}
    >
      <ToolBar>
        <TopBarButton
          onClick={(e) => {
            e.stopPropagation();
            setJoinChatOpen(true);
            setMoreOptionsOpen(false);
          }}
          title="Join a chat"
        >
          <IoIosChatboxes color={colors.mainWhite}></IoIosChatboxes>
        </TopBarButton>
        <TopBarButton
          onClick={(e) => {
            e.stopPropagation();
            setCreateChatOpen(true);
            setMoreOptionsOpen(false);
          }}
          title="Create a chat"
        >
          <FaPlus color={colors.mainWhite}></FaPlus>
        </TopBarButton>
        <TopBarButton
          onClick={(e) => {
            e.stopPropagation();
            setSearchUserOpen(true);
            setMoreOptionsOpen(false);
          }}
          title="Search users"
        >
          <FaUserPlus color={colors.mainWhite}></FaUserPlus>
        </TopBarButton>
        <TopBarButton
          onClick={(e) => {
            e.stopPropagation();
            setMailboxOpen(true);
            setMoreOptionsOpen(false);
          }}
          style={{ position: "relative" }}
          title="Mailbox"
        >
          <IoMdMail color={colors.mainWhite}></IoMdMail>
          {mailbox.length > 0 && <NotifAlert></NotifAlert>}
        </TopBarButton>
        <DropdownButtonContainer>
          <TopBarButton
            onClick={(e) => {
              e.stopPropagation();
              setMoreOptionsOpen(true);
            }}
            title="More options"
          >
            <TbDotsVertical color={colors.mainWhite}></TbDotsVertical>
          </TopBarButton>
          <MoreOptionsDropdown
            isOpen={moreOptionsOpen}
            close={() => {
              setMoreOptionsOpen(false);
            }}
            openValuesModal={() => {
              setChangeValuesOpen(true);
            }}
          ></MoreOptionsDropdown>
        </DropdownButtonContainer>
        <MobileTopBarButton
          onClick={() => {
            close();
          }}
        >
          <IoMdArrowRoundBack color={colors.mainWhite}></IoMdArrowRoundBack>
        </MobileTopBarButton>
      </ToolBar>
      <Separator></Separator>
      <Scrollable>
        <Chats>
          {chats.map((chat) => (
            <Chat
              key={chat.id}
              onClick={() => {
                pusher.unsubscribe(currentChat);
                setCurrentChat(chat.id);
                close();
              }}
              isSelected={currentChat === chat.id}
            >
              <p>{chat.chatname}</p>
              {chat.unreads > 0 && <UnreadAlert></UnreadAlert>}
            </Chat>
          ))}
        </Chats>
      </Scrollable>
    </LeftMenuContainer>
  );
};

export default LeftMenu;

const LeftMenuContainer = styled.div`
  max-width: 400px;
  flex: 1;
  border: 1px solid ${colors.lightHoverGray};
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  background: ${colors.background};
  box-sizing: border-box;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    position: absolute;
    z-index: 10;
    height: 100%;
    width: 90%;
    transform: translateX(-110%);
    box-shadow: 5px 0px 16px #0d0d0d8c;
  }
`;

const Scrollable = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  flex: 1;

  ::-webkit-scrollbar {
    background: ${colors.background};
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.lightHoverGray};
    border-radius: 9999px;
  }
`;

const Chats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  gap: 8px;
  padding-right: 8px;
  box-sizing: border-box;
`;

const Chat = styled.div<{ isSelected: boolean }>`
  ${(props) => (props.isSelected ? `background: ${colors.darkHoverGray};` : "")}
  color: ${colors.mainWhite};
  margin: 0;
  padding: 17px 10px;
  border: 1px solid transparent;
  border-radius: 3px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: 0.3s;
  p {
    margin: 0;
    font-size: 17px;
  }

  :hover {
    background: ${colors.darkHoverGray};
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    p {
      margin: 0;
      font-size: 13px;
    }
  }
`;

const ToolBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
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
  display: none;
  @media screen and (max-width: ${breakpoints.smallScreen}) {
    display: block;
  }
`;

const Separator = styled.div`
  height: 1px;
  width: 100%;
  background: ${colors.lightHoverGray};
`;

const UnreadAlert = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${colors.blue};
  margin-right: 32px;
`;

const NotifAlert = styled(UnreadAlert)`
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
`;

const DropdownButtonContainer = styled.div`
  position: relative;
`;
