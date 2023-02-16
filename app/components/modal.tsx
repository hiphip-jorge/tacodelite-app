import { link } from "fs";
import { useEffect, useState } from "react";
// import { modalContent } from "~/routes";
// import { buttons, links } from "~/utilities/components/modals.utils";

type Props = {
  isOpen: boolean;
  // contentList?: modalContent[];
  handleClose?: React.MouseEventHandler<HTMLButtonElement>;
  isButtons?: boolean;
};

const Modal = ({
  isOpen,
  // contentList,
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
  }, [isOpen]);

  return (
    <aside
      className={`modalMask lg:hidden ${menuClassState}`}
      onClick={handleClose}
    >
      <div className="modalContainer">
        <button
          className="animate-grow-n-shrink-subtle absolute -right-6 -top-6 z-30 h-12 w-12 rounded-full bg-green-primary p-4"
          onClick={handleClose}
        >
          <div className="h-5/6 w-5/6">
            {isOpen && <span className="cancel"></span>}
          </div>
        </button>
        <ul className="flex flex-col">
          {/* {contentList?.map((item, idx) => {
            return (
              <li
                key={idx}
                className="subtle-underline flex justify-center p-2 text-dark"
              >
                {isButtons ? buttons(item, handleClose) : links(item)}
              </li>
            );
          })} */}
        </ul>
      </div>
    </aside>
  );
};

export default Modal;
