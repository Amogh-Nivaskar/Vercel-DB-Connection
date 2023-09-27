if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const cors = require("cors");
const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(
//   cors({
//     credentials: true,
//     origin: "https://formaker-6ib3.vercel.app",
//   })
// );
const PORT = process.env.PORT || 8080;
const postgre = require("./database");

app.get("/", (req, res) => {
  return res.status(200).send("Simple API homepage");
});

app.get("/", async (req, res) => {
  try {
    const { rows } = await postgre.query("select * from books");
    return res.status(200).json({ msg: "OK", data: rows });
  } catch (error) {
    return res.status(400).json({ msg: error.msg });
  }
});

app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await postgre.query(
      "select * from books where book_id = $1",
      [id]
    );

    if (rows[0]) {
      return res.json({ msg: "OK", data: rows });
    }

    return res.status(404).json({ msg: "not found" });
  } catch (error) {
    return res.json({ msg: error.msg });
  }
});

app.post("/", async (req, res) => {
  try {
    const { name, price } = req.body;

    const sql = "INSERT INTO books(name, price) VALUES($1, $2) RETURNING *";

    const { rows } = await postgre.query(sql, [name, price]);

    return res.json({ msg: "OK", data: rows[0] });
  } catch (error) {
    return res.json({ msg: error.msg });
  }
});

app.put("/:id", async (req, res) => {
  try {
    const { name, price } = req.body;

    const sql =
      "UPDATE books set name = $1, price = $2 where book_id = $3 RETURNING *";

    const { rows } = await postgre.query(sql, [name, price, req.params.id]);

    return res.json({ msg: "OK", data: rows[0] });
  } catch (error) {
    return res.json({ msg: error.msg });
  }
});

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
