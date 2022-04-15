import React, { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import Panel from "./Panel";
import MostVotesPanels from "./MostVotesPanels";
import usePrevious from "../common/usePrevious";
import { GetEntranceClass } from "../animate/Animate";
import PlayerDots from "./PlayerDots";
import "./Panels.css";

const panelNumbers = [...Array(20).keys()].map((panelNumber) => panelNumber + 1 + "");

const Panels = ({ gameStateId, players, revealedPanels, roundNumber, teamTurn, turnType, teamIsCorrect }) => {
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };

  const panelsRef = useRef();
  const [entranceClass, setEntranceClass] = useState("");
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [openWelcomePanels, setOpenWelcomePanels] = useState([]);
  const welcomePanelIndex = useRef(0);
  const welcomePanelNumbers = useRef(shuffleArray([...panelNumbers]));
  const welcomeIntervalRef = useRef();
  const previousRevealedPanels = usePrevious(revealedPanels);
  const panelRefs = useMemo(() => panelNumbers.map(() => React.createRef()), []);

  const onImageLoaded = (panelNumber) => {
    setImagesLoaded((currentImagesLoaded) => {
      return { ...currentImagesLoaded, [panelNumber]: true };
    });
  };

  useEffect(() => {
    if (!previousRevealedPanels || revealedPanels.length < previousRevealedPanels.length) {
      setEntranceClass(GetEntranceClass());
    }
  }, [previousRevealedPanels, revealedPanels]);

  useEffect(() => {
    if (Object.keys(imagesLoaded).length === panelNumbers.length) {
      resizePanelContainer();
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

    panelsRef.current.style.maxWidth = "";
    window.onresize = resizePanelContainer;

    resizePanelContainer();
  }, [roundNumber, gameStateId]);

  useEffect(() => {
    clearInterval(welcomeIntervalRef.current);

    if (turnType !== "Welcome") {
      setOpenWelcomePanels([]);
      return;
    }

    welcomeIntervalRef.current = setInterval(() => {
      if (welcomePanelIndex.current >= panelNumbers.length) {
        welcomePanelIndex.current = 0;
        welcomePanelNumbers.current = shuffleArray([...panelNumbers]);
        setOpenWelcomePanels([]);
        setEntranceClass(GetEntranceClass());
        return;
      }
      setOpenWelcomePanels((owp) => {
        owp.push(welcomePanelNumbers.current[welcomePanelIndex.current]);
        welcomePanelIndex.current++;
        return [...owp];
      });
    }, 6000);
  }, [turnType]);

  const resizePanelContainer = () => {
    var panelsContainerMaxWidth = 84;
    var panelsContainerRect = panelsRef.current.getBoundingClientRect();
    var paddingBottom = 5;

    while (panelsContainerRect.height + panelsContainerRect.y >= window.innerHeight - paddingBottom) {
      if (panelsContainerMaxWidth < 10) {
        break;
      }

      panelsRef.current.style.maxWidth = panelsContainerMaxWidth + "vw";
      panelsContainerRect = panelsRef.current.getBoundingClientRect();
      panelsContainerMaxWidth -= 0.5;
    }
  };

  return (
    <>
      <div ref={panelsRef} id="panels" className="panels center">
        {panelNumbers.map((panelNumber) => (
          <Panel
            key={panelNumber}
            ref={panelRefs[panelNumber - 1]}
            gameStateId={gameStateId}
            isOpen={
              turnType === "EndRound" || teamIsCorrect || revealedPanels.indexOf(panelNumber) >= 0 || openWelcomePanels.indexOf(panelNumber) >= 0
            }
            entranceClass={entranceClass}
            panelNumber={panelNumber}
            roundNumber={roundNumber}
            onImageLoaded={onImageLoaded}
            turnType={turnType}
          ></Panel>
        ))}
      </div>
      {allImagesLoaded && <MostVotesPanels panelRefs={panelRefs} players={players} teamTurn={teamTurn} turnType={turnType}></MostVotesPanels>}
      {allImagesLoaded && <PlayerDots panelRefs={panelRefs} players={players} teamTurn={teamTurn} turnType={turnType}></PlayerDots>}
    </>
  );
};

export default React.memo(Panels);

Panels.propTypes = {
  gameStateId: PropTypes.string,
  players: PropTypes.object,
  revealedPanels: PropTypes.arrayOf(PropTypes.string),
  roundNumber: PropTypes.number,
  teamTurn: PropTypes.number,
  turnType: PropTypes.string,
  teamIsCorrect: PropTypes.bool,
};
