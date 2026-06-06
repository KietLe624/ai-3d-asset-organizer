# 🏗️ AI 3D Asset Organizer

Mini web app phân loại và tổ chức nội dung dự án 3D bằng AI (Gemini).

---

## 📁 Cấu trúc dự án

```
ai-3d-asset-organizer/
├── backend/
│   ├── app.js                  # Entry point Express
│   ├── routes/app.route.js         # POST /api/organize-assets
│   ├── services/gemini-api.js         # Gemini AI integration + mock
│   ├── middlewares/validate.js    # Input validation
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── asset-organizer/   # Component chính
│   │   ├── services
|   |   |   ├──/asset.ts  # HTTP service
|   |   |   ├──/history.ts   
│   │   └── models/asset.model.ts         # TypeScript interfaces
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
|__ REPOTR.md
---
```
## 🚀 Cách chạy

### Yêu cầu
- Node.js >= 18
- Angular CLI (`npm install -g @angular/cli`)

### Bước 1: Clone và cấu hình

```bash
git clone <repo-url>
cd ai-3d-asset-organizer
```

### Bước 2: Cấu hình API Key

```bash
cd backend
cp .env.example .env
```

Mở file `.env` và chỉnh sửa:

```env
# Nếu có Gemini key:
GEMINI_API_KEY=your_key_here
USE_MOCK=false

# Nếu chưa có key (dùng mock data):
GEMINI_API_KEY=
USE_MOCK=true
```

> Lấy Gemini API key miễn phí tại: https://aistudio.google.com/app/apikey

### Bước 3: Chạy Backend

```bash
cd backend
npm install
npm run dev     # http://localhost:3000
hoặc node app.js
```

### Bước 4: Chạy Frontend

Mở terminal mới:

```bash
cd frontend
npm install
ng serve( ng s -o)        # http://localhost:4200
```

---

## 📡 API Reference

### `POST /api/organize-assets`

**Request body:**
```json
{
  "assetInput": "Phòng khách, phòng ngủ master, bếp, nhà tắm..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "classifications": {
      "Phòng ngủ": ["master-bedroom-01", "bedroom-02"],
      "Khu vực công cộng": ["living-room-01", "kitchen-01"]
    },
    "slugs": {
      "Phòng khách": "living-room-01"
    },
    "metadata": {
      "total_assets": 6,
      "project_type": "Căn hộ",
      "estimated_scale": "Trung bình",
      "primary_zones": ["Sinh hoạt", "Nghỉ ngơi"]
    },
    "improvements": [
      "Thêm prefix theo tầng: floor01_living_room",
      "Dùng tiếng Anh nhất quán cho slug"
    ]
  },
  "processedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Mô tả lỗi",
  "detail": "Chi tiết kỹ thuật"
}
```

---

## 🧪 Test nhanh bằng curl

```bash
curl -X POST http://localhost:3000/api/organize-assets \
  -H "Content-Type: application/json" \
  -d '{"assetInput": "Phòng khách, phòng ngủ, bếp, nhà tắm, ban công"}'
```

