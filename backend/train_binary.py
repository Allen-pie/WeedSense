import torch
import pickle
from torch import optim, nn
from torch.utils.data import DataLoader
from tqdm import tqdm
from unet import UNet
from cropweed_dataset import CropWeedDataset
import os

CHECK_POINT_PATH = '../saved/training_checkpoint_binary.pth'

def binary_accuracy(y_pred, y_true, threshold=0.5):
    y_pred = torch.sigmoid(y_pred)
    y_pred = (y_pred > threshold).float()
    correct = (y_pred == y_true).float()
    acc = correct.sum() / correct.numel()
    return acc

def dice_score(pred, target, threshold=0.5, eps=1e-6):
    pred = torch.sigmoid(pred)  # karena pakai BCEWithLogitsLoss
    pred = (pred > threshold).float()

    intersection = (pred * target).sum(dim=(1, 2, 3))
    union = pred.sum(dim=(1, 2, 3)) + target.sum(dim=(1, 2, 3))

    dice = (2. * intersection + eps) / (union + eps)
    return dice.mean().item()


if __name__ == "__main__":
    
    with open("../assets/split_paths.pkl", "rb") as f:
        train_imgs, val_imgs, train_masks, val_masks = pickle.load(f)

    LEARNING_RATE = 3e-4
    EPOCHS = 30
    MODEL_SAVE_PATH = "../saved/best_model_binary.pth"
     
    # BATCH_SIZE = 5 
    # IMG_SIZE = (512, 896)

    BATCH_SIZE = 20 
    IMG_SIZE = (256, 256)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    
   
    train_dataset = CropWeedDataset(train_imgs, train_masks, IMG_SIZE)
    val_dataset = CropWeedDataset(val_imgs, val_masks, IMG_SIZE)

    train_dataloader = DataLoader(dataset=train_dataset,
                                batch_size=BATCH_SIZE,
                                shuffle=True)
    val_dataloader = DataLoader(dataset=val_dataset,
                                batch_size=BATCH_SIZE,
                                shuffle=True)

    model = UNet(in_channels=3, num_classes=1).to(device)
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE)

    criterion = nn.BCEWithLogitsLoss()

    start_epoch = 0

    # load hasil pause kalo ada
    if os.path.exists(CHECK_POINT_PATH):
        checkpoint = torch.load(CHECK_POINT_PATH)
        model.load_state_dict(checkpoint['model_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        start_epoch = checkpoint['epoch'] + 1 
        print(f"Checkpoint loaded. Resuming from epoch {start_epoch + 1}")

    else:
        print("No checkpoint found. Starting training from scratch.")

   
    for epoch in tqdm(range(start_epoch, EPOCHS)):
        model.train()

        train_running_loss = 0
        train_dice_total = 0
        train_acc_total = 0
        
        # training
        for idx, img_mask in enumerate(tqdm(train_dataloader)):
            img = img_mask[0].float().to(device)
            mask = img_mask[1].float().to(device)

            # print(f"img shape: {img.shape}, mask shape: {mask.shape}")

            y_pred = model(img)
            optimizer.zero_grad()

            loss = criterion(y_pred, mask)
            train_running_loss += loss.item()
            
            dice = dice_score(y_pred, mask)
            train_dice_total += dice

            acc = binary_accuracy(y_pred, mask)
            train_acc_total += acc

            loss.backward()
            optimizer.step()

        train_loss = train_running_loss / (idx + 1)
        train_dice = train_dice_total / (idx + 1)
        train_acc = train_acc_total / (idx + 1)

        model.eval()

        val_running_loss = 0
        val_dice_total = 0
        val_acc_total = 0

        # validating
        with torch.no_grad():
            for idx, img_mask in enumerate(tqdm(val_dataloader)):
                img = img_mask[0].float().to(device)
                mask = img_mask[1].float().to(device)
                
                y_pred = model(img)
                loss = criterion(y_pred, mask)
                val_running_loss += loss.item()

                dice = dice_score(y_pred, mask)
                val_dice_total += dice

                acc = binary_accuracy(y_pred, mask)
                val_acc_total += acc

            val_loss = val_running_loss / (idx + 1)
            val_dice = val_dice_total / (idx + 1)
            val_acc = val_acc_total / (idx + 1)

     
        print("-"*30)
        print(f"Train Loss EPOCH {epoch+1}: {train_loss:.4f} | Dice: {train_dice:.4f} | Acc: {train_acc:.4f}")
        print(f"Valid Loss EPOCH {epoch+1}: {val_loss:.4f} | Dice: {val_dice:.4f} | Acc: {val_acc:.4f}")
        print("-"*30)

        checkpoint = {
                    'epoch': epoch,
                    'model_state_dict': model.state_dict(),
                    'optimizer_state_dict': optimizer.state_dict()
        }
        torch.save(checkpoint, CHECK_POINT_PATH)
        print('Training Saved at Epoch ', epoch + 1)


    torch.save(model.state_dict(), MODEL_SAVE_PATH)
