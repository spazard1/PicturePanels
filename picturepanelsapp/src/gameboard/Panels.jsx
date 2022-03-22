import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";
import MostVotesPanels from "./MostVotesPanels";
import usePrevious from "../common/usePrevious";
import { GetEntranceClass } from "../animate/Animate";
import "./Panels.css";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

export default function Panels({ gameStateId, players, revealedPanels, roundNumber }) {
  const [entranceClass, setEntranceClass] = useState("");
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const previousRevealedPanels = usePrevious(revealedPanels);
  const panelRefs = useMemo(() => panelNumbers.map(() => React.createRef()), []);

  useEffect(() => {
    if (!previousRevealedPanels || revealedPanels.length < previousRevealedPanels.length) {
      setEntranceClass(GetEntranceClass());
    }
  }, [revealedPanels]);

  useEffect(() => {
    if (Object.keys(imagesLoaded).length === panelNumbers.length) {
      setAllImagesLoaded(true);
    }
  }, [imagesLoaded]);

  useEffect(() => {
    setImagesLoaded({});
    setAllImagesLoaded(false);
  }, [gameStateId, roundNumber]);

  return (
    <>
      <div id="panels" className="panels center">
        {panelNumbers.map((panelNumber) => {
          return (
            <Panel
              key={panelNumber}
              ref={panelRefs[panelNumber - 1]}
              gameStateId={gameStateId}
              isOpen={revealedPanels.indexOf(panelNumber) >= 0}
              entranceClass={entranceClass}
              panelNumber={panelNumber}
              roundNumber={roundNumber}
              setImagesLoaded={setImagesLoaded}
            ></Panel>
          );
        })}
      </div>
      {allImagesLoaded && <MostVotesPanels panelRefs={panelRefs} players={players}></MostVotesPanels>}
    </>
  );
}

Panels.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  players: PropTypes.object.isRequired,
  revealedPanels: PropTypes.arrayOf(PropTypes.string),
  roundNumber: PropTypes.number.isRequired,
};
