import { useEffect, useRef, useState } from "react";

const useTimeRemaining = (isPaused, turnTime, turnTimeRemaining, frameRate) => {
  const intervalRef = useRef();
  const currentCountdown = useRef();
  const [countdownMax, setCountdownMax] = useState();
  const [endTimeDate, setEndTimeDate] = useState();
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    setCountdownMax(turnTime * 1000);
    const newEndTimeDate = new Date();
    newEndTimeDate.setMilliseconds(newEndTimeDate.getMilliseconds() + turnTimeRemaining * 1000);
    setEndTimeDate(newEndTimeDate);
    setTimeRemaining({});
  }, [turnTime, turnTimeRemaining]);

  useEffect(() => {
    if (!turnTimeRemaining || !frameRate || !countdownMax || !endTimeDate) {
      return;
    }

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isPaused) {
        currentCountdown.current = Math.min(turnTimeRemaining * 1000, countdownMax);
      } else {
        currentCountdown.current = Math.min(endTimeDate - new Date(), countdownMax);
      }

      setTimeRemaining({
        percentageRemaining: Math.max(0, Math.min(currentCountdown.current, countdownMax) / countdownMax),
        millisecondsRemaining: Math.max(0, currentCountdown.current, 0),
      });

      if (currentCountdown.current <= 0 || isPaused) {
        clearInterval(intervalRef.current);
      }
    }, 1000 / frameRate);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isPaused, turnTimeRemaining, frameRate, countdownMax, endTimeDate]);

  return timeRemaining;
};

export default useTimeRemaining;
