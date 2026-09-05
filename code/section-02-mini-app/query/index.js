const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const eventBusUrl = "http://event-bus:4005";

app.use(express.json());
app.use(cors());


const posts = {};


function handleEvent(type, data) {
  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find(comment => {
      return comment.id === id;
    });

    comment.status = status;
    comment.content = content;
  }
}

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  console.log("EVENT RECEIVED ", type)

  handleEvent(type, data);

  res.send({ status: "ok" });
});

app.listen(4002, async () => {
  console.log("Query service listening on port 4002");

  console.log(`[Info] Query service is requesting all events from the event bus to synchronize its state...`);

  try{

    if (!eventBusUrl) {
      console.error("[Error] EVENT_BUS_URL is not defined. Cannot synchronize events.");
      throw new Error("EVENT_BUS_URL is not defined. Cannot synchronize events.");
    }
    
    const { data } = await axios.get(`${eventBusUrl}/events`);
    data.forEach((event) => {
      handleEvent(event.type, event.data);
    });
  }catch (error) {
    console.error(`[Error] Failed to synchronize events from the event bus: ${error.message}`);
  }
});
