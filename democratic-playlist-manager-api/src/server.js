const express = require("express");
const cookieParser = require("cookie-parser");
const boolParser = require('express-query-boolean')

const app = express();
app.disable("x-powered-by");

const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middleware/errorMiddleware");

app.use(express.json());
app.use(cookieParser());
app.use(boolParser());
app.use(cors({ credentials: true, origin: process.env.WEB_APP_BASE_URL }));
app.use("/", routes);
app.use(errorHandler);

const PORT = 8080;

module.exports = app.listen(PORT, () => {
  console.log(`app listening on port: ${PORT}`);
});
