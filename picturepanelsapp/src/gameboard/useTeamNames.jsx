import { useEffect, useState } from "react";
import getTeamNames from "../common/getTeamNames";

export function useTeamNames() {
  const [teamNames, setTeamNames] = useState();

  useEffect(() => {
    getTeamNames((tn) => {
      setTeamNames(tn);
    });
  }, []);

  return { teamNames };
}
