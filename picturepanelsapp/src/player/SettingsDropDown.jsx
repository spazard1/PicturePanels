import React from "react";
import PropTypes from "prop-types";
import { Dropdown, DropdownButton } from "react-bootstrap";

import "./SettingsDropDown.css";

const SettingsDropDown = ({
  pauseState,
  hideRemainingTime,
  disableVibrate,
  onPlayerNameChange,
  onTeamChange,
  onTogglePauseGame,
  onToggleHideRemainingTime,
  onToggleVibrate,
}) => {
  return (
    <DropdownButton className="playerSettingsButton" variant={"secondary"} title="⚙" size="sm" menuVariant="dark">
      <Dropdown.Item onClick={onPlayerNameChange}>Change Name/Color</Dropdown.Item>
      <Dropdown.Item onClick={onTeamChange}>Change Team</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onTogglePauseGame}>{pauseState === "Paused" ? "Resume Game" : "Pause Game"}</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onToggleHideRemainingTime}>Hide Remaining Time{hideRemainingTime ? " ✓" : ""}</Dropdown.Item>
      <Dropdown.Item onClick={onToggleVibrate}>Vibrations{disableVibrate ? "" : " ✓"}</Dropdown.Item>
    </DropdownButton>
  );
};

export default SettingsDropDown;

SettingsDropDown.propTypes = {
  pauseState: PropTypes.string,
  hideRemainingTime: PropTypes.string,
  disableVibrate: PropTypes.string,
  onPlayerNameChange: PropTypes.func.isRequired,
  onTeamChange: PropTypes.func.isRequired,
  onTogglePauseGame: PropTypes.func.isRequired,
  onToggleHideRemainingTime: PropTypes.func.isRequired,
  onToggleVibrate: PropTypes.func.isRequired,
};
