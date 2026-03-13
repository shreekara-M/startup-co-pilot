const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.service");

/** POST /api/auth/signup */
const signup = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.signup({ name, email, password });
  res.status(201).json({ status: "success", data: result });
});

/** POST /api/auth/login */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.json({ status: "success", data: result });
});

/** GET /api/auth/me — requires auth middleware */
const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ status: "success", data: user });
});

module.exports = { signup, login, getMe };
