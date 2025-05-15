const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

const TEAMS_FILE = path.join(__dirname, "..", "dashboard", "data", "teams.json");
const ANSWERS_FILE = path.join(__dirname, "..", "dashboard", "data", "answers.json");
const QUESTIONS_FILE = path.join(__dirname, "..", "dashboard", "data", "questions.json");
const RIDDLES_FILE = path.join(__dirname, "..", "dashboard", "data", "riddles.json");

app.use(cors());
app.use(express.json());

// Load data safely
const loadJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    return {};
  }
};

let correctAnswers = loadJson(ANSWERS_FILE);
let teamQuestions = loadJson(QUESTIONS_FILE);
let scoreRiddles = loadJson(RIDDLES_FILE);

// Sequence of expected letters
const correctSequence = ["R", "O", "S", "S", "U", "M"];

// Get question
app.post("/get-question", (req, res) => {
  const { teamCode, questionId } = req.body;
  const teamSet = teamQuestions[teamCode];
  if (!teamSet || !teamSet[questionId]) {
    return res.status(404).json({ error: "Question not found for this team" });
  }
  res.json({ question: teamSet[questionId] });
});

// Get teams
app.get("/teams", (req, res) => {
  fs.readFile(TEAMS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read teams file" });
    res.json(JSON.parse(data));
  });
});

// Get riddle
app.post("/get-riddle", (req, res) => {
  const { teamCode } = req.body;
  if (!teamCode) return res.status(400).json({ error: "Missing team code." });

  const teams = loadJson(TEAMS_FILE);
  const team = teams.find(t => t.teamCode === teamCode);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const riddle = scoreRiddles[team.score] || null;
  res.json({ riddle });
});

// Submit answer
app.post("/submit-answer", (req, res) => {
  const { teamCode, questionId, answer } = req.body;

  const teamAnswerSet = correctAnswers[teamCode];
  if (!teamAnswerSet || !teamAnswerSet[questionId]) {
    return res.status(400).json({ error: "Invalid question ID or team code" });
  }

  const expected = teamAnswerSet[questionId];
  const normalizedAnswer = answer.trim().toLowerCase();
  const isCorrect = expected.answers.some(a => a.toLowerCase() === normalizedAnswer);

  if (!isCorrect) {
    return res.status(400).json({ error: "Incorrect answer" });
  }

  fs.readFile(TEAMS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read teams file" });

    let teams = JSON.parse(data);
    const team = teams.find(t => t.teamCode === teamCode);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (!Array.isArray(team.answeredQuestions)) team.answeredQuestions = [];
    if (!Array.isArray(team.lettersUnlocked)) team.lettersUnlocked = [];

    if (team.answeredQuestions.includes(questionId)) {
      return res.status(400).json({ error: "Question already answered" });
    }

    const expectedNextLetter = correctSequence[team.lettersUnlocked.length];
    if (expected.letter !== expectedNextLetter) {
      return res.status(400).json({ error: `Invalid letter. Expected '${expectedNextLetter}' next` });
    }

    team.updatedAt = new Date().toISOString();
    team.score += expected.points;
    team.lettersUnlocked.push(expected.letter);
    team.answeredQuestions.push(questionId);

    fs.writeFile(TEAMS_FILE, JSON.stringify(teams, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to update team file" });
      res.json({ message: "Correct answer!", team });
    });
  });
});

// Reset teams
app.post("/admin/reset", (req, res) => {
  fs.readFile(TEAMS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Could not read teams file." });

    let teams = JSON.parse(data);
    teams = teams.map(team => ({
      ...team,
      score: 0,
      lettersUnlocked: [],
      answeredQuestions: [],
      updatedAt: new Date().toISOString()
    }));

    fs.writeFile(TEAMS_FILE, JSON.stringify(teams, null, 2), err => {
      if (err) return res.status(500).json({ error: "Could not write teams file." });
      res.json({ message: "Teams reset successfully." });
    });
  });
});

// ✅ Add a new team
app.post("/admin/add-team", (req, res) => {
  const { teamCode, teamName, answers, questions } = req.body;
  if (!teamCode || !teamName || !answers || !questions) {
    return res.status(400).json({ error: "Missing team data." });
  }

  // Add to teams.json
  const teams = loadJson(TEAMS_FILE);
  if (teams.find(t => t.teamCode === teamCode)) {
    return res.status(400).json({ error: "Team code already exists." });
  }

  teams.push({
    teamCode,
    teamName,
    score: 0,
    lettersUnlocked: [],
    answeredQuestions: [],
    updatedAt: new Date().toISOString()
  });

  // Save team
  fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2));

  // Save answers
  correctAnswers[teamCode] = answers;
  fs.writeFileSync(ANSWERS_FILE, JSON.stringify(correctAnswers, null, 2));

  // Save questions
  teamQuestions[teamCode] = questions;
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(teamQuestions, null, 2));

  res.json({ message: "Team added successfully." });
});

// ✅ Add a riddle for a score
app.post("/admin/add-riddle", (req, res) => {
  const { score, riddle } = req.body;
  if (typeof score !== "number" || !riddle) {
    return res.status(400).json({ error: "Invalid score or riddle." });
  }

  scoreRiddles[score] = riddle;
  fs.writeFileSync(RIDDLES_FILE, JSON.stringify(scoreRiddles, null, 2));
  res.json({ message: `Riddle for score ${score} added.` });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
