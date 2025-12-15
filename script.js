let model;
let maxPredictions;

async function loadModel() {
    // Try BOTH locations (model/ folder and root)
    const possiblePaths = [
        "https://pepalakrotiriou.github.io/potatocare/model/model.json"
    ];
    
    let modelLoaded = false;
    
    for (const baseURL of possiblePaths) {
        const modelURL = baseURL;
        const metadataURL = baseURL.replace('model.json', 'metadata.json');
        
        console.log(`Trying to load model from: ${modelURL}`);
        
        try {
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();
            console.log(`Model loaded from: ${modelURL}`);
            console.log(`Model has ${maxPredictions} classes`);
            
            // Get class names
            const classNames = model.getClassLabels();
            console.log("Class names:", classNames);
            
            document.getElementById("label").innerText = `Model ready (${maxPredictions} classes). Upload an image.`;
            modelLoaded = true;
            break;
        } catch (err) {
            console.log(`Failed from ${modelURL}:`, err.message);
        }
    }
    
    if (!modelLoaded) {
        console.error("All model loading attempts failed");
        document.getElementById("label").innerText = "Error: Could not load model from any location!";
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
        // Make prediction
        const prediction = await model.predict(imgElement);
        
        // DEBUG: Log everything
        console.log("=== PREDICTION RESULTS ===");
        console.log("Raw prediction array:", prediction);
        
        let resultHTML = "<h3>Prediction Results:</h3>";
        let bestClass = "Unknown";
        let bestProb = 0;
        
        // Check each class
        for (let i = 0; i < prediction.length; i++) {
            const item = prediction[i];
            console.log(`Class ${i}:`, item);
            
            const className = item.className || `Class ${i}`;
            const probability = Number(item.probability);
            
            console.log(`${className}: ${probability} (${probability * 100}%)`);
            
            // Check if probability is valid
            if (isNaN(probability)) {
                console.error(`Probability for ${className} is NaN!`);
                resultHTML += `<div style="color: red">${className}: INVALID (NaN)</div>`;
            } else {
                const percentage = (probability * 100).toFixed(2);
                resultHTML += `<div>${className}: ${percentage}%</div>`;
                
                if (probability > bestProb) {
                    bestProb = probability;
                    bestClass = className;
                }
            }
        }
        
        // Display results
        document.getElementById("label").innerHTML = resultHTML;
        
        if (bestProb > 0) {
            const displayText = `${bestClass} (${(bestProb * 100).toFixed(1)}%)`;
            console.log("Best result:", displayText);
            document.title = bestClass;
            // SEND RESULT BACK TO APP INVENTOR
            try {
                AppInventor.setWebViewString(bestClass + ": " + (bestProb * 100).toFixed(2) + "%");
            } catch(e) {
                console.log("AppInventor interface not available");
            }
        } else {
            console.error("No valid probabilities found!");
            document.title = "ERROR";
        }
        
    } catch (err) {
        console.error("Prediction error:", err);
        document.getElementById("label").innerHTML = `<div style="color: red">Prediction error: ${err.message}</div>`;
        document.title = "ERROR";
    }
}

// File upload handler
document.getElementById("imageInput").addEventListener("change", function (evt) {
    const file = evt.target.files[0];
    const img = document.getElementById("preview");

    if (!file) return;

    img.src = URL.createObjectURL(file);
    document.getElementById("label").innerText = "Processing image...";

    img.onload = function () {
        predict(img);
    };
});

// Load model when page loads
window.addEventListener('DOMContentLoaded', (event) => {
    console.log("Page loaded, loading model...");
    loadModel();
});
