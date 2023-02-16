import React from "react";

type Props = {
  header: string;
  sectionClass?: string;
  hClass?: string;
  subHeader?: string;
  children: React.ReactNode;
  height?: string;
  width?: string;
  alt?: boolean;
};

const Section = (props: Props) => {
  let sectionClass = props.sectionClass
    ? props.sectionClass
    : "flex flex-col justify-around py-10";
  sectionClass += props.height ? ` ${props.height}` : "";
  sectionClass += props.width
    ? ` ${props.width}`
    : " xl:max-w-[1200px] xl:m-auto";
  sectionClass += props.alt ? " bg-dark" : "";

  return (
    <section className={sectionClass}>
      <h1
        className={`mx-auto w-fit text-6xl text-green-primary md:text-7xl ${
          props.hClass ? props.hClass : ""
        } ${
          props.alt
            ? " font-primary-solid text-green-light"
            : "font-primary-outline"
        }`}
      >
        {props.header}
      </h1>
      {props.subHeader && <h2>{props.subHeader}</h2>}
      {props.children}
    </section>
  );
};

export default Section;
