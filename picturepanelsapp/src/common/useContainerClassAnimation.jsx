import { useEffect, useRef, useState } from "react";

export function useContainerClassAnimation(entraceAnimation, exitAnimation) {
  const [isVisible, setIsVisible] = useState();
  const [className, setClassName] = useState();
  const hasBeenVisibleRef = useRef(false);

  useEffect(() => {
    if (isVisible) {
      hasBeenVisibleRef.current = true;
      setClassName(entraceAnimation);
      return;
    }

    if (hasBeenVisibleRef.current) {
      setClassName(exitAnimation);
    } else {
      setClassName("hidden");
    }
  }, [isVisible, entraceAnimation, exitAnimation]);

  return [className, setIsVisible];
}
