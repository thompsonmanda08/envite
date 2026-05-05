"use client";
import React, { useState } from "react";

interface IProps {
  options: React.ReactElement[];
  onChange?: (selectedIndex: number) => void;
  value?: number;
  labelText?: string;
  required?: boolean;
}

interface OptionProps {
  index: number;
  selectedIndex?: number;

  onSelect: (index: number) => void;

  children: React.ReactNode;
}
const Option = (props: OptionProps) => {
  const isSelected = props.index === props.selectedIndex;
  return (
    <div
      className={`flex items-center gap-2 cursor-pointer transition duration-300  mx-1 rounded-md p-2 py-3  flex-1 text-xs font-bold text-slate-600 lg:font-normal w-full min-w-fit lg:text-sm hover:shadow-md border border-slate-900/5 hover:border-slate-900/10 ${
        isSelected && "bg-slate-900/10  border-slate-900/20"
      }`}
      onClick={() => props.onSelect(props.index)}
    >
      <div
        className={`rounded-full flex items-center justify-center w-6 h-6 aspect-square border transition ${
          isSelected && "border-2 border-slate-900 "
        } `}
      >
        <div
          className={`rounded-full w-[80%] aspect-square h-[80%] border transition ${
            isSelected && "bg-slate-900 border-black"
          } `}
        />
      </div>
      {props.children}
    </div>
  );
};

const RadioGroup = ({
  options,
  onChange,
  value = 0,
  labelText,
  required,
}: IProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    value || 0
  );
  function onSelect(index: number) {
    setSelectedIndex(index);
    onChange?.(index);
  }
  return (
    <div className="flex flex-col gap-y-2 w-full">
      {labelText && (
        <label className="text-slate-500 font-medium leading-[1.125rem] tracking-wide text-sm">
          {labelText}{" "}
          {required && <span className="font-bold text-red-500"> *</span>}
        </label>
      )}
      <div className="flex flex-row justify-between flex-1 min-w-full">
        {options.map((el, index) => (
          <Option
            key={index}
            index={index}
            selectedIndex={selectedIndex}
            onSelect={(index: number) => onSelect(index)}
          >
            {el}
          </Option>
        ))}
      </div>
    </div>
  );
};
export default RadioGroup;
