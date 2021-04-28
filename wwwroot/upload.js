function onPasteUrl(event) {
    var pastedUrl = (event.clipboardData || window.clipboardData).getData('text');

    if (pastedUrl) {
        prepareForUpload("Loading from URL...");
        uploadTemporary(pastedUrl);
        return;
    }

    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            prepareForUpload("Loading from pasted image...");

            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = handleFileOnload;
            reader.readAsDataURL(blob);
        }
    }
}

function prepareForUpload(message) {
    showLoadingMessage(message);

    document.getElementById("imagePreviewContainer").classList.add("hidden");
    document.getElementById("helpMessageContainer").classList.add("hidden");
    document.getElementById("croppieContainer").classList.remove("hidden");
    document.getElementById("imageInfo").classList.remove("hidden");
    setupCroppie();
}

function onFileSelection(event) {
    var input = document.getElementById("imageFile");

    if (input.files && input.files[0]) {
        prepareForUpload("Loading from file...");

        var reader = new FileReader();
        reader.onload = handleFileOnload;
        reader.readAsDataURL(input.files[0]);
    }
}

async function handleFileOnload(event) {
    isImageSelected = true;
    showLoadingMessage("Preparing image for cropping...");

    await croppie.bind({
        url: event.target.result,
        zoom: 0
    });

    showLoadingMessage();

    document.getElementById("imageName").value = "";
    document.getElementById("imageName").focus();
}

async function uploadTemporary(uploadUrl) {
    return await fetch("api/images/uploadTemporary",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("Authorization")
            },
            body: JSON.stringify({
                url: uploadUrl
            })
        })
        .then(async response => {
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return response.json();
        })
        .then(async responseJson => {
            isImageSelected = true;
            showLoadingMessage("Preparing image for cropping...");

            await croppie.bind({
                url: responseJson.url,
                zoom: 0
            });

            showLoadingMessage();

            document.getElementById("imageName").value = "";
            document.getElementById("imageName").focus();

            return responseJson;
        }).catch(function (error) {
            showLoadingMessage();

            showMessage(error.message, true);

            return null;
        });
}

async function putImage() {
    showLoadingMessage("Uploading image...");

    var blobContainer = document.getElementById("blobContainer").value;
    if (!blobContainer) {
        blobContainer = "pending";
    }

    return await fetch("api/images",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("Authorization")
            },
            body: JSON.stringify({
                blobContainer: blobContainer,
                name: document.getElementById("imageName").value,
                uploadedBy: document.getElementById("uploadedBy").value
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("The image failed to be created.")
            }
            return response.json();
        })
        .then(responseJson => {
            return responseJson;
        }).catch(function (error) {
            showLoadingMessage();

            showMessage(error.message, true);

            return null;
        });
}

async function uploadImage() {
    if (document.getElementById("imageName").value.length < 2) {
        showMessage("The 'Movie/TV Show Name' field must be longer.", true);
        return;
    }

    var uploadedByElement = document.getElementById("uploadedBy");
    if (uploadedByElement.value.length < 2 ||
        uploadedByElement.value === uploadedByElement.defaultValue) {
        showMessage("The 'Uploaded By' field must be longer.", true);
        return;
    }

    var blob = await croppie.result({
        type: "blob",
        size: { width: imageWidth, height: imageHeight }
    });

    var imageEntity = await putImage();

    if (!imageEntity) {
        return;
    }

    return await fetch("api/images/" + imageEntity.blobContainer + "/" + imageEntity.id,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("Authorization")
            },
            body: blob
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("The image failed to be uploaded.")
            }
            return response.json();
        })
        .then(responseJson => {
            showLoadingMessage();

            showMessage("Upload complete! Here is the final image. If you have more images to upload, you can start those now.");

            document.getElementById("imagePreviewContainer").innerHTML = "<img src='api/images/" + responseJson.blobContainer + "/" + responseJson.id +"' class='imagePreview' />";

            document.getElementById("imagePreviewContainer").classList.remove("hidden");
            document.getElementById("croppieContainer").classList.add("hidden");

            return responseJson;
        }).catch(function (error) {
            showLoadingMessage();

            showMessage(error.message, true);

            return null;
        });
}

