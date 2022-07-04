import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Dropdown } from "react-bootstrap";
import { putTogglePauseGame } from "../common/putTogglePauseGame";

import "./SettingsDropDown.css";
import { useCallback } from "react";

const SettingsDropDown = ({ gameStateId, pauseState, volume, onChangeVolume }) => {
  const [dropdownVisible, setDropDownVisible] = useState();
  const intervalRef = useRef();

  const setCloseInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setTimeout(() => {
      setDropDownVisible(false);
    }, 7000);
  }, []);

  const onTogglePauseGame = useCallback(() => {
    setDropDownVisible(false);
    putTogglePauseGame(gameStateId, () => {});
  }, [gameStateId]);

  const onClickChangeVolume = useCallback(
    (e) => {
      setCloseInterval();
      onChangeVolume(parseInt(e.target.value));
    },
    [setCloseInterval, onChangeVolume]
  );

  useEffect(() => {
    if (dropdownVisible) {
      setCloseInterval();
    } else {
      clearInterval(intervalRef.current);
    }
  }, [dropdownVisible, setCloseInterval]);

  return (
    <Dropdown autoClose={false} show={dropdownVisible} onSelect={setCloseInterval} className="gameBoardSettingsDropdown">
      <Dropdown.Toggle
        size="sm"
        variant={"secondary"}
        id="dropdown-basic"
        className="gameBoardSettingsDropdownButton"
        onClick={() => setDropDownVisible((ddv) => !ddv)}
      >
        ⚙
      </Dropdown.Toggle>

      <Dropdown.Menu variant="dark">
        <Dropdown.Item href="#" onClick={onTogglePauseGame} disabled={!gameStateId}>
          {pauseState === "Paused" ? "Resume Game" : "Pause Game"}
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item href="#">
          <div className="volume-chooser">
            <div className="volume-button">
              <span>&#128266;</span>
              <span className="volume-value">{volume}</span>
            </div>
            <div>
              <input className="volume" type="range" min={0} max={100} value={volume} onChange={onClickChangeVolume} />
            </div>
          </div>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SettingsDropDown;

SettingsDropDown.propTypes = {
  gameStateId: PropTypes.string,
  pauseState: PropTypes.string,
  volume: PropTypes.number,
  onChangeVolume: PropTypes.func.isRequired,
};
