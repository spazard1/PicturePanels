import { useEffect, useState } from "react";

export function useLocalStorageState(keyName) {
  const [state, setState] = useState(localStorage.getItem(keyName));

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

  return [state, setState];
}
