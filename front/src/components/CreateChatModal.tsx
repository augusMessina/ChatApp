import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { FC, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: string;
  chats: { id: string; chatname: string }[];
  setChats: (chats: { id: string; chatname: string }[]) => void;
};

const CreateChatModal: FC<ModalProps> = ({
  isOpen,
  close,
  userId,
  chats,
  setChats,
}) => {
  const [chatname, setChatname] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

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
  }, [close, isOpen]);

  const createChat = async () => {
    const res = await fetch("http://localhost:8080/createChat", {
      method: "POST",
      body: JSON.stringify({
        chatname: chatname,
        password: isPrivate,
        user_id: userId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      setChats([{ id: data.id, chatname: data.chatname }, ...chats]);
      close();
    } else {
      close();
    }
  };

  return (
    <ModalBackground isOpen={isOpen}>
      <Wrap>
        <OuterContainer>
          <CloseButton
            onClick={() => {
              close();
              setChatname("");
              setIsPrivate(false);
            }}
          >
            <IoMdClose color={colors.darkText}></IoMdClose>
          </CloseButton>

          <ModalContainer ref={modalRef}>
            <Title>Create a chat</Title>

            <InputsDiv>
              <ModalInput
                onChange={(e) => {
                  setChatname(e.target.value);
                }}
                value={chatname}
                placeholder="Chat name..."
              ></ModalInput>
              <Toggle
                isActive={isPrivate}
                onClick={() => {
                  setIsPrivate(!isPrivate);
                }}
              >
                Private
              </Toggle>
              {/* <div>
                <label>Private</label>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setIsPrivate(e.target.checked);
                  }}
                ></input>
              </div> */}
            </InputsDiv>

            <ModalButton
              onClick={() => {
                createChat();
                close();
                setChatname("");
                setIsPrivate(false);
              }}
            >
              Create
            </ModalButton>
          </ModalContainer>
        </OuterContainer>
      </Wrap>
    </ModalBackground>
  );
};

export default CreateChatModal;

const ModalBackground = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
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
`;

const Title = styled.h3`
  text-align: center;
  color: ${colors.mainWhite};
  margin-top: 8px;
  margin-bottom: 16px;
`;

const InputsDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
`;

const Toggle = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.isActive ? colors.darkText : "transparent")};
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;

  :hover {
    background: ${(props) => (props.isActive ? "" : colors.darkHoverGray)};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 24px;
  height: 24px;
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

const ModalInput = styled.input`
  padding: 12px 20px;
  box-sizing: border-box;
  background: transparent;
  color: ${colors.mainWhite};
  border-color: ${colors.mainWhite};
  border-style: solid;
  border-image: none;
  border-width: 1px;
  border-color: transparent;
  border-bottom: 1px solid ${colors.mainWhite};
  font-weight: 500;
  font-size: 16px;
  transition: 0.4s;

  :focus {
    border: 1px solid ${colors.mainWhite};
    border-radius: 3px;
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
`;
