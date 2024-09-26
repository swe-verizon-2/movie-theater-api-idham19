const app = require("./src/app");
const { db } = require("./db/connection");
const port = 3000;

app.listen(port, async () => {
  // await db.sync({ alter: true });
  db.sync();
  console.log(`Listening at http://localhost:${port}/`);
});
