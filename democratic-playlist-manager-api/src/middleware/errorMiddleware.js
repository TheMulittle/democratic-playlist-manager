const { WebapiError } = require("spotify-web-api-node/src/response-error");
const GeneralError = require("../errors/GeneralError");

function errorHandler(err, req, res, _) {
  if (err instanceof GeneralError) {
    console.log(err.stack);
    res.status(err.code).send({ message: err.message });
  } else if (err instanceof WebapiError) {
    res.status(err.statusCode).send({
      message: "An error occured while communicating with Spotify Api",
    });
  }
}

module.exports = errorHandler;
