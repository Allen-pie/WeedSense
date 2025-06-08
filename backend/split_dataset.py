import os
from sklearn.model_selection import train_test_split
import pickle

image_dir = "../assets/original"
mask_dir = "../assets/masked"

test_dir = '../assets/for_app_original'
test_mask_dir = '../assets/for_app_masked'

image_filenames = sorted(os.listdir(image_dir))  # Sort to match images & masks
mask_filenames = sorted(os.listdir(mask_dir))

test_filenames = os.listdir(test_dir)
mask_test_filenames = os.listdir(test_mask_dir)

# Full paths
images = [os.path.join(image_dir, fname) for fname in image_filenames if fname not in test_filenames and fname != 'README.md']
masks = [os.path.join(mask_dir, fname) for fname in mask_filenames if fname not in mask_test_filenames and fname != 'README.md']

print('len img', len(images)) # 8024 = true
print('len mask', len(masks)) # 8024 = true

# Split
train_imgs, val_imgs, train_masks, val_masks = train_test_split(
    images, masks, test_size=0.2, random_state=42
)

# Save paths as pickle file
with open("../assets/split_paths.pkl", "wb") as f:
    pickle.dump((train_imgs, val_imgs, train_masks, val_masks), f)
