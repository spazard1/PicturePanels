async function tileButtonOnClick(event) {
    if (event.currentTarget.classList.contains("tileButtonDisabled")) {
        event.currentTarget.classList.remove("tileButtonSelected");
        return;
    }

    event.currentTarget.classList.toggle("tileButtonSelected");
    event.currentTarget.blur();

    await sendSelectedTiles();
}

function setupPlayer() {
    var initialColor = "hsl(" + Math.ceil(Math.random() * 360) + ", 100%, 50%)";

    if (localStorage.getItem("playerColor")) {
        initialColor = localStorage.getItem("playerColor");
    }

    window.colorPicker = new iro.ColorPicker("#colorPicker", {
        layout: [
            {
                component: iro.ui.Wheel,
                options: {}
            },
        ],
        color: initialColor
    });

    if (localStorage.getItem("playerName")) {
        document.getElementById("playerNameInput").style.color = initialColor;
    }

    document.getElementById("playerNameInput").oninput = function (event) {
        event.target.style.color = window.colorPicker.color.hslString;
    }

    window.colorPicker.on('color:change', function (color) {
        color.value = 100;
        document.getElementById("playerNameInput").style.color = color.hslString;
    });

    setupInputDefaultText("playerNameInput", "your name", localStorage.getItem("playerName"));
}

var playerLoaded = false;

function drawPlayer(player) {
    if (player.selectedTiles) {
        var tileButtons = document.getElementsByClassName("tileButton");
        for (let tileButton of tileButtons) {
            if (player.selectedTiles.includes(tileButton.value)) {
                tileButton.classList.add("tileButtonSelected");
            }
        }
    }
}

async function putPlayer() {
    return await fetch("api/players/" + localStorage.getItem("playerId"),
    {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            PlayerId: localStorage.getItem("playerId"),
            Name: localStorage.getItem("playerName"),
            TeamNumber: parseInt(localStorage.getItem("teamNumber")),
            Color: localStorage.getItem("playerColor")
        })
    })
    .then(response => response.json())
    .then(responseJson => {
        return responseJson;
    });
}

