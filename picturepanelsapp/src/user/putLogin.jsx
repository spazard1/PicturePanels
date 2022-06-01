import serverUrl from "../common/ServerUrl";

const putLogin = (userInfo, callback) => {
  fetch(serverUrl + "api/users/login", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInfo),
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

export default putLogin;
