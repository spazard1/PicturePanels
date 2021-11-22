var entranceAnimations = [
    "backInDown", "backInLeft", "backInRight", "backInUp",
    "bounceInDown", "bounceInLeft", "bounceInRight", "bounceInUp",
    "fadeInDown", "fadeInLeft", "fadeInRight", "fadeInUp", "fadeInTopLeft", "fadeInTopRight", "fadeInBottomLeft", "fadeInBottomRight",
    "flipInX", "flipInY",
    "jackInTheBox", "rollIn",
    "zoomIn", "zoomInDown", "zoomInLeft", "zoomInRight", "zoomInUp",
    "slideInDown", "slideInLeft", "slideInRight", "slideInUp"
    ];
var exitAnimations = [
    "backOutDown", "backOutLeft", "backOutRight",
    "bounceOutDown", "bounceOutLeft", "bounceOutRight", "bounceOutUp",
    "fadeOutDown", "fadeOutLeft", "fadeOutRight", "fadeOutUp", "fadeOutTopLeft", "fadeOutTopRight", "fadeOutBottomLeft", "fadeOutBottomRight",
    "flipOutX", "flipOutY", "lightSpeedOutRight", "lightSpeedOutLeft",
    "hinge", "rollOut",
    "zoomOut", "zoomOutDown", "zoomOutLeft", "zoomOutRight", "zoomOutUp"
    ];

var maxMostVotesPanels = 3;

async function postGameStateAsync() {
    return await fetch("/api/gameState", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("userToken")
        },
        body: JSON.stringify({
            teamOneName: document.getElementById("welcomeGameStateTeamOneName").value,
            teamTwoName: document.getElementById("welcomeGameStateTeamTwoName").value,
            openPanelTime: parseInt(document.getElementById("welcomeOpenPanelTime").value),
            wrongGuessPenalty: parseInt(document.getElementById("welcomeWrongGuessPenalty").value),
            guessTime: parseInt(document.getElementById("welcomeGuessTime").value),
            tags: document.getElementById("tagsInput").value,
            excludedTags: document.getElementById("excludedTagsInput").value,
            theme: urlParams.get('theme')
        })
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        return;
    });
}

async function pauseGameAsync() {
    return await fetch("/api/gameState/" + currentGameState.gameStateId + "/pause", {
        method: "PUT"
    })
        .then(response => {
            if (response.ok) {
                return true;
            }
            return false;
        });
}

async function resumeGameAsync() {
    return await fetch("/api/gameState/" + currentGameState.gameStateId + "/resume", {
        method: "PUT"
    })
        .then(response => {
            if (response.ok) {
                return true;
            }
            return false;
        });
}

async function getGameRoundsAsync(gameStateId) {
    return await fetch("/api/gameState/gameRounds/" + gameStateId)
        .then(response => {
        if (response.ok) {
            return response.json();
        }
        return false;
    });
}

async function getGameRoundAsync(gameStateId, roundNumber) {
    return await fetch("/api/gameState/gameRounds/" + gameStateId + "/" + roundNumber)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return false;
        });
}

async function getScoreChangeAsync(gameStateId) {
    return await fetch("/api/gameState/scoreChange/" + gameStateId)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return false;
        });
}

function createPanels() {
    var panelNumber = 1;

    var panelsElement = document.getElementById("panels");
    for (var i = 0; i < down; i++) {
        for (var j = 0; j < across; j++) {
            var panelElement = document.createElement("div");
            panelElement.classList.add("panel");
            panelElement.id = "panel_" + panelNumber;
            panelElement.panelNumber = "" + panelNumber;
            panelElement.value = panelNumber + "";

            var panelBackgroundElement = document.createElement("div");
            panelBackgroundElement.classList.add("panelBackground");
            panelBackgroundElement.classList.add("animate__animated");
            panelBackgroundElement.classList.add("animate__slow");
            panelElement.appendChild(panelBackgroundElement);

            var panelNumberElement = document.createElement("div");
            panelNumberElement.id = "panelNumber_" + panelNumber;
            panelNumberElement.classList.add("panelNumber");
            panelNumberElement.appendChild(document.createTextNode(panelNumber));
            panelBackgroundElement.appendChild(panelNumberElement);

            var panelImageElement = document.createElement("img");
            panelImageElement.classList.add("panelImage");
            panelElement.appendChild(panelImageElement);

            panelsElement.appendChild(panelElement);
            panelNumber++;
        }
    }
}

function createMostVotesPanels() {
    var mostVotesPanelsElement = document.getElementById("mostVotesPanels");

    for (var i = 0; i < maxMostVotesPanels; i++) {
        var mostVotesPanelElement = document.createElement("div");
        mostVotesPanelElement.classList.add("mostVotesPanel");
        mostVotesPanelElement.classList.add("opacity0");

        var mostVotesPanelImageElement = document.createElement("img");
        mostVotesPanelImageElement.classList.add("panelImage");
        mostVotesPanelElement.appendChild(mostVotesPanelImageElement);

        mostVotesPanelsElement.appendChild(mostVotesPanelElement);
    }
}

function openPanel(panel) {
    if (panel.classList.contains("panelOpen")) {
        return;
    }

    panel.classList.add("panelOpen");
    animateCSS(panel.firstChild, [exitAnimations[Math.floor(Math.random() * exitAnimations.length)]], entranceAnimations);
}

function closePanel(panel) {
    var entranceAnimation = entranceAnimations[Math.floor(Math.random() * entranceAnimations.length)];

    resetPanel(panel, entranceAnimation);
}

function togglePanel(panel) {
    if (panel.classList.contains("panelOpen")) {
        closePanel(panel);
    } else {
        openPanel(panel);
    }
}

function resetPanel(panel, entranceAnimation, delay) {
    if (!panel.classList.contains("panelOpen")) {
        animateCSS(panel.firstChild, [], exitAnimations, 0, true);
        return;
    }

    panel.classList.remove("panelOpen");
    animateCSS(panel.firstChild, [entranceAnimation], exitAnimations, delay, true);
}

async function resetPanelsAsync(gameState, updateType) {
    if (gameState.turnType === "EndGame" || (updateType !== "FirstLoad" && updateType !== "NewRound")) {
        return
    }

    var imagePromises = [];
    var panels = document.getElementsByClassName("panel");

    var entranceAnimation = entranceAnimations[Math.floor(Math.random() * entranceAnimations.length)];

    var delay = 0;
    for (var panel of panels) {
        resetPanel(panel, entranceAnimation, delay);
        delay += 50;
        imagePromises.push(loadImageAsync(panel.lastChild, "/api/images/panels/" + gameState.gameStateId + "/" + gameState.roundNumber + "/0"));
    }

    var mostVotesPanelElements = document.getElementsByClassName("mostVotesPanel");
    for (var mostVotesPanelElement of mostVotesPanelElements) {
        mostVotesPanelElement.classList.add("opacity0");
    }

    await Promise.all(imagePromises);

    resizePanelContainer();
}

function resizePanelContainer() {
    var panelsContainer = document.getElementById('panels');
    panelsContainer.style.maxWidth = "";

    var panelsContainerRect = panelsContainer.getBoundingClientRect();
    var panelsContainerMaxWidth = 83;
    var paddingBottom = 5;

    while (panelsContainerRect.height + panelsContainerRect.y >= (window.innerHeight - paddingBottom)) {
        panelsContainerMaxWidth -= .5;
        if (panelsContainerMaxWidth < 10) {
            break;
        }

        panelsContainer.style.maxWidth = panelsContainerMaxWidth + "vw";
        panelsContainerRect = panelsContainer.getBoundingClientRect();
    }
}

var playerSelectedPanels = {};

