<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Loading...</title>
    <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js"></script>

    <style>
        body { font-family: Arial; text-align: center; }
        img { width: 250px; margin: 20px; }
    </style>
</head>

<body>

<h2>Potato Leaf Disease Detection</h2>

<input type="file" id="imageInput">
<br>
<img id="preview">

<div id="output" style="margin-top:20px; font-size:20px;"></div>

<script>
let model;
let maxPredictions;

// 🔥 Sends results back to APP INVENTOR using document.title
function sendToAppInventor(message) {
    console.log("Sending to App Inventor:", message);
    document.title = "RESULT:" + message;   // App Inventor will read this
}

// 🔥 Load the Teachable Machine model
async function loadModel() {
    const modelURL = "https://pepalakrotiriou.github.io/potatocare/model/model.json";
    const metadataURL = "https://pepalakrotiriou.github.io/potatocare/model/metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        document.getElementById("output").innerText =
            "Model loaded (" + maxPredictions + " classes)";
        sendToAppInventor("MODEL LOADED");  // notify AppInventor

    } catch (error) {
        document.getElementById("output").innerText =
            "Error loading model: " + error;
        sendToAppInventor("ERROR: MODEL FAILED TO LOAD");
    }
}

// 🔥 Perform prediction
async function predict(imgElement) {
    if (!model) {
        sendToAppInventor("ERROR: MODEL NOT READY");
        return;
    }

    try {
        const prediction = await model.predict(imgElement);

        let bestClass = "";
        let bestProb = 0;
        let html = "<h3>Prediction Results:</h3>";

        prediction.forEach(p => {
            let pct = (p.probability * 100).toFixed(2);
            html += `${p.className}: ${pct}%<br>`;

            if (p.probability > bestProb) {
                bestProb = p.probability;
                bestClass = p.className;
            }
        });

        document.getElementById("output").innerHTML = html;

        // 🔥 Send best class back to App Inventor
        sendToAppInventor(bestClass + " (" + (bestProb * 100).toFixed(1) + "%)");

    } catch (error) {
        sendToAppInventor("ERROR: PREDICTION FAILED");
        document.getElementById("output").innerHTML =
            "<span style='color:red'>Prediction error: " + error + "</span>";
    }
}

// 🔥 When user selects a file
document.getElementById("imageInput").addEventListener("change", function (evt) {
    const file = evt.target.files[0];
    if (!file) return;

    const img = document.getElementById("preview");
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        predict(img);
    };
});

// 🔥 Load model when page loads
window.addEventListener("DOMContentLoaded", loadModel);

</script>

</body>
</html>
