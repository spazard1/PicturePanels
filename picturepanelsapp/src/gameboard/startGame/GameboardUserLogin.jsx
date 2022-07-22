import React, { useContext } from "react";
import UserContext from "../../user/UserContext";
import { Button } from "react-bootstrap";
import LoadingRing from "../../common/LoadingRing";

const GameboardUserLogin = () => {
  const { user, promptLogin, promptNewUser, logout, isLoadingLogin } = useContext(UserContext);

  return (
    <>
      <div className="loginContainer">
        {!user && !isLoadingLogin && (
          <>
            <div className="loginMessage">When you are logged in, you will not see images that you have already played.</div>
            <div className="startGameButtonsContainer">
              <Button variant="light" className="startGameButton" disabled={isLoadingLogin} onClick={promptNewUser}>
                Create User
              </Button>
              <Button variant="light" className="startGameButton" disabled={isLoadingLogin} onClick={promptLogin}>
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
      {isLoadingLogin && !user && <LoadingRing />}
    </>
  );
};

GameboardUserLogin.propTypes = {};

export default GameboardUserLogin;