function updatePlayer(player) {
    var playerElement = document.getElementById("player_" + player.playerId);
    if (!playerElement) {
        playerElement = document.createElement("div");
        playerElement.classList = "teamPlayerName";
        playerElement.id = "player_" + player.playerId;
        playerElement.playerId = player.playerId;
    }
    playerElement.innerHTML = player.name;
    playerElement.style.borderColor = player.color;

    var parent = null;
    
    playerSelectedPanels[player.playerId] = player;

    if (player.teamNumber === 1) {
        parent = document.getElementById("teamOnePlayerNames");
    } else {
        parent = document.getElementById("teamTwoPlayerNames");
    }
    if (parent !== playerElement.parentNode) {
        parent.appendChild(playerElement);
    }

    setPlayerFuzzies(player);

    updatePlayerDots(player);
}

var middleXOffset = .2;
var middleYOffset = .25;
var playerFuzzies = {};

function setPlayerFuzzies(player) {
    if (playerFuzzies[player.playerId]) {
        return;
    }

    playerFuzzies[player.playerId] = {};

    if (Math.random() < .5) {
        playerFuzzies[player.playerId].fuzzX = Math.random();

        // check if this number falls inside the middle range
        if (playerFuzzies[player.playerId].fuzzX < (.5 + middleXOffset) && playerFuzzies[player.playerId].fuzzX > (.5 - middleXOffset)) {
            // generate a random number on the first-half (.5) of the panel, but use the entire valid range of the panel (offset is only half of the offset, so multiply by 2).
            playerFuzzies[player.playerId].fuzzY = .5 * Math.random() * (1 - middleYOffset * 2);
            if (Math.random() < .5) {
                // half of the time, choose the other side of the panel instead (.5), + the offset to get to the end of the panel
                playerFuzzies[player.playerId].fuzzY = .5 + middleYOffset + playerFuzzies[player.playerId].fuzzY;
            }
        } else {
            playerFuzzies[player.playerId].fuzzY = Math.random();
        }
    } else {
        playerFuzzies[player.playerId].fuzzY = Math.random();

        if (playerFuzzies[player.playerId].fuzzY < (.5 + middleYOffset) && playerFuzzies[player.playerId].fuzzY > (.5 - middleYOffset)) {
            playerFuzzies[player.playerId].fuzzX = .5 * Math.random() * (1 - middleXOffset * 2);
            if (Math.random() < .5) {
                playerFuzzies[player.playerId].fuzzX = .5 + middleXOffset + playerFuzzies[player.playerId].fuzzX;
            }
        } else {
            playerFuzzies[player.playerId].fuzzX = Math.random();
        }
    }
}

function drawMostVotesPanels(resetPanels) {
    if (resetPanels) {
        resetMaxVotesPanels();
    }

    var mostVotesPanelElements = document.getElementsByClassName("mostVotesPanel");

    if (currentGameState.turnType !== "OpenPanel" &&
        currentGameState.turnType !== "OpenFreePanel") {
        for (var mostVotesPanelElement of mostVotesPanelElements) {
            mostVotesPanelElement.classList.add("opacity0");
        }
        return;
    }

    var panelVotes = {};
    for (var i = 1; i <= across * down; i++) {
        panelVotes[i + ""] = 0;
    }

    for (const playerId in playerSelectedPanels) {
        if (playerSelectedPanels[playerId].teamNumber !== currentGameState.teamTurn) {
            continue;
        }
        playerSelectedPanels[playerId].selectedPanels.forEach(panel => {
            panelVotes[panel]++;
        });
    }

    var mostVotes = 0;
    var mostVotesPanels = [];

    for (const panel in panelVotes) {
        var panelElement = document.getElementById("panel_" + panel);
        if (panelElement.classList.contains("panelOpen")) {
            continue;
        }

        if (panelVotes[panel] > mostVotes) {
            mostVotes = panelVotes[panel];
            mostVotesPanels = [panel];
        } else if (panelVotes[panel] === mostVotes) {
            mostVotesPanels.push(panel);
        }
    }

    if (mostVotes === 0 || mostVotesPanels.length > maxMostVotesPanels) {
        for (var mostVotesPanelElement of mostVotesPanelElements) {
            mostVotesPanelElement.classList.add("opacity0");
        }
    } else {
        for (var i = 0; i < maxMostVotesPanels; i++) {
            if (mostVotesPanels.length > i) {
                var panelElement = document.getElementById("panel_" + mostVotesPanels[i]);
                var panelElementRect = panelElement.getBoundingClientRect();
                mostVotesPanelElements[i].classList.remove("opacity0");
                mostVotesPanelElements[i].style.transform = "translate(" + panelElementRect.x + "px," + panelElementRect.y + "px)";
                mostVotesPanelElements[i].style.width = panelElementRect.width + "px";
                mostVotesPanelElements[i].style.height = panelElementRect.height + "px";
            } else {
                mostVotesPanelElements[i].classList.add("opacity0");
            }
        }
    }
}

function drawWelcome(gameState) {
    stopWelcomeAnimation();

    if (gameState.turnType === "Welcome") {
        document.getElementById("welcomeJoinGame").classList.remove("hidden");
        document.getElementById("teamOnePlayerNames").classList.add("welcomePlayerNames");
        document.getElementById("teamTwoPlayerNames").classList.add("welcomePlayerNames");
        document.getElementById("welcomeGameStateId").innerHTML = gameState.gameStateId;
    } else {
        document.getElementById("welcomeJoinGame").classList.add("hidden");
        document.getElementById("teamOnePlayerNames").classList.remove("welcomePlayerNames");
        document.getElementById("teamTwoPlayerNames").classList.remove("welcomePlayerNames");
    }
}

async function drawEndGameAsync(gameState) {
    var endGameContainer = document.getElementById("endGameContainer");
    var endGameWinner = document.getElementById("endGameWinner");

    if (gameState.turnType !== "EndGame") {
        endGameWinner.innerHTML = "";
        return;
    }

    if (endGameWinner.innerHTML) {
        return;
    }

    if (gameState.teamOneScore > gameState.teamTwoScore) {
        endGameWinner.innerHTML = gameState.teamOneName + " wins!";
    } else if (gameState.teamOneScore < gameState.teamTwoScore) {
        endGameWinner.innerHTML = gameState.teamTwoName + " wins!";
    } else {
        if (gameState.teamOneIncorrectGuesses > gameState.teamTwoIncorrectGuesses) {
            endGameWinner.innerHTML = gameState.teamTwoName + " wins!";
        } else if (gameState.teamOneIncorrectGuesses < gameState.teamTwoIncorrectGuesses) {
            endGameWinner.innerHTML = gameState.teamOneName + " wins!";
        } else {
            endGameWinner.innerHTML = "It's a tie game!";
        }
    }

    var imagePromises = [];

    if (gameState.turnType === "EndGame") {
        document.getElementById("panels").classList.add("hidden");

        endGameContainer.classList.remove("hidden");

        var gameRounds = await this.getGameRoundsAsync(gameState.gameStateId);

        var endGameRoundsElement = document.getElementById("endGameRounds");

        for (var gameRound of gameRounds) {
            var gameRoundElement = document.createElement("div");
            gameRoundElement.classList = "animate__hidden gameRound";

            var gameRoundScoreContainer = document.createElement("div");
            gameRoundScoreContainer.classList = "gameRoundScoreContainer";
            if (gameRound.teamOneScore != 0) {
                var teamOneScoreElement = document.createElement("div");
                teamOneScoreElement.classList = "gameRoundScore teamOneBox";
                teamOneScoreElement.innerHTML = gameRound.teamOneScore;
                gameRoundScoreContainer.appendChild(teamOneScoreElement);
            }

            if (gameRound.teamTwoScore != 0) {
                var teamTwoScoreElement = document.createElement("div");
                teamTwoScoreElement.classList = "gameRoundScore teamTwoBox";
                teamTwoScoreElement.innerHTML = gameRound.teamTwoScore;
                gameRoundScoreContainer.appendChild(teamTwoScoreElement);
            }

            if (gameRound.teamOneScore == 0 && gameRound.teamTwoScore == 0) {
                var teamZeroScoreElement = document.createElement("div");
                teamZeroScoreElement.classList = "gameRoundScore gameRoundScoreZero teamOneBox";
                teamZeroScoreElement.innerHTML = "0";
                gameRoundScoreContainer.appendChild(teamZeroScoreElement);
            }

            var thumbnail = document.createElement("img");
            thumbnail.classList = "thumbnail";
            imagePromises.push(loadImageAsync(thumbnail, "api/images/thumbnails/" + gameState.gameStateId + "/" + gameRound.roundNumber));

            if (gameRound.roundNumber <= 5) {
                gameRoundElement.appendChild(gameRoundScoreContainer);
                gameRoundElement.appendChild(thumbnail);
            } else {
                gameRoundElement.appendChild(thumbnail);
                gameRoundElement.appendChild(gameRoundScoreContainer);
            }

            endGameRoundsElement.appendChild(gameRoundElement);
        }

        await Promise.all(imagePromises);

        var delay = 0;
        for (var endGameRound of endGameRoundsElement.children) {
            animateCSS(endGameRound, ["fadeInDown", "slow"], ["hidden"], delay);
            delay += 100;
        }

        animateCSS(endGameWinner, ["fadeInDown", "slow"], ["hidden"]);
        
    } else {
        document.getElementById("panels").classList.remove("hidden");
        endGameContainer.classList.add("hidden");
    }
}

