import torch
import pickle
import matplotlib.pyplot as plt
from torchvision import transforms
from PIL import Image
from unet import UNet
import torchvision
import os

SAVE_DIR = '../assets/for_app_predicted_masked'

def single_image_segment(image_pth, img_res):
    model_pth = '../saved/best_model_binary.pth'
    device =  "cuda" if torch.cuda.is_available() else "cpu"

    model = UNet(in_channels=3, num_classes=1).to(device)
    model.load_state_dict(torch.load(model_pth, map_location=device))
    model.eval()

    transform = transforms.Compose([
        transforms.Resize(img_res),
        transforms.ToTensor()
    ])
    img = transform(Image.open(image_pth).convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        pred_mask = model(img)

    pred_mask = torch.sigmoid(pred_mask)  
    pred_mask = (pred_mask > 0.5).float() 

    return pred_mask


def single_image_inference(image_pth, model_pth, img_res, device):
    

    model = UNet(in_channels=3, num_classes=1).to(device)
    model.load_state_dict(torch.load(model_pth, map_location=device))
    model.eval()

    # Transform image
    transform = transforms.Compose([
        transforms.Resize(img_res),
        transforms.ToTensor()
    ])
    img = transform(Image.open(image_pth).convert("RGB")).unsqueeze(0).to(device)

    # Inference
    with torch.no_grad():
        pred_mask = model(img)

    pred_mask = torch.sigmoid(pred_mask) 
    pred_mask = (pred_mask > 0.5).float()  

    # pred_mask = F.interpolate(pred_mask, size=(1088, 1920), mode='bilinear', align_corners=False)

    # Get filename wo ext
    img_name_wo_ext = os.path.splitext(os.path.basename(image_pth))[0]

    # Save prediction mask as single png
    save_path = f"{SAVE_DIR}/pred_{img_name_wo_ext}.png"
    torchvision.utils.save_image(pred_mask.cpu(), save_path)



    # Squeeze and permute for saving/visualization
    img = img.squeeze(0).cpu().detach()
    img = img.permute(1, 2, 0)  # Convert to HWC format for visualization

    pred_mask = pred_mask.squeeze(0).cpu().detach()
    pred_mask = pred_mask.permute(1, 2, 0)  # Convert to HWC format for visualization

    fig = plt.figure(figsize=(10, 5))
    for i in range(1, 3):
        fig.add_subplot(1, 2, i)
        if i == 1:
            plt.imshow(img)
            plt.title("Input Image")
        else:
            plt.imshow(pred_mask)
            plt.title("Predicted Mask")

    save_path = f"{SAVE_DIR}/comparison_{img_name_wo_ext}.png"
    plt.savefig(save_path)
    # plt.show()
    plt.close()


if __name__ == "__main__":
    SINGLE_IMG_PATH = "../assets/for_app_original/ave-0035-0014.jpg"
    MODEL_PATH = "../saved/best_model_binary.pth"
    IMG_RES = (512, 896)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    single_image_inference(SINGLE_IMG_PATH, MODEL_PATH, IMG_RES, device)
