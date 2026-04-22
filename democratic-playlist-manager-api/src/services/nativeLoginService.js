const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const nativeUsers = require("../repositories/nativeUsers");
const sessions = require("../repositories/sessions");
const GeneralError = require("../errors/GeneralError");

async function login(email, password) {
  const user = nativeUsers.get(email);
  const passwordMatch = user && (await bcrypt.compare(password, user.password));

  if (!passwordMatch) {
    throw new GeneralError("Invalid email or password", 401);
  }

  const token = nanoid();
  sessions.add(token, { ...user, userType: "invitee" });
  return { token, userType: "invitee" };
}

module.exports = { login };
