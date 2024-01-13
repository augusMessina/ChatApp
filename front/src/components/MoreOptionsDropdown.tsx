import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { signOut } from "next-auth/react";
import { FC, MouseEventHandler, useEffect, useRef, useState } from "react";
import { MdLogout } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import ChangeValuesModal from "./ChangeValuesModal";
import { breakpoints } from "@/utils/breakpoints";

type MoreOptionsDropdownProps = {
  isOpen: boolean;
  close: () => void;
  openValuesModal: () => void;
};

const MoreOptionsDropdown: FC<MoreOptionsDropdownProps> = ({
  isOpen,
  close,
  openValuesModal,
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
    <DropdownContainer isOpen={isOpen} ref={modalRef}>
      <Column>
        <Option style={{ borderBottom: `1px solid ${colors.darkText}` }}>
          <p>Logout</p>
          <TopBarButton onClick={() => signOut()}>
            <MdLogout color={colors.red}></MdLogout>
          </TopBarButton>
        </Option>
        <Option>
          <p>Change user values</p>
          <TopBarButton
            onClick={(e) => {
              e.stopPropagation();
              close();
              openValuesModal();
            }}
          >
            <IoSettingsSharp color={colors.mainWhite}></IoSettingsSharp>
          </TopBarButton>
        </Option>
      </Column>
    </DropdownContainer>
  );
};

export default MoreOptionsDropdown;

const DropdownContainer = styled.div<{
  isOpen: boolean;
}>`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: absolute;
  right: 0;
  height: fit-content;
  width: 200px;
  background: ${colors.darkHoverGray};
  box-shadow: 0px 0px 10px ${colors.lightHoverGray};
  border-radius: 3px;
  padding: 16px;
  box-sizing: border-box;

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    width: 150px;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
`;

const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: ${colors.mainWhite};

  p {
    flex: 1;
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    p {
      font-size: 12px;
    }
  }
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
