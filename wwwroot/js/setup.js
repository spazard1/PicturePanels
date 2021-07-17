function patchGameState() {
    fetch("/api/gameState", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        },
        body: JSON.stringify({
            BlobContainer: document.getElementById("blobContainer").value,
            ThemeCss: document.getElementById("themeCss").value,
            OpenPanelTime: parseInt(document.getElementById("openPanelTime").value),
            GuessTime: parseInt(document.getElementById("guessTime").value),
            TeamOneName: document.getElementById("teamOneName").value,
            TeamTwoName: document.getElementById("teamTwoName").value,
        })
    }).then(response => {
        document.getElementById("results").innerHTML = "Saved.";
    });
}

async function putAdmin() {
    return await fetch("api/players/" + localStorage.getItem("playerId") + "/admin", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    }).then(response => response.json())
    .then(responseJson => {
        drawIsAdminButton(responseJson);
        return responseJson;
    });
}

function login() {
    localStorage.setItem("Authorization", document.getElementById("passwordText").value);
}

function newGame() {
    var result = confirm("New Game? Select the new image first.");
    if (!result) {
        return;
    }

    fetch("/api/gameState/newGame", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function randomizeTeams() {
    var result = confirm("Randomize Teams?");
    if (!result) {
        return;
    }

    fetch("/api/gameState/randomizeTeams", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function captains() {
    var result = confirm("Set Captains?");
    if (!result) {
        return;
    }

    fetch("/api/gameState/captains", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("Authorization")
        }
    });
}

function drawIsAdminButton(player) {
    if (player.isAdmin) {
        document.getElementById("putAdminButton").value = "Revoke Admin";
    } else {
        document.getElementById("putAdminButton").value = "Promote Admin";
    }
}

window.onload = async () => {
    setupAdminMenu();

    drawBlobContainers(await getBlobContainers(), "blobContainer");

    drawGameState(await getGameStateAsync());

    drawIsAdminButton(await getPlayer());

    if (await isAuthorized()) {
        document.getElementById("password").classList.add("hidden");
    }
}
