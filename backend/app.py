from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from PIL import Image
import io
import torch
import torch.nn as nn
import torchvision.transforms.functional as TF
import numpy as np
import os
import segmentation_models_pytorch as smp


class UNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=3):
        super(UNet, self).__init__()

        def conv_block(in_c, out_c):
            return nn.Sequential(
                nn.Conv2d(in_c, out_c, kernel_size=3, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_c, out_c, kernel_size=3, padding=1),
                nn.ReLU(inplace=True)
            )

        self.down1 = conv_block(in_channels, 64)
        self.pool1 = nn.MaxPool2d(2)
        self.down2 = conv_block(64, 128)
        self.pool2 = nn.MaxPool2d(2)

        self.bottleneck = conv_block(128, 256)

        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.upconv2 = conv_block(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.upconv1 = conv_block(128, 64)

        self.final = nn.Conv2d(64, out_channels, kernel_size=1)

    def forward(self, x):
        d1 = self.down1(x)
        p1 = self.pool1(d1)
        d2 = self.down2(p1)
        p2 = self.pool2(d2)

        b = self.bottleneck(p2)

        up2 = self.up2(b)
        merge2 = torch.cat([up2, d2], dim=1)
        u2 = self.upconv2(merge2)

        up1 = self.up1(u2)
        merge1 = torch.cat([up1, d1], dim=1)
        u1 = self.upconv1(merge1)

        return self.final(u1)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_binary = UNet(in_channels=3, out_channels=4).to(device)  
model_binary.load_state_dict(torch.load("best_model.pt", map_location=device))

model_multi = smp.UnetPlusPlus(
    encoder_name="resnet34",        # resnet for now
    encoder_weights="imagenet",     # pretrained weightss
    in_channels=3,
    classes=3,                      # multi-class 0,1,2
    activation=None             
).to(device)
model_multi.load_state_dict(torch.load("best_model_multi.pth", map_location=device))

class_colors = {
    0: (0, 0, 0),         # Black for background
    1: (0, 255, 0),       # Green for crop
    2: (255, 0, 0)        # Red for weed
}

app = Flask(__name__)
CORS(app)

@app.route("/segment", methods=["POST"])
def segment():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    mode = request.form['mode']
    image_file = request.files['image']
    image = Image.open(image_file.stream).convert("RGB")

    transform = TF.to_tensor(image)
    if mode == 'binary':
        transform = TF.resize(transform, [256, 256])  
    else:
        transform = TF.resize(transform, [288, 480])  
    transform = TF.normalize(transform, mean=[0.485, 0.456, 0.406],
                                      std=[0.229, 0.224, 0.225])
    input_tensor = transform.unsqueeze(0).to(device) 
    # Inference

    if mode == 'binary':
        model = model_binary
    else:
        model = model_multi
    
    model.eval()
    with torch.no_grad():
        output = model(input_tensor)
        pred = torch.argmax(output.squeeze(), dim=0).cpu().numpy()  # Shape: [H, W]

    # Convert prediction to image
    # Create color segmentation map
    h, w = pred.shape
    pred_img = np.zeros((h, w, 3), dtype=np.uint8)

    for class_idx, color in class_colors.items():
        pred_img[pred == class_idx] = color

    # Convert to PIL and resize
    pred_img = Image.fromarray(pred_img)
    pred_img = pred_img.resize(image.size)

    # Encode to base64
    buffer = io.BytesIO()
    pred_img.save(buffer, format="PNG")
    buffer.seek(0)
    encoded_image = base64.b64encode(buffer.read()).decode('utf-8')

    return jsonify({"result": encoded_image})

if __name__ == "__main__":
    app.run(debug=True)
