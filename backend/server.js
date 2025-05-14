const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

const TEAMS_FILE = path.join(__dirname, "..", "dashboard", "data", "teams.json");

app.use(cors());
app.use(express.json());

// Correct answers and rewards
const correctAnswers = {
  TEAM123: {
    question1: { answers: ["Dictionary", "dictionary"], points: 10, letter: "R" },
    question2: { answers: ["Semaphore", "semaphore"], points: 10, letter: "O" },
    question3: { answers: ["Network layer", "network layer", "Nertwork Layer"], points: 10, letter: "S" },
    question4: { answers: ["UTF-8", "utf-8", "utf8", "UTF8"], points: 10, letter: "S" },
    question5: { answers: ["Third Normal Form", "3NF", "3nf", "third normal form"], points: 10, letter: "U" },
    question6: { answers: ["Code generation", "Code Generation", "code generation"], points: 10, letter: "M" },

  },
  TEAM456: {
    question1: { answers: ["Clone", "clone"], points: 10, letter: "R" },
    question2: { answers: ["Merge sort", "merge sort"], points: 10, letter: "O" },
    question3: { answers: ["Client-Server", "client-server", "Client-server"], points: 10, letter: "S" },
    question4: { answers: ["pwd"], points: 10, letter: "S" },
    question5: { answers: ["Symbol table", "Symbol Table", "symbol table"], points: 10, letter: "U" },
    question6: { answers: ["Sigmoid", "sigmoid"], points: 10, letter: "M" },

  }
};

// Expected letter sequence
const correctSequence = ["R", "O", "S", "S", "U", "M"];


// Per-team custom questions
const teamQuestions = {
  TEAM123: {
    question1: `Which data structure is implemented as a hash table but has a fixed size and stores items using a key-value mapping?`,
    question2: `What Python construct allows multiple threads to run concurrently without the risk of race conditions, using a shared resource?`,
    question3: `What layer of the OSI model is responsible for routing packets and providing logical addressing?`,
    question4: `What encoding format is commonly used to represent Unicode characters as a sequence of bytes, ensuring compatibility with ASCII?`,
    question5: `What normal form eliminates transitive dependencies in a relational database schema?`,
    question6: `Which phase of a compiler converts a high-level programming language to machine code instructions?`

  },
  TEAM456: {
    question1: `In Git, what command is used to download a remote repository history and content into your local directory?`,
    question2: `A sorting algorithm that consistently divides the data in half before merging the parts together has a time complexity of O(n log n) in all cases.`,
    question3: `A system design pattern where the client and server communicate through HTTP APIs, ensuring decoupling, is widely used in modern web architectures.`,
    question4: `The Unix command that reveals the current working directory of the shell session.`,
    question5: `The table that holds identifiers, their types, and scopes during code compilation.`,
    question6: `Activation function with output strictly between 0 and 1, often used in logistic regression.`
  }
};

// Score-based riddles
const scoreRiddles = {
  0: "Next QR Destination Riddle: 'I speak without a mouth and hear without ears. What am I?'",
  10: "Next QR Destination Riddle: 'I am not alive, but I grow; I don’t have lungs, but I need air.'",
  20: "Next QR Destination Riddle: 'I have keys but no locks. I have space but no room.'",
  30: "Next QR Destination Riddle: 'I fly without wings. I cry without eyes. What am I?'",
  40: "Next QR Destination Riddle: 'The more you take, the more you leave behind. What are they?'",
  50: "Next QR Destination Riddle: 'I’m the end of the hunt. Find me where winners shine!'"
};

// Endpoint to get question for a specific team
app.post("/get-question", (req, res) => {
  const { teamCode, questionId } = req.body;

  const teamSet = teamQuestions[teamCode];
  if (!teamSet || !teamSet[questionId]) {
    return res.status(404).json({ error: "Question not found for this team" });
  }

  // 👇 FIXED: changed key from questionText → question
  res.json({ question: teamSet[questionId] });
});

// Endpoint to retrieve all teams
app.get("/teams", (req, res) => {
  fs.readFile(TEAMS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read teams file" });
    res.json(JSON.parse(data));
  });
});

app.post("/get-riddle", (req, res) => {
  const { teamCode } = req.body;
  if (!teamCode) return res.status(400).json({ error: "Missing team code." });

  fs.readFile(TEAMS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Could not read teams file." });

    const teams = JSON.parse(data);
    const team = teams.find(t => t.teamCode === teamCode);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const riddle = scoreRiddles[team.score] || null;
    res.json({ riddle });
  });
});

// Answer submission handler
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
team.updatedAt = new Date().toISOString(); // ← Add this


    fs.writeFile(TEAMS_FILE, JSON.stringify(teams, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to update team file" });
      res.json({ message: "Correct answer!", team });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// Reset all team progress and scores (admin route)
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


