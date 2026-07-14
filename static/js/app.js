const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const statusMsg = document.getElementById("statusMsg");
const resultsSection = document.getElementById("results");
const originalImg = document.getElementById("originalImg");
const gradcamImg = document.getElementById("gradcamImg");
const scanSweep = document.getElementById("scanSweep");
const predictionLabel = document.getElementById("predictionLabel");
const ringFill = document.getElementById("ringFill");
const ringPct = document.getElementById("ringPct");
const RING_CIRC = 553;
const resetBtn = document.getElementById("resetBtn");

const CLASS_COLORS = {
  "Glioma": "#8A4B45",
  "Meningioma": "#B17C4B",
  "Pituitary": "#4F5D52",
  "No Tumor": "#6A7A5A"
};

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("dragover"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", e => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) handleFile(fileInput.files[0]);
});

resetBtn.addEventListener("click", () => {
  resultsSection.classList.remove("is-visible");
  fileInput.value = "";
  statusMsg.textContent = "";
  document.getElementById("scan").scrollIntoView({ behavior: "smooth" });
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    statusMsg.textContent = "Please upload an image file.";
    return;
  }

  statusMsg.textContent = "Loading scan…";
  const reader = new FileReader();
  reader.onload = () => {
    originalImg.src = reader.result;
    gradcamImg.removeAttribute("src");
    predictionLabel.textContent = "Analyzing…";
    predictionLabel.style.color = "";
    ringPct.textContent = "0%";
    ringFill.style.strokeDashoffset = RING_CIRC;

    resultsSection.classList.add("is-visible");
    scanSweep.classList.add("is-active");
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

    statusMsg.textContent = "Running inference…";

    const formData = new FormData();
    formData.append("image", file);

    fetch("/predict", { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => {
        scanSweep.classList.remove("is-active");
        if (data.error) { statusMsg.textContent = data.error; return; }
        predictionLabel.textContent = data.prediction;
        gradcamImg.src = data.gradcam + "?t=" + Date.now();
        ringPct.textContent = data.confidence + "%";
        requestAnimationFrame(() => {
          ringFill.style.strokeDashoffset = RING_CIRC - (RING_CIRC * data.confidence) / 100;
        });
        statusMsg.textContent = `Confidence: ${data.confidence}%`;
      })
      .catch(() => {
        scanSweep.classList.remove("is-active");
        statusMsg.textContent = "Prediction failed. Check server logs.";
      });
  };
  reader.readAsDataURL(file);
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in-view"); });
}, { threshold: 0.15 });
document.querySelectorAll(".section").forEach(s => revealObserver.observe(s));
