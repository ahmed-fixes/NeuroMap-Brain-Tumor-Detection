import os, uuid
from flask import Flask, request, jsonify, render_template
from predict import load_model, predict_image

app = Flask(__name__)
UPLOAD_DIR = "static/uploads"
GRADCAM_DIR = "static/gradcam"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GRADCAM_DIR, exist_ok=True)

model = load_model("model/best_model.keras")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/results")
def results_page():
    return render_template("results.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    uid = uuid.uuid4().hex

    original_path = os.path.join(UPLOAD_DIR, f"{uid}{ext}")
    file.save(original_path)

    gradcam_path = os.path.join(GRADCAM_DIR, f"{uid}_cam.jpg")

    result = predict_image(model, original_path, gradcam_path)

    return jsonify({
        "prediction": result["label"],
        "confidence": result["confidence"],
        "probabilities": result["probabilities"],
        "original": "/" + original_path,
        "gradcam": "/" + gradcam_path
    })

if __name__ == "__main__":
    app.run(debug=True)
