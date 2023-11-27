// import { link } from "fs";
import { useEffect, useState } from "react";
import type { modalContent } from "~/routes";
import { buttons, links } from "~/utils";

type Props = {
  isOpen: boolean;
  contentList?: modalContent[];
  handleClose?: React.MouseEventHandler<HTMLButtonElement>;
  isButtons?: boolean;
};

const Modal = ({
  isOpen,
  contentList,
  handleClose,
  isButtons = false,
}: Props) => {
  const [fadeOut, setFadeOut] = useState(false);
  const menuClassState = isOpen
    ? "sideMenu-fadeIn"
    : "" + !isOpen && fadeOut
    ? "sideMenu-fadeOut"
    : "" + !isOpen && !fadeOut
    ? "hidden"
    : "";

  useEffect(() => {
    // set true after the first menu open
    if (isOpen && !fadeOut) {
      setFadeOut(true);
    }
    // wait for fade out animation
    if (!isOpen) {
      setTimeout(() => {
        document.querySelector(".modalMask")?.classList.add("hidden");
      }, 350);
    }
  }, [isOpen, fadeOut]);

  return (
    <aside
      className={`modalMask lg:hidden ${menuClassState}`}
      onClick={handleClose}
    >
      <div className="modalContainer">
        <button
          className="absolute -right-6 -top-6 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 p-2 drop-shadow-md"
          onClick={handleClose}
        >
          <div>
            {isOpen && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-x"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="3"
                stroke="#eee"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M18 6l-12 12" />
                <path d="M6 6l12 12" />
              </svg>
            )}
          </div>
        </button>
        <ul className="flex flex-wrap gap-3 p-4">
          {contentList?.map((item, idx) => {
            return (
              <li
                key={idx}
                className="flex w-fit justify-center rounded-md bg-green-dark p-2 text-light"
              >
                {isButtons ? buttons(item, handleClose) : links(item)}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Modal;
