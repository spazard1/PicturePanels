async function putStartGameAsync() {
    await fetch("api/gameState/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/start",
        {
            method: "PUT",
        });
}

async function putCancelStartGameAsync() {
    await fetch("api/gameState/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/cancelStart",
        {
            method: "PUT",
        });
}

async function getSmallestTeamAsync() {
    return await fetch("/api/gameState/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/smallestTeam")
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return;
        });
}

async function panelButtonOnClick(event) {
    if (event.currentTarget.classList.contains("panelButtonDisabled")) {
        event.currentTarget.classList.remove("panelButtonSelected");
        return;
    }

    event.currentTarget.classList.toggle("panelButtonSelected");
    event.currentTarget.blur();

    await sendSelectedPanels();
}

function setupPlayerMenu() {
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
        color: initialColor,
        width: Math.ceil(Math.min(250, window.screen.width * .50))
    });

    document.getElementById("playerNameInput").style.color = initialColor;
    document.getElementById("gameStateId").style.color = initialColor;

    document.getElementById("playerNameInput").oninput = function (event) {
        event.target.style.color = window.colorPicker.color.hslString;
    }

    document.getElementById("gameStateId").oninput = function (event) {
        event.target.style.color = window.colorPicker.color.hslString;
    }

    window.colorPicker.on('color:change', function (color) {
        color.value = 100;
        document.getElementById("playerNameInput").style.color = color.hslString;
        document.getElementById("gameStateId").style.color = color.hslString;
    });
}

var playerLoaded = false;

function drawPlayer(player) {
    if (player.selectedPanels) {
        var panelButtons = document.getElementsByClassName("panelButton");
        for (var panelButton of panelButtons) {
            if (player.selectedPanels.includes(panelButton.value)) {
                panelButton.classList.add("panelButtonSelected");
            }
        }
    }

    if (player.isAdmin) {
        document.getElementById("playerName").classList.add("adminPlayerName");
    }

    var teamGuessVoteElement = document.getElementById("teamGuessVoteCount_" + player.teamGuessVote);
    if (teamGuessVoteElement) {
        teamGuessVoteElement.classList.add("teamGuessVoteCountChosen");
    }
}

async function putPlayerPingAsync() {
    if (!playerIsReadyToPlay) {
        return;
    }
    
    await fetch("api/players/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/ping",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            }
        });
}

function promptTeamGuess() {
    bootbox.prompt({
        size: "small",
        title: "What is your guess?",
        backdrop: true,
        closeButton: false,
        callback: function (result) {
            if (result) {
                postTeamGuessAsync(result);
            }
        }
    });
}

async function postTeamGuessAsync(guess) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuesses/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Guess: guess
            })
        });
}

async function getTeamGuessesAsync() {
    return await fetch("/api/teamGuesses/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId"))
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function putPlayerReadyAsync() {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/players/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/ready",
    {
        method: "PUT"
    });
}

async function getPlayerReadyAsync() {
    return await fetch("api/players/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/ready").then(response => {
        if (response.ok) {
            return response.json();
        }
        return;
    }).then(responseJson => {
        return responseJson;
    });
}

async function deleteTeamGuessAsync(ticks) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuesses/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/" + ticks,
        {
            method: "DELETE"
        });
}

async function putTeamGuessVoteAsync(ticks) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuesses/" + localStorage.getItem("gameStateId") + "/" + localStorage.getItem("playerId") + "/" + ticks,
        {
            method: "PUT"
        }).then((response) => {
            if (response.ok) {
                resetTeamGuessVoteChoosen();
                document.getElementById("teamGuessVoteCount_" + ticks).classList.add("teamGuessVoteCountChosen");
            }
        });
}

