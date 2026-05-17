const bcrypt = require("bcrypt");
const nativeUsers = require("../repositories/nativeUsers");
const ConflictError = require("../errors/ConflictError");
const ValidationError = require("../errors/ValidationError");

const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%¨&]).{8,}$/;

async function register(email, password) {
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError("Invalid email format");
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw new ValidationError("Invalid password format");
  }
  if (await nativeUsers.get(email)) {
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await nativeUsers.add(email, { passwordHash });

  return { email };
}

module.exports = { register };
