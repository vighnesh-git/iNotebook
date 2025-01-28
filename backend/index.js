
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const path = require('path')

connectToMongo();
const app = express();
const PORT = 5000;
const _dirname = path.resolve();

app.use(cors());
app.use(express.json());

// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// Default Route
app.get("/", (req, res) => {
  res.send("Hello, MongoDB is connected, Vighnesh!");
});

app.listen(PORT, () => {
  console.log(`iNotebook backend listening at http://localhost:${PORT}`);
});

app.use(express.static(path.join(_dirname,"/frontend/build")));
app.get('*', (req,res)=>{
  res.sendFile(path.resolve(_dirname,"frontend","build","index.html"))
});

module.exports = app;


