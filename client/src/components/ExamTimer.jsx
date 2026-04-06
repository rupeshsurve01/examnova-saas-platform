import { useEffect, useMemo, useRef, useState } from "react";

function formatRemaining(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function ExamTimer({ startedAt, duration, onTimeUp }) {
  const timeoutTriggeredRef = useRef(false);
  const endTime = useMemo(() => {
    if (!startedAt || !duration) {
      return null;
    }

    return new Date(startedAt).getTime() + Number(duration) * 60 * 1000;
  }, [startedAt, duration]);
  const calculateRemainingSeconds = () => {
    if (!endTime) {
      return 0;
    }

    return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  };
  const [remainingSeconds, setRemainingSeconds] = useState(
    calculateRemainingSeconds(),
  );

  useEffect(() => {
    timeoutTriggeredRef.current = false;
    setRemainingSeconds(calculateRemainingSeconds());

    if (!endTime) {
      return undefined;
    }

    const tick = () => {
      const nextRemaining = calculateRemainingSeconds();
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0 && !timeoutTriggeredRef.current) {
        timeoutTriggeredRef.current = true;
        onTimeUp?.();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [endTime, onTimeUp]);

  const warningClass =
    remainingSeconds <= 300
      ? "exam-timer-critical"
      : remainingSeconds <= 900
        ? "exam-timer-warning"
        : "";

  return (
    <div className={`exam-timer ${warningClass}`.trim()}>
      <p className="exam-timer-label">Time Remaining</p>
      <p className="exam-timer-value">{formatRemaining(remainingSeconds)}</p>
    </div>
  );
}

export default ExamTimer;
