const { WebapiError } = require("spotify-web-api-node/src/response-error");
const GeneralError = require("../errors/GeneralError");

function errorHandler(err, req, res, _) {
  const timestamp = new Date().toISOString();
  if (err instanceof GeneralError) {
    console.log(err.stack);
    res.status(err.code).json({ timestamp, errorMessage: err.message });
  } else if (err instanceof WebapiError) {
    res.status(err.statusCode).json({
      timestamp,
      errorMessage: "An error occured while communicating with Spotify Api",
    });
  }
}

module.exports = errorHandler;
