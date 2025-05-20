from PIL import Image
from torch.utils.data.dataset import Dataset
from torchvision import transforms

class CropWeedDataset(Dataset):
    def __init__(self, image_paths, mask_paths, transform_size=(256, 256)):
        self.images = image_paths
        self.masks = mask_paths
        self.transform = transforms.Compose([
            transforms.Resize(transform_size),
            transforms.ToTensor()])

    def __getitem__(self, index):
        img = Image.open(self.images[index]).convert("RGB")
        mask = Image.open(self.masks[index]).convert("L")
        # Terapkan transform ke img dan mask
        img = self.transform(img)
        mask = self.transform(mask)  
        # Binary threshold
        mask = (mask > 0).float()
        return img, mask
    
    def __len__(self):
        return len(self.images)
