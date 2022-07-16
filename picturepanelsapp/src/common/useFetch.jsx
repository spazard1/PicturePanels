import { useEffect, useState } from "react";
import serverUrl from "./ServerUrl";

const useFetch = (url, method, body) => {
  const [data, setData] = useState();
  const [isLoaded, setIsLoaded] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    if (!url || !method) {
      return;
    }

    let fetchOptions = {};
    if (method === "GET") {
      fetchOptions = {
        method: method,
      };
    } else {
      fetchOptions = {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      };
    }

    fetch(serverUrl + url, fetchOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setData(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }, [url, method, body]);

  return [data, isLoaded, error];
};

export default useFetch;
