const express = require("express");
const app = express();
const userRouter = require("../routes/users");
const showRouter = require("../routes/shows");

app.use(express.json());
app.use("/users", userRouter);
app.use("/shows", showRouter);

module.exports = app;
