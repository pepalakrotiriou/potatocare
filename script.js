// ===============================
// Potato Leaf Disease Detection
// Fully rewritten, robust version
// ===============================

let model = null;
let maxPredictions = 0;

// -------------------------------
// Load Teachable Machine model
// -------------------------------
async function loadModel() {
    const modelURL = "https://pepalakrotiriou.github.io/potatocare/model/model.json";
    const metadataURL = "https://pepalakrotiriou.github.io/potatocare/model/metadata.json";

    try {
        console.log("Loading model...");
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        console.log("Model loaded successfully");
        console.log("Number of classes:", maxPredictions);
        console.log("Class labels:", model.getClassLabels());

        document.getElementById("label").innerText =
            `Model ready (${maxPredictions} classes). Choose an image.`;
    } catch (error) {
        console.error("Model loading failed:", error);
        document.getElementById("label").innerText = "ERROR: Model failed to load";
        document.title = "ERROR";
    }
}

// -------------------------------
// Predict image
// -------------------------------
async function predict(img) {
    if (!model) {
        document.getElementById("label").innerText = "Model not loaded";
        return;
    }

    // Safety check: image must be valid
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        document.getElementById("label").innerText = "Invalid image";
        console.error("Invalid image dimensions");
        return;
    }

    try {
        console.log("Running prediction...");
        const predictions = await model.predict(img);

        let bestClass = "Unknown";
        let bestProb = 0;

        let html = "<h3>Prediction Results</h3>";

        predictions.forEach(p => {
            const percent = (p.probability * 100).toFixed(2);
            html += `<div>${p.className}: ${percent}%</div>`;

            if (p.probability > bestProb) {
                bestProb = p.probability;
                bestClass = p.className;
            }
        });

        document.getElementById("label").innerHTML = html;
        document.title = bestClass;

        console.log("Best result:", bestClass, bestProb);

        // Send result to MIT App Inventor (if available)
        try {
            AppInventor.setWebViewString(
                `${bestClass}: ${(bestProb * 100).toFixed(2)}%`
            );
        } catch (e) {
            console.log("AppInventor interface not available");
        }

    } catch (error) {
        console.error("Prediction error:", error);
        document.getElementById("label").innerText = "Prediction failed";
        document.title = "ERROR";
    }
}

// -------------------------------
// Handle file upload (browser)
// -------------------------------
document.getElementById("imageInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = document.getElementById("preview");

    document.getElementById("label").innerText = "Loading image...";

    // IMPORTANT: attach handlers BEFORE src
    img.onload = () => {
        console.log("Image loaded:", img.naturalWidth, img.naturalHeight);
        predict(img);
    };

    img.onerror = () => {
        console.error("Image failed to load");
        document.getElementById("label").innerText = "Image load error";
    };

    img.src = URL.createObjectURL(file);
});

// -------------------------------
// Optional: receive Base64 image from MIT App Inventor
// -------------------------------
function loadImageFromAI(base64) {
    const img = document.getElementById("preview");

    document.getElementById("label").innerText = "Loading image from app...";

    img.onload = () => {
        console.log("Base64 image loaded");
        predict(img);
    };

    img.onerror = () => {
        document.getElementById("label").innerText = "Image load error (AI)";
    };

    img.src = "data:image/jpeg;base64," + base64;
}

// -------------------------------
// Init
// -------------------------------
window.addEventListener("DOMContentLoaded", () => {
    loadModel();
});