function playEndGameSounds(gameState, updateType) {
    if (updateType !== "NewRound" || gameState.turnType !== "EndGame") {
        return;
    }

    playRandomSound(endGameSounds);
}

function playTurnStartSounds(gameState, updateType) {
    if (gameState.turnType === "OpenPanel" && (updateType === "NewTurn" || updateType === "NewRound")) {
        playRandomSound(turnStartSounds);
    }
}

function drawTeamStatus(gameState) {
    var teamStatus = document.getElementById("teamStatus");
    var teamOneCountdownCanvas = document.getElementById("teamOneCountdownCanvas");
    var teamTwoCountdownCanvas = document.getElementById("teamTwoCountdownCanvas");

    if (gameState.teamTurn === 1) {
        activeTeamCountdownCanvas = document.getElementById("teamOneCountdownCanvas");
        passiveTeamCountdownCanvas = document.getElementById("teamTwoCountdownCanvas");
    } else {
        passiveTeamCountdownCanvas = document.getElementById("teamOneCountdownCanvas");
        activeTeamCountdownCanvas = document.getElementById("teamTwoCountdownCanvas");
    }

    if (gameState.turnType === "EndGame") {
        document.getElementById("teamOneDiv").classList.remove("activeTeam");
        document.getElementById("teamTwoDiv").classList.remove("activeTeam");
    } else if (gameState.teamTurn === 1) {
        document.getElementById("teamOneDiv").classList.add("activeTeam");
        document.getElementById("teamTwoDiv").classList.remove("activeTeam");
    } else {
        document.getElementById("teamOneDiv").classList.remove("activeTeam");
        document.getElementById("teamTwoDiv").classList.add("activeTeam");
    }

    switch (gameState.turnType) {
        case "OpenPanel":
            if (gameState.teamTurn === 1) {
                teamStatus.innerHTML = "&larr; Open a Panel";
            } else {
                teamStatus.innerHTML = "Open a Panel &rarr;";
            }

            updateCountdown(activeTeamCountdownCanvas, gameState);
            stopCountdown(passiveTeamCountdownCanvas);

            break;
        case "MakeGuess":
            teamStatus.innerHTML = "Guess or Pass";

            if (gameState.teamOneGuessStatus) {
                stopCountdown(teamOneCountdownCanvas);
            } else {
                updateCountdown(teamOneCountdownCanvas, gameState);
            }
            if (gameState.teamTwoGuessStatus) {
                stopCountdown(teamTwoCountdownCanvas);
            } else {
                updateCountdown(teamTwoCountdownCanvas, gameState);
            }

            break;
        case "GuessesMade":
            teamStatus.innerHTML = "Who was right?";
            stopCountdown(activeTeamCountdownCanvas);
            stopCountdown(passiveTeamCountdownCanvas);
            break;
        case "EndRound":
            teamStatus.innerHTML = "Round " + gameState.roundNumber + " Complete";
            stopCountdown(activeTeamCountdownCanvas);
            stopCountdown(passiveTeamCountdownCanvas);
            break;
        case "EndGame":
            if (gameState.teamOneScore != gameState.teamTwoScore) {
                teamStatus.innerHTML = "Congratulations";
            } else {
                teamStatus.innerHTML = ""
            }
            stopCountdown(activeTeamCountdownCanvas);
            stopCountdown(passiveTeamCountdownCanvas);
            break;
    }
}

function drawTeamGuesses(gameState) {
    var teamOneGuessContainer = document.getElementById("teamOneGuessContainer");
    var teamTwoGuessContainer = document.getElementById("teamTwoGuessContainer");

    if (gameState.teamOneGuessStatus) {
        animateCSS(teamOneGuessContainer, ["slow", "bounceInDown"], ["bounceOutUp", "hidden"]);
    }

    if (gameState.teamTwoGuessStatus) {
        animateCSS(teamTwoGuessContainer, ["slow", "bounceInDown"], ["bounceOutUp", "hidden"]);
    }

    if (gameState.turnType === "GuessesMade") {
        animationPromise = animationPromise.then(() => animateCSS(teamTwoGuessContainer, ["slow", "bounceInDown"], ["bounceOutUp", "hidden"], 2000));
        animationPromise = animationPromise.then(() => animateCSS(teamTwoGuessContainer, ["slow", "bounceInDown"], ["bounceOutUp", "hidden"]));

        var teamOneGuess = "\"" + gameState.teamOneGuess + "\"";
        if (gameState.teamOneGuessStatus !== "Guess") {
            teamOneGuess = "(team passed)";
        }

        var teamTwoGuess = "\"" + gameState.teamTwoGuess + "\"";
        if (gameState.teamTwoGuessStatus !== "Guess") {
            teamTwoGuess = "(team passed)";
        }

        animationPromise = animationPromise.then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    document.getElementById("teamOneGuessText").innerHTML = teamOneGuess;
                    document.getElementById("teamTwoGuessText").innerHTML = teamTwoGuess;

                    document.getElementById("teamOneGuessReady").classList.add("opacity0");
                    document.getElementById("teamTwoGuessReady").classList.add("opacity0");
                    document.getElementById("teamOneGuessText").classList.remove("opacity0");
                    document.getElementById("teamTwoGuessText").classList.remove("opacity0");
                    resolve();
                }, 3000);
            });
        });
        
        if (teamOneGuess.length > 20) {
            teamOneGuessContainer.classList.add("teamGuessLong");
        } else {
            teamOneGuessContainer.classList.remove("teamGuessLong");
        }

        if (teamTwoGuess.length > 20) {
            teamTwoGuessContainer.classList.add("teamGuessLong");
        } else {
            teamTwoGuessContainer.classList.remove("teamGuessLong");
        }
        
    } else if (gameState.turnType !== "MakeGuess") {
        animateCSS(teamOneGuessContainer, ["bounceOutUp"], ["slow", "bounceInDown", "tada", "repeat-2"]);
        animateCSS(teamTwoGuessContainer, ["bounceOutUp"], ["slow", "bounceInDown", "tada", "repeat-2"]);
        setTimeout(() => {
            document.getElementById("teamOneGuessReady").classList.remove("opacity0");
            document.getElementById("teamTwoGuessReady").classList.remove("opacity0");
            document.getElementById("teamOneGuessText").classList.add("opacity0");
            document.getElementById("teamTwoGuessText").classList.add("opacity0");
            document.getElementById("teamOneGuessText").innerHTML = "(team passed)";
            document.getElementById("teamTwoGuessText").innerHTML = "(team passed)";
            teamOneGuessContainer.classList.remove("teamGuessIncorrect");
            teamTwoGuessContainer.classList.remove("teamGuessIncorrect");
        }, 1000);
    }
}

