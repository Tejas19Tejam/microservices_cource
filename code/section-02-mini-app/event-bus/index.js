const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

// Event bus data store
const events = []



app.post("/events", (req, res) => {
  const event = req.body;

  console.log("Event ", event.type);

  events.push(event);

  // send the event to all services
  axios.post("http://localhost:4000/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://localhost:4001/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://localhost:4002/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://localhost:4003/events", event).catch((err) => {
    console.log(err.message);
  });

  res.send({ status: "ok" });
});


app.get("/events", (req, res) => {
  res.send(events);
});


app.listen(4005, () => {
  console.log("Event Broker Service is listening on post 4005");
});
