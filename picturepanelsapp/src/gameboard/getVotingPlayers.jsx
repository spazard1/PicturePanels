import serverUrl from "../common/ServerUrl";

export default function getVotingPlayers(gameStateId, callback) {
  fetch(serverUrl + "api/teamguesses/" + gameStateId + "/votingPlayers")
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return false;
    })
    .then((responseJson) => {
      callback(responseJson);
    });
}