function showLoadingMessage(message) {
    if (!message) {
        document.getElementById("imageUrl").disabled = "";
        document.getElementById("blobContainer").disabled = "";
        document.getElementById("imageName").disabled = "";
        document.getElementById("uploadedBy").disabled = "";
        document.getElementById("saveButton").disabled = "";
        document.getElementById("loading").classList.add("hidden");
        return;
    }

    document.getElementById("imageUrl").disabled = "disabled";
    document.getElementById("blobContainer").disabled = "disabled";
    document.getElementById("imageName").disabled = "disabled";
    document.getElementById("uploadedBy").disabled = "disabled";
    document.getElementById("saveButton").disabled = "disabled";
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("loadingMessage").innerHTML = message;
}

var imageWidth;
var imageHeight;
var isImageSelected = false;

function showMessage(message, isError) {
    if (isError) {
        document.getElementById("results").classList.add("invalidImage");
        document.getElementById("results").innerHTML = message;
    } else {
        document.getElementById("results").classList.remove("invalidImage");
        document.getElementById("results").innerHTML = message;
    }
}

function drawDetails(event) {
    imageWidth = Math.ceil(parseInt(event.detail.points[2]) - parseInt(event.detail.points[0]));
    imageHeight = Math.ceil(parseInt(event.detail.points[3]) - parseInt(event.detail.points[1]));
    var aspectRatio = (imageWidth / imageHeight).toFixed(2);

    document.getElementById("aspectRatio").innerHTML = aspectRatio;
    document.getElementById("imageWidth").innerHTML = imageWidth;
    document.getElementById("imageHeight").innerHTML = imageHeight;

    if (!isImageSelected) {
        document.getElementById("saveButton").disabled = "disabled";
    } else if (imageWidth < 1000) {
        showMessage("Image width must be at least 1000 pixels. The cropped image is " + (1000 - imageWidth) + " pixels too small.", true);
        document.getElementById("saveButton").disabled = "disabled";
    } else if (aspectRatio > 1.85) {
        showMessage("Aspect Ratio must be less than 1.85. The cropped image rectangle is too wide.", true);
        document.getElementById("saveButton").disabled = "disabled";
    } else if (aspectRatio < 1.35) {
        showMessage("Aspect Ratio must be greater than 1.35. The cropped image is too square.", true);
        document.getElementById("saveButton").disabled = "disabled";
    } else {
        showMessage("Image size is good, ready to save!");
        document.getElementById("saveButton").disabled = "";
    }
}

function saveSettings() {
    localStorage.setItem("uploadUploadedBy", document.getElementById("uploadedBy").value);
    localStorage.setItem("blobContainer", document.getElementById("blobContainer").value);
}

var croppie;

function setupCroppie() {
    if (croppie) {
        return;
    }

    var croppieContainer = document.getElementById("croppieContainer");

    // 1.7778
    croppieContainer.style.height = croppieContainer.getBoundingClientRect().width * .5625 + "px";

    var scale = .9;

    croppie = new Croppie(croppieContainer, {
        viewport: { width: Math.round(croppieContainer.getBoundingClientRect().width * scale), height: Math.round(croppieContainer.getBoundingClientRect().height * scale) },
        showZoomer: true,
        enableResize: true,
        mouseWheelZoom: true,
    });

    croppieContainer.addEventListener("update", drawDetails);
}

window.onload = async () => {
    if (await isAuthorized()) {
        setupAdminMenu();
        await drawBlobContainers(await getBlobContainers(), "blobContainer");
    } else {
        document.getElementById("blobContainerDiv").classList.add("hidden");
    }

    document.getElementById("blobContainer").value = localStorage.getItem("blobContainer");
    document.getElementById("blobContainer").onchange = saveSettings;

    setupInputDefaultText("uploadedBy", "your name", localStorage.getItem("uploadUploadedBy"));
    document.getElementById("uploadedBy").onchange = saveSettings;

    document.getElementById("saveButton").disabled = "disabled";

    setupInputDefaultText("imageUrl", "paste an image or url");
    document.getElementById("imageUrl").onpaste = onPasteUrl;
    document.getElementById("imageUrl").onfocus = function (event) {
        document.getElementById("imageUrl").value = "";
    };

    document.getElementById("imageFile").onchange = onFileSelection;
}
