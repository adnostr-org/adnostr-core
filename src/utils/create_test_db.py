import sqlite3
import os

def create_mini_db():
    db_path = "test_experts.db"
    # 如果已存在則刪除重來
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 模擬 avatar_queue 表結構
    cursor.execute('''
        CREATE TABLE avatar_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expert_id INTEGER,
            expert_name TEXT,
            status TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 插入 20 條精選數據
    # 注意：這裡的 image_url 我們模擬你數據庫裡的真實格式
    test_data = []
    for i in range(1, 21):
        # 1-10 號給頭像，11-20 號給橫幅，模擬雙重素材
        if i <= 10:
            img_url = f"/static/avatars/expert_{i}_v0.png"
        else:
            img_url = f"/static/covers/horizontal/cover_h_{i-10}_20260315.png"
            
        test_data.append((i, f"Expert_Elite_{i}", 'completed', img_url))

    cursor.executemany(
        "INSERT INTO avatar_queue (expert_id, expert_name, status, image_url) VALUES (?, ?, ?, ?)",
        test_data
    )

    conn.commit()
    conn.close()
    print(f"✅ 成功創建『精銳 20』測試數據庫：{db_path}")

if __name__ == "__main__":
    create_mini_db()