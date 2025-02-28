const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const GEMINI_API_KEY = "AIzaSyCVvymG0N5moUT3aMwMSe0TYS2CkBmDHXg";

//
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateResponse = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    // console.log(response.candidates[0].content.parts[0].text);
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API error:", error);
  }
};
//

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const port = 5000;
const messages = [];

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.get("/", (req, res) => {
  res.json("Hello World");
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);
  socket.on("sendMessage", async (msg) => {
    console.log("user message:", msg);

    const botResponse = await generateResponse(msg); //

    messages.push({ sender: "User", text: msg });
    messages.push({ sender: "Bot", text: botResponse });

    io.emit("receiveMessage", { sender: "User", text: msg });
    io.emit("receiveMessage", { sender: "Bot", text: botResponse });
  });
  socket.on("disconnect", () => {
    console.log("User Disconnet", socket.id);
  });
});
server.listen(port, () => {
  console.log("Server running on port: ", port);
});
