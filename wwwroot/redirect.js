window.onload = function () {
    if (mobileCheck()) {
        window.location = "player.html";
    } else {
        window.location = "gameboard.html";
    }
}