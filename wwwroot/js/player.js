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
        width: Math.ceil(Math.min(300, window.screen.width * .65))
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
}

async function putPlayerPingAsync() {
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

async function postTeamGuessAsync() {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuess/" + localStorage.getItem("playerId"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Guess: document.getElementById("chats_inputText").value
            })
        }).then(() => {
            document.getElementById("chats_inputText").value = "";
        });
}

async function getTeamGuessesAsync() {
    return await fetch("/api/teamGuess/" + localStorage.getItem("playerId"))
        .then(response => response.json())
        .then(responseJson => {
            return responseJson;
        });
}

async function deleteTeamGuessAsync(ticks) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuess/" + localStorage.getItem("playerId") + "/" + ticks,
        {
            method: "DELETE"
        });
}

async function putTeamGuessVoteAsync(ticks) {
    if (!playerIsReadyToPlay) {
        return;
    }

    await fetch("api/teamGuess/" + localStorage.getItem("playerId") + "/" + ticks,
        {
            method: "PUT"
        }).then((response) => {
            if (response.ok) {
                var teamGuessElements = document.querySelectorAll(".teamGuessVoteCount");
                for (var teamGuessElement of teamGuessElements) {
                    teamGuessElement.classList.remove("teamGuessVoteCountChosen");
                }
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

    document.getElementById("playerBanner").classList.add("hidden");
    document.getElementById("chooseTeam").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("hidden");
    document.getElementById("teamTwoName").classList.add("hidden");

    document.getElementById("playerName").classList.add("hidden");
    document.getElementById("teamOneName").classList.add("chooseTeamName");
    document.getElementById("teamTwoName").classList.add("chooseTeamName");
    document.getElementById("chooseSmallestTeam").classList.remove("hidden");

    document.getElementById("panelButtons").classList.add("hidden");

    document.getElementById("teamGuessButton").classList.add("hidden");
    document.getElementById("teamGuessesContainer").classList.add("hidden");

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
}

function choosePlayerNameButtonOnClick() {
    var playerNameInput = document.getElementById("playerNameInput");
    if (playerNameInput.value.length <= 1 || playerNameInput.value === playerNameInput.defaultValue) {
        document.getElementById("playerNameInput").classList.add("playerNameInputDivInvalid");
        return;
    }

    playerNameChosen({
        name: document.getElementById("playerNameInput").value,
        color: window.colorPicker.color.hslString
    });
}

function playerNameChosen(player) {
    localStorage.setItem("playerName", player.name);
    localStorage.setItem("playerColor", player.color);
    document.getElementById("playerName").innerHTML = player.name;

    document.getElementById("choosePlayerNameLabel").classList.add("hidden");
    document.getElementById("playerNameInputDiv").classList.add("hidden");
    document.getElementById("colorPicker").classList.add("hidden");
    document.getElementById("choosePlayerName").classList.add("hidden");

    document.getElementById("playerBanner").classList.remove("hidden");
    document.getElementById("chooseTeam").classList.remove("hidden");
    document.getElementById("teamOneName").classList.remove("hidden");
    document.getElementById("teamTwoName").classList.remove("hidden");

    setupTeamSelectionButtons();
}

var playerIsReadyToPlay = false;

function teamChosen(teamNumber) {
    localStorage.setItem("teamNumber", teamNumber);

    drawTeam(teamNumber);
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
    if (shouldPlayerLoadFromCache() && localStorage.getItem("playerName") && localStorage.getItem("playerColor") && localStorage.getItem("teamNumber")) {
        playerNameChosen({
            name: localStorage.getItem("playerName"),
            color: localStorage.getItem("playerColor")
        });
        teamChosen(parseInt(localStorage.getItem("teamNumber")));
        return finalizePlayerAsync();
    } else {
        localStorage.setItem("createdTime", new Date());
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
                teamChosen(1);
            } else if (teamOneCount > teamTwoCount) {
                teamChosen(2);
            } else {
                if (Math.random() < .5) {
                    teamChosen(1);
                } else {
                    teamChosen(2);
                }
            }
        });
}

function drawTeam(teamNumber) {
    updatePlayerPanelButtons(currentGameState);

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

function drawTurnType(gameState) {
    if (!gameState) {
        return;
    }

    document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageCorrect");
    document.getElementById("teamGuessButton").classList.add("hidden");
    document.getElementById("teamGuessesContainer").classList.add("hidden");

    if (gameState.turnType === "Welcome") {
        document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageVisible");
        document.getElementById("panelButtons").classList.add("hidden");
        document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
        return;
    }

    if (gameState.turnType === "EndRound") {
        document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageVisible");
        document.getElementById("panelButtons").classList.add("hidden");
        document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
        document.getElementById("turnStatusMessage").innerHTML = "This round is over.";
        return;
    }

    
    if (gameState.turnType !== "MakeGuess") {
        setInputDefaultText("chats_inputText", "chat with your team...");
    } else {
        setInputDefaultText("chats_inputText", "chat or guess...");
    }
    

    switch (gameState.turnType) {
        case "OpenPanel":
            if (gameState.teamTurn === parseInt(localStorage.getItem("teamNumber"))) {
                document.getElementById("turnStatusMessage").classList.add("turnStatusMessageVisible");
                highlightturnStatusMessage();

                document.getElementById("panelButtons").classList.remove("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
                document.getElementById("turnStatusMessage").innerHTML = "Vote for a panel to open";
            } else {
                document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageVisible");
                document.getElementById("panelButtons").classList.add("hidden");
                document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");
            }
            break;
        case "MakeGuess":
            document.getElementById("teamGuessButton").classList.remove("hidden");
            document.getElementById("teamGuessesContainer").classList.remove("hidden");

            document.getElementById("panelButtons").classList.add("hidden");
            document.getElementById("panelButtons").classList.remove("panelButtonsHighlight");

            document.getElementById("turnStatusMessage").classList.add("turnStatusMessageVisible");
            document.getElementById("turnStatusMessage").innerHTML = "Make your guess or pass";
            highlightturnStatusMessage();

            break;
        case "GuessesMade":
            document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageVisible");
            break;
    }
}

function highlightturnStatusMessage() {
    document.getElementById("turnStatusMessage").classList.remove("turnStatusMessageHighlight");
    setTimeout(function () {
        document.getElementById("turnStatusMessage").classList.add("turnStatusMessageHighlight");
    }, 0);
}

function handleGameState(gameState) {
    loadThemeCss(gameState);

    if (playerIsReadyToPlay && (!currentGameState || currentGameState.turnType !== gameState.turnType || currentGameState.teamTurn !== gameState.teamTurn)) {
        clearPanelButtonSelection();
    } else if (currentGameState && currentGameState.imageId !== gameState.imageId) {
        clearPanelButtonSelection();
    }

    currentGameState = gameState;

    drawGameState(gameState);

    if (!playerIsReadyToPlay) {
        return;
    }

    drawTurnType(gameState);

    updatePlayerPanelButtons(gameState);

    if (gameState.turnType === "Welcome") {
        drawSystemChat("chats", { message: "Welcome to the Picture Panels game!" });
        return;
    }
}

function drawTeamGuesses(teamGuesses) {
    var teamGuessesElement = document.getElementById("teamGuesses");
    teamGuessesElement.innerHTML = "";
    teamGuesses.forEach(drawTeamGuess);
}

function deleteTeamGuess(teamGuess) {
    document.getElementById("teamGuess_" + teamGuess.ticks).remove();
}

function drawTeamGuess(teamGuess) {
    var teamGuessesElement = document.getElementById("teamGuesses");

    var teamGuessElement = document.createElement("div");
    teamGuessElement.id = "teamGuess_" + teamGuess.ticks;
    teamGuessElement.classList = "teamGuessText";
    if (localStorage.getItem("teamNumber") === "1") {
        teamGuessElement.classList.add("teamOneDarkColorBackground");
    } else {
        teamGuessElement.classList.add("teamTwoDarkColorBackground");
    }

    var teamGuessVoteCountElement = document.createElement("div");
    teamGuessVoteCountElement.id = "teamGuessVoteCount_" + teamGuess.ticks;
    teamGuessVoteCountElement.classList = "teamGuessVoteCount";
    teamGuessVoteCountElement.innerHTML = teamGuess.voteCount;
    teamGuessElement.appendChild(teamGuessVoteCountElement);

    teamGuessElement.appendChild(document.createTextNode(teamGuess.guess));

    var teamGuessDeleteButtonElement = document.createElement("div");
    teamGuessDeleteImageElement = document.createElement("img");
    teamGuessDeleteImageElement.src = "img/x-mark.png";
    teamGuessDeleteButtonElement.appendChild(teamGuessDeleteImageElement);

    teamGuessDeleteButtonElement.onclick = (event) => {
        event.stopPropagation();

        var result = confirm("Delete the guess '" + teamGuess.guess + "'?");
        if (!result) {
            return;
        }

        deleteTeamGuessAsync(teamGuess.ticks);
    }

    teamGuessDeleteButtonElement.classList = "teamGuessDeleteButton";
    teamGuessElement.appendChild(teamGuessDeleteButtonElement);

    var teamGuessVoteCountElement = document.createElement("div");
    teamGuessVoteCountElement.id = "teamGuessVoteCount_" + teamGuess.ticks;
    teamGuessVoteCountElement.classList = "teamGuessVoteCount";
    teamGuessVoteCountElement.innerHTML = teamGuess.voteCount;
    teamGuessElement.appendChild(teamGuessVoteCountElement);

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
            voteCountElement.innerHTML = 0;
        }
    }
}

const innerPanels = ["7", "8", "9", "12", "13", "14"];
const outerPanels = ["1", "2", "3", "4", "5", "6", "10", "11", "15", "16", "17", "18", "19", "20"];

function updatePlayerPanelButtons(gameState) {
    if (!gameState) {
        return;
    }

    var disabledPanels = [];

    var teamNumber = localStorage.getItem("teamNumber");
    if (teamNumber === "1") {
        if (gameState.teamOneInnerPanels <= 0) {
            disabledPanels = disabledPanels.concat(innerPanels);
        }
    } else {
        if (gameState.teamTwoInnerPanels <= 0) {
            disabledPanels = disabledPanels.concat(innerPanels);
        }
    }

    updatePanelButtons(currentGameState, disabledPanels);
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
}

async function finalizePlayerAsync() {
    await startSignalRAsync("player");
    drawPlayer(await putPlayerAsync());
    playerIsReadyToPlay = true;

    setupChats("chats");

    var promises = [];
    promises.push(getTeamGuessesAsync());
    promises.push(getGameStateAsync());
    promises.push(drawChatsAsync("chats"));

    var results = await Promise.all(promises);

    drawTeamGuesses(results[0]); // first promise is getTeamGuessesAsync
    handleGameState(results[1]); // second promise is getGameStateAsync

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
}

window.onresize = function () {
    var chatsElement = document.getElementById("chats");
    chatsElement.classList.remove("smoothScroll");
    scrollChats("chats", true);
    chatsElement.classList.add("smoothScroll");
}

window.onload = async function () {
    handleGameState(await getGameStateAsync());

    var teamGuessButton = document.getElementById("teamGuessButton");
    teamGuessButton.onclick = (event) => {
        postTeamGuessAsync();
    }

    var playerReadyButton = document.getElementById("playerReadyButton");
    playerReadyButton.onclick = (event) => {
        putPlayerReadyAsync();
    }

    drawPanelButtons();
    setupPlayerMenu();
    setupPlayerAsync();

    setInterval(putPlayerPingAsync, 30000);
}
