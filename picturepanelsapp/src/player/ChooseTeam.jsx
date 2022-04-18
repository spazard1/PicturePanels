import React from "react";
import PropTypes from "prop-types";

import "./ChooseTeam.css";

const ChooseTeam = ({ teamOneName, teamTwoName }) => {
  return (
    <>
      <div className="chooseTeam center">Choose your team</div>
      <div className="playerBanner playerBannerChooseTeam center">
        <div className="playerBannerItem playerName"></div>
        <div className="playerBannerItem">
          <div className="teamName chooseTeamName teamBox teamOneBox">{teamOneName}</div>
          <div className="teamName chooseTeamName teamBox teamTwoBox">{teamTwoName}</div>
          <div className="teamName chooseTeamName chooseSmallestTeamBox">Choose for me</div>
        </div>
      </div>
    </>
  );
};

export default ChooseTeam;

ChooseTeam.propTypes = {
  teamOneName: PropTypes.string.isRequired,
  teamTwoName: PropTypes.string.isRequired,
};
