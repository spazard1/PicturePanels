import { useEffect, useState } from "react";

export function useQueryString(key) {
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    if (!key) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);

    setQueryString(urlParams.get(key));
  }, [key]);

  return queryString;
}
