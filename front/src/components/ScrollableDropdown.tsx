import { Notif, NotifType, OutgoingRequest } from "@/types/notif";
import { breakpoints } from "@/utils/breakpoints";
import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

type DropdownProps = {
  isOpen: boolean;
  close: () => void;
  items: { label: string; buttonLabel: string; id: string }[];
  onButtonClick: (itemId: string) => any;
  disabledCondition: (itemId: string) => boolean;
  emptyText: string;
  title: string;
  width: number;
  height: number;
};

const ScrollableDropdown: FC<DropdownProps> = ({
  isOpen,
  close,
  items,
  onButtonClick,
  disabledCondition,
  emptyText,
  title,
  width,
  height,
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

  return (
    <DropdownContainer
      isOpen={isOpen}
      ref={modalRef}
      width={width}
      height={height}
    >
      <Title>{title}</Title>
      <Scrollable>
        {items.length > 0 && (
          <ChatsColumn>
            {items.map((item) => (
              <ChatJoin key={item.id ?? item.label}>
                <p>{item.label}</p>
                <ModalButton
                  style={{
                    width: "unset",
                    boxSizing: "border-box",
                  }}
                  onClick={() => onButtonClick(item.id)}
                  disabled={disabledCondition(item.id)}
                >
                  {item.buttonLabel}
                </ModalButton>
              </ChatJoin>
            ))}
          </ChatsColumn>
        )}

        {items.length === 0 && <h3>{emptyText}</h3>}
      </Scrollable>
    </DropdownContainer>
  );
};

export default ScrollableDropdown;

const DropdownContainer = styled.div<{
  isOpen: boolean;
  width: number;
  height: number;
}>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  right: 0;
  bottom: ${(props) => `-${props.height + 4}px`};
  height: ${(props) => `${props.height}px`};
  width: ${(props) => `${props.width}px`};
  background: ${colors.darkHoverGray};
  box-shadow: 0px 0px 10px ${colors.lightHoverGray};
  border-radius: 3px;
  padding: 16px;
  box-sizing: border-box;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    bottom: ${(props) => `-${props.height * 0.75 + 4}px`};

    height: ${(props) => `${props.height * 0.75}px`};
    width: ${(props) => `${props.width * 0.75}px`};
  }
`;

const Title = styled.h3`
  text-align: center;
  color: ${colors.mainWhite};
  margin-top: 8px;
  margin-bottom: 16px;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 14px;
  }
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
`;

const ChatJoin = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid ${colors.darkText};
  padding-bottom: 8px;
  color: ${colors.mainWhite};

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    p {
      font-size: 12px;
    }
  }
`;

const ModalButton = styled.button`
  padding: 8px 20px;
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
    padding: 8px 16px;
    max-width: 100px;
  }
`;
