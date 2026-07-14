\# NeuroMap — Brain Tumor MRI Classification with Grad-CAM



NeuroMap is a deep learning web app that classifies brain MRI scans into four

categories — \*\*glioma\*\*, \*\*meningioma\*\*, \*\*pituitary tumor\*\*, or \*\*no tumor\*\* —

and pairs every prediction with a \*\*Grad-CAM heatmap\*\*, so you can see exactly

which region of the scan drove the model's decision.



Upload a scan → the model classifies it → the heatmap shows you why.





\## Why Grad-CAM



A confidence score alone doesn't tell you whether a model is looking at the

tumor or at some unrelated artifact in the scan. Grad-CAM traces gradients

back to the last convolutional layer and overlays the resulting activation

map on the original image, turning the prediction into something that can

actually be visually verified against the scan.



\## Model



\- Custom CNN with residual blocks, trained \*\*from scratch\*\* — no pretrained

&#x20; weights, no transfer learning.

\- \*\*94% test accuracy\*\* on the \[Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset)

&#x20; by Masoud Nickparvar (Kaggle) — 7,000+ scans across 4 classes.

\- Weighted loss to handle class imbalance, label smoothing to reduce

&#x20; overconfidence, AdamW optimizer with L2 regularization.

\- Trained on Google Colab (T4 GPU). Training notebook: \[Colab link](https://colab.research.google.com/drive/1UnmS1kCR0B29uACU3MyHxgrkPJgDUspN)



\## Tech stack



Python · TensorFlow / Keras · OpenCV · Flask · NumPy · HTML / CSS / JS



\## Project structure



```

NeuroMap/

├── app.py                # Flask routes: / /results /predict

├── predict.py            # preprocessing + inference

├── gradcam.py             # Grad-CAM heatmap + overlay generation

├── requirements.txt

├── model/

│   └── best\_model.keras   # not included in repo — see "Model weights" below

├── templates/

│   ├── index.html         # upload + live results (scrolling single page)

│   └── results.html

└── static/

&#x20;   ├── css/style.css

&#x20;   ├── js/app.js, results.js

&#x20;   ├── uploads/            # saved scans (runtime, gitignored)

&#x20;   └── gradcam/            # generated heatmaps (runtime, gitignored)

```



\## Setup



```bash

git clone https://github.com/<your-username>/NeuroMap.git

cd NeuroMap

python -m venv venv

source venv/bin/activate        # Windows: venv\\Scripts\\activate

pip install -r requirements.txt

```



\### Model weights



`best\_model.keras` isn't included in this repo (over GitHub's 100MB file

limit). Download it from \*\*\[link your hosted weights here — e.g. Hugging

Face / Google Drive]\*\* and place it at:



```

model/best\_model.keras

```



\### Run



```bash

python app.py

```



Open `http://127.0.0.1:5000`



\## API



```

POST /predict

Form Data:

&#x20;   image: MRI scan file (JPG/PNG)



Response:

{

&#x20; "prediction": "pituitary",

&#x20; "confidence": 91.7,

&#x20; "probabilities": { "pituitary": 91.7, "glioma": 3.23, "notumor": 2.86, "meningioma": 2.22 },

&#x20; "gradcam": "static/gradcam/gradcam\_xxxx.jpg"

}

```



\## Disclaimer



This is a research and educational project. It is \*\*not\*\* a diagnostic

medical device and should never replace clinical judgment.



\## License



For educational and research purposes only.

