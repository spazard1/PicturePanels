import React, { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";
import MostVotesPanels from "./MostVotesPanels";
import usePrevious from "../common/usePrevious";
import { GetEntranceClass } from "../animate/Animate";
import PlayerDots from "./PlayerDots";
import "./Panels.css";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

export default function Panels({ gameStateId, players, revealedPanels, roundNumber, teamTurn, turnType }) {
  const panelsRef = useRef();
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

  useEffect(() => {
    if (!gameStateId) {
      return;
    }

    const resizePanelContainer = () => {
      var panelsContainerRect = panelsRef.current.getBoundingClientRect();
      var panelsContainerMaxWidth = 84;
      panelsRef.current.style.maxWidth = panelsContainerMaxWidth + "vw";
      var paddingBottom = 5;

      while (panelsContainerRect.height + panelsContainerRect.y >= window.innerHeight - paddingBottom) {
        panelsContainerMaxWidth -= 0.5;
        if (panelsContainerMaxWidth < 10) {
          break;
        }

        panelsRef.current.style.maxWidth = panelsContainerMaxWidth + "vw";
        panelsContainerRect = panelsRef.current.getBoundingClientRect();
      }
    };

    window.onresize = resizePanelContainer;

    resizePanelContainer();
  }, [roundNumber, gameStateId]);

  return (
    <>
      <div ref={panelsRef} id="panels" className="panels center">
        {panelNumbers.map((panelNumber) => (
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
        ))}
      </div>
      {allImagesLoaded && <MostVotesPanels panelRefs={panelRefs} players={players} teamTurn={teamTurn} turnType={turnType}></MostVotesPanels>}
      {allImagesLoaded && <PlayerDots panelRefs={panelRefs} players={players} teamTurn={teamTurn} turnType={turnType}></PlayerDots>}
    </>
  );
}

Panels.propTypes = {
  gameStateId: PropTypes.string,
  players: PropTypes.object,
  revealedPanels: PropTypes.arrayOf(PropTypes.string),
  roundNumber: PropTypes.number,
  teamTurn: PropTypes.number,
  turnType: PropTypes.string,
};
