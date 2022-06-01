import serverUrl from "../common/ServerUrl";

const getUser = (callback) => {
  fetch(serverUrl + "api/users", {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("userToken"),
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

export default getUser;
