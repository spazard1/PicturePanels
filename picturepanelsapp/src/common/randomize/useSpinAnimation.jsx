import { useEffect, useState } from "react";

import "./SpinAnimation.css";

export function useSpinAnimation(spinTime = 250) {
  const [spinAnimation, setSpinAnimation] = useState(false);

  useEffect(() => {
    if (spinAnimation) {
      setTimeout(() => {
        setSpinAnimation(false);
      }, spinTime);
    }
  }, [spinAnimation, spinTime]);

  return [spinAnimation, setSpinAnimation];
}
