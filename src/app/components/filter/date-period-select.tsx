import "./filter.css";

interface DatePeriodSelectProps {
  from: number;
  to: number;
  onSelectFrom: (from: number) => void;
  onSelectTo: (to: number) => void;
}

function getDateInputFormat(timestamp: number) {
  const date = new Date(timestamp);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getDate().toString().padStart(2, "0");
  return `${date.getFullYear()}-${month}-${year}`;
}

function parseDateInputFormat(dateString: string) {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.valueOf();
}

export function DatePeriodSelect({
  from,
  to,
  onSelectFrom,
  onSelectTo,
}: DatePeriodSelectProps) {
  return (
    <div>
      <input
        type="date"
        className="filter"
        value={getDateInputFormat(from)}
        onChange={(ev) => onSelectFrom(parseDateInputFormat(ev.target.value))}
        max={getDateInputFormat(Date.now())}
      />
      <span className="filter">To</span>
      <input
        type="date"
        className="filter"
        value={getDateInputFormat(to)}
        onChange={(ev) => onSelectTo(parseDateInputFormat(ev.target.value))}
        max={getDateInputFormat(Date.now())}
      />
    </div>
  );
}
