import { breakpoints } from "@/utils/breakpoints";
import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { FC, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  onYes: () => void;
  question: string;
  highlight?: string;
};

const AreYouSureModal: FC<ModalProps> = ({
  isOpen,
  close,
  onYes,
  question,
  highlight,
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
      <Wrap>
        <OuterContainer>
          <CloseButton
            onClick={() => {
              close();
            }}
          >
            <IoMdClose color={colors.darkText}></IoMdClose>
          </CloseButton>
          <ModalContainer ref={modalRef}>
            <p>
              {question} <HighlightBubble>{highlight}</HighlightBubble> ?
            </p>
            <ButtonsDiv>
              <ModalButton onClick={close}>No</ModalButton>
              <ModalButton
                onClick={() => {
                  onYes();
                  close();
                }}
              >
                Yes
              </ModalButton>
            </ButtonsDiv>
          </ModalContainer>
        </OuterContainer>
      </Wrap>
    </ModalBackground>
  );
};

export default AreYouSureModal;

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

  p {
    font-size: 18px;
    text-align: center;
    line-height: 2;
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    p {
      font-size: 14px;
    }
    gap: 12px;
  }
`;

const ButtonsDiv = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
`;

const HighlightBubble = styled.span`
  padding: 8px 8px;
  background: ${colors.darkHoverGray};
  color: ${colors.mainWhite};
  border-radius: 5px;
`;

const ModalButton = styled.button`
  padding: 12px 20px;
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
  }
`;
