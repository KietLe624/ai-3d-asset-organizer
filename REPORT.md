# 📋 REPORT – AI 3D Asset Organizer

> **Ứng viên:** [Họ và tên]
> **Vị trí:** Thực tập sinh Công nghệ – Star Global
> **Option thực hiện:** Option B – AI 3D Asset Organizer
> **Thời gian hoàn thành:** 2 ngày

---

## 1. Mô tả chức năng đã làm

### Tổng quan
Xây dựng một mini web app cho phép người dùng nhập danh sách asset/phòng của một dự án 3D (dạng text thô hoặc JSON), sau đó dùng AI (Gemini 3.1 Flash Lite) để tự động phân tích và trả về kết quả có cấu trúc.

### Chức năng cụ thể

#### Frontend (Angular)
- **Form nhập liệu:** Textarea cho phép nhập text thô hoặc JSON tự do
- **Validate client-side:** Kiểm tra input rỗng trước khi gọi API, hiển thị thông báo lỗi rõ ràng
- **Loading state:** Spinner + disable button khi đang chờ AI xử lý
- **Error handling:** Hiển thị lỗi cụ thể từ backend (network error, validation error, AI error)
- **Hiển thị kết quả 2 chế độ:**
  - **Tab Bảng:** Metadata dự án, bảng phân loại asset theo nhóm, bảng slug gợi ý, danh sách đề xuất cải thiện
  - **Tab JSON:** Raw JSON output với nút copy clipboard
- **Load ví dụ:** Nút tải dữ liệu mẫu để user thử nhanh

#### Backend (Node.js + Express)
- **Endpoint:** `POST /api/organize-assets`
- **Validate middleware:** Kiểm tra input rỗng, quá ngắn (<5 ký tự), quá dài (>10,000 ký tự)
- **Gemini integration:** Gọi Gemini 1.5 Flash với prompt yêu cầu JSON output có cấu trúc
- **Mock fallback:** Tự động dùng mock data nếu không có API key (`USE_MOCK=true`)
- **Health check endpoint:** `GET /health` để Docker kiểm tra server sống
- **Error phân loại:** Phân biệt lỗi AI vs lỗi server nội bộ trong response

#### DevOps
- **Docker Compose:** Orchestrate cả frontend (Nginx) + backend (Node) bằng 1 lệnh
- **Multi-stage build:** Frontend build Angular → serve bằng Nginx Alpine (image nhỏ gọn)
- **Nginx proxy:** Frontend proxy `/api` đến backend, tránh CORS issue trong production

### Output AI trả về
```json
{
  "classifications": { "Nhóm": ["slug-asset"] },
  "slugs": { "Tên gốc": "slug-goi-y" },
  "metadata": { "total_assets", "project_type", "estimated_scale", "primary_zones" },
  "improvements": ["đề xuất 1", "đề xuất 2", "đề xuất 3"]
}
```

---

## 2. Cách dùng AI/LLM trong dự án

### AI tool đã dùng
- **Claude (claude.ai):** Hỗ trợ lên kiến trúc, review logic, viết prompt template
- **Gemini 3.1 Flash Lite (Google AI Studio):** LLM được tích hợp trực tiếp vào app để xử lý asset

### Dùng để làm gì
| Mục đích | Tool |
|---|---|
| Thiết kế cấu trúc project, luồng xử lý | Claude |
| Viết và tối ưu prompt gửi cho Gemini | Claude |
| Xử lý phân loại asset, sinh slug, đề xuất cải thiện | Gemini 3.1 Flash Lite (runtime) |
| Review edge case khi parse JSON response | Claude |

### Prompt mẫu gửi cho Gemini

**Prompt 1 – Yêu cầu structured output:**
```
Bạn là chuyên gia tổ chức và quản lý nội dung dự án 3D/không gian số hóa.

Phân tích danh sách asset/phòng sau đây và trả về KẾT QUẢ DƯỚI DẠNG JSON THUẦN TÚY
(không markdown, không giải thích thêm):

INPUT:
Phòng khách, phòng ngủ master, phòng ngủ 2, bếp, nhà tắm, ban công

YÊU CẦU OUTPUT JSON với cấu trúc chính xác:
{
  "classifications": { "<nhóm>": ["<slug>"] },
  "slugs": { "<tên gốc>": "<slug>" },
  "metadata": { "total_assets": N, "project_type": "...", ... },
  "improvements": ["...", "...", "..."]
}
CHỈ trả về JSON, không có text nào khác.
```

**Prompt 2 – Test edge case với input JSON:**
```
INPUT là JSON: [{"name": "Master Bedroom"}, {"name": "Living Room"}, {"name": "Kho"}]
Hãy phân loại và sinh slug theo chuẩn kebab-case tiếng Anh.
```

### Cách kiểm tra lại output của AI

