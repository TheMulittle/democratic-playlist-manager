const fs = require("fs");
const path = require("path");

function readFixtureJson(relativePath) {
  const rawdata = fs.readFileSync(
    path.resolve(__dirname, `./../json/${relativePath}`)
  );
  return JSON.parse(rawdata);
}

module.exports = readFixtureJson;
