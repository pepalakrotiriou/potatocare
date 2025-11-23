let model, metadata;
const modelPath = "model/model.json";
const metadataPath = "model/metadata.json";

async function loadModel() {
    model = await tf.loadLayersModel(modelPath);
    const response = await fetch(metadataPath);
    metadata = await response.json();
    console.log("Model loaded.");
}

async function predict(imgElement) {
    if (!model) {
        document.getElementById("label").innerText = "Model not loaded!";
        return;
    }

    const tensor = tf.browser
        .fromPixels(imgElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims();

    const prediction = await model.predict(tensor).data();

    // find top class
    let maxIndex = 0;
    prediction.forEach((value, i) => {
        if (value > prediction[maxIndex]) maxIndex = i;
    });

    const className = metadata.labels[maxIndex];
    const confidence = prediction[maxIndex].toFixed(3);

    document.getElementById("label").innerText =
        className + " (" + confidence + ")";
}

document.getElementById("imageInput").addEventListener("change", function (evt) {
    const file = evt.target.files[0];
    const img = document.getElementById("preview");
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        predict(img);
    };
});

// Load model on startup
loadModel();

