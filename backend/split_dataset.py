import os
from sklearn.model_selection import train_test_split
import pickle

image_dir = "../assets/original"
mask_dir = "../assets/masked"

image_filenames = sorted(os.listdir(image_dir))  # Sort to match images & masks
mask_filenames = sorted(os.listdir(mask_dir))

# Full paths
images = [os.path.join(image_dir, fname) for fname in image_filenames]
masks = [os.path.join(mask_dir, fname) for fname in mask_filenames]

# Split
train_imgs, val_imgs, train_masks, val_masks = train_test_split(
    images, masks, test_size=0.2, random_state=42
)

# Save paths as pickle file
with open("./assets/split_paths.pkl", "wb") as f:
    pickle.dump((train_imgs, val_imgs, train_masks, val_masks), f)
