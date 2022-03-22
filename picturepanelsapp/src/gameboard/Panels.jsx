import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";
import MostVotesPanels from "./MostVotesPanels";
import usePrevious from "../common/usePrevious";
import { GetEntranceClass } from "../animate/Animate";
import "./Panels.css";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

export default function Panels({ players, revealedPanels, roundNumber }) {
  const [entranceClass, setEntranceClass] = useState("");
  const previousRevealedPanels = usePrevious(revealedPanels);

  useEffect(() => {
    if (!previousRevealedPanels || revealedPanels.length < previousRevealedPanels.length) {
      setEntranceClass(GetEntranceClass());
    }
  }, [revealedPanels]);

  const measuredRef = useCallback(
    (node) => {
      if (node !== null) {
        console.log(node);
        console.log(node.getBoundingClientRect().height);
      }
    },
    [roundNumber]
  );

  return (
    <>
      <div id="panels" className="panels center">
        {panelNumbers.map((panelNumber) => {
          return (
            <Panel
              ref={measuredRef}
              isOpen={revealedPanels.indexOf(panelNumber) >= 0}
              entranceClass={entranceClass}
              key={panelNumber}
              panelNumber={panelNumber}
              roundNumber={roundNumber}
            ></Panel>
          );
        })}
      </div>
      <MostVotesPanels players={players}></MostVotesPanels>
    </>
  );
}

Panels.propTypes = {
  players: PropTypes.object.isRequired,
  revealedPanels: PropTypes.arrayOf(PropTypes.string),
  roundNumber: PropTypes.number.isRequired,
};
