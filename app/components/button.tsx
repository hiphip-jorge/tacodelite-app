type Props = {
  children: string;
  className?: string;
  handleClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  primary?: boolean;
};

const Button = (props: Props) => {
  return (
    <button
      className={
        (props.primary
          ? "button-primary " + props.className
          : "button-secondary ") + props.className
      }
      onClick={props.handleClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
