import { useEffect, useState } from "react";
import getTeamNames from "../../common/getTeamNames";

export function useTeamNames() {
  const [teamNames, setTeamNames] = useState();

  const refreshTeamNames = () => {
    getTeamNames((tn) => {
      setTeamNames(tn);
    });
  };

  useEffect(() => {
    refreshTeamNames();
  }, []);

  return { teamNames, refreshTeamNames };
}