function setupChoosePlayerName() {
    playerIsReadyToPlay = false;
    document.getElementById("chooseSmallestTeam").innerHTML = "Choose for me";

    document.getElementById("turnStatusMessage").classList.add("hidden");

    document.getElementById("choosePlayerNameLabel").classList.remove("hidden");
    document.getElementById("playerNameInputDiv").classList.remove("hidden");
    document.getElementById("colorPicker").classList.remove("hidden");
    document.getElementById("choosePlayerName").classList.remove("hidden");
    document.getElementById("playerHelp").classList.remove("hidden");

    document.getElementById("playerBanner").classList.add("hidden");
    document.getElementById("chooseTeam").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("hidden");
    document.getElementById("teamTwoName").classList.add("hidden");

    document.getElementById("playerName").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("chooseTeamName");
    document.getElementById("teamTwoName").classList.add("chooseTeamName");
    document.getElementById("chooseSmallestTeam").classList.remove("hidden");

    document.getElementById("panelButtons").classList.add("hidden");

    document.getElementById("teamButtons").classList.add("hidden");
    document.getElementById("teamGuesses").classList.add("hidden");

    document.getElementById("chats").classList.add("hidden");
    document.getElementById("chats_input").classList.add("hidden");

    document.getElementById("playerName").style.color = localStorage.getItem("playerColor");
    document.getElementById("playerBanner").classList.add("playerBannerChooseTeam");
    document.getElementById("playerBanner").classList.remove("playerBannerPlaying");
    document.getElementById("playerBanner").onclick = null;
    document.getElementById("turnStatusMessage").onclick = null;

    document.getElementById("teamOneName").classList.remove("teamOneColor");
    document.getElementById("teamOneName").classList.add("teamOneBox");

    document.getElementById("teamTwoName").classList.remove("teamTwoColor");
    document.getElementById("teamTwoName").classList.add("teamTwoBox");

    if (localStorage.getItem("playerName")) {
        document.getElementById("playerNameInput").value = localStorage.getItem("playerName");
    }

    if (localStorage.getItem("gameStateId")) {
        document.getElementById("gameStateId").value = localStorage.getItem("gameStateId");
    }
}

async function choosePlayerNameButtonOnClickAsync() {
    var playerNameInput = document.getElementById("playerNameInput");
    if (playerNameInput.value.length <= 1) {
        bootbox.alert({
            size: "small",
            message: "Your player name must be at least two characters.",
            closeButton: false
        });
        return;
    }

    if (playerNameInput.value.length > 14) {
        bootbox.alert({
            size: "small",
            message: "Your player name must be 14 or less characters.",
            closeButton: false
        });
        return;
    }

    if (document.getElementById("gameStateId").value) {
        localStorage.setItem("gameStateId", document.getElementById("gameStateId").value.toUpperCase());
    }

    localStorage.setItem("playerName", document.getElementById("playerNameInput").value);
    localStorage.setItem("playerColor", window.colorPicker.color.hslString);

    var gameState = await getGameStateAsync();
    if (gameState) {
        handleGameState(gameState);
    } else {
        bootbox.alert({
            size: "small",
            message: "Didn't find a game with that code. Try a different code.",
            closeButton: false
        });
        return;
    }

    playerNameChosen({
        name: document.getElementById("playerNameInput").value,
        color: window.colorPicker.color.hslString
    });
}

function playerNameChosen(player) {
    document.getElementById("playerName").innerHTML = player.name;

    document.getElementById("choosePlayerNameLabel").classList.add("hidden");
    document.getElementById("playerNameInputDiv").classList.add("hidden");
    document.getElementById("colorPicker").classList.add("hidden");
    document.getElementById("choosePlayerName").classList.add("hidden");
    document.getElementById("playerHelp").classList.add("hidden");

    document.getElementById("playerBanner").classList.remove("hidden");
    document.getElementById("chooseTeam").classList.remove("hidden");
    document.getElementById("teamOneName").classList.remove("hidden");
    document.getElementById("teamTwoName").classList.remove("hidden");

    setupTeamSelectionButtons();
}

var playerIsReadyToPlay = false;

