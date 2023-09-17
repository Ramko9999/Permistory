import { useState } from "react";

interface Period {
  from: number;
  to: number;
}

interface UseSelectPeriodProps {
  initialFrom: number;
  initialTo: number;
}

export function usePeriod({ initialFrom, initialTo }: UseSelectPeriodProps) {
  const [period, setPeriod] = useState<Period>({
    from: initialFrom,
    to: initialTo,
  });

  const setFrom = (from: number) => {
    setPeriod(({ to }) => {
      return { from, to: Math.max(to, from) };
    });
  };

  const setTo = (to: number) => {
    setPeriod(({ from }) => {
      return { from: Math.min(to, from), to };
    });
  };

  return { period, setFrom, setTo };
}
