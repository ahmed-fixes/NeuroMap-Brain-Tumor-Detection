import numpy as np
import tensorflow as tf
import cv2
from PIL import Image
from gradcam import make_gradcam_heatmap, overlay_heatmap

IMG_SIZE = (224, 224)
CLASS_NAMES = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]  # match training order
LAST_CONV_LAYER = "activation_17"  # change to your model's actual last conv layer name


def load_model(path):
    return tf.keras.models.load_model(path)


def preprocess(image_path):
    pil_img = Image.open(image_path).convert("RGB").resize(IMG_SIZE)
    arr = np.array(pil_img).astype(np.float32) / 255.0
    return arr, np.expand_dims(arr, axis=0)


def predict_image(model, image_path, gradcam_out_path):
    arr, batch = preprocess(image_path)

    preds = model.predict(batch, verbose=0)[0]
    idx = int(np.argmax(preds))

    result = {
        "label": CLASS_NAMES[idx],
        "confidence": round(float(preds[idx]) * 100, 2),
        "probabilities": {CLASS_NAMES[i]: round(float(p) * 100, 2) for i, p in enumerate(preds)}
    }

    # Grad-CAM (skip cleanly if class has no tumor / layer mismatch)
    try:
        heatmap = make_gradcam_heatmap(batch, model, LAST_CONV_LAYER)
        overlay = overlay_heatmap((arr * 255).astype(np.uint8), heatmap)
        cv2.imwrite(gradcam_out_path, overlay)
    except Exception as e:
        print("Grad-CAM failed:", e)

    return result
