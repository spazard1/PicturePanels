const putPlayerOpenPanelVote = (gameStateId, playerId, callback) => {
  fetch("https://picturepanels.azurewebsites.net/api/players/" + gameStateId + "/" + playerId + "/openPanelVote", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return false;
    })
    .then((responseJson) => {
      callback(responseJson);
    });
};

export default putPlayerOpenPanelVote;
