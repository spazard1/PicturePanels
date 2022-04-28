import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";

import "./SettingsDropDown.css";

const SettingsDropDown = ({ pauseState, hideRemainingTime, onPlayerNameChange, onTeamChange, onTogglePauseGame, onToggleHideRemainingTime }) => {
  return (
    <DropdownButton className="playerSettingsButton" variant={"secondary"} title="⚙" size="sm" menuVariant="dark">
      <Dropdown.Item onClick={onPlayerNameChange}>Change Name/Color</Dropdown.Item>
      <Dropdown.Item onClick={onTeamChange}>Change Team</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onTogglePauseGame}>{pauseState === "Paused" ? "Resume Game" : "Pause Game"}</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onToggleHideRemainingTime}>Hide Remaining Time{hideRemainingTime ? " ✓" : ""}</Dropdown.Item>
    </DropdownButton>
  );
};

export default SettingsDropDown;

SettingsDropDown.propTypes = {
  pauseState: PropTypes.string,
  hideRemainingTime: PropTypes.string,
  onPlayerNameChange: PropTypes.func.isRequired,
  onTeamChange: PropTypes.func.isRequired,
  onTogglePauseGame: PropTypes.func.isRequired,
  onToggleHideRemainingTime: PropTypes.func.isRequired,
};
