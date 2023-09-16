import { useState } from "react"

interface Period {
    from: number,
    to: number,
}

interface UseSelectPeriodProps {
    initialFrom: number,
    initialTo: number
}

export function usePeriod({initialFrom, initialTo}: UseSelectPeriodProps){
    const [period, setPeriod] = useState<Period>({from:initialFrom, to:initialTo});

    const setFrom = (newFrom: number) => {
        const {to} = period;
        setPeriod({from: newFrom, to: Math.max(to, newFrom)});
    }

    const setTo = (newTo: number) => {
        const {from} = period;
        setPeriod({from: Math.min(newTo, from), to: newTo});
    }

    return {period, setFrom, setTo}
}