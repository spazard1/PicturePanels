import { useEffect, useState } from "react";
import getTags from "./getTags";

export function useTags() {
  const [tags, setTags] = useState();

  useEffect(() => {
    getTags((tags) => {
      if (!tags) {
        return;
      }
      setTags(tags);
    });
  }, []);

  return { tags };
}
