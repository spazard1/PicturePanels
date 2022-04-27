import { useCallback } from "react";

export function usePlayerVibrate() {
  navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

  const vibrate = useCallback((vibratePattern) => {
    if (navigator.vibrate) {
      navigator.vibrate(vibratePattern);
    }
  }, []);

  return { vibrate };
}
