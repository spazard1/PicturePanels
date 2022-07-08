import React, { useContext } from "react";
import UserContext from "../user/UserContext";
import { Button } from "react-bootstrap";

import "./UploadUserLogin.css";

const UploadUserLogin = () => {
  const { user, promptLogin, promptNewUser, logout, isLoadingLogin } = useContext(UserContext);

  return (
    <>
      <div className="uploadLoginContainer center">
        {!user && (
          <>
            <div className="center uploadLoginMessage">You must be logged in to upload images.</div>
            <div className="uploadLoginButtonsContainer">
              <Button variant="light" disabled={isLoadingLogin} onClick={promptNewUser}>
                Create User
              </Button>
              <Button variant="light" disabled={isLoadingLogin} onClick={promptLogin}>
                Login
              </Button>
            </div>
          </>
        )}
        {user && (
          <>
            <div>
              Logged in as: <span className="loggedInUserDisplayName">{user.displayName}</span>
            </div>
            <div>
              <Button variant="light" className="startGameButton" onClick={logout}>
                Logout
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

UploadUserLogin.propTypes = {};

export default UploadUserLogin;
