const nativeRegistrationService = require("../services/nativeRegistrationService");

async function registerUser(req, res) {
  const { email, password } = req.body;
  const user = await nativeRegistrationService.register(email, password);
  res.status(201).json({ email: user.email });
}

module.exports = { registerUser };
