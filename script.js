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
        document.title = "ERROR";
    }
}

async function predict(imgElement) {
    if (!model) {
        document.getElementById("label").innerText = "Model not loaded!";
        document.title = "ERROR";
        return;
    }

    try {
        const prediction = await model.predict(imgElement);
         // ADD THIS DEBUG CODE:
        console.log("Raw prediction array:", prediction);
        console.log("Number of classes:", prediction.length);
        
        for (let i = 0; i < prediction.length; i++) {
            console.log(`Class ${i}: ${prediction[i].className} = ${prediction[i].probability}`);
        }
        // END DEBUG CODE
        // Find the best class
        let best = prediction.reduce((a, b) =>
            a.probability > b.probability ? a : b
        );

        const resultText = `${best.className} (${(best.probability * 100).toFixed(1)}%)`;

        // Show on webpage
        document.getElementById("label").innerText = resultText;

        // 🔥 SEND RESULT TO APP INVENTOR VIA PAGE TITLE
        document.title = best.className;

    } catch (err) {
        console.error("Prediction error:", err);
        document.getElementById("label").innerText = "Prediction failed!";
        document.title = "ERROR";
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

// Load model on startup
loadModel();
