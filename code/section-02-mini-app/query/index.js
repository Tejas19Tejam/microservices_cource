const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const postsWithComments = {};

app.get("/posts", (req, res) => {
  res.send(postsWithComments);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  if (type === "PostCreated") {
    postsWithComments[data.id] = { ...data, comments: [] };
  }

  if (type === "CommentCreated") {
    const post = postsWithComments[data.postId];
    if (post) {
      post.comments.push(data);
    }
  }

  res.send({ status: "ok" });
});

app.listen(4002, () => {
  console.log("Query service listening on port 4002");
});
