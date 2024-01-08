import styled from "@emotion/styled";
import { ISODateString } from "next-auth";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  onYes: () => void;
  question: string;
};

const AreYouSureModal: FC<ModalProps> = ({
  isOpen,
  close,
  onYes,
  question,
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
    <ModalBackground isOpen={isOpen}>
      <ModalContainer ref={modalRef}>
        <h3>{question}</h3>
        <ButtonsDiv>
          <button onClick={close}>No</button>
          <button
            onClick={() => {
              onYes();
              close();
            }}
          >
            Yes
          </button>
        </ButtonsDiv>
      </ModalContainer>
    </ModalBackground>
  );
};

export default AreYouSureModal;

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

const ButtonsDiv = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
`;