function teamChosen(teamNumber) {
    localStorage.setItem("teamNumber", teamNumber);
    document.getElementById("turnStatusMessage").classList.remove("hidden");

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

    document.getElementById("teamButtons").classList.remove("hidden");

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

function shouldPlayerLoadFromCache() {
    if (localStorage.getItem("createdTime")) {
        var createdTime = new Date(localStorage.getItem("createdTime"));
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (createdTime > yesterday) {
            return true;
        }
    }

    return false;
}

async function setupPlayerAsync() {
    var promises = [];
    promises.push(getGameStateAsync());
    promises.push(getPlayerAsync());

    var results = await Promise.all(promises);

    if (!results[0] || results[0].turnType === "EndGame") {
        localStorage.removeItem("gameStateId");
        results[0] = null;
    }
    
    if (shouldPlayerLoadFromCache() && results[0] && results[1]) {
        playerNameChosen({
            name: results[1].name,
            color: results[1].color
        });
        teamChosen(results[1].teamNumber);
        return finalizePlayerAsync();
    } else {
        setupChoosePlayerName();
    }
}

function setupTeamSelectionButtons() {
    document.getElementById("teamOneName").onclick = async function () {
        teamChosen(1);
        await finalizePlayerAsync();
    };
    document.getElementById("teamTwoName").onclick = async function () {
        teamChosen(2);
        await finalizePlayerAsync();
    };
    document.getElementById("chooseSmallestTeam").onclick = async function () {
        await smallestTeamChosenAsync();
        await finalizePlayerAsync();
    };
}

async function smallestTeamChosenAsync() {
    document.getElementById("chooseSmallestTeam").innerHTML = "Loading...";

    await getSmallestTeamAsync().then(entity => {
        if (entity) {
            teamChosen(entity.teamNumber);
        } else {
            teamChosen(Math.ceil(Math.random() * 2));
        }
    });
}

function drawTurnType(gameState) {
    if (!gameState) {
        return;
    }

    document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageCorrect");

    if (gameState.pauseState === "Paused") {
        document.getElementById("panelButtons").classList.add("hidden");
        document.getElementById("playerReadyButton").classList.add("hidden");
        document.getElementById("teamGuesses").classList.add("hidden");
        document.getElementById("turnStatusMessage").classList.remove("opacity0");
        document.getElementById("turnStatusMessage").innerHTML = "Game is paused";
        return;
    }

    switch (gameState.turnType) {
        case "Welcome":

            if (!gameState.turnEndTime) {
                document.getElementById("startGameButton").classList.remove("hidden");
                document.getElementById("cancelStartGameButton").classList.add("hidden");
            } else {
                document.getElementById("startGameButton").classList.add("hidden");
                document.getElementById("cancelStartGameButton").classList.remove("hidden");
            }

            document.getElementById("panelButtons").classList.add("hidden");
            document.getElementById("playerReadyButton").classList.add("hidden");
            document.getElementById("teamGuesses").classList.add("hidden");
            document.getElementById("turnStatusMessage").classList.add("opacity0");
            break;
        case "OpenPanel":
            document.getElementById("startGameButton").classList.add("hidden");
            document.getElementById("cancelStartGameButton").classList.add("hidden");

            document.getElementById("teamGuesses").classList.add("hidden");

            if (gameState.teamTurn === parseInt(localStorage.getItem("teamNumber"))) {
                document.getElementById("turnStatusMessage").classList.remove("opacity0");
                document.getElementById("turnStatusMessage").innerHTML = "Vote for a panel to open";
                highlightturnStatusMessage();

                document.getElementById("panelButtons").classList.remove("hidden");
                document.getElementById("playerReadyButton").classList.remove("hidden");
            } else {
                document.getElementById("turnStatusMessage").classList.add("opacity0");
                document.getElementById("panelButtons").classList.add("hidden");
                document.getElementById("playerReadyButton").classList.add("hidden");
            }
            break;
        case "MakeGuess":
            document.getElementById("startGameButton").classList.add("hidden");
            document.getElementById("cancelStartGameButton").classList.add("hidden");
            document.getElementById("panelButtons").classList.add("hidden");

            if ((localStorage.getItem("teamNumber") === "1" && gameState.teamOneGuessStatus) ||
                (localStorage.getItem("teamNumber") === "2" && gameState.teamTwoGuessStatus)) {
                document.getElementById("playerReadyButton").classList.add("hidden");
                document.getElementById("teamGuesses").classList.add("hidden");
                document.getElementById("turnStatusMessage").classList.add("opacity0");
                drawPlayerReady();
            } else {
                document.getElementById("playerReadyButton").classList.remove("hidden");
                document.getElementById("teamGuesses").classList.remove("hidden");
                document.getElementById("turnStatusMessage").classList.remove("opacity0");
            }

            document.getElementById("turnStatusMessage").innerHTML = "Submit and Vote for Guesses";
            highlightturnStatusMessage();

            break;
        case "GuessesMade":
            document.getElementById("startGameButton").classList.add("hidden");
            document.getElementById("cancelStartGameButton").classList.add("hidden");
            document.getElementById("panelButtons").classList.add("hidden");
            document.getElementById("playerReadyButton").classList.add("hidden");
            document.getElementById("teamGuesses").classList.add("hidden");
            document.getElementById("turnStatusMessage").classList.add("opacity0");
            break;
        case "EndRound":
            document.getElementById("startGameButton").classList.add("hidden");
            document.getElementById("cancelStartGameButton").classList.add("hidden");
            document.getElementById("turnStatusMessage").classList.add("opacity0");
            document.getElementById("panelButtons").classList.add("hidden");

            document.getElementById("playerReadyButton").classList.add("hidden");
            document.getElementById("teamGuesses").classList.add("hidden");
            document.getElementById("turnStatusMessage").classList.add("opacity0");
            break;
    }
}

function highlightturnStatusMessage() {
    document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageHighlight");
    setTimeout(function () {
        document.getElementById("turnStatusMessage").classList.add("turnStatusMessageHighlight");
    }, 0);
}

function handleGameState(gameState, updateType) {
    loadThemeAsync(gameState);

    if (playerIsReadyToPlay && (updateType === "NewTurn" || updateType === "NewRound")) {
        clearPanelButtonSelection();
        drawPlayerReady();
        scrollChats("chats", true);
    }

    if (updateType === "NewTurn" || updateType === "NewRound") {
        resetTeamGuessVoteChoosen();
        resetTeamGuessVoteCounts();
    }

    if (updateType === "NewRound") {
        drawTeamGuesses([]);
    }

    if (gameState.turnType === "OpenPanel" && localStorage.getItem("innerPanelNotifyGameStateId") !== gameState.gameStateId &&
        parseInt(localStorage.getItem("teamNumber")) == gameState.teamTurn) {
        if ((localStorage.getItem("teamNumber") === "1" && gameState.teamOneInnerPanels <= 0) ||
            (localStorage.getItem("teamNumber") === "2" && gameState.teamTwoInnerPanels <= 0)) {

            bootbox.alert({
                size: "small",
                message: "Your team is out of inner panels. From now on, if you open an inner panel, it will cost one point.",
                closeButton: false
            });

            localStorage.setItem("innerPanelNotifyGameStateId", gameState.gameStateId);
        }
    }

    drawGameState(gameState);

    if (!playerIsReadyToPlay) {
        return;
    }

    drawTurnType(gameState);

    updatePlayerPanelButtons(gameState);
}

function drawTeamGuesses(teamGuesses) {
    var teamGuessesElement = document.getElementById("teamGuessesContainer");
    teamGuessesElement.innerHTML = "";

    if (!teamGuesses) {
        return;
    }
    
    teamGuesses.forEach(drawTeamGuess);
}

function deleteTeamGuess(teamGuess) {
    document.getElementById("teamGuess_" + teamGuess.ticks).remove();
}

function drawTeamGuess(teamGuess, startingPlayerId) {
    if (teamGuess.guess === "Pass") {
        document.getElementById("teamGuessVoteCount_Pass").innerHTML = teamGuess.voteCount;
        return
    }

    var teamGuessesElement = document.getElementById("teamGuessesContainer");

    var teamGuessElement = document.createElement("div");
    teamGuessElement.id = "teamGuess_" + teamGuess.ticks;
    teamGuessElement.classList = "teamGuessText";

    var teamGuessVoteCountElement = document.createElement("div");
    teamGuessVoteCountElement.id = "teamGuessVoteCount_" + teamGuess.ticks;
    teamGuessVoteCountElement.classList = "teamGuessVoteCount";
    if (localStorage.getItem("playerId") === startingPlayerId) {
        teamGuessVoteCountElement.classList.add("teamGuessVoteCountChosen");
    }
    teamGuessVoteCountElement.innerHTML = teamGuess.voteCount;
    teamGuessElement.appendChild(teamGuessVoteCountElement);

    teamGuessElement.appendChild(document.createTextNode(teamGuess.guess));

    var teamGuessDeleteButtonElement = document.createElement("div");
    teamGuessDeleteImageElement = document.createElement("img");
    teamGuessDeleteImageElement.src = "img/x-mark.png";
    teamGuessDeleteButtonElement.appendChild(teamGuessDeleteImageElement);

    teamGuessDeleteButtonElement.onclick = (event) => {
        event.stopPropagation();

        bootbox.confirm({
            size: "small",
            message: "Delete the guess '" + teamGuess.guess + "'?",
            backdrop: true,
            closeButton: false,
            callback: function (result) {
                if (result) {
                    deleteTeamGuessAsync(teamGuess.ticks);
                }
            }
        });
    }

    teamGuessDeleteButtonElement.classList = "teamGuessDeleteButton";
    teamGuessElement.appendChild(teamGuessDeleteButtonElement);

    teamGuessElement.onclick = (event) => {
        event.stopPropagation();
        putTeamGuessVoteAsync(teamGuess.ticks);
    }

    teamGuessesElement.appendChild(teamGuessElement);
}

function voteTeamGuess(oldVote, newVote) {
    updateVoteCount(oldVote, -1);
    updateVoteCount(newVote, 1);
}

function updateVoteCount(ticks, amount) {
    var voteCountElement = document.getElementById("teamGuessVoteCount_" + ticks);
    if (voteCountElement) {
        var currentVoteCount = parseInt(voteCountElement.textContent);
        if (currentVoteCount) {
            voteCountElement.innerHTML = currentVoteCount + amount;
        } else if (amount > 0) {
            voteCountElement.innerHTML = amount;
        } else {
            voteCountElement.innerHTML = "0";
        }

        if (amount > 0) {
            animateCSS(voteCountElement, ["pulse"], [], 0, true);
        }
    }
}

function resetTeamGuessVoteChoosen() {
    var teamGuessElements = document.querySelectorAll(".teamGuessVoteCount");
    for (var teamGuessElement of teamGuessElements) {
        teamGuessElement.classList.remove("teamGuessVoteCountChosen");
    }
}

function resetTeamGuessVoteCounts() {
    var teamGuessElements = document.querySelectorAll(".teamGuessVoteCount");
    for (var teamGuessElement of teamGuessElements) {
        teamGuessElement.innerHTML = "0";
    }
}

const innerPanels = ["7", "8", "9", "12", "13", "14"];
const outerPanels = ["1", "2", "3", "4", "5", "6", "10", "11", "15", "16", "17", "18", "19", "20"];

function updatePlayerPanelButtons(gameState) {
    if (!gameState) {
        return;
    }

    updatePanelButtons(gameState);
}

async function handleRandomizeTeam(player) {
    clearPanelButtonSelection();

    if (parseInt(localStorage.getItem("teamNumber")) !== player.teamNumber) {
        teamChosen(player.teamNumber);
        await finalizePlayerAsync();

        drawSystemChat("chats", { message: "The teams have been randomized; you are now on the other team." });
    } else {
        drawSystemChat("chats", { message: "The teams have been randomized; you have not changed teams." });
    }
}

var confirmPlayerReadyInterval;
function drawPlayerReady(player) {
    clearInterval(confirmPlayerReadyInterval);

    var playerReadyButton = document.getElementById("playerReadyButton");
    if (!player) {
        playerReadyButton.innerHTML = "We are Ready!";
        return;
    }

    if (player.playerId === localStorage.getItem("playerId")) {
        playerReadyButton.innerHTML = "Undo Ready";
    } else {
        playerReadyButton.innerHTML = "";

        var playerNameReady = document.createElement("div");
        playerNameReady.id = "playerNameReady"
        playerNameReady.classList = "confirmButtonChild";

        var playerName = document.createElement("span");
        playerName.classList = "playerNameConfirm";
        playerName.style = "color: " + player.color + ";";
        playerName.appendChild(document.createTextNode(player.name));
        playerNameReady.appendChild(playerName);
        playerNameReady.appendChild(document.createTextNode(" is ready..."));
        playerReadyButton.appendChild(playerNameReady);

        var confirmElement = document.createElement("div");
        confirmElement.id = "confirmReady";
        confirmElement.classList = "confirmReady confirmButtonChild opacity0";
        confirmElement.appendChild(document.createTextNode("Confirm?"));
        playerReadyButton.appendChild(confirmElement);

        confirmPlayerReadyInterval = setTimeout(fadeConfirmButton, 2000);
    }
}

function fadeConfirmButton() {
    document.getElementById("playerNameReady").classList.toggle("opacity0");
    document.getElementById("confirmReady").classList.toggle("opacity0");
    confirmPlayerReadyInterval = setTimeout(fadeConfirmButton, 3000);
}

function registerConnections() {
    connection.on("Chat", (chat) => {
        drawChat("chats", chat);
    });

    connection.on("Typing", (player) => {
        handleTyping("chats", player);
    });

    connection.on("AddPlayer", (player) => {
        if (player.playerId !== localStorage.getItem("playerId")) {
            drawSystemChat("chats", { message: "has joined the team.", player: player });
        }
    });

    connection.on("GameState", handleGameState);
    connection.on("AddTeamGuess", drawTeamGuess);
    connection.on("DeleteTeamGuess", deleteTeamGuess);
    connection.on("VoteTeamGuess", voteTeamGuess);
    connection.on("RandomizeTeam", handleRandomizeTeam);
    connection.on("PlayerReady", drawPlayerReady);
}

async function finalizePlayerAsync() {
    var player = await putPlayerAsync();
    localStorage.setItem("playerId", player.playerId);

    await startSignalRAsync("playerId=" + player.playerId + "&gameStateId=" + player.gameStateId);

    playerIsReadyToPlay = true;
    localStorage.setItem("createdTime", new Date());

    setupChats("chats");

    var promises = [];
    promises.push(getTeamGuessesAsync());
    promises.push(getGameStateAsync());
    promises.push(getPlayerReadyAsync());
    promises.push(drawChatsAsync("chats"));

    var results = await Promise.all(promises);

    drawTeamGuesses(results[0]); // first promise is getTeamGuessesAsync
    handleGameState(results[1]); // second promise is getGameStateAsync
    drawPlayerReady(results[2]); // third promise is getPlayerReadyAsync
    drawPlayer(player);

    document.getElementById("playerBanner").onclick = (event) => {
        var result = confirm("Do you want to change your player name, color, or team?");
        if (!result) {
            return;
        }
        setupChoosePlayerName();
    };

    document.getElementById("turnStatusMessage").onclick = (event) => {
        var result = confirm("Do you want to change your player name, color, or team?");
        if (!result) {
            return;
        }
        setupChoosePlayerName();
    };

    scrollChats("chats", true);
    sortChats("chats");

    setupPing(putPlayerPingAsync);
}

window.onresize = function () {
    var chatsElement = document.getElementById("chats");
    chatsElement.classList.remove("smoothScroll");
    scrollChats("chats", true);
    chatsElement.classList.add("smoothScroll");
}

window.onload = async function () {
    var gc = urlParams.get('gc');
    if (gc) {
        if (gc.length === 4) {
            localStorage.setItem("gameStateId", gc);
            localStorage.removeItem("createdTime");
        }

        window.location.href = "https://picturepanels.net/";
        return;
    }

    document.getElementById("teamGuess_Pass").onclick = (event) => {
        event.stopPropagation();
        putTeamGuessVoteAsync("Pass");
    }

    document.getElementById("teamGuessAdd").onclick = (event) => {
        promptTeamGuess();
    }

    document.getElementById("playerReadyButton").onclick = (event) => {
        putPlayerReadyAsync();
    }

    document.getElementById("startGameButton").onclick = (event) => {
        putStartGameAsync();
    }

    document.getElementById("cancelStartGameButton").onclick = (event) => {
        putCancelStartGameAsync();
    }

    drawPanelButtons();
    setupPlayerMenu();
    setupPlayerAsync();
}
