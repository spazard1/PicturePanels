import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import getWhitelistTags from "./getWhitelistTags";
import { useQueryString } from "./useQueryString";

import "@yaireo/tagify/dist/tagify.css";
import "./Tagify.css";

export function useTags() {
  const [whitelistTags, setWhitelistTags] = useState();
  const queryTagsString = useQueryString("tags");
  const whitelistTagsDictionary = useRef({});

  const decorateSortOrder = useCallback((tags) => {
    return tags?.map((tag) => ({ value: tag, "data-sortorder": whitelistTagsDictionary.current[tag] }));
  }, []);

  const queryTags = useMemo(() => decorateSortOrder(queryTagsString?.split(",").filter((e) => e)), [decorateSortOrder, queryTagsString]);

  const tagifySettings = useMemo(
    () => ({
      originalInputValueFormat: (valuesArr) => valuesArr.map((item) => item.value).join(","),
      maxTags: 6,
      userInput: true,
      placeholder: "tags",
      dropdown: {
        maxItems: 30,
        classname: "tags-look",
        enabled: 0,
        closeOnSelect: false,
        placeAbove: true,
      },
    }),
    []
  );

  useEffect(() => {
    getWhitelistTags((serverTags) => {
      if (!serverTags) {
        return;
      }

      for (var tag of serverTags.tags) {
        whitelistTagsDictionary.current[tag.tag] = tag.sortOrder;
      }

      setWhitelistTags(serverTags.tags.map((tag) => ({ value: tag.tag, "data-sortorder": tag.sortOrder })));
    });
  }, []);

  return { whitelistTags, queryTags, tagifySettings, decorateSortOrder };
}
