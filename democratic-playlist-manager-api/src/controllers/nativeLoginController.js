const nativeLoginService = require("../services/nativeLoginService");
const sessions = require("../repositories/sessions");

async function login(req, res) {
  const { email, password } = req.body;
  const result = await nativeLoginService.login(email, password);
  res.status(200).json(result);
}

function logout(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) sessions.remove(token);
  res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { login, logout };
