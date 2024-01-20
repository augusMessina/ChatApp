import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import CustomSelect from "./CustomSelect";
import { languagesList } from "@/utils/languages";
import { useRouter } from "next/router";
import { checkUsernameValid } from "@/utils/checkUsernameValid";
import { breakpoints } from "@/utils/breakpoints";

type ModalProps = {
  isOpen: boolean;
  close: () => void;
  userId: string;
  username: string;
  language: string;
};

const ChangeValuesModal: FC<ModalProps> = ({
  isOpen,
  close,
  userId,
  username,
  language,
}) => {
  const [inputUsername, setInputUsername] = useState(username);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [showError, setShowError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const closeModal = useCallback(() => {
    close();
    setInputUsername(username);
    setSelectedLanguage(language);
    setShowError("");
  }, [close, language, username]);

  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        closeModal();
      }
    };
    const checkIfEscPressed = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("click", checkIfClickedOutside);
    document.addEventListener("keydown", checkIfEscPressed);
    return () => {
      document.removeEventListener("click", checkIfClickedOutside);
      document.removeEventListener("keydown", checkIfEscPressed);
    };
  }, [close, isOpen, closeModal]);

  const setUserdata = async () => {
    const res = await fetch("/api/setUserData", {
      method: "POST",
      body: JSON.stringify({
        username: inputUsername,
        language: selectedLanguage,
        id: userId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.message && data.message === "username already taken") {
        setShowError("Username already in use");
        return;
      }
      router.reload();
    }
  };

  return (
    <ModalBackground isOpen={isOpen}>
      <Wrap>
        <OuterContainer>
          <CloseButton
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
          >
            <IoMdClose color={colors.darkText}></IoMdClose>
          </CloseButton>

          <ModalContainer ref={modalRef}>
            <Title>User values</Title>

            <ModalInput
              onChange={(e) => {
                setInputUsername(e.target.value);
                setShowError("");
              }}
              value={inputUsername}
              placeholder="Username"
              maxLength={12}
            ></ModalInput>
            {showError && <Error>{showError}</Error>}
            <CustomSelect
              defaultText={
                languagesList.find((lan) => lan.value === language)!.label
              }
              items={languagesList}
              onChange={(item) => setSelectedLanguage(item)}
            ></CustomSelect>

            <ModalButton
              disabled={
                inputUsername === username && selectedLanguage === language
              }
              onClick={() => {
                const isValid = checkUsernameValid(inputUsername);
                if (isValid === "valid") {
                  setUserdata();
                } else {
                  setShowError(isValid);
                }
              }}
            >
              Update
            </ModalButton>
          </ModalContainer>
        </OuterContainer>
      </Wrap>
    </ModalBackground>
  );
};

export default ChangeValuesModal;

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

const ModalInput = styled.input`
  padding: 12px 20px;
  box-sizing: border-box;
  background: transparent;
  width: 100%;
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

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;
    padding: 12px 8px;
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

const Error = styled.p`
  color: ${colors.red};
  margin: 8px;
`;