function drawTeamGuessHighlights(gameState) {
    if (gameState.turnType !== "GuessesMade") {
        return;
    }

    var teamOneGuessContainer = document.getElementById("teamOneGuessContainer");
    var teamTwoGuessContainer = document.getElementById("teamTwoGuessContainer");

    if (gameState.teamOneCorrect) {
        animationPromise = animationPromise.then(() => animateCSS(teamOneGuessContainer, ["tada", "repeat-2"], ["slow", "bounceInDown"]));
    } else if (gameState.teamOneGuessStatus === "Guess" && !gameState.teamOneCorrect) {
        animationPromise = animationPromise.then(() => {
            teamOneGuessContainer.classList.add("teamGuessIncorrect");
            return Promise.resolve();
        });
    }

    if (gameState.teamTwoCorrect) {
        animationPromise = animationPromise.then(() => animateCSS(teamTwoGuessContainer, ["tada", "repeat-2"], ["slow", "bounceInDown"]));
    } else if (gameState.teamTwoGuessStatus === "Guess" && !gameState.teamTwoCorrect) {
        animationPromise = animationPromise.then(() => {
            teamTwoGuessContainer.classList.add("teamGuessIncorrect");
            return Promise.resolve();
        });
    }
}

async function drawTeamScoreChangeAsync(gameState) {
    var teamOneScoreTextElement = document.getElementById("teamOneScoreText");
    var teamTwoScoreTextElement = document.getElementById("teamTwoScoreText");
    var teamOneScoreChangeElement = document.getElementById("teamOneScoreChange");
    var teamTwoScoreChangeElement = document.getElementById("teamTwoScoreChange");

    if (gameState.turnType === "GuessesMade") {
        var scoreChange = await getScoreChangeAsync(gameState.gameStateId);

        if (scoreChange.teamOne && scoreChange.teamTwo) {
            animationPromise = animationPromise.then(() => animateCSS(teamOneScoreChangeElement, ["slow", "bounceInDown"], ["bounceOutUp"], 3000));
            animationPromise = animationPromise.then(() => animateCSS(teamTwoScoreChangeElement, ["slow", "bounceInDown"], ["bounceOutUp"]));
            delay = 0;
        } else if (scoreChange.teamOne) {
            animationPromise = animationPromise.then(() => animateCSS(teamOneScoreChangeElement, ["slow", "bounceInDown"], ["bounceOutUp"], 3000));
        } else if (scoreChange.teamTwo) {
            animationPromise = animationPromise.then(() => animateCSS(teamTwoScoreChangeElement, ["slow", "bounceInDown"], ["bounceOutUp"], 3000));
        }

        animationPromise = animationPromise.then(async () => {
            drawTeamScoreChangeText(scoreChange);
            return Promise.resolve();
        });

        animationPromise = animationPromise.then(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    teamOneScoreTextElement.innerHTML = gameState.teamOneScore;
                    teamTwoScoreTextElement.innerHTML = gameState.teamTwoScore;
                    resolve();
                }, 2000);
            });
        });

    } else {
        teamOneScoreTextElement.innerHTML = gameState.teamOneScore;
        teamTwoScoreTextElement.innerHTML = gameState.teamTwoScore;

        animateCSS(teamOneScoreChangeElement, ["bounceOutUp"], ["slow", "bounceInDown"]);
        animateCSS(teamTwoScoreChangeElement, ["bounceOutUp"], ["slow", "bounceInDown"]);
    }

    if (!teamOneScoreTextElement.innerHTML) {
        teamOneScoreTextElement.innerHTML = gameState.teamOneScore;
        teamTwoScoreTextElement.innerHTML = gameState.teamTwoScore;
    }
}

function drawTeamScoreChangeText(scoreChange) {
    var teamOneScoreChangeElement = document.getElementById("teamOneScoreChange");
    var teamTwoScoreChangeElement = document.getElementById("teamTwoScoreChange");

    if (scoreChange.teamOne > 0) {
        teamOneScoreChangeElement.innerHTML = "+" + scoreChange.teamOne;
    } else if (scoreChange.teamOne < 0) {
        teamOneScoreChangeElement.innerHTML = scoreChange.teamOne;
    } else {
        teamOneScoreChangeElement.innerHTML = "";
    }

    if (scoreChange.teamTwo > 0) {
        teamTwoScoreChangeElement.innerHTML = "+" + scoreChange.teamTwo;
    } else if (scoreChange.teamTwo < 0) {
        teamTwoScoreChangeElement.innerHTML = scoreChange.teamTwo;
    } else {
        teamTwoScoreChangeElement.innerHTML = "";
    }
}

function isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

function setupCanvases() {
    var canvases = document.getElementsByClassName("countdownCanvas");

    for (var canvas of canvases) {
        canvas.style = "";
        var ctx = canvas.getContext("2d");
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        var canvasSize = Math.floor(canvas.clientHeight);
        canvas.style.height = canvasSize + "px";
        canvas.style.width = canvasSize + "px";
        canvas.height = canvasSize * window.devicePixelRatio;
        canvas.width = canvasSize * window.devicePixelRatio;
        
        var circlePosition = Math.floor(canvasSize / 2) * window.devicePixelRatio;

        ctx.translate(circlePosition, circlePosition); // First translate the context to the center you wish to rotate around.
        ctx.rotate(1.5 * Math.PI); // Then do the actual rotation.
        ctx.translate(-circlePosition, -circlePosition); // Then translate the context back.
    }
}

var framerate = 30;

function updateCountdown(canvas, gameState) {
    canvas.currentCountdown = new Date(gameState.turnEndTime) - new Date();
    canvas.countdownMax = new Date(gameState.turnEndTime) - new Date(gameState.turnStartTime);

    if (canvas.countdownMax <= 0) {
        return;
    }

    clearInterval(canvas.countdownInterval);

    if (gameState.pauseState === "Paused") {
        canvas.currentCountdown = gameState.pauseTurnRemainingTime * 1000;
        drawCountdown(canvas);
        return;
    }

    canvas.countdownInterval = setInterval(function () {
        if (canvas.currentCountdown <= 0) {
            clearInterval(canvas.countdownInterval);
        } else {
            canvas.currentCountdown = new Date(gameState.turnEndTime) - new Date();
        }

        drawCountdown(canvas);

    }, 1000 / framerate);
}

function stopCountdown(canvas) {
    canvas.currentCountdown = 0;
}

