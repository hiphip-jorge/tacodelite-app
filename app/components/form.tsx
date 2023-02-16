import { useState } from "react";
import { Form as RemixForm } from "@remix-run/react";
import DatePicker from "react-datepicker";

type Props = {};

const Form = (props: Props) => {
  const [formStartDate, setFormStartDate] = useState(getValidDate(2));

  return (
    <RemixForm className=" pb-80" method="post">
      <fieldset className="">
        <label
          className="ml-2 font-primary-solid text-xl text-green-dark"
          htmlFor=""
        >
          Name
        </label>
        <input
          className="mb-1 w-full rounded-2xl border-4 border-[#43B64F] p-2"
          type="text"
          placeholder="Nombre"
          //   onChange={(e) => setName(e.target.value)}
        />
        <label
          className="ml-2 font-primary-solid text-xl text-green-dark"
          htmlFor=""
        >
          Email
        </label>
        <input
          className="mb-1 w-full rounded-2xl border-4 border-[#43B64F] p-2"
          type="email"
          placeholder="example@burrito.com"
          // onChange={e => setEmail(e.target.value)}
        />
        <label
          className="ml-2 font-primary-solid text-xl text-green-dark"
          htmlFor=""
        >
          Event Description
        </label>
        <textarea
          className="mb-1 rounded-2xl border-4 border-[#43B64F] p-2"
          placeholder="Tell us about your event."
          //   onChange={(e) => setDescription(e.target.value)}
          aria-label="Event Description"
          maxLength={185}
          rows={4}
          cols={30}
        />
        <label
          className="ml-2 font-primary-solid text-xl text-green-dark"
          htmlFor=""
        >
          Date
        </label>
        <DatePicker
          className="mb-6 w-full rounded-2xl border-4 border-[#43B64F] p-2"
          selected={formStartDate}
          onChange={(date: Date) => setFormStartDate(date)}
          minDate={getValidDate(2)}
          filterDate={isWeekday}
        />
        <button
          className="w-fit rounded-xl bg-[#43B64F] p-3 text-xl text-white"
          type="submit"
        >
          Send Off
        </button>
      </fieldset>
    </RemixForm>
  );
};

export default Form;

const getValidDate = (offset = 0) => {
  if (!isWeekday(getMinDate(offset))) {
    for (let i = 1; i < 3; i++) {
      if (isWeekday(getMinDate(offset + i))) return getMinDate(offset + i);
    }
  }

  return getMinDate(offset);
};

const getMinDate = (offset = 0) => {
  let minDate = new Date();
  minDate.setDate(minDate.getDate() + offset);
  return minDate;
};

const isWeekday = (date: Date) => {
  const day = new Date(date).getDay();
  return day !== 0 && day !== 6;
};
