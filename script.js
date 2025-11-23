let model;
let maxPredictions;

async function loadModel() {
    const modelURL = "model/model.json";
    const metadataURL = "model/metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    console.log("Model loaded.");
}

async function predict(imgElement) {
    if (!model) {
        document.getElementById("label").innerText = "Model not loaded!";
        return;
    }

    const prediction = await model.predict(imgElement);

    // find the class with the highest probability
    let best = prediction[0];
    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > best.probability) {
            best = prediction[i];
        }
    }

    document.getElementById("label").innerText =
        `${best.className} (${best.probability.toFixed(3)})`;
}

document.getElementById("imageInput").addEventListener("change", function (evt) {
    const file = evt.target.files[0];
    const img = document.getElementById("preview");
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        predict(img);
    };
});

// Load model on page load
loadModel();
