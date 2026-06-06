const express = require("express"); // Express router
const router = express.Router(); // Import service và middleware
const { organizeAssets } = require("../services/gemini-api");
const { validateOrganizeInput } = require("../middlewares/validate");

// ─── POST /api/organize-assets ────────────────────────────────────────────
router.post("/organize-assets", validateOrganizeInput, async (req, res) => {
  try {
    const inputText = req.validatedInput; // đã được validate và trim bởi middleware

    console.log(`[Route] Processing input (${inputText.length} chars)...`);

    // Gọi service xử lý AI
    const result = await organizeAssets(inputText);

    // Trả về kết quả kèm timestamp
    return res.status(200).json({
      success: true,
      data: result,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Route] Error:", error.message);

    // phân loại lỗi
    const isAiError = error.message.includes("AI processing failed");
    return res.status(500).json({
      success: false,
      error: isAiError
        ? "Không thể xử lý yêu cầu AI, vui lòng thử lại"
        : "Lỗi server nội bộ",
      detail: error.message,
    });
  }
});

module.exports = router;
