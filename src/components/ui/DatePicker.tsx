"use client";

import React, { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, value, onChange, name, placeholder = "Select date", maxDate, minDate }, ref) => {
    const selectedDate = value ? new Date(value) : null;

    const handleChange = (date: Date | null) => {
      if (date) {
        // Format as YYYY-MM-DD for form compatibility
        const formatted = date.toISOString().split("T")[0];
        onChange?.(formatted);
      } else {
        onChange?.("");
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-base font-medium text-secondary mb-2"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {label}
          </label>
        )}

        {/* Hidden input for form compatibility */}
        <input type="hidden" name={name} value={value || ""} ref={ref} />

        <ReactDatePicker
          selected={selectedDate}
          onChange={handleChange}
          dateFormat="MMMM d, yyyy"
          placeholderText={placeholder}
          maxDate={maxDate}
          minDate={minDate}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          yearDropdownItemNumber={100}
          scrollableYearDropdown
          className={cn(
            "flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "transition-all duration-200",
            error && "border-red-500 focus:ring-red-500"
          )}
          calendarClassName="custom-datepicker"
          wrapperClassName="w-full"
        />

        {error && (
          <p
            className="mt-1 text-base text-red-500"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {error}
          </p>
        )}

        <style jsx global>{`
          .custom-datepicker {
            font-family: var(--font-outfit);
            border: 2px solid rgb(95, 101, 196);
            border-radius: 12px;
            box-shadow: 0 0 30px rgba(95, 101, 196, 0.2);
          }

          .react-datepicker__header {
            background: linear-gradient(to bottom right, rgb(95, 101, 196), rgb(147, 112, 219));
            border-bottom: none;
            border-radius: 10px 10px 0 0;
            padding-top: 12px;
          }

          .react-datepicker__current-month,
          .react-datepicker__day-name {
            color: white;
            font-weight: 600;
          }

          .react-datepicker__day-name {
            font-size: 0.875rem;
            margin: 0.4rem;
          }

          .react-datepicker__month {
            margin: 0.8rem;
          }

          .react-datepicker__day {
            width: 2.2rem;
            line-height: 2.2rem;
            margin: 0.3rem;
            border-radius: 8px;
            color: rgb(51, 65, 85);
            transition: all 0.2s;
            font-weight: 500;
          }

          .react-datepicker__day:hover {
            background-color: rgba(95, 101, 196, 0.1);
            border-radius: 8px;
          }

          .react-datepicker__day--selected,
          .react-datepicker__day--keyboard-selected {
            background: linear-gradient(135deg, rgb(95, 101, 196), rgb(147, 112, 219));
            color: white;
            font-weight: 700;
            border-radius: 8px;
          }

          .react-datepicker__day--selected:hover,
          .react-datepicker__day--keyboard-selected:hover {
            background: linear-gradient(135deg, rgb(85, 91, 186), rgb(137, 102, 209));
          }

          .react-datepicker__day--today {
            background-color: rgba(95, 101, 196, 0.15);
            font-weight: 700;
            border-radius: 8px;
          }

          .react-datepicker__day--disabled {
            color: rgb(203, 213, 225);
            cursor: not-allowed;
          }

          .react-datepicker__day--disabled:hover {
            background-color: transparent;
          }

          .react-datepicker__day--outside-month {
            color: rgb(203, 213, 225);
          }

          .react-datepicker__navigation {
            top: 12px;
          }

          .react-datepicker__navigation-icon::before {
            border-color: white;
            border-width: 2px 2px 0 0;
          }

          .react-datepicker__navigation:hover *::before {
            border-color: rgb(226, 232, 240);
          }

          .react-datepicker__month-dropdown,
          .react-datepicker__year-dropdown {
            background-color: white;
            border: 2px solid rgb(95, 101, 196);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            font-family: var(--font-outfit);
          }

          .react-datepicker__month-option,
          .react-datepicker__year-option {
            padding: 8px 12px;
            font-weight: 500;
            transition: all 0.2s;
          }

          .react-datepicker__month-option:hover,
          .react-datepicker__year-option:hover {
            background-color: rgba(95, 101, 196, 0.1);
          }

          .react-datepicker__month-option--selected,
          .react-datepicker__year-option--selected {
            background: linear-gradient(135deg, rgb(95, 101, 196), rgb(147, 112, 219));
            color: white;
            font-weight: 700;
          }

          .react-datepicker__year-read-view--down-arrow,
          .react-datepicker__month-read-view--down-arrow {
            border-color: white;
            border-width: 2px 2px 0 0;
          }

          .react-datepicker__year-dropdown--scrollable {
            max-height: 300px;
          }
        `}</style>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
