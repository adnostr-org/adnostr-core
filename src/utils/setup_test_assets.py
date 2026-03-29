import os
import shutil
import random
import glob

def setup_assets():
    # 1. 定義路徑
    BASE_DIR = "/www/wwwroot/adnostr-core/static/tests"
    SOURCE_AVATARS = "/www/wwwroot/TickleBell_Factory/static/avatars/*.png"
    SOURCE_BANNERS = "/www/wwwroot/TickleBell_Factory/static/covers/horizontal/*.png"
    
    TARGET_AVATARS = os.path.join(BASE_DIR, "avatars")
    TARGET_BANNERS = os.path.join(BASE_DIR, "banners")

    # 確保目標目錄存在
    os.makedirs(TARGET_AVATARS, exist_ok=True)
    os.makedirs(TARGET_BANNERS, exist_ok=True)

    # 2. 處理頭像 (Avatars) - 隨機抽 10 張
    avatar_files = glob.glob(SOURCE_AVATARS)
    if len(avatar_files) >= 10:
        selected_avatars = random.sample(avatar_files, 10)
        for i, src in enumerate(selected_avatars, 101): # 從 1 開始編號
            # 這裡我們按照 test_experts.db 的邏輯命名：expert_1_v0.png
            index = i - 100
            dst = os.path.join(TARGET_AVATARS, f"expert_{index}_v0.png")
            shutil.copy(src, dst)
            print(f"✅ Avatars: {os.path.basename(src)} -> expert_{index}_v0.png")
    else:
        print(f"❌ 錯誤：源頭像目錄圖片不足 10 張！(目前只有 {len(avatar_files)} 張)")

    # 3. 處理橫幅 (Banners) - 隨機抽 10 張
    banner_files = glob.glob(SOURCE_BANNERS)
    if len(banner_files) >= 10:
        selected_banners = random.sample(banner_files, 10)
        for i, src in enumerate(selected_banners, 101):
            index = i - 100
            dst = os.path.join(TARGET_BANNERS, f"cover_h_{index}_20260315.png")
            shutil.copy(src, dst)
            print(f"✅ Banners: {os.path.basename(src)} -> cover_h_{index}_20260315.png")
    else:
        print(f"❌ 錯誤：源橫幅目錄圖片不足 10 張！")

    print(f"\n🚀 『精銳 20』素材已就位！路徑：{BASE_DIR}")

if __name__ == "__main__":
    setup_assets()