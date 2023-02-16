import React from "react";

type Props = { message: string };

const AnnouncementBar = ({ message }: Props) => {
  return (
    <div className="flex h-10 w-full items-center justify-between bg-dark">
      <p className="ml-4 font-secondary-secular text-white">{message}</p>
      <button className="h-full border-l-2 border-gray-800 bg-gray-700 px-3 font-secondary-secular text-white hover:bg-red-700">
        X
      </button>
    </div>
  );
};

export default AnnouncementBar;
