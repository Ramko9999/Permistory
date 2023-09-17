import { useRef } from "react";
import "./filter.css";
import { createDateRangeFromNow, formatDateForDashboard } from "../../util";

function toDateInputFormat(timestamp: number) {
  const date = new Date(timestamp);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${month}-${year}`;
}

function parseDateInputFormat(dateString: string) {
  const date = new Date(dateString);
  // passing in `yyyy-MM-dd` format into Date doesn't result in a TZ aware date
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.valueOf();
}

interface DateInputProps {
  date: number;
  onChange: (d: number) => void;
}

function DateInput({ date, onChange }: DateInputProps) {
  const nativeDateInputRef = useRef<HTMLInputElement>(null);
  const openDatePicker = () => {
    if (nativeDateInputRef.current) {
      nativeDateInputRef.current.showPicker();
    }
  };

  return (
    <div>
      <div onClick={openDatePicker} className="date-input-display">
        {formatDateForDashboard(new Date(date))}
      </div>
      <input
        ref={nativeDateInputRef}
        type="date"
        value={toDateInputFormat(date)}
        onChange={(ev) => onChange(parseDateInputFormat(ev.target.value))}
        max={toDateInputFormat(Date.now())}
      />
    </div>
  );
}

const ranges: { [index: string]: number } = {
  "Last Week": 6,
  "Last 30 days": 29,
};

function isRange(from: number, to: number, range: string) {
  if (range in ranges) {
    const { from: expectedFrom, to: expectedTo } = createDateRangeFromNow(
      ranges[range]
    );
    return from === expectedFrom && to === expectedTo;
  }
  return false;
}

interface DatePeriodSelect {
  from: number;
  to: number;
  onSelectFrom: (from: number) => void;
  onSelectTo: (to: number) => void;
}

function DatePeriodSelect({
  from,
  to,
  onSelectFrom,
  onSelectTo,
}: DatePeriodSelect) {
  const doesSomeRangeApply = Object.keys(ranges).some((range) =>
    isRange(from, to, range)
  );

  const onPeriodSelectionChange = (range: string) => {
    if (range in ranges) {
      const { from: newFrom, to: newTo } = createDateRangeFromNow(
        ranges[range]
      );
      onSelectFrom(newFrom);
      onSelectTo(newTo);
    }
  };

  return (
    <select
      className="date-period-select"
      onChange={(ev) => onPeriodSelectionChange(ev.target.value)}
    >
      {Object.keys(ranges).map((range, idx) => (
        <option key={idx} value={range} selected={isRange(from, to, range)}>
          {range}
        </option>
      ))}
      <option value="Custom" selected={!doesSomeRangeApply}>
        Custom
      </option>
    </select>
  );
}

interface DatePeriodPickerProps {
  from: number;
  to: number;
  onSelectFrom: (from: number) => void;
  onSelectTo: (to: number) => void;
}

export function DatePeriodPicker({
  from,
  to,
  onSelectFrom,
  onSelectTo,
}: DatePeriodPickerProps) {
  return (
    <div className="date-period-picker filter">
      <DatePeriodSelect
        from={from}
        to={to}
        onSelectFrom={onSelectFrom}
        onSelectTo={onSelectTo}
      />
      <DateInput date={from} onChange={onSelectFrom} />
      -
      <DateInput date={to} onChange={onSelectTo} />
    </div>
  );
}
