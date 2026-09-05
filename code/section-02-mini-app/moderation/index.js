const express = require("express");
const axios = require("axios");

const app = express();
const eventBusUrl = "http://event-bus:4005";

app.use(express.json());

const CHECK_WORD = "orange";

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    let status = "approved";
    if (data?.content?.includes(CHECK_WORD)) {
      status = "rejected";
    }
    await axios
      .post(`${eventBusUrl}/events`, {
        type: "CommentModerated",
        data: { ...data, status },
      })
      .catch((err) => console.log(err.message));
  }

  res.send({});
});

app.listen(4003, () => {
  console.log("Comment Moderation Service is listening on post 4003");
});
