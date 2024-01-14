import { breakpoints } from "@/utils/breakpoints";
import { colors } from "@/utils/colors";
import styled from "@emotion/styled";
import { FC, useEffect, useRef, useState } from "react";

type CustomSelectProps = {
  defaultText: string;
  items: { label: string; value: any }[];
  onChange: (item: string) => void;
};

const CustomSelect: FC<CustomSelectProps> = ({
  defaultText,
  items,
  onChange,
}) => {
  const [selectedText, setSelectedText] = useState(defaultText);
  const [isOpen, setIsOpen] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: any) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(e.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };
    const checkIfEscPressed = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", checkIfClickedOutside);
    document.addEventListener("keydown", checkIfEscPressed);
    return () => {
      document.removeEventListener("click", checkIfClickedOutside);
      document.removeEventListener("keydown", checkIfEscPressed);
    };
  }, [isOpen]);

  return (
    <SelectContainer>
      <SelectDislpay
        isOpen={isOpen}
        isDefault={selectedText === defaultText}
        onClick={(e) => {
          if (!isOpen) e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <p>{selectedText}</p>
      </SelectDislpay>
      <SelectOptionsContainer isOpen={isOpen} ref={selectRef}>
        <OptionsColumn>
          {items.map((item) => (
            <Option
              key={item.label}
              onClick={() => {
                setSelectedText(item.label);
                setIsOpen(false);
                onChange(item.value);
              }}
            >
              {item.label}
            </Option>
          ))}
        </OptionsColumn>
      </SelectOptionsContainer>
    </SelectContainer>
  );
};

export default CustomSelect;

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectDislpay = styled.div<{ isOpen: boolean; isDefault: boolean }>`
  background: ${(props) =>
    props.isOpen ? colors.lightHoverGray : "transparent"};
  padding: 12px 20px;
  border-bottom: 1px solid ${colors.mainWhite};
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  p {
    font-size: 16px;
    color: ${(props) => (props.isDefault ? colors.darkText : colors.mainWhite)};
    margin: 0;
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    p {
      font-size: 12px;
    }
    padding: 8px 4px;
  }
`;

const SelectOptionsContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  display: ${(props) => (props.isOpen ? "block" : "none")};
  width: 100%;
  height: 300px;
  overflow: auto;
  background: ${colors.background};
`;

const OptionsColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

const Option = styled.div`
  padding: 12px 20px;
  box-sizing: border-box;
  border-bottom: 1px solid ${colors.mainWhite};
  color: ${colors.mainWhite};
  width: 100%;
  background: transparent;
  transition: 0.3s;

  :hover {
    background: ${colors.lightHoverGray};
  }

  @media screen and (max-width: ${breakpoints.smallScreen}) {
    font-size: 12px;

    padding: 12px 12px;
  }
`;
