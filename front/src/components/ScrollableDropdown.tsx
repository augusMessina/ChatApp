import { Notif, NotifType, OutgoingRequest } from "@/types/notif";
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
      <Scrollable>
        {items.length > 0 && (
          <ChatsColumn>
            {items.map((item) => (
              <ChatJoin key={item.id ?? item.label}>
                <p>{item.label}</p>
                <button
                  onClick={() => onButtonClick(item.id)}
                  disabled={disabledCondition(item.id)}
                >
                  {item.buttonLabel}
                </button>
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
