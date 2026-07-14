const originalImg = document.getElementById("originalImg");
const gradcamImg = document.getElementById("gradcamImg");
const predictionLabel = document.getElementById("predictionLabel");
const probBars = document.getElementById("probBars");
const statusMsg = document.getElementById("statusMsg");

const CLASS_COLORS = {
  "Glioma": "#8A4B45",
  "Meningioma": "#B17C4B",
  "Pituitary": "#4F5D52",
  "No Tumor": "#6A7A5A"
};

const dataUrl = sessionStorage.getItem("mri_image");
const filename = sessionStorage.getItem("mri_filename") || "scan.jpg";

if (!dataUrl) {
  statusMsg.textContent = "No image found. Go back and upload a scan.";
} else {
  originalImg.src = dataUrl;
  statusMsg.textContent = "Running inference…";
  predictionLabel.textContent = "Analyzing…";

  dataUrlToBlob(dataUrl).then(blob => {
    const formData = new FormData();
    formData.append("image", blob, filename);

    fetch("/predict", { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.error) { statusMsg.textContent = data.error; return; }
        predictionLabel.textContent = data.prediction;
        predictionLabel.style.color = CLASS_COLORS[data.prediction] || "#1A2233";
        gradcamImg.src = data.gradcam + "?t=" + Date.now();
        renderProbs(data.probabilities, data.prediction);
        statusMsg.textContent = `Confidence: ${data.confidence}%`;
      })
      .catch(() => { statusMsg.textContent = "Prediction failed. Check server logs."; });
  });
}

function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then(res => res.blob());
}

function renderProbs(probs, topLabel) {
  probBars.innerHTML = "";
  Object.entries(probs)
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, pct]) => {
      const color = CLASS_COLORS[label] || "#667085";
      const row = document.createElement("div");
      row.className = "prob-row" + (label === topLabel ? " prob-row-top" : "");
      row.innerHTML = `
        <span>${label}</span>
        <span class="prob-track"><span class="prob-fill" style="width:${pct}%;background:${color}"></span></span>
        <span class="prob-pct">${pct}%</span>
      `;
      probBars.appendChild(row);
    });
}
