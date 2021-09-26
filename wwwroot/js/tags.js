var maxRatio = 1.9;

function listTags() {
    fetch("api/images/alltags", {
            headers: {
                "Authorization": localStorage.getItem("userToken")
            }
        })
        .then(response => response.json())
        .then(responseJson => {
            var tagCountsElement = document.getElementById("tagCounts");
            tagCountsElement.innerHTML = "";

            for (var tag of responseJson) {
                var tagInfo = document.createElement("div");

                tagInfo.appendChild(document.createTextNode(tag.tag + ":" + tag.count + " " + (tag.isHidden ? "(hidden)" : "")))
                
                tagCountsElement.appendChild(tagInfo);
            };
        });
}

function rebuildTags() {
    fetch("api/images/rebuildTags", {
        method: "PUT",
        headers: {
            "Authorization": localStorage.getItem("userToken")
        }
    })
        .then(response => {
            listTags();
        });
}

window.onload = async function () {
    listTags();

    document.getElementById("rebuildbutton").onclick = () => {
        rebuildTags();
    };
};