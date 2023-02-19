import React from "react";

type Props = {
  className?: string;
  iconSVG: JSX.Element;
  handleClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
};

const IconButton = ({ className = "", iconSVG, handleClick }: Props) => {
  return (
    <button onClick={handleClick} className={`w-8 p-2 md:w-10 ${className}`}>
      {iconSVG}
    </button>
  );
};

export default IconButton;
