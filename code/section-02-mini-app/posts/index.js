const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = { id, title };

  // Trigger event
  // consistent structure for event
  await axios.post("http://localhost:4005/events", {
    type: "PostCreated",
    data: posts[id],
  });

  res.status(201).send(posts[id]);
});

app.get("/posts", (req, res) => {});

app.post("/events", (req, res) => {
  console.log("Event received:", req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log("Posts service listening on port 4000");
});
