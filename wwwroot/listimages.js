var maxRatio = 1.9;

function listImages() {
    localStorage.setItem("blobContainer", document.getElementById("sourceBlobContainer").value);

    fetch("api/images/all/" + document.getElementById("sourceBlobContainer").value, {
        headers: {
            "Authorization": localStorage.getItem("Authorization")
        }
        })
        .then(response => response.json())
        .then(responseJson => {
            var imageContainerElement = document.getElementById("imageContainer");
            imageContainerElement.innerHTML = "";

            responseJson.forEach(imageEntity => {
                var imageInfo = document.createElement("div");
                imageInfo.id = imageEntity.id;
                imageInfo.imageEntity = imageEntity;
                imageInfo.classList.add("imageInfo");
                var nameInfoElement = document.createElement("div");
                imageInfo.appendChild(nameInfoElement);

                var img = document.createElement("img");
                img.src = "api/images/" + imageEntity.blobContainer + "/" + imageEntity.id + "/thumbnail";

                imageInfo.appendChild(img);
                imageContainerElement.appendChild(imageInfo);

                drawImageInfo(img, imageEntity, nameInfoElement);
            });

            document.getElementById("imageCount").innerHTML = document.getElementById("imageContainer").children.length;
        });
}

function drawImageInfo(img, imageEntity, nameInfoElement) {
    if (!img.complete) {
        setTimeout(function () {
            drawImageInfo(img, imageEntity, nameInfoElement);
        }, 100);
        return;
    }
    var imgRect = getImgSizeInfo(img);

    var ratio = (imgRect.width / imgRect.height).toFixed(2);

    if (ratio >= maxRatio) {
        nameInfoElement.style.border = "5px solid red";

        var dimensions = document.createElement("div");
        dimensions.appendChild(document.createTextNode(imgRect.width.toFixed(2) + "x" + imgRect.height.toFixed(2) + " " + ratio));
        nameInfoElement.appendChild(dimensions);
    }

    var imageName = document.createElement("div");
    imageName.id = imageEntity.id + "_name";
    imageName.appendChild(document.createTextNode(imageEntity.name));
    nameInfoElement.appendChild(imageName);

    var imageUploadedBy = document.createElement("div");
    imageUploadedBy.id = imageEntity.id + "_uploadedBy";
    imageUploadedBy.appendChild(document.createTextNode(imageEntity.uploadedBy));
    nameInfoElement.appendChild(imageUploadedBy);
    

    var imagePlayedTime = document.createElement("div");
    imagePlayedTime.appendChild(document.createTextNode(imageEntity.playedTime));
    nameInfoElement.appendChild(imagePlayedTime);

    var actionLinks = document.createElement("div");

    var editLink = document.createElement("span");
    editLink.classList = "actionLink";
    editLink.onclick = function (event) {
        editImage(imageEntity.id);
    };
    editLink.appendChild(document.createTextNode("Edit"));
    actionLinks.appendChild(editLink);

    var moveLink = document.createElement("span");
    moveLink.classList = "actionLink";
    moveLink.onclick = function (event) {
        moveImage(imageEntity.id);
    };
    moveLink.appendChild(document.createTextNode("Move"));
    actionLinks.appendChild(moveLink);

    var copyLink = document.createElement("span");
    copyLink.classList = "actionLink";
    copyLink.onclick = function (event) {
        copyImage(imageEntity.id);
    };
    copyLink.appendChild(document.createTextNode("Copy"));
    actionLinks.appendChild(copyLink);

    var deleteLink = document.createElement("span");
    deleteLink.classList = "actionLink";
    deleteLink.onclick = function (event) {
        deleteImage(imageEntity.id);
    };
    deleteLink.appendChild(document.createTextNode("Delete"));
    actionLinks.appendChild(deleteLink);

    nameInfoElement.appendChild(actionLinks);
}

async function editImage(imageId) {
    var imageEntity = document.getElementById(imageId).imageEntity;

    document.getElementById("editImageMenu").classList.remove("hidden");
    document.getElementById("imageId").value = imageId;
    document.getElementById("imageName").value = imageEntity.name;
    document.getElementById("uploadedBy").value = imageEntity.uploadedBy;
}

async function saveImage() {
    return await fetch("api/images/" + document.getElementById("sourceBlobContainer").value + "/" + document.getElementById("imageId").value,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("Authorization")
            },
            body: JSON.stringify({
                name: document.getElementById("imageName").value,
                uploadedBy: document.getElementById("uploadedBy").value
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("got bad response on edit image: " + response.text());
            }
            return response.json();
        }).then(responseJson => {
            document.getElementById("editImageMenu").classList.add("hidden");

            document.getElementById(document.getElementById("imageId").value).imageEntity = responseJson;
            document.getElementById(document.getElementById("imageId").value + "_name").innerHTML = document.getElementById("imageName").value;
            document.getElementById(document.getElementById("imageId").value + "_uploadedBy").innerHTML = document.getElementById("uploadedBy").value;
            return responseJson;
        }).catch(error => {
            alert(error);
        });
}

async function moveImage(imageId) {
    var result = confirm("Move image to " + document.getElementById("targetBlobContainer").value + "?");
    if (!result) {
        return;
    }

    return await fetch("api/images/move",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("Authorization")
            },
            body: JSON.stringify({
                sourceBlobContainer: document.getElementById("sourceBlobContainer").value,
                sourceImageId: imageId,
                targetBlobContainer: document.getElementById("targetBlobContainer").value
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("got bad response on move image: " + response.text());
            }
            return response.json();
        }).then(responseJson => {
            document.getElementById(imageId).remove();
            document.getElementById("imageCount").innerHTML = document.getElementById("imageContainer").children.length;
            return responseJson;
        }).catch (error => {
            alert(error);
        });
}

async function copyImage(imageId) {
    var result = confirm("Copy image to " + document.getElementById("targetBlobContainer").value + "?");
    if (!result) {
        return;
    }

    return await fetch("api/images/copy",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("Authorization")
            },
            body: JSON.stringify({
                sourceBlobContainer: document.getElementById("sourceBlobContainer").value,
                sourceImageId: imageId,
                targetBlobContainer: document.getElementById("targetBlobContainer").value
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("got bad response on copy image: " + response.text());
            }
            return response.json();
        }).then(responseJson => {
            return responseJson;
        }).catch(error => {
            alert(error);
        });
}

async function deleteImage(imageId) {
    var result = confirm("Delete image?");
    if (!result) {
        return;
    }

    return await fetch("api/images/" + document.getElementById("sourceBlobContainer").value + "/" + imageId,
        {
            method: "DELETE",
            headers: {
                "Authorization": localStorage.getItem("Authorization")
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("got bad response on delete image: " + response.text());
            }
            document.getElementById(imageId).remove();
            document.getElementById("imageCount").innerHTML = document.getElementById("imageContainer").children.length;
        }).catch(error => {
            alert(error);
        });
}

window.onload = async function () {
    setupAdminMenu();

    var blobContainers = await getBlobContainers();
    drawBlobContainers(blobContainers, "sourceBlobContainer");
    drawBlobContainers(blobContainers, "targetBlobContainer");

    document.getElementById("sourceBlobContainer").value = localStorage.getItem("blobContainer");
    document.getElementById("sourceBlobContainer").onchange = listImages;

    document.getElementById("cancelSaveButton").onclick = function (event) {
        document.getElementById("editImageMenu").classList.add("hidden");
    };
    document.getElementById("saveButton").onclick = saveImage;


    listImages();
};