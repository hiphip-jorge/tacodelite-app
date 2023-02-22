import type { ReactNode } from "react";

type Props = {
  children: ReactNode | string;
  className?: string;
  handleClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  primary?: boolean;
};

const Button = (props: Props) => {
  const className = props.primary
    ? "button-primary " + props.className
    : "button-secondary " + props.className;

  return (
    <button className={className} onClick={props.handleClick}>
      {props.children}
    </button>
  );
};

export default Button;
