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
            TeamFirstTurn: parseInt(document.getElementById("teamFirstTurn").value),
            ImageId: document.getElementById("imageId").value,
            TeamOneName: document.getElementById("teamOneName").value,
            TeamOneScore: parseInt(document.getElementById("teamOneScore").value),
            TeamOneIncorrectGuesses: parseInt(document.getElementById("teamOneIncorrectGuesses").value),
            TeamOneOuterTiles: parseInt(document.getElementById("teamOneOuterTiles").value),
            TeamOneInnerTiles: parseInt(document.getElementById("teamOneInnerTiles").value),
            TeamTwoName: document.getElementById("teamTwoName").value,
            TeamTwoScore: parseInt(document.getElementById("teamTwoScore").value),
            TeamTwoIncorrectGuesses: parseInt(document.getElementById("teamTwoIncorrectGuesses").value),
            TeamTwoOuterTiles: parseInt(document.getElementById("teamTwoOuterTiles").value),
            TeamTwoInnerTiles: parseInt(document.getElementById("teamTwoInnerTiles").value),
        })
    });
}

function passTurn() {
    fetch("/api/gameState/pass", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function correct() {
    fetch("/api/gameState/correct", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function incorrect() {
    fetch("/api/gameState/incorrect", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function getSelectedTile() {
    var selectedTileElements = document.getElementsByClassName("tileButtonSelected");

    for (let selectedTile of selectedTileElements) {
        if (selectedTile.classList.contains("tileButtonDisabled")) {
            continue;
        }

        return selectedTile;
    }
}

function openTile() {
    var selectedTile = getSelectedTile();
    if (!selectedTile) {
        return;
    }

    fetch("/api/gameState/openTile/" + selectedTile.value, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        },
    });
}

function forceOpenTile() {
    var selectedTile = getSelectedTile();
    if (!selectedTile) {
        return;
    }

    fetch("/api/gameState/openTile/" + selectedTile.value + "/force", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        },
    });
}

function closeTile() {
    var selectedTile = getSelectedTile();
    if (!selectedTile) {
        return;
    }

    fetch("/api/gameState/closeTile/" + selectedTile.value, {
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

function loadImageIds() {
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

function tileButtonOnClick(event) {
    if (event.currentTarget.classList.contains("tileButtonDisabled")) {
        event.currentTarget.classList.remove("tileButtonSelected");
        return;
    }

    clearTileButtonSelection();

    event.currentTarget.classList.add("tileButtonSelected");

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
    loadThemeCss(gameState);

    updateTileButtons(gameState);

    if (currentGameState && currentGameState.blobContainer !== gameState.blobContainer) {
        await loadImageIds();
        drawImageNumber();
    }

    currentGameState = gameState;

    drawGameState(gameState);

    var imageSelect = document.getElementById("imageId");
    imageSelect.onchange();

    document.getElementById("imageId").currentImageId = gameState.imageId;
    document.getElementById("goContainer").classList.add("hidden");

    switch (gameState.turnType) {
        case "OpenTile":
        case "OpenFreeTile":
            document.getElementById("openTileButton").classList.remove("hidden");
            document.getElementById("passButton").classList.add("hidden");
            document.getElementById("incorrectButton").classList.add("hidden");
            document.getElementById("correctButton").classList.add("hidden");
            document.getElementById("endRoundButton").classList.remove("hidden");
            document.getElementById("forceOpenTileButton").classList.remove("hidden");
            break;
        case "MakeGuess":
            document.getElementById("openTileButton").classList.add("hidden");
            document.getElementById("passButton").classList.remove("hidden");
            document.getElementById("incorrectButton").classList.remove("hidden");
            document.getElementById("correctButton").classList.remove("hidden");
            document.getElementById("endRoundButton").classList.add("hidden");
            document.getElementById("forceOpenTileButton").classList.add("hidden");
            break;
        case "Welcome":
        case "Correct":
        case "EndRound":
            document.getElementById("openTileButton").classList.add("hidden");
            document.getElementById("passButton").classList.add("hidden");
            document.getElementById("incorrectButton").classList.add("hidden");
            document.getElementById("correctButton").classList.add("hidden");
            document.getElementById("endRoundButton").classList.add("hidden");
            document.getElementById("forceOpenTileButton").classList.add("hidden");
            break;
    }
}

function getChatsElementId(player) {
    return player.teamNumber === 1 ? "chatsTeam1" : "chatsTeam2";
}

function registerConnections() {
    connection.on("GameState", handleGameState);
    connection.on("Chat", (player, message) => {
        drawChat(getChatsElementId(player), message, player);      
    });

    connection.on("Typing", (player) => {
        handleTyping(getChatsElementId(player), player);
    });

    connection.on("AddPlayer", (player) => {
        if (player.playerId !== localStorage.getItem("playerId")) {
            drawSystemChat(getChatsElementId(player), "has joined the team.", player);
        }
    });

    connection.onreconnected = function () {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chatsTeam1", "SignalR reconnected");
        }
    }

    connection.onclose(async function () {
        if (localStorage.getItem("debug")) {
            drawSystemChat("chatsTeam1", "SignalR closed.");
        }
        await startSignalRAsync("admin");
    });
}

function drawPlusMinusButtons() {
    var plusMinusDivs = document.getElementsByClassName("plusMinus");

    for (let plusMinusDiv of plusMinusDivs) {
        let inputText = document.createElement("input");
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
        minusButton.onclick = function (event) {
            inputText.value = parseInt(inputText.value) - 1;
            patchGameState();
        }

        var plusButton = document.createElement("div");
        plusButtonText = document.createElement("div");
        plusButtonText.classList = "plusMinusButtonText";
        plusButtonText.appendChild(document.createTextNode("+"));
        plusButton.appendChild(plusButtonText);

        plusButton.classList = "plusMinusInput plusMinusButton";
        plusButton.onclick = (event) => {
            inputText.value = parseInt(inputText.value) + 1;
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

    setupAdminMenu();

    var player = await getPlayer();
    if (!player) {
        document.getElementById("mainDiv").innerHTML = "Player not found. Go to player page first.";
        return;
    }

    if (!player.isAdmin) {
        document.getElementById("mainDiv").innerHTML = "Player is not admin. Promote on the <a href='setup.html'>setup.html</a> page.";
        return;
    }

    setupChats("chatsTeam1", 1);
    setupChats("chatsTeam2", 2);
    drawChatsAsync("chatsTeam1", 1);
    drawChatsAsync("chatsTeam2", 2);

    drawPlusMinusButtons();

    document.getElementById("imageId").onchange = (event) => {
        document.getElementById("goContainer").classList.remove("hidden");
        drawImageNumber();
    }

    var adminSelects = document.getElementsByClassName("adminSelect");
    for (let adminSelect of adminSelects) {
        adminSelect.onchange = (event) => { patchGameState(); };
    }

    drawTileButtons();

    await startSignalRAsync("admin");
    await loadImageIds();

    var gameState = await getGameStateAsync();
    handleGameState(gameState);

    drawImageNumber();

}
