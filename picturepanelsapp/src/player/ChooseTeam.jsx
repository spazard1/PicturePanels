import React, { useState } from "react";
import PropTypes from "prop-types";

import "./ChooseTeam.css";
import getSmallestTeam from "./getSmallestTeam";

const ChooseTeam = ({ gameStateId, teamOneName, teamTwoName, onTeamNumberChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  const chooseSmallestTeamOnClick = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    getSmallestTeam(gameStateId, (teamNumber) => {
      setIsLoading(false);
      onTeamNumberChange(teamNumber);
    });
  };

  const onTeamNumberChangeClick = (teamNumber) => {
    if (isLoading) {
      return;
    }
    onTeamNumberChange(teamNumber);
  };

  return (
    <>
      <div className="chooseTeamLabel center">Choose your team</div>
      <div className="chooseTeamNames">
        {!isLoading && (
          <>
            <div className="chooseTeamName teamBox teamOneBox center" onClick={() => onTeamNumberChangeClick(1)}>
              {teamOneName}
            </div>
            <div className="chooseTeamName teamBox teamTwoBox center" onClick={() => onTeamNumberChangeClick(2)}>
              {teamTwoName}
            </div>
            <div className="chooseTeamName chooseSmallestTeamBox center" onClick={chooseSmallestTeamOnClick}>
              {isLoading ? "Loading" : "Choose for me"}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChooseTeam;

ChooseTeam.propTypes = {
  gameStateId: PropTypes.string.isRequired,
  teamOneName: PropTypes.string.isRequired,
  teamTwoName: PropTypes.string.isRequired,
  onTeamNumberChange: PropTypes.func.isRequired,
};
