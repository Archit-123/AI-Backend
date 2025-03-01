const express = require("express");
const app = express();
const { createServer } = require("http");
const server = createServer(app);
const cors = require("cors");
const axios = require("axios");

const port = 5001;

const gemini_apiKey = "AIzaSyCVvymG0N5moUT3aMwMSe0TYS2CkBmDHXg";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(gemini_apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const BotResponse = async (prompt) => {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  console.log(response.candidates[0].content.parts[0].text);
  return response.candidates[0].content.parts[0].text;
};

app.use(express.json());
app.use(
  cors({ origin: "https://aichatarchit.netlify.app", credentials: true })
);

app.get("/", (req, res) => {
  res.json("Hello world");
});

app.post("/msg", async (req, res) => {
  const { message } = req.body;
  console.log(message);
  const botreply = await BotResponse(message);
  res.json({ reply: botreply });
});

server.listen(port, () => {
  console.log("Server running on port :", port);
});
