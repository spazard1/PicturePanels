import { useState } from "react";

export function useQueryString(key) {
  const urlParams = new URLSearchParams(window.location.search);
  const [queryString] = useState(urlParams.get(key));

  return queryString;
}