function drawCountdown(canvas) {
    var ctx = canvas.getContext("2d");

    var scale = .55;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (canvas.currentCountdown <= 0) {
        return;
    }

    var circleSize = canvas.height / 2 * scale;
    var circlePosition = canvas.height / 2;
    var strokeWidth = canvas.height / 2 * scale;

    ctx.beginPath();
    ctx.arc(circlePosition, circlePosition, circleSize, 0, (Math.min(canvas.currentCountdown, canvas.countdownMax) / canvas.countdownMax) * 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
}

var remainingTurnTimeInterval;
var remainingSeconds;
function drawRemainingTurnTime(gameState) {
    if (gameState.turnEndTime && ((gameState.turnType === "GuessesMade" && (gameState.teamOneCorrect || gameState.teamTwoCorrect)) ||
        gameState.turnType === "Welcome" ||
        gameState.turnType === "EndRound")) {

        if (gameState.turnType === "Welcome") {
            document.getElementById("remainingTurnTimeText").innerHTML = "Game starts in";
        } else {
            if (gameState.roundNumber === gameState.finalRoundNumber) {
                document.getElementById("remainingTurnTimeText").innerHTML = "Game ends in";
            } else {
                document.getElementById("remainingTurnTimeText").innerHTML = "Next round starts in";
            }
        }

        remainingSeconds = (new Date(gameState.turnEndTime) - new Date()) / 1000;
        remainingTurnTimeInterval = setInterval(function () {
            if (remainingSeconds >= 0 && remainingSeconds <= 10) {
                document.getElementById("remainingTurnTimeTextSeconds").innerHTML = Math.max(0, Math.floor(remainingSeconds)) + "...";
                animateCSS("#remainingTurnTime", ["slow", "bounceInRight"], ["bounceOutRight", "hidden"]);
                if (remainingSeconds >= 1 && remainingSeconds <= 5) {
                    playRandomSound(countdownSounds);
                }
            }
            remainingSeconds = (new Date(gameState.turnEndTime) - new Date()) / 1000;
        }, 1000);
    } else {
        remainingSeconds = -1;
        clearInterval(remainingTurnTimeInterval);
        animateCSS("#remainingTurnTime", ["bounceOutRight"], ["slow", "bounceInRight"], 500);
    }
}

function setClassStyle(className, styleFunc) {
    for (var i = 0; i < document.styleSheets.length; i++) {
        if (document.styleSheets[i].href.endsWith("gameboard.css")) {
            var cssRules = document.styleSheets[i].cssRules;
            for (var j = 0; j < cssRules.length; j++) {
                if (cssRules[j].selectorText === className) {
                    styleFunc(cssRules[j]);
                }
            }
        }
    }
}

function hideMostVotesPanels() {
    setClassStyle(".mostVotesPanel", (element) => {
        element.style.opacity = 0;
    });
}

function hidePlayerDots(panelNumber) {
    if (panelNumber) {
        var playerDotDivs = document.getElementsByClassName("playerDot_panelNumber_" + panelNumber);
        for (var playerDotDiv of playerDotDivs) {
            playerDotDiv.classList.add("opacity0");
        }
    } else {
        setClassStyle(".playerDot", (element) => {
            element.style.opacity = 0;
        });
    }
}

function drawPlayerDots(player) {
    var panels = document.getElementsByClassName("panel");

    for (var i = 1; i <= across * down; i++) {
        var playerDotDiv = document.getElementById("playerDot_" + player.playerId + "_" + i);
        if (playerDotDiv) {
            drawPlayerDot(panels, playerDotDiv, currentGameState);
        }
    }
}

function drawAllPlayerDots(gameState, resetDots) {
    if (resetDots) {
        resetPlayerDots();
    }

    var playerDotDivs = document.getElementsByClassName("playerDot");
    var panels = document.getElementsByClassName("panel");

    for (var playerDotDiv of playerDotDivs) {
        drawPlayerDot(panels, playerDotDiv, gameState);
    }
}

function drawPlayerDot(panels, playerDotDiv, gameState) {
    if (playerSelectedPanels[playerDotDiv.player.playerId] &&
        playerSelectedPanels[playerDotDiv.player.playerId].selectedPanels.includes(playerDotDiv.panelNumber + "") &&
        playerDotDiv.player.teamNumber === currentGameState.teamTurn &&
        !panels[playerDotDiv.panelNumber - 1].classList.contains("panelOpen") &&
        (gameState.turnType === "OpenPanel" ||  gameState.turnType === "OpenFreePanel")) {
        movePlayerDotToPanel(playerDotDiv);
    } else {
        movePlayerDotToPlayer(playerDotDiv);
    }
}

function updatePlayerDots(player) {
    for (var i = 1; i <= across * down; i++) {
        var playerDotDiv = document.getElementById("playerDot_" + player.playerId + "_" + i);
        if (!playerDotDiv) {
            playerDotDiv = createPlayerDot(player, i);
        }

        playerDotDiv.style.fill = player.color;
        playerDotDiv.player = player;

        if (player.name) {
            var spaceIndex = player.name.trim().indexOf(" ");
            if (spaceIndex > 0) {
                document.getElementById("playerDotInitials_" + player.playerId + "_" + i).innerHTML = player.name.charAt(0) + player.name.charAt(spaceIndex + 1);
            } else {
                document.getElementById("playerDotInitials_" + player.playerId + "_" + i).innerHTML = player.name.substring(0, 2);
            }
        }
    }
}

function createPlayerDot(player, panelNumber) {
    var playerElement = document.getElementById("player_" + player.playerId);
    playerElementRect = playerElement.getBoundingClientRect();

    var scale = 1.1;
    var circleSize = Math.ceil(playerElementRect.height * scale);

    var playerDotDiv = document.createElement("div");
    playerDotDiv.id = "playerDot_" + player.playerId + "_" + panelNumber;
    playerDotDiv.player = player;
    playerDotDiv.panelNumber = panelNumber;
    playerDotDiv.style.width = circleSize + "px";
    playerDotDiv.style.height = circleSize + "px";

    playerDotDiv.classList.add("playerDot_panelNumber_" + panelNumber);
    playerDotDiv.classList.add("playerDot");
    playerDotDiv.classList.add("opacity0");
    playerDotDiv.classList.add("playerDot_" + player.playerId);
    document.body.appendChild(playerDotDiv);

    var playerDotSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var playerDotInitials = document.createElement("div");
    playerDotInitials.id = "playerDotInitials_" + player.playerId + "_" + panelNumber;

    var playerDotCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    playerDotCircle.setAttribute("r", Math.max(1, circleSize / 2 - 2));
    playerDotCircle.setAttribute("cx", circleSize / 2);
    playerDotCircle.setAttribute("cy", circleSize / 2);
    playerDotCircle.setAttribute("stroke", "black");
    playerDotCircle.setAttribute("stroke-width", 2);

    playerDotSvg.appendChild(playerDotCircle);
    playerDotDiv.appendChild(playerDotSvg);
    playerDotDiv.appendChild(playerDotInitials);

    var zindex = Math.ceil(Math.random() * 500) + 100;
    playerDotDiv.style.zIndex = zindex;

    return playerDotDiv;
}

function random(lower, upper) {
    return Math.floor((Math.random() * (upper - lower)) + lower);
}

function resetPlayerDots() {
    var playerDotDivs = document.getElementsByClassName("playerDot");

    for (var playerDotDiv of playerDotDivs) {
        playerDotDiv.player.selectedPanels = [];
        playerDotDiv.classList.add("opacity0");
        movePlayerDotToPlayer(playerDotDiv);
    }

    setClassStyle(".playerDot", (element) => {
        element.style.removeProperty("opacity");
    });
}

function movePlayerDotToPlayer(playerDotDiv) {
    var playerElement = document.getElementById("player_" + playerDotDiv.player.playerId);
    if (!playerElement) {
        playerDotDiv.remove();
        return;
    }
    var playerElementRect = playerElement.getBoundingClientRect();

    playerDotDiv.style.transform = "translate(" + playerElementRect.x + "px," + playerElementRect.y + "px)";
    playerDotDiv.style.zIndex = Math.ceil(Math.random() * 500) + 100;
    playerDotDiv.classList.add("opacity0");
}

function movePlayerDotToPanel(playerDotDiv) {
    var playerDotDiv = document.getElementById("playerDot_" + playerDotDiv.player.playerId + "_" + playerDotDiv.panelNumber);

    var panelRect = document.getElementById("panel_" + playerDotDiv.panelNumber).getBoundingClientRect();
    var playerDotDivRect = playerDotDiv.getBoundingClientRect();

    var x = (panelRect.right - panelRect.left - playerDotDivRect.width) * Math.abs(playerFuzzies[playerDotDiv.player.playerId].fuzzX) + panelRect.left;
    var y = (panelRect.bottom - panelRect.top - playerDotDivRect.height) * Math.abs(playerFuzzies[playerDotDiv.player.playerId].fuzzY) + panelRect.top;
    
    playerDotDiv.style.transform = "translate(" + x + "px," + y + "px)";
    playerDotDiv.classList.remove("opacity0");
}

function resetMaxVotesPanels() {
    playerSelectedPanels = {};

    setClassStyle(".mostVotesPanel", (element) => {
        element.style.removeProperty("opacity");
    });
}

async function loadAllPanelImagesAsync() {
    var panels = document.getElementsByClassName("panel");

    var panelsArray = [];
    for (var panel of panels) {
        panelsArray.push(panel);
    }
    shuffle(panelsArray);

    var loadPromises = [];
    panelsArray.forEach(function (panel) {
        loadPromises.push(loadImageAsync(panel.lastChild, "/api/images/panels/" + currentGameState.gameStateId + "/" + currentGameState.roundNumber + "/" + panel.panelNumber));
    });

    await Promise.all(loadPromises);
}

async function openAllPanelsAsync() {
    hidePlayerDots();
    hideMostVotesPanels();

    await loadAllPanelImagesAsync();

    var delayTimeout = 0;

    var panels = document.getElementsByClassName("panel");

    var panelsArray = [];
    for (var panel of panels) {
        panelsArray.push(panel);
    }
    shuffle(panelsArray);

    panelsArray.forEach(function (panel) {
        if (!panel.classList.contains("panelOpen")) {
            setTimeout(function () {
                openPanel(panel);
            }, delayTimeout);
            delayTimeout += 150;
        }
    });
}

var allPlayers = [];

function drawGameStateId(gameState) {
    if (gameState.revealedPanels.length === 0 && gameState.turnType === "OpenPanel") {
        document.getElementById("gameStateIdDisplayText").innerHTML = "Join the game!&nbsp;&nbsp;&nbsp;picturepanels.net&nbsp;&nbsp;&nbsp;" + gameState.gameStateId;
    } else {
        document.getElementById("gameStateIdDisplayText").innerHTML = gameState.gameStateId;
    }

    if (gameState.turnType !== "Welcome" && gameState.turnType !== "EndGame") {
        animateCSS("#gameStateIdDisplay", ["bounceInLeft", "slow"], ["bounceOutLeft", "hidden"]);
    } else {
        animateCSS("#gameStateIdDisplay", ["bounceOutLeft"], ["bounceInLeft", "slow"]);
    }
}

function drawRoundNumber(gameState) {
    if (gameState.turnType === "Welcome" || gameState.turnType === "EndGame") {
        document.getElementById("roundNumberCorner").classList.add("hidden");
    } else {
        document.getElementById("roundNumberCorner").classList.remove("hidden");
    }

    if (gameState.revealedPanels.length === 0 && gameState.turnType === "OpenPanel") {
        document.getElementById("roundNumberAnimateText").innerHTML = "Round " + gameState.roundNumber;

        var roundNumberPromise = Promise.resolve();
        roundNumberPromise = roundNumberPromise.then(() => animateCSS("#roundNumberAnimate", ["backInLeft"], ["backOutRight", "hidden"], 3000));
        roundNumberPromise = roundNumberPromise.then(() => animateCSS("#roundNumberAnimate", ["backOutRight"], ["backInLeft"], 4000));
    }
}

async function drawImageEntityAsync(gameState, updateType) {
    if (gameState.turnType === "Welcome" || gameState.turnType === "EndGame") {
        animateCSS("#uploadedBy", ["bounceOutRight"], ["slow", "bounceInRight"]);
        animateCSS("#answerTitle", ["bounceOutUp"], ["slow", "bounceInDown"]);
        return;
    }

    if (updateType !== "FirstLoad" && updateType !== "NewRound" &&
        gameState.turnType !== "EndRound" &&
        !gameState.teamOneCorrect && !gameState.teamTwoCorrect) {
        return;
    }

    var imageEntity = await getImageEntityAsync(gameState.gameStateId);

    if (imageEntity && imageEntity.uploadedBy) {
        document.getElementById("uploadedByText").innerHTML = "Uploaded by: " + imageEntity.uploadedBy;
        animateCSS("#uploadedBy", ["slow", "bounceInRight"], ["bounceOutRight", "hidden"]);
    } else {
        animateCSS("#uploadedBy", ["bounceOutRight"], ["slow", "bounceInRight"]);
    }

    if (imageEntity && imageEntity.name) {
        document.getElementById("answerTitleText").innerHTML = imageEntity.name;
        animationPromise = animationPromise.then(() => animateCSS("#answerTitle", ["slow", "bounceInDown"], ["bounceOutUp", "hidden"], 2000));
    } else {
        animateCSS("#answerTitle", ["bounceOutUp"], ["slow", "bounceInDown"]);
    }
}

async function drawRevealedPanelsAsync(gameState) {
    if (gameState.turnType === "EndGame") {
        return;
    }

    if (gameState.turnType === "EndRound") {
        return openAllPanelsAsync();
    }

    if (gameState.turnType === "GuessesMade") {
        if (gameState.teamOneCorrect || gameState.teamTwoCorrect) {
            loadAllPanelImagesAsync();

            animationPromise = animationPromise.then(() => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        openAllPanelsAsync().then(() => resolve());
                    }, 5000);
                })
            });

            return;
        } else {
            // always wait to show if the guesses were wrong
            animationPromise = animationPromise.then(() => {
                return new Promise((resolve) => {
                    setTimeout(resolve, 5000);
                })
            });
        }
    }

    var loadImagePromises = [];
    var panels = document.getElementsByClassName("panel");
    for (var panel of panels) {
        var panelImage = panel.lastChild;

        if (gameState.revealedPanels.includes(panel.panelNumber)) {
            loadImagePromises.push(loadImageAsync(panelImage, "/api/images/panels/" + gameState.gameStateId + "/" + gameState.roundNumber + "/" + panel.panelNumber).then((panelImageLoaded) => {
                openPanel(panelImageLoaded.parentElement);
            }));

            hidePlayerDots(panel.panelNumber);
        } else {
            panel.classList.remove("panelOpen");
            panelImage.src = "/api/images/panels/" + gameState.gameStateId + "/" + gameState.roundNumber + "/0";
        }
    }

    await Promise.all(loadImagePromises);
}