async function putPlayerPing() {
    if (!playerIsReadyToPlay) {
        return;
    }
    
    await fetch("api/players/" + localStorage.getItem("playerId") + "/ping",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

async function putCaptainPass() {
    if (!playerIsReadyToPlay) {
        return;
    }

    document.getElementById("captainGuessButton").classList.add("captainButtonDisabled");
    document.getElementById("captainGuessButton").classList.remove("captainButtonSelected");

    document.getElementById("captainPassButton").classList.remove("captainButtonDisabled");
    document.getElementById("captainPassButton").classList.add("captainButtonSelected");

    await fetch("api/gameState/captainPass/" + localStorage.getItem("playerId"),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

async function putCaptainGuess() {
    if (!playerIsReadyToPlay) {
        return;
    }

    document.getElementById("captainGuessButton").classList.remove("captainButtonDisabled");
    document.getElementById("captainGuessButton").classList.add("captainButtonSelected");

    document.getElementById("captainPassButton").classList.add("captainButtonDisabled");
    document.getElementById("captainPassButton").classList.remove("captainButtonSelected");

    await fetch("api/gameState/captainGuess/" + localStorage.getItem("playerId"),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

async function putImTheCaptainNow() {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/gameState/captain/" + localStorage.getItem("playerId"),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

function setupChoosePlayerName() {
    playerIsReadyToPlay = false;
    document.getElementById("chooseSmallestTeam").innerHTML = "Choose for me";

    document.getElementById("turnStatusContainer").classList.add("hidden");

    document.getElementById("choosePlayerNameLabel").classList.remove("hidden");
    document.getElementById("playerNameInputDiv").classList.remove("hidden");

    document.getElementById("colorPicker").classList.remove("hidden");
    document.getElementById("choosePlayerName").classList.remove("hidden");

    document.getElementById("playerBanner").classList.add("hidden");
    document.getElementById("chooseTeam").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("hidden");
    document.getElementById("teamTwoName").classList.add("hidden");

    document.getElementById("playerName").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("chooseTeamName");
    document.getElementById("teamTwoName").classList.add("chooseTeamName");
    document.getElementById("chooseSmallestTeam").classList.remove("hidden");

    document.getElementById("tileButtons").classList.add("hidden");

    document.getElementById("chats").classList.add("hidden");
    document.getElementById("chats_input").classList.add("hidden");

    document.getElementById("playerName").style.color = localStorage.getItem("playerColor");
    document.getElementById("playerBanner").classList.add("playerBannerChooseTeam");
    document.getElementById("playerBanner").classList.remove("playerBannerPlaying");
    document.getElementById("playerBanner").onclick = null;

    document.getElementById("teamOneName").classList.remove("teamOneColor");
    document.getElementById("teamOneName").classList.add("teamOneBox");

    document.getElementById("teamTwoName").classList.remove("teamTwoColor");
    document.getElementById("teamTwoName").classList.add("teamTwoBox");
}

function choosePlayerName(isCreated) {
    localStorage.setItem("playerName", document.getElementById("playerNameInput").value);
    localStorage.setItem("playerColor", window.colorPicker.color.hslString);

    if (isCreated) {
        localStorage.setItem("createdTime", new Date());
    }

    var playerNameInput = document.getElementById("playerNameInput");
    if (playerNameInput.value.length <= 1 ||
        playerNameInput.value === playerNameInput.defaultValue) {

        document.getElementById("playerNameInput").classList.add("playerNameInputDivInvalid");
        return;
    }

    setupTeamSelectionButtons();

    document.getElementById("choosePlayerNameLabel").classList.add("hidden");
    document.getElementById("playerNameInputDiv").classList.add("hidden");
    document.getElementById("colorPicker").classList.add("hidden");
    document.getElementById("choosePlayerName").classList.add("hidden");

    document.getElementById("playerName").innerHTML = document.getElementById("playerNameInput").value;

    document.getElementById("playerBanner").classList.remove("hidden");
    document.getElementById("chooseTeam").classList.remove("hidden");
    document.getElementById("teamOneName").classList.remove("hidden");
    document.getElementById("teamTwoName").classList.remove("hidden");
}

var playerIsReadyToPlay = false;

async function chooseTeam(teamNumber) {
    setupTeam(teamNumber);
    
    var player = await putPlayer();
    document.getElementById("playerName").innerHTML = player.name;
    localStorage.setItem("playerName", player.name);

    await startSignalR("player");
    await drawChats("chats");

    notifyTurn(currentGameState);
    updatePlayerTileButtons(currentGameState);
    handleCaptainButtons(currentGameState);

    document.getElementById("playerBanner").onclick = (event) => {
        var result = confirm("Do you want to change your player name, color, or team?");
        if (!result) {
            return;
        }
        setupChoosePlayerName();
    }
    playerIsReadyToPlay = true;

    scrollChats("chats", true);
}

async function chooseSmallestTeam() {
    document.getElementById("chooseSmallestTeam").innerHTML = "Loading...";

    await fetch("api/players")
        .then(response => response.json())
        .then(responseJson => {
            var teamOneCount = 0;
            var teamTwoCount = 0;
            for (var i = 0; i < responseJson.length; i++) {
                if (responseJson[i].playerId === localStorage.getItem("playerId")) {
                    continue;
                }
                if (responseJson[i].teamNumber === 1) {
                    teamOneCount++;
                } else {
                    teamTwoCount++;
                }
            }

            if (teamOneCount < teamTwoCount) {
                chooseTeam(1);
            } else if (teamOneCount > teamTwoCount) {
                chooseTeam(2);
            } else {
                if (Math.random() < .5) {
                    chooseTeam(1);
                } else {
                    chooseTeam(2);
                }
            }
        });
}

function setupTeam(teamNumber) {
    localStorage.setItem("teamNumber", teamNumber);

    updatePlayerTileButtons(currentGameState);

    document.getElementById("turnStatusContainer").classList.remove("hidden");

    if (teamNumber === 1) {
        document.getElementById("teamOneName").classList.remove("hidden");
        document.getElementById("teamTwoName").classList.add("hidden");
    } else {
        document.getElementById("teamOneName").classList.add("hidden");
        document.getElementById("teamTwoName").classList.remove("hidden");
    }

    document.getElementById("playerName").classList.remove("hidden");
    document.getElementById("teamOneName").classList.remove("chooseTeamName");
    document.getElementById("teamOneName").onclick = null;
    document.getElementById("teamTwoName").classList.remove("chooseTeamName");
    document.getElementById("teamTwoName").onclick = null;
    document.getElementById("chooseSmallestTeam").onclick = null;
    document.getElementById("chooseSmallestTeam").classList.add("hidden");

    document.getElementById("chooseTeam").classList.add("hidden");

    document.getElementById("chats").classList.remove("hidden");
    document.getElementById("chats_input").classList.remove("hidden");

    document.getElementById("playerName").style.color = localStorage.getItem("playerColor");
    document.getElementById("playerBanner").classList.remove("playerBannerChooseTeam");
    document.getElementById("playerBanner").classList.add("playerBannerPlaying");

    document.getElementById("teamOneName").classList.add("teamOneColor");
    document.getElementById("teamOneName").classList.remove("teamOneBox");

    document.getElementById("teamTwoName").classList.add("teamTwoColor");
    document.getElementById("teamTwoName").classList.remove("teamTwoBox");
}

function isCaptain(gameState) {
    if (!gameState) {
        return false;
    }
    return (gameState.teamOneCaptain === localStorage.getItem("playerId") && localStorage.getItem("teamNumber") === "1") ||
        (gameState.teamTwoCaptain === localStorage.getItem("playerId") && localStorage.getItem("teamNumber") === "2");
}

function handleCaptainButtons(gameState) {
    if (gameState.turnType === "MakeGuess" && isCaptain(gameState) && gameState.teamTurn === parseInt(localStorage.getItem("teamNumber"))) {
        if (gameState.captainStatus === "Guess") {
            document.getElementById("captainGuessButton").classList.remove("captainButtonDisabled");
            document.getElementById("captainGuessButton").classList.add("captainButtonSelected");

            document.getElementById("captainPassButton").classList.add("captainButtonDisabled");
            document.getElementById("captainPassButton").classList.remove("captainButtonSelected");
        } else if (gameState.captainStatus === "Pass") {
            document.getElementById("captainGuessButton").classList.add("captainButtonDisabled");
            document.getElementById("captainGuessButton").classList.remove("captainButtonSelected");

            document.getElementById("captainPassButton").classList.remove("captainButtonDisabled");
            document.getElementById("captainPassButton").classList.add("captainButtonSelected");
        } else {
            document.getElementById("captainGuessButton").classList.remove("captainButtonDisabled");
            document.getElementById("captainGuessButton").classList.remove("captainButtonSelected");

            document.getElementById("captainPassButton").classList.remove("captainButtonDisabled");
            document.getElementById("captainPassButton").classList.remove("captainButtonSelected");
        }
        document.getElementById("captainStatusButtons").classList.remove("hidden");
    } else {
        document.getElementById("captainStatusButtons").classList.add("hidden");
    }
}

function notifyTeamCaptain(gameState) {
    if (!gameState) {
        return;
    }

    if (localStorage.getItem("teamNumber") === "1" && gameState.teamOneCaptain === localStorage.getItem("playerId") ||
        localStorage.getItem("teamNumber") === "2" && gameState.teamTwoCaptain === localStorage.getItem("playerId")) {
        drawSystemChat("chats", "You are the captain now.");
    }
}

function notifyTurn(gameState) {
    if (!gameState) {
        return;
    }

    document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerCorrect");

    if (gameState.turnType === "Welcome") {
        document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHidden");
        document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHighlight");
        document.getElementById("tileButtons").classList.add("hidden");
        document.getElementById("tileButtons").classList.remove("tileButtonsHighlight");
        document.getElementById("turnStatusMessage").innerHTML = "Welcome to the Picture Game!<br/>We'll be getting started soon.";
        return;
    }

    if (gameState.turnType === "EndRound") {
        document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHidden");
        document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHighlight");
        document.getElementById("tileButtons").classList.add("hidden");
        document.getElementById("tileButtons").classList.remove("tileButtonsHighlight");
        document.getElementById("turnStatusMessage").innerHTML = "This round is over.";
        return;
    }

    if (gameState.teamTurn === parseInt(localStorage.getItem("teamNumber"))) {
        switch (gameState.turnType) {
            case "OpenTile":
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerHidden");
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerHighlight");
                document.getElementById("tileButtons").classList.remove("hidden");
                document.getElementById("tileButtons").classList.remove("tileButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "It's your team's turn to vote for a tile.";
                drawSystemChat("chats", "It's your team's turn to vote for tile(s) you want to open.");
                break;
            case "OpenFreeTile":
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerHidden");
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerHighlight");
                document.getElementById("tileButtons").classList.remove("hidden");
                document.getElementById("tileButtons").classList.add("tileButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "It's your team's turn to vote for a tile.";
                drawSystemChat("chats", "The other team made an incorrect guess, so vote to open a FREE tile.");
                break;
            case "MakeGuess":
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHidden");
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerHighlight");
                document.getElementById("tileButtons").classList.add("hidden");
                document.getElementById("tileButtons").classList.remove("tileButtonsHighlight");
                if (isCaptain(gameState)) {
                    document.getElementById("turnStatusMessage").innerHTML = "Does your team want to guess or pass?";
                } else {
                    document.getElementById("turnStatusMessage").innerHTML = "It's your team's turn to guess or pass.";
                }
                drawSystemChat("chats", "It's your team's turn to guess or pass.");
                break;
            case "Correct":
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHidden");
                document.getElementById("turnStatusContainer").classList.add("turnStatusContainerCorrect");
                document.getElementById("tileButtons").classList.add("hidden");
                document.getElementById("tileButtons").classList.remove("tileButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "Correct!<br/>Your team wins this round!";
                drawSystemChat("chats", "That's the correct answer!");
                break;
        }
    } else {
        switch (gameState.turnType) {
            case "Correct":
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHidden");
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHighlight");
                document.getElementById("tileButtons").classList.add("hidden");
                document.getElementById("tileButtons").classList.remove("tileButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "The other team won this round.";
                break;
            default:
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHidden");
                document.getElementById("turnStatusContainer").classList.remove("turnStatusContainerHighlight");
                document.getElementById("tileButtons").classList.add("hidden");
                document.getElementById("tileButtons").classList.remove("tileButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "The other team is taking their turn.";
                break;
        }
    }
}

function handleGameState(gameState) {
    loadThemeCss(gameState);

    if (playerIsReadyToPlay && (!currentGameState || currentGameState.turnType !== gameState.turnType || currentGameState.teamTurn !== gameState.teamTurn)) {
        notifyTurn(gameState);
        clearTileButtonSelection();
    } else if (currentGameState && currentGameState.imageId !== gameState.imageId) {
        clearTileButtonSelection();
    }

    if (currentGameState &&
        (localStorage.getItem("teamNumber") === "1" && currentGameState.teamOneCaptain !== gameState.teamOneCaptain ||
            localStorage.getItem("teamNumber") === "2" && currentGameState.teamTwoCaptain !== gameState.teamTwoCaptain)) {
        notifyTurn(gameState);
        notifyTeamCaptain(gameState);
    }

    currentGameState = gameState;

    drawGameState(gameState);

    updatePlayerTileButtons(gameState);

    handleCaptainButtons(gameState);
}

const innerTiles = ["7", "8", "9", "12", "13", "14"];
const outerTiles = ["1", "2", "3", "4", "5", "6", "10", "11", "15", "16", "17", "18", "19", "20"];

function updatePlayerTileButtons(gameState) {
    if (!gameState) {
        return;
    }

    var disabledTiles = [];

    var teamNumber = localStorage.getItem("teamNumber");
    if (teamNumber === "1") {
        if (gameState.teamOneOuterTiles <= 0) {
            disabledTiles = disabledTiles.concat(outerTiles);
        }
        if (gameState.teamOneInnerTiles <= 0) {
            disabledTiles = disabledTiles.concat(innerTiles);
        }
    } else {
        if (gameState.teamTwoOuterTiles <= 0) {
            disabledTiles = disabledTiles.concat(outerTiles);
        }
        if (gameState.teamTwoInnerTiles <= 0) {
            disabledTiles = disabledTiles.concat(innerTiles);
        }
    }

    if (gameState.turnType === "OpenFreeTile") {
        disabledTiles = innerTiles;
    }

    updateTileButtons(currentGameState, disabledTiles);
}

async function handleRandomizeTeam(player) {
    clearTileButtonSelection();

    if (parseInt(localStorage.getItem("teamNumber")) !== player.teamNumber) {
        setupTeam(player.teamNumber);
        await drawChats("chats");
        drawSystemChat("chats", "The teams have been randomized; you are now on the other team.");
    } else {
        drawSystemChat("chats", "The teams have been randomized; you have not changed teams.");
    }
}

function registerConnections() {
    connection.on("Chat", (player, message) => {
        drawChat("chats", message, player);
    });

    connection.on("Typing", (player) => {
        handleTyping("chats", player);
    });

    connection.on("AddPlayer", (player) => {
        if (player.playerId !== localStorage.getItem("playerId")) {
            drawSystemChat("chats", "has joined the team.", player);
        }
    });

    connection.on("GameState", handleGameState);
    connection.on("RandomizeTeam", handleRandomizeTeam);

    connection.onreconnected = function () {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chats", "SignalR reconnected");
        }
    }

    connection.onclose(async function () {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chats", "SignalR closed.");
        }
        await startSignalR("player");
    });
}

function setupTeamSelectionButtons() {
    document.getElementById("teamOneName").onclick = function () {
        chooseTeam(1);
    };
    document.getElementById("teamTwoName").onclick = function () {
        chooseTeam(2);
    };
    document.getElementById("chooseSmallestTeam").onclick = function () {
        chooseSmallestTeam();
    };
}

window.onresize = function () {
    var chatsElement = document.getElementById("chats");
    chatsElement.classList.remove("smoothScroll");
    scrollChats("chats", true);
    chatsElement.classList.add("smoothScroll");
}

var connectionCount = 0;

window.onload = async function () {
    setupChats("chats");

    var captainGuessButton = document.getElementById("captainGuessButton");
    captainGuessButton.onclick = (event) => {
        putCaptainGuess();
    }
    var captainPassButton = document.getElementById("captainPassButton");
    captainPassButton.onclick = (event) => {
        putCaptainPass();
    }

    drawTileButtons();
    setupPlayer();

    var gameState = await getGameState();
    handleGameState(gameState);

    var player = await getPlayer();

    var foundPlayer = false;
    if (player && player.playerId && localStorage.getItem("createdTime")) {
        var createdTime = new Date(localStorage.getItem("createdTime"));

        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (createdTime > yesterday) {
            choosePlayerName();
            await chooseTeam(player.teamNumber);

            foundPlayer = true;
        }
    }
    if (!foundPlayer) {
        setupChoosePlayerName();
    }
    
    drawPlayer(player);

    if (player.isAdmin) {
        document.getElementById("playerName").classList.add("adminPlayerName");
    }

    document.getElementById("chooseSmallestTeam").innerHTML = "Choose for me";

    setInterval(putPlayerPing, 30000);

    if (localStorage.getItem("debug")) {
        setInterval(function () {
            document.getElementById("playerName").innerHTML = connection.state + " " + connectionCount++;
        }, 1000);

        window.onerror = function (msg, url, line, col, error) {
            // Note that col & error are new to the HTML 5 spec and may not be 
            // supported in every browser.  It worked for me in Chrome.
            var extra = !col ? '' : '\ncolumn: ' + col;
            extra += !error ? '' : '\nerror: ' + error;

            // You can view the information in an alert to see things working like this:
            drawSystemChat("chats", "Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);

            // TODO: Report this error via ajax so you can keep track
            //       of what pages have JS issues

            var suppressErrorAlert = true;
            // If you return true, then error alerts (like in older versions of 
            // Internet Explorer) will be suppressed.
            return suppressErrorAlert;
        };
    }
}
