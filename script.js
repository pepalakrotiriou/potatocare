let model;
let maxPredictions;

async function loadModel() {
    const modelURL = "https://pepalakrotiriou.github.io/potatocare/model/model.json";
    const metadataURL = "https://pepalakrotiriou.github.io/potatocare/model/metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully.");
        document.getElementById("label").innerText = "Model ready. Upload an image.";
    } catch (err) {
        console.error("Model failed to load:", err);
        document.getElementById("label").innerText = "Error loading model!";
    }
}

async function predict(imgElement) {
    if (!model) {
        document.getElementById("label").innerText = "Model not loaded!";
        return;
    }

    try {
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

    } catch (err) {
        console.error("Prediction error:", err);
        document.getElementById("label").innerText = "Prediction failed!";
    }
}

document.getElementById("imageInput").addEventListener("change", function (evt) {
    const file = evt.target.files[0];
    const img = document.getElementById("preview");

    if (!file) return;

    img.src = URL.createObjectURL(file);

    img.onload = function () {
        predict(img);
    };
});

// Load model on page load
loadModel();
