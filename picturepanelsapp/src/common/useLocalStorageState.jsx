import { useEffect, useState } from "react";

export function useLocalStorageState(keyName, initialValue) {
  const [state, setState] = useState(localStorage.getItem(keyName) ?? initialValue);

  useEffect(() => {
    if (!keyName) {
      return;
    }

    if (!state) {
      localStorage.removeItem(keyName);
      return;
    }

    localStorage.setItem(keyName, state);
  }, [keyName, state]);

  useEffect(() => {
    if (initialValue && !localStorage.getItem(keyName)) {
      localStorage.setItem(keyName, initialValue);
    }
  }, [keyName, initialValue]);

  return [state, setState];
}
