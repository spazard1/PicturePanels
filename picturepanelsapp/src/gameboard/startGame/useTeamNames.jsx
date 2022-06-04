import { useCallback, useEffect, useRef, useState } from "react";
import getTeamNames from "../../common/getTeamNames";

export function useTeamNames(setSpinAnimation) {
  const isFirstLoadRef = useRef(true);
  const [teamNames, setTeamNames] = useState();

  const refreshTeamNames = useCallback(() => {
    if (!isFirstLoadRef.current) {
      setSpinAnimation(true);
    } else {
      isFirstLoadRef.current = false;
    }

    getTeamNames((tn) => {
      setTeamNames(tn);
    });
  }, [setSpinAnimation]);

  useEffect(() => {
    refreshTeamNames();
  }, [refreshTeamNames]);

  return { teamNames, refreshTeamNames };
}
