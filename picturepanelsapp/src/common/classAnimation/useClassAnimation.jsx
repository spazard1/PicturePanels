import { useEffect, useState } from "react";

import "./ClassAnimation.css";

export function useClassAnimation(animationTime = 250) {
  const [classAnimation, setClassAnimation] = useState(false);

  useEffect(() => {
    if (classAnimation) {
      setTimeout(() => {
        setClassAnimation(false);
      }, animationTime);
    }
  }, [classAnimation, animationTime]);

  return [classAnimation, setClassAnimation];
}