function playOpenPanelSounds(gameState, updateType) {
    if (updateType !== "NewTurn" && updateType !== "NewRound") {
        return;
    }

    if (gameState.turnType === "MakeGuess") {
        playRandomSound(openPanelSounds);
    }
}

function playTeamReadySounds(gameState, updateType) {
    if (gameState.turnType !== "MakeGuess" && gameState.turnType !== "GuessesMade") {
        return;
    }

    if ((updateType === "TeamReady" || updateType === "NewTurn") &&
        (gameState.teamOneGuessStatus || gameState.teamTwoGuessStatus)) {
        playRandomSound(teamReadySounds);
    }
}

function playGuessesMadeSounds(gameState, updateType) {
    if (gameState.turnType !== "GuessesMade" || updateType !== "NewTurn") {
        return;
    }

    if (gameState.teamOneCorrect || gameState.teamTwoCorrect) {
        animationPromise = animationPromise.then(() => {
            playRandomSound(correctSounds);
            return Promise.resolve();
        });
    } else if (gameState.teamOneGuessStatus === "Guess" || gameState.teamTwoGuessStatus === "Guess") {
        animationPromise = animationPromise.then(() => {
            playRandomSound(incorrectSounds);
            return Promise.resolve();
        });
    }
}

function drawIncorrectGuesses(gameState) {
    var incorrectGuessesFunction = () => {
        if (gameState.teamOneIncorrectGuesses <= 3) {
            document.getElementById("teamOneIncorrectGuessesDiv").innerHTML = "&olcross;".repeat(gameState.teamOneIncorrectGuesses);
        } else {
            document.getElementById("teamOneIncorrectGuessesDiv").innerHTML = gameState.teamOneIncorrectGuesses + " &olcross;";
        }
        if (gameState.teamTwoIncorrectGuesses <= 3) {
            document.getElementById("teamTwoIncorrectGuessesDiv").innerHTML = "&olcross;".repeat(gameState.teamTwoIncorrectGuesses);
        } else {
            document.getElementById("teamTwoIncorrectGuessesDiv").innerHTML = gameState.teamTwoIncorrectGuesses + " &olcross;";
        }
        return Promise.resolve();
    };

    animationPromise = animationPromise.then(incorrectGuessesFunction);
}

