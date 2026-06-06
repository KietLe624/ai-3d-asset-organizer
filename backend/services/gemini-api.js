const { GoogleGenerativeAI } = require("@google/generative-ai");

// ─── Mock data fallback khi không có API key ───────────────────────────────
const getMockResponse = (inputText) => ({
  classifications: {
    "Phòng ngủ": ["master_bedroom", "bedroom_02", "bedroom_03"],
    "Khu vực công cộng": ["living_room", "dining_room", "kitchen"],
    "Khu vực phụ trợ": ["bathroom_01", "bathroom_02", "balcony"],
    "Khu vực kỹ thuật": ["storage_room", "electrical_cabinet"],
  },
  slugs: {
    "Phòng ngủ master": "master-bedroom-01",
    "Phòng ngủ 2": "bedroom-02",
    "Phòng khách": "living-room-01",
    "Phòng bếp": "kitchen-01",
    "Nhà tắm": "bathroom-01",
    "Ban công": "balcony-01",
  },
  metadata: {
    total_assets: 9,
    project_type: "Căn hộ chung cư",
    estimated_scale: "Trung bình (80-100m²)",
    primary_zones: ["Sinh hoạt", "Nghỉ ngơi", "Phụ trợ"],
    generated_at: new Date().toISOString(),
    source_input: inputText.substring(0, 100) + "...",
  },
  improvements: [
    "Thêm prefix theo tầng để dễ quản lý đa tầng: 'floor01_living_room'",
    "Tách riêng nhóm asset kỹ thuật (điện, nước, HVAC) thành category độc lập",
    "Dùng tiếng Anh nhất quán cho toàn bộ slug để tránh lỗi encoding",
  ],
});

// ─── Prompt template gửi cho Gemini ───────────────────────────────────────
const buildPrompt = (inputText) => `
Bạn là chuyên gia tổ chức và quản lý nội dung dự án 3D/không gian số hóa.

Phân tích danh sách asset/phòng sau đây và trả về KẾT QUẢ DƯỚI DẠNG JSON THUẦN TÚY (không markdown, không giải thích thêm):

INPUT:
${inputText}

YÊU CẦU OUTPUT JSON với cấu trúc chính xác như sau:
{
  "classifications": {
    "<tên nhóm>": ["<slug_asset_1>", "<slug_asset_2>"]
  },
  "slugs": {
    "<tên gốc asset>": "<slug-gợi-ý>"
  },
  "metadata": {
    "total_assets": <số nguyên>,
    "project_type": "<loại dự án>",
    "estimated_scale": "<quy mô ước tính>",
    "primary_zones": ["<zone 1>", "<zone 2>"]
  },
  "improvements": [
    "<đề xuất cải thiện 1>",
    "<đề xuất cải thiện 2>",
    "<đề xuất cải thiện 3>"
  ]
}

QUY TẮC:
- Phân loại asset vào nhóm phù hợp: Phòng ngủ, Khu vực công cộng, Khu vực kỹ thuật, Khu vực phụ trợ, v.v.
- Slug phải dạng kebab-case, tiếng Anh, không dấu, có số thứ tự nếu trùng tên
- Đề xuất 2-3 cải thiện thực tế về cách đặt tên hoặc tổ chức
- CHỈ trả về JSON, không có text nào khác
`;

// ─── Main function gọi Gemini API ─────────────────────────────────────────
const organizeAssets = async (inputText) => {
  // Dùng mock nếu không có key hoặc USE_MOCK=true
  if (process.env.USE_MOCK === "true" || !process.env.GEMINI_API_KEY) {
    console.log("[Gemini] Using mock data (no API key or USE_MOCK=true)");
    return getMockResponse(inputText);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Dùng gemini-1.5-flash: nhanh và rẻ, phù hợp structured output
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const prompt = buildPrompt(inputText);
    console.log("[Gemini] Sending request to Gemini API...");

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("[Gemini] Raw response:", responseText.substring(0, 200));

    // Làm sạch response: xóa markdown code block nếu có
    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse JSON và validate cấu trúc
    const parsed = JSON.parse(cleaned);

    // Kiểm tra các field bắt buộc
    const requiredFields = [
      "classifications",
      "slugs",
      "metadata",
      "improvements",
    ];
    for (const field of requiredFields) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return parsed;
  } catch (error) {
    console.error("[Gemini] Error:", error.message);
    throw new Error(`AI processing failed: ${error.message}`);
  }
};

module.exports = { organizeAssets };