1. **Validate cấu trúc JSON:** Code kiểm tra 4 field bắt buộc (`classifications`, `slugs`, `metadata`, `improvements`) sau khi parse
2. **Kiểm tra bằng mắt:** So sánh slug output có đúng định dạng `kebab-case`, không dấu, không ký tự đặc biệt
3. **Test nhiều loại input:** Thử text thô tiếng Việt, JSON tiếng Anh, input hỗn hợp → kiểm tra AI có xử lý nhất quán không
4. **Mock data làm baseline:** Dùng mock response cố định để so sánh khi AI trả về kết quả bất thường
5. **Log raw response:** In `responseText` ra console trước khi parse, dễ debug khi Gemini trả về markdown thừa

---

## 3. Khó khăn gặp phải

### Khó khăn 1: Gemini không luôn trả về JSON thuần túy
**Vấn đề:** Gemini đôi khi wrap response trong markdown code block (` ```json ... ``` `), khiến `JSON.parse()` throw error.

**Giải pháp:** Thêm bước làm sạch response bằng regex trước khi parse:
```javascript
const cleaned = responseText
  .replace(/```json\n?/g, '')
  .replace(/```\n?/g, '')
  .trim();
```

### Khó khăn 2: CORS khi frontend Angular gọi backend
**Vấn đề:** Khi chạy local (`localhost:4200` → `localhost:3000`), browser block request do CORS policy.

**Giải pháp:** Cấu hình `cors` middleware trong Express cho phép origin `localhost:4200`. Trong Docker production, dùng Nginx proxy `/api` để bypass hoàn toàn.

### Khó khăn 3: Docker build Angular lần đầu chậm
**Vấn đề:** `npm install` trong Docker mỗi lần rebuild tốn 2-3 phút vì không cache `node_modules`.

**Giải pháp:** Tách `COPY package*.json` và `RUN npm install` thành layer riêng trước `COPY . .` — Docker cache lại layer install nếu `package.json` không thay đổi.

---

## 4. Ba lỗi / điểm chưa hợp lý đã quan sát

### Lỗi #1: Không có timeout cho Gemini API call
**Mô tả:** Nếu Gemini phản hồi chậm hoặc không phản hồi, request sẽ treo vô thời hạn. Frontend hiển thị loading mãi, user không biết có lỗi hay không.

**Mức độ ảnh hưởng:** ⚠️ **Trung bình** – Gây trải nghiệm xấu, user phải tự reload trang.

**Đề xuất cải thiện:** Thêm `AbortController` với timeout 30 giây phía backend. Sau timeout, trả về lỗi `504 Gateway Timeout` rõ ràng thay vì treo mãi.

---

### Lỗi #2: Frontend dùng URL backend hardcode (`localhost:3000`)
**Mô tả:** URL `http://localhost:3000` được hardcode trong `asset.service.ts`. Khi deploy lên server thật hoặc đổi port, phải sửa code và build lại.

**Mức độ ảnh hưởng:** ⚠️ **Trung bình** – Không ảnh hưởng khi chạy local, nhưng gây khó khăn khi deploy production hoặc thay đổi môi trường.

**Đề xuất cải thiện:** Dùng Angular `environment.ts` để quản lý API URL theo môi trường:
```typescript
// environment.development.ts
export const environment = { apiUrl: 'http://localhost:3000/api' };

// environment.production.ts
export const environment = { apiUrl: '/api' }; // Nginx proxy
```

---

### Lỗi #3: Không có rate limiting trên API
**Mô tả:** Endpoint `POST /api/organize-assets` không giới hạn số lượng request. User (hoặc bot) có thể gọi liên tục, nhanh chóng làm cạn quota Gemini API key miễn phí (60 requests/phút với free tier).

**Mức độ ảnh hưởng:** 🔴 **Cao** – Có thể gây mất tiền hoặc block API key trong môi trường production.

**Đề xuất cải thiện:** Tích hợp `express-rate-limit` để giới hạn số request:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 60_000, max: 10 }); // 10 req/phút/IP
app.use('/api', limiter);
```

---

## 5. Hướng cải thiện nếu có thêm thời gian

| Ưu tiên | Cải thiện | Lý do |
|---|---|---|
| Cao | Thêm rate limiting | Bảo vệ API key, tránh abuse |
| Cao | Timeout cho Gemini call | UX tốt hơn khi AI chậm |
| Trung bình | Dùng `environment.ts` cho API URL | Dễ deploy nhiều môi trường |
| Thấp | Export kết quả ra file CSV/JSON | Tăng tính thực dụng cho workflow thực tế |
| Thấp | Hỗ trợ input upload file `.json` | Dễ dùng hơn khi dự án có nhiều asset |
| Thấp | Unit test cho `validate.js` và `gemini.js` | Đảm bảo code ổn định khi mở rộng |
