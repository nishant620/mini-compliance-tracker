const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Client = require("./models/client");
const Task = require("./models/Task");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("API is working");
});
app.get("/clients", async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); 
app.post("/clients", async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/tasks/:clientId", async (req, res) => {
  try {
    const tasks = await Task.find({
      client_id: req.params.clientId
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/tasks/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});