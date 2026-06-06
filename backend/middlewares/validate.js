// validate input
const validateOrganizeInput = (req, res, next) => {
  const { assetInput } = req.body;

  // check input exists
  if (assetInput === undefined || assetInput === null) {
    return res.status(400).json({
      error: "Thiếu trường assetInput trong request body",
    });
  }

  // input not empty
  if (typeof assetInput !== "string" || assetInput.trim().length === 0) {
    return res.status(400).json({
      error: "Danh sách asset không được để trống",
    });
  }

  // check minimum length
  if (assetInput.trim().length < 5) {
    return res.status(400).json({
      error: "Nội dung nhập quá ngắn, vui lòng mô tả chi tiết hơn",
    });
  }

  // check maximum length
  if (assetInput.length > 5000) {
    return res.status(400).json({
      error: "Nội dung nhập quá dài (tối đa 5,000 ký tự)",
    });
  }

  // Gắn trim
  req.validatedInput = assetInput.trim();
  next();
};

module.exports = { validateOrganizeInput };
