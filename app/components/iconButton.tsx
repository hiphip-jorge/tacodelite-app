import React from "react";

type Props = {
  iconSVG: JSX.Element;
  handleClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
};

const IconButton = ({ iconSVG, handleClick }: Props) => {
  return (
    <button onClick={handleClick} className="w-8 flex items-center justify-center p-2 md:w-10">
      {iconSVG}
    </button>
  );
};

export default IconButton;
