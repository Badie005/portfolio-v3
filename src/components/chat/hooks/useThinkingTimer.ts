import { useState, useEffect, useCallback, useRef } from 'react';

export function useThinkingTimer(isActive: boolean): {
    thinkingTime: number;
    thinkingTimeRef: React.MutableRefObject<number>;
    resetTimer: () => void;
} {
    const [thinkingTime, setThinkingTime] = useState(0);
    const thinkingTimeRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            thinkingTimeRef.current = 0;
            setThinkingTime(0);
            
            intervalRef.current = setInterval(() => {
                thinkingTimeRef.current += 1;
                setThinkingTime(thinkingTimeRef.current);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive]);

    const resetTimer = useCallback(() => {
        thinkingTimeRef.current = 0;
        setThinkingTime(0);
    }, []);

    return {
        thinkingTime,
        thinkingTimeRef,
        resetTimer,
    };
}

export function useThinkingTimerState(isActive: boolean): number {
    const [thinkingTime, setThinkingTime] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            setThinkingTime(0);
            intervalRef.current = setInterval(() => {
                setThinkingTime(t => t + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive]);

    return thinkingTime;
}
