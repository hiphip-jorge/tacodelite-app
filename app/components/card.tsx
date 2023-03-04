import { useState } from "react";
import { motion } from "framer-motion";
import { leaf_icon, menu_arrow } from "~/assets/svg";

type item = {
  name: string;
  description: string;
  price: string;
  categoryId: Number | null;
};

type Props = {
  item: item;
  id: string;
  className?: string;
  vegetarian: boolean;
};

const Card = ({ item, id, className, vegetarian }: Props) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <motion.button
      id={id}
      className={
        (className ? className + " " : "") +
        (isOpen ? "w-[280px] shadow-2xl " : "h-44 ") +
        "card"
      }
      layout
      transition={{ layout: { duration: 0.25, type: "spring" } }}
      onClick={() => setOpen((prev) => !prev)}
    >
      <motion.div
        className="flex w-full justify-between gap-4"
        layout="position"
      >
        <h3 className="text-left font-primary-solid text-2xl leading-6 text-green-dark">
          {item.name}
        </h3>
        <div className={`mt-1 h-fit ${isOpen ? "open" : "close"}`}>
          {menu_arrow}
        </div>
      </motion.div>
      {isOpen && (
        <motion.p
          className={`self-start  text-left font-secondary-secular tracking-wider ${
            item.categoryId === 14 && "whitespace-pre"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {item.description.replaceAll("| ", "\n")}
        </motion.p>
      )}
      <div className="flex w-full items-center justify-between">
        <p className="font-secondary-secular text-2xl text-green-primary">
          {"$" + item.price}
        </p>
        {vegetarian && <div className="w-6">{leaf_icon}</div>}
      </div>
    </motion.button>
  );
};

export default Card;
