import serverUrl from "../common/ServerUrl";

const postUser = (userInfo, callback) => {
  fetch(serverUrl + "api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInfo),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return response.status;
    })
    .then((responseJson) => {
      callback(responseJson);
    });
};

export default postUser;
