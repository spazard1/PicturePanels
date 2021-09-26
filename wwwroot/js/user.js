async function postUserAsync() {

    return await fetch("/api/users",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userName: document.getElementById("username").value,
                password: document.getElementById("password").value,
                displayName: document.getElementById("displayName").value
            })
        })
        .then(response => {
            if (response.ok) {
                localStorage.setItem("username", document.getElementById("username").value);

                showMessage("User created. Return to the <a href='javascript: history.back()'>previous page</a>.");
                return;
            }

            showMessage("User could not be created. Please try again.", true);
            return false;
        });
}

async function putUserAsync() {
    var body = {
        userName: document.getElementById("username").innerHTML,
        existingPassword: document.getElementById("existingPassword").value
    };

    if (document.getElementById("password").value) {
        body.password = document.getElementById("password").value;
    }

    if (document.getElementById("displayName").value) {
        body.displayName = document.getElementById("displayName").value;
    }

    return await fetch("/api/users",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
        .then(response => {
            if (response.ok) {
                localStorage.setItem("username", document.getElementById("username").value);

                showMessage("User edited. Return to the <a href='javascript: history.back()'>previous page</a>.");
                return;
            }

            showMessage("User could not be edited. Please try again.", true);
            return false;
        });
}

window.onload = async () => {
    if (document.getElementById("newUserButton")) {
        document.getElementById("newUserButton").onclick = () => {
            postUserAsync();
        };
    }

    var user = null;
    if (document.getElementById("editUserButton")) {
        if (localStorage.getItem("userToken")) {
            user = await getUserAsync();
        }

        if (!user) {
            window.location = "upload";
        }

        document.getElementById("username").innerHTML = user.userName;
        document.getElementById("displayName").value = user.displayName;

        document.getElementById("editUserButton").onclick = () => {
            putUserAsync();
        };
    }
}