from flask import Flask, request
from flask_cors import CORS
from inference import single_image_segment
from werkzeug.utils import secure_filename
import uuid
import torchvision
import os
import io
import base64


app = Flask(__name__)
CORS(app)

SAVE_DIR = '../assets/tes'


def convertToBase64(mask):
    buffer = io.BytesIO()
    torchvision.utils.save_image(mask.cpu(), buffer, format="PNG")
    buffer.seek(0)

    img_base64 = base64.b64encode(buffer.read()).decode('utf-8')

    return {
        "message": "Segmentation successful",
        "result": img_base64
    }



@app.route('/segment-image', methods=['POST'])
def segmentImage():
    
    if 'image' not in request.files:
        return {"error": "No file part"}, 400

    image = request.files['image']

    img_name_wo_ext = os.path.splitext((image.filename))[0]

    filename = secure_filename(str(uuid.uuid4()) + "_" + img_name_wo_ext)

    img_res = (512, 896)

    mask = single_image_segment(image.stream, img_res)

    return convertToBase64(mask)
    
    # save_path = f"{SAVE_DIR}/pred_{filename}.png"
    # torchvision.utils.save_image(mask.cpu(), save_path)

    # # image_path = os.path.join('./assets/tes', filename)
    # # image.save(image_path)
    
    # print("Received file:", image)
    # return {"message": f"File saved as {filename}"}

if __name__ == '__main__':
    app.run(debug=True)

