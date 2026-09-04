const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");
const axios = require("axios");
const app = express();
const eventBusUrl = process.env.EVENT_BUS_URL || "http://localhost:4005";

app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { content } = req.body;
  const postId = req.params.id;
  const comments = commentsByPostId[postId] || [];

  comments.push({ id, content, status: "pending" });
  commentsByPostId[postId] = comments;

  await axios.post(`${eventBusUrl}/events`, {
    type: "CommentCreated",
    data: {
      id,
      content,
      postId,
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    console.log("CommentModerated event occur", req.body);
    const comments = commentsByPostId[data.postId];
    
    const comment = comments.find((cmt) => cmt.id === data.id);
    comment.status = data.status;

    await axios.post(`${eventBusUrl}/events`, {
      type: "CommentUpdated",
      data: data,
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("Comments service listening on port 4001");
});