function drawPanelCounts(gameState) {
    var teamOneInnerPanelsCountDiv = document.getElementById("teamOneInnerPanelsCount");
    var teamTwoInnerPanelsCountDiv = document.getElementById("teamTwoInnerPanelsCount");

    if (gameState.teamOneInnerPanels <= 0) {
        teamOneInnerPanelsCountDiv.innerHTML = "";

        panelElement = document.createElement("div");
        panelElement.className = "animate__animated animate__slow panelCount teamOneBox";
        teamOneInnerPanelsCountDiv.appendChild(panelElement);
        panelElement.addEventListener('animationend', () => {
            teamOneInnerPanelsCountDiv.lastChild.remove();
        });

        var negativeElement = document.createElement("div");
        negativeElement.className = "negativePanelCount";
        negativeElement.innerHTML = "&#x2794; -2";
        teamOneInnerPanelsCountDiv.appendChild(negativeElement);

    } else {
        for (var element of teamOneInnerPanelsCountDiv.children) {
            if (element.classList.contains("negativePanelCount")) {
                element.remove();
            }
        }

        var children = teamOneInnerPanelsCountDiv.children;
        for (var i = 0; i < Math.max(gameState.teamOneInnerPanels, teamOneInnerPanelsCountDiv.children.length); i++) {
            if (teamOneInnerPanelsCountDiv.children.length < gameState.teamOneInnerPanels && i < gameState.teamOneInnerPanels) {
                var panelElement = document.createElement("div");
                panelElement.className = "animate__animated animate__slow panelCount teamOneBox";
                teamOneInnerPanelsCountDiv.appendChild(panelElement);
                panelElement.addEventListener('animationend', () => {
                    teamOneInnerPanelsCountDiv.lastChild.remove();
                });
            } else if (teamOneInnerPanelsCountDiv.children.length > gameState.teamOneInnerPanels && i >= gameState.teamOneInnerPanels) {
                children[i].classList.add("animate__rollOut");
            }
        }
    }

    if (gameState.teamTwoInnerPanels <= 0) {
        teamTwoInnerPanelsCountDiv.innerHTML = "";

        panelElement = document.createElement("div");
        panelElement.className = "animate__animated animate__slow panelCount teamTwoBox";
        teamTwoInnerPanelsCountDiv.appendChild(panelElement);
        panelElement.addEventListener('animationend', () => {
            teamTwoInnerPanelsCountDiv.lastChild.remove();
        });

        negativeElement = document.createElement("div");
        negativeElement.className = "negativePanelCount";
        negativeElement.innerHTML = "&#x2794; -2";
        teamTwoInnerPanelsCountDiv.appendChild(negativeElement);
    } else {
        for (var element of teamTwoInnerPanelsCountDiv.children) {
            if (element.classList.contains("negativePanelCount")) {
                element.remove();
            }
        }

        var children = teamTwoInnerPanelsCountDiv.children;
        for (var i = 0; i < Math.max(gameState.teamTwoInnerPanels, teamTwoInnerPanelsCountDiv.children.length); i++) {
            if (teamTwoInnerPanelsCountDiv.children.length < gameState.teamTwoInnerPanels && i < gameState.teamTwoInnerPanels) {
                var panelElement = document.createElement("div");
                panelElement.className = "animate__animated animate__slow panelCount teamTwoBox";
                teamTwoInnerPanelsCountDiv.appendChild(panelElement);
                panelElement.addEventListener('animationend', () => {
                    teamTwoInnerPanelsCountDiv.lastChild.remove();
                });
            } else if (teamTwoInnerPanelsCountDiv.children.length > gameState.teamTwoInnerPanels && i >= gameState.teamTwoInnerPanels) {
                children[i].classList.add("animate__rollOut");
            }
        }
    }
}

function drawPauseState(gameState) {
    if (gameState.pauseState === "Paused") {
        document.getElementById("pauseButton").classList.add("hidden");
        document.getElementById("resumeButton").classList.remove("hidden");
    } else if (gameState.turnType === "OpenPanel" && gameState.openPanelTime > 0) {
        document.getElementById("pauseButton").classList.remove("hidden");
        document.getElementById("resumeButton").classList.add("hidden");
    } else if (gameState.turnType === "MakeGuess" && gameState.guessTime > 0) {
        document.getElementById("pauseButton").classList.remove("hidden");
        document.getElementById("resumeButton").classList.add("hidden");
    } else {
        document.getElementById("pauseButton").classList.add("hidden");
        document.getElementById("resumeButton").classList.add("hidden");
    }
}

function setupWelcomeAnimationAsync() {
    var promises = [];
    var panels = document.getElementsByClassName("panel");

    for (var panel of panels) {
        panel.classList.remove("panelOpen");
        promises.push(loadImageAsync(panel.lastChild, "/api/images/panels/welcome/0/" + panel.panelNumber));
    }

    return Promise.all(promises);
}

var welcomeAnimationTimeout;
var previousRandomIndex = -1;
function drawWelcomeAnimation() {
    hidePlayerDots();
    hideMostVotesPanels();

    var panels = document.getElementsByClassName("panel");

    var panelsArray = [];
    for (var panel of panels) {
        panelsArray.push(panel);
    }

    do {
        var randomIndex = Math.floor(Math.random() * panelsArray.length);
    } while (randomIndex === previousRandomIndex)
    previousRandomIndex = randomIndex;

    togglePanel(panelsArray[randomIndex]);
}

function stopWelcomeAnimation() {
    clearInterval(welcomeAnimationTimeout);
    welcomeAnimationTimeout = null;
}

var animationPromise;

async function handleGameState(gameState, updateType) {
    currentGameState = gameState;

    loadThemeAsync(gameState, true);

    animationPromise = Promise.resolve();

    drawWelcome(gameState);
    await resetPanelsAsync(gameState, updateType);
    await drawEndGameAsync(gameState);
    playEndGameSounds(gameState, updateType);
    playTurnStartSounds(gameState, updateType);
    drawGameState(gameState);
    drawGameStateId(gameState);
    drawRoundNumber(gameState);
    drawTeamStatus(gameState);
    drawTeamGuesses(gameState);
    playTeamReadySounds(gameState, updateType);
    await drawRevealedPanelsAsync(gameState);
    playOpenPanelSounds(gameState, updateType);
    await drawImageEntityAsync(gameState, updateType);
    playGuessesMadeSounds(gameState, updateType);
    drawTeamGuessHighlights(gameState);
    await drawTeamScoreChangeAsync(gameState);
    drawIncorrectGuesses(gameState);
    drawPanelCounts(gameState);
    drawRemainingTurnTime(gameState);
    drawAllPlayerDots(gameState, updateType === "NewTurn");
    drawMostVotesPanels(updateType === "NewTurn");
    drawPauseState(gameState);
}

