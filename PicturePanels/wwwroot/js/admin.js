function patchGameState() {
    fetch("/api/gameState", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        },
        body: JSON.stringify({
            RoundNumber: parseInt(document.getElementById("roundNumber").value),
            TeamTurn: parseInt(document.getElementById("teamTurn").value),
            TurnType: document.getElementById("turnType").value,
            ImageId: document.getElementById("imageId").value,
            TeamOneName: document.getElementById("teamOneName").value,
            TeamOneScore: parseInt(document.getElementById("teamOneScore").value),
            TeamOneIncorrectGuesses: parseInt(document.getElementById("teamOneIncorrectGuesses").value),
            TeamOneInnerPanels: parseInt(document.getElementById("teamOneInnerPanels").value),
            TeamTwoName: document.getElementById("teamTwoName").value,
            TeamTwoScore: parseInt(document.getElementById("teamTwoScore").value),
            TeamTwoIncorrectGuesses: parseInt(document.getElementById("teamTwoIncorrectGuesses").value),
            TeamTwoInnerPanels: parseInt(document.getElementById("teamTwoInnerPanels").value),
        })
    });
}

function nextTurn() {
    fetch("/api/gameState/nextTurn", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function teamPass(teamNumber) {
    fetch("/api/gameState/teamPass/" + teamNumber, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function teamCorrect(teamNumber) {
    fetch("/api/gameState/teamCorrect/" + teamNumber, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function teamIncorrect(teamNumber) {
    fetch("/api/gameState/teamIncorrect/" + teamNumber, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function getSelectedPanel() {
    var selectedPanelElements = document.getElementsByClassName("panelButtonSelected");

    for (var selectedPanel of selectedPanelElements) {
        if (selectedPanel.classList.contains("panelButtonDisabled")) {
            continue;
        }

        return selectedPanel;
    }
}

function openPanel() {
    var selectedPanel = getSelectedPanel();
    if (!selectedPanel) {
        return;
    }

    fetch("/api/gameState/openPanel/" + selectedPanel.value, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        },
    });
}

function forceOpenPanel() {
    var selectedPanel = getSelectedPanel();
    if (!selectedPanel) {
        return;
    }

    fetch("/api/gameState/openPanel/" + selectedPanel.value + "/force", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        },
    });
}

function closePanel() {
    var selectedPanel = getSelectedPanel();
    if (!selectedPanel) {
        return;
    }

    fetch("/api/gameState/closePanel/" + selectedPanel.value, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        },
    });
}

function endRound() {
    var result = confirm("End Round?");
    if (!result) {
        return;
    }

    fetch("/api/gameState/endRound", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function loadImageIdsAsync() {
    var imageSelect = document.getElementById("imageId");
    while (imageSelect.firstChild) {
        imageSelect.removeChild(imageSelect.firstChild);
    }

    return fetch("/api/images/all", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("Authorization")
        },
    })
    .then(response => response.json())
    .then(responseJson => {
        responseJson.forEach(function (imageEntity) {
            var optionElement = document.createElement("option");
            optionElement.value = imageEntity.id;
            optionElement.appendChild(document.createTextNode(imageEntity.name));
            imageSelect.appendChild(optionElement)
        });
    });
}

function selectNextImage() {
    var imageSelect = document.getElementById("imageId");
    var newIndex = parseInt(imageSelect.selectedIndex) + 1;
    if (newIndex >= imageSelect.length) {
        newIndex = 0;
    }
    imageSelect.selectedIndex = newIndex;

    imageSelect.onchange();
}

function selectPreviousImage() {
    var imageSelect = document.getElementById("imageId");
    var newIndex = parseInt(imageSelect.selectedIndex) - 1;
    if (newIndex < 0) {
        newIndex = imageSelect.length - 1;
    }
    imageSelect.selectedIndex = newIndex;

    imageSelect.onchange();
}

function cancelGo() {
    document.getElementById("goContainer").classList.add("hidden");
    document.getElementById("imageId").value = document.getElementById("imageId").currentImageId;
    drawImageNumber();
}

function panelButtonOnClick(event) {
    if (event.currentTarget.classList.contains("panelButtonDisabled")) {
        event.currentTarget.classList.remove("panelButtonSelected");
        return;
    }

    clearPanelButtonSelection();

    event.currentTarget.classList.add("panelButtonSelected");

    event.currentTarget.blur();
}

function drawImageNumber() {
    document.getElementById("imageNumber").innerHTML = (document.getElementById("imageId").selectedIndex + 1) + "/" + document.getElementById("imageId").length;
}

function editTeamOne() {
    document.getElementById("editTeamOne").classList.toggle("hidden");
    document.getElementById("editTeamTwo").classList.add("hidden");
}

function editTeamTwo() {
    document.getElementById("editTeamOne").classList.add("hidden");
    document.getElementById("editTeamTwo").classList.toggle("hidden");
}

async function handleGameState(gameState) {
    loadThemeAsync(gameState);

    updatePanelButtons(gameState);

    if (currentGameState && currentGameState.blobContainer !== gameState.blobContainer) {
        await loadImageIdsAsync();
        drawImageNumber();
    }

    currentGameState = gameState;

    drawGameState(gameState);

    var imageSelect = document.getElementById("imageId");
    imageSelect.onchange();

    document.getElementById("imageId").currentImageId = gameState.imageId;
    document.getElementById("goContainer").classList.add("hidden");

    switch (gameState.turnType) {
        case "OpenPanel":
            document.getElementById("openPanelButton").classList.remove("hidden");
            document.getElementById("teamOnePassButton").classList.add("hidden");
            document.getElementById("teamTwoPassButton").classList.add("hidden");
            document.getElementById("teamOneCorrectButton").classList.add("hidden");
            document.getElementById("teamTwoCorrectButton").classList.add("hidden");
            document.getElementById("teamOneIncorrectButton").classList.add("hidden");
            document.getElementById("teamTwoIncorrectButton").classList.add("hidden");
            document.getElementById("nextTurnButton").classList.add("hidden");
            document.getElementById("endRoundButton").classList.remove("hidden");
            document.getElementById("forceOpenPanelButton").classList.remove("hidden");
            break;
        case "MakeGuess":
            document.getElementById("openPanelButton").classList.add("hidden");
            document.getElementById("teamOnePassButton").classList.remove("hidden");
            document.getElementById("teamTwoPassButton").classList.remove("hidden");
            document.getElementById("teamOneCorrectButton").classList.remove("hidden");
            document.getElementById("teamTwoCorrectButton").classList.remove("hidden");
            document.getElementById("teamOneIncorrectButton").classList.remove("hidden");
            document.getElementById("teamTwoIncorrectButton").classList.remove("hidden");
            document.getElementById("nextTurnButton").classList.add("hidden");
            document.getElementById("endRoundButton").classList.add("hidden");
            document.getElementById("forceOpenPanelButton").classList.remove("hidden");
            break;
        case "GuessesMade":
            document.getElementById("openPanelButton").classList.add("hidden");
            document.getElementById("teamOnePassButton").classList.add("hidden");
            document.getElementById("teamTwoPassButton").classList.add("hidden");
            document.getElementById("teamOneCorrectButton").classList.add("hidden");
            document.getElementById("teamTwoCorrectButton").classList.add("hidden");
            document.getElementById("teamOneIncorrectButton").classList.add("hidden");
            document.getElementById("teamTwoIncorrectButton").classList.add("hidden");
            if (gameState.teamOneCorrect || gameState.teamTwoCorrect) {
                document.getElementById("nextTurnButton").classList.add("hidden");
            } else {
                document.getElementById("nextTurnButton").classList.remove("hidden");
            }
            document.getElementById("endRoundButton").classList.add("hidden");
            document.getElementById("forceOpenPanelButton").classList.remove("hidden");
            break;
        case "Welcome":
        case "Correct":
        case "EndRound":
            document.getElementById("openPanelButton").classList.add("hidden");
            document.getElementById("teamOnePassButton").classList.add("hidden");
            document.getElementById("teamTwoPassButton").classList.add("hidden");
            document.getElementById("teamOneCorrectButton").classList.add("hidden");
            document.getElementById("teamTwoCorrectButton").classList.add("hidden");
            document.getElementById("teamOneIncorrectButton").classList.add("hidden");
            document.getElementById("teamTwoIncorrectButton").classList.add("hidden");
            document.getElementById("nextTurnButton").classList.add("hidden");
            document.getElementById("endRoundButton").classList.add("hidden");
            document.getElementById("forceOpenPanelButton").classList.add("hidden");
            break;
    }

    if (gameState.teamTurn === 1) {
        document.getElementById("chatsTeam1").classList.add("chatsHighlight");
        document.getElementById("chatsTeam2").classList.remove("chatsHighlight");
    } else {
        document.getElementById("chatsTeam1").classList.remove("chatsHighlight");
        document.getElementById("chatsTeam2").classList.add("chatsHighlight");
    }
}

function getChatsElementId(player) {
    return player && player.teamNumber === 2 ? "chatsTeam2" : "chatsTeam1";
}

function registerConnections() {
    connection.on("GameState", handleGameState);
    connection.on("Chat", (chat) => {
        drawChat(getChatsElementId(chat.player), chat);
    });

    connection.on("Typing", (player) => {
        handleTyping(getChatsElementId(player), player);
    });

    connection.on("AddPlayer", (player) => {
        if (player.playerId !== localStorage.getItem("playerId")) {
            drawSystemChat(getChatsElementId(player), { message: "has joined the team.", player: player });
        }
    });
}

function drawPlusMinusButtons() {
    var plusMinusDivs = document.getElementsByClassName("plusMinus");

    for (var plusMinusDiv of plusMinusDivs) {
        var inputText = document.createElement("input");
        inputText.id = plusMinusDiv.getAttribute("name");
        inputText.type = "text";
        inputText.value = 0;
        inputText.classList = "plusMinusInput plusMinusText";
        inputText.onchange = patchGameState;

        var minusButton = document.createElement("div");
        minusButtonText = document.createElement("div");
        minusButtonText.classList = "plusMinusButtonText";
        minusButtonText.appendChild(document.createTextNode("\u2212"));
        minusButton.appendChild(minusButtonText);
        minusButton.classList = "plusMinusInput plusMinusButton";
        minusButton.pairedId = inputText.id;

        minusButton.onclick = function (event) {
            var pairedTextElement = document.getElementById(event.currentTarget.pairedId);
            pairedTextElement.value = parseInt(pairedTextElement.value) - 1;
            patchGameState();
        }

        var plusButton = document.createElement("div");
        plusButtonText = document.createElement("div");
        plusButtonText.classList = "plusMinusButtonText";
        plusButtonText.appendChild(document.createTextNode("+"));
        plusButton.appendChild(plusButtonText);
        plusButton.pairedId = inputText.id;

        plusButton.classList = "plusMinusInput plusMinusButton";
        plusButton.onclick = (event) => {
            var pairedTextElement = document.getElementById(event.currentTarget.pairedId);
            pairedTextElement.value = parseInt(pairedTextElement.value) + 1;
            patchGameState();
        }

        plusMinusDiv.appendChild(minusButton);
        plusMinusDiv.appendChild(inputText);
        plusMinusDiv.appendChild(plusButton);
    }
}

window.onload = async function () {
    if (!localStorage.getItem("Authorization")) {
        document.getElementById("mainDiv").innerHTML = "Missing password.";
        return;
    }

    var player = await getPlayer();
    if (!player) {
        document.getElementById("mainDiv").innerHTML = "Player not found. Go to player page first.";
        return;
    }

    if (!player.isAdmin) {
        document.getElementById("mainDiv").innerHTML = "Player is not admin. Promote on the <a href='setup'>setup</a> page.";
        return;
    }

    await startSignalRAsync("admin");
    await putPlayerAsync();

    setupChats("chatsTeam1", 1);
    setupChats("chatsTeam2", 2);
    drawChatsAsync("chatsTeam1", 1);
    drawChatsAsync("chatsTeam2", 2);


    var promises = [];
    promises.push(getGameStateAsync());
    promises.push(loadImageIdsAsync());

    Promise.all(promises).then((results) => {
        handleGameState(results[0]);
        drawImageNumber();
    });

    setupAdminMenu();
    drawPanelButtons();
    drawPlusMinusButtons();

    var adminSelects = document.getElementsByClassName("adminSelect");
    for (var adminSelect of adminSelects) {
        adminSelect.onchange = (event) => { patchGameState(); };
    }

    document.getElementById("imageId").onchange = (event) => {
        document.getElementById("goContainer").classList.remove("hidden");
        drawImageNumber();
    }
}