function handlePlayers(players) {
    allPlayers = players;

    var playerNameElements = document.getElementsByClassName("teamPlayerName");
    for (var playerNameElement of playerNameElements) {
        var found = false;
        players.forEach((player) => {
            if ("player_" + player.playerId === playerNameElement.id) {
                found = true;
            }
        });

        if (!found) {
            playerNameElement.remove();
        }
    }

    players.forEach((player) => {
        updatePlayer(player);
    });
}

function handleAddPlayer(player) {
    var playerElement = document.getElementById("player_" + player.playerId);
    if (!playerElement) {
        playRandomSound(playerJoinSounds);
    }

    playerSelectedPanels[player.playerId] = player;

    updatePlayer(player);
    drawPlayerDots(player);
    drawMostVotesPanels();
}

function handleSelectPanels(player) {
    playerSelectedPanels[player.playerId] = player;

    drawPlayerDots(player);
    drawMostVotesPanels();
}

function registerConnections() {
    connection.on("Players", handlePlayers);
    connection.on("AddPlayer", handleAddPlayer);
    connection.on("SelectPanels", handleSelectPanels);
    connection.on("GameState", handleGameState);
}

var mouseTimer = null, cursorVisible = true;
function disappearCursor() {
    mouseTimer = null;
    document.body.style.cursor = "none";
    cursorVisible = false;
}

function setupHideCursor() {
    document.onmousemove = function () {
        clearTimeout(mouseTimer);
        if (!cursorVisible) {
            document.body.style.cursor = "default";
            cursorVisible = true;
        }
        mouseTimer = window.setTimeout(disappearCursor, 3000);
    };
}

async function tryStartGameAsync() {
    var gameState = await getGameStateAsync();
    if (gameState) {
        await startGameAsync(gameState);
        return true;
    }
    return false;
}

async function putGameBoardPingAsync() {
    await fetch("/api/gameState/" + localStorage.getItem("gameStateId") + "/gameBoardPing",
        {
            method: "PUT"
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return;
        }).then(players => {
            if (players) {
                handlePlayers(players);
            }
        });
}

async function startGameAsync(gameState) {
    document.getElementById("welcomeContainer").classList.add("hidden");

    startSignalRAsync("gameStateId=" + localStorage.getItem("gameStateId"));

    handleGameState(gameState, "FirstLoad");

    getPlayersAsync().then(players => {
        handlePlayers(players);
    });

    setupHideCursor();
    setupPing(putGameBoardPingAsync);
}

async function startGameboardAsync() {
    await setupWelcomeAnimationAsync();

    if (!welcomeAnimationTimeout) {
        welcomeAnimationTimeout = setInterval(drawWelcomeAnimation, 5000);
        drawWelcomeAnimation();
    }

    resizePanelContainer();
}

var reloadTimeout;
window.onresize = function () {
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(function () {
        resizePanelContainer();
        setupCanvases();
    }, 100);
}

function gameboardLoginCallback(user, automatic) {
    document.getElementById("loginButton").disabled = "";

    if (user) {
        document.getElementById("displayName").innerHTML = user.displayName;
        document.getElementById("loginContainer").classList.add("hidden");
    } else {
        document.getElementById("loginContainer").classList.remove("hidden");

        if (automatic) {
            document.getElementById("loginMessage").innerHTML = "When you are logged in, you won't see images that you have already played.";
        } else {
            document.getElementById("loginMessage").innerHTML = "That login didn't work. Try again.";
        }
    }
}

window.onload = async function () {
    setupLoggedInUserAsync(gameboardLoginCallback);

    setupTagsAsync(urlParams.get('tags'));

    createPanels();
    createMostVotesPanels();
    setupCanvases();

    startGameboardAsync();

    document.getElementById("pauseButton").onclick = pauseGameAsync;
    document.getElementById("resumeButton").onclick = resumeGameAsync;

    document.getElementById("welcomeCreateGameButton").onclick = async () => {
        document.getElementById("welcomeStartGame").classList.add("hidden");
        document.getElementById("welcomeCreateGame").classList.remove("hidden");

        document.getElementById("startGameButton").innerHTML = "Create Game";
        document.getElementById("startGameButtons").classList.remove("hidden");

        document.getElementById("welcomeGameStateTeamOneName").value = "Team 1";
        document.getElementById("welcomeGameStateTeamTwoName").value = "Team 2";
        document.getElementById("welcomeCreateGameMessage").innerHTML = "Creating a new game... Set it up how you want!";
        document.getElementById("welcomeGameStateOptions").classList.remove("hidden");
    };

    document.getElementById("welcomeJoinGameButton").onclick = () => {
        document.getElementById("gameStateIdInput").value = localStorage.getItem("gameStateId");

        document.getElementById("startGameButton").innerHTML = "Join Game";
        document.getElementById("startGameButtons").classList.remove("hidden");

        document.getElementById("welcomeStartGame").classList.add("hidden");
        document.getElementById("welcomeExistingGame").classList.remove("hidden");
    };

    document.getElementById("welcomeCancelButton").onclick = () => {
        document.getElementById("welcomeStartGame").classList.remove("hidden");

        document.getElementById("welcomeCreateGame").classList.add("hidden");
        document.getElementById("welcomeGameStateOptions").classList.add("hidden");
        document.getElementById("welcomeExistingGame").classList.add("hidden");
        document.getElementById("startGameButtons").classList.add("hidden");
    }

    document.getElementById("startGameButton").onclick = async () => {
        var welcomeErrorMessageElement = document.getElementById("welcomeErrorMessage");

        if (document.getElementById("welcomeCreateGame").classList.contains("hidden")) {
            document.getElementById("startGameButton").innerHTML = "Joining...";

            localStorage.setItem("gameStateId", document.getElementById("gameStateIdInput").value.toUpperCase());

            tryStartGameAsync().then(result => {
                if (!result) {
                    document.getElementById("startGameButton").innerHTML = "Join Game";
                    welcomeErrorMessageElement.classList.remove("hidden");
                    welcomeErrorMessageElement.innerHTML = "Could not join the game. Double check your game id.";
                }
            });
        } else {
            document.getElementById("startGameButton").innerHTML = "Creating...";

            await postGameStateAsync().then(async result => {
                if (result) {
                    localStorage.setItem("gameStateId", result.gameStateId);
                    await tryStartGameAsync();
                } else {
                    document.getElementById("startGameButton").innerHTML = "Create Game";

                    welcomeErrorMessageElement.classList.remove("hidden");
                    welcomeErrorMessageElement.innerHTML = "Could not create the game. Refresh the page and try again.";
                }
            });
        }
    }

    document.getElementById("welcomeGameStateTeamOneName").oninput = (event) => {
        document.getElementById("teamOneName").innerHTML = event.target.value;
    };

    document.getElementById("welcomeGameStateTeamTwoName").oninput = (event) => {
        document.getElementById("teamTwoName").innerHTML = event.target.value;
    };

    $(".volume-chooser").on("input", ".volume", function (e) {
        var volume = $(e.currentTarget).val();
        localStorage.setItem("volume", volume);
        $(".volume-value").text(volume);
        Howler.volume(volume / 100);
    });

    if (!localStorage.getItem("volume")) {
        localStorage.setItem("volume", 50);
    }

    document.getElementById("volumeInput").value = localStorage.getItem("volume");
    $(".volume-value").text(localStorage.getItem("volume"));
    Howler.volume(parseInt(localStorage.getItem("volume")) / 100);

    // full screen
    // window.innerWidth == screen.width && window.innerHeight == screen.height
}
