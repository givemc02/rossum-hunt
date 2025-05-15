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
  Wizards1289: {
    question1: { answers: ["Kernel", "kernel"], points: 10, letter: "R" },
    question2: { answers: ["Byte", "byte"], points: 10, letter: "O" },
    question3: { answers: ["SFTP", "sftp"], points: 10, letter: "S" },
    question4: { answers: ["Constexpr", "constexpr"], points: 10, letter: "S" },
    question5: { answers: ["Deque", "deque"], points: 10, letter: "U" },
    question6: { answers: ["Default Constructor", "default constructor"], points: 10, letter: "M" },
  },
  Liquid6384: {
    question1: { answers: ["Mutex", "mutex"], points: 10, letter: "R" },
    question2: { answers: ["Paging", "paging"], points: 10, letter: "O" },
    question3: { answers: ["Builder", "builder"], points: 10, letter: "S" },
    question4: { answers: ["Dangling", "dangling"], points: 10, letter: "S" },
    question5: { answers: ["Static Member Function", "static member function"], points: 10, letter: "U" },
    question6: { answers: ["Variable Scope Leakage", "variable scope leakage"], points: 10, letter: "M" },
  },
  Cache9187: {
    question1: { answers: ["Seven", "seven"], points: 10, letter: "R" },
    question2: { answers: ["63"], points: 10, letter: "O" },
    question3: { answers: ["Eval", "eval"], points: 10, letter: "S" },
    question4: { answers: ["RAM", "ram"], points: 10, letter: "S" },
    question5: { answers: ["Virtual", "virtual"], points: 10, letter: "U" },
    question6: { answers: ["Constexpr", "constexpr"], points: 10, letter: "M" },
  },
  Hostle9794: {
    question1: { answers: ["Array", "array"], points: 10, letter: "R" },
    question2: { answers: ["Seven", "seven"], points: 10, letter: "O" },
    question3: { answers: ["4"], points: 10, letter: "S" },
    question4: { answers: ["Object", "object"], points: 10, letter: "S" },
    question5: { answers: ["Readonly", "readonly"], points: 10, letter: "U" },
    question6: { answers: ["Virtual Inheritance", "virtual inheritance"], points: 10, letter: "M" },
  },
  Digging4947: {
    question1: { answers: ["2:10", "2.10"], points: 10, letter: "R" },
    question2: { answers: ["Overflow", "overflow"], points: 10, letter: "O" },
    question3: { answers: ["XOR", "xor"], points: 10, letter: "S" },
    question4: { answers: ["DISTINCT", "distinct"], points: 10, letter: "S" },
    question5: { answers: ["Dynamic", "dynamic"], points: 10, letter: "U" },
    question6: { answers: ["Factory", "factory"], points: 10, letter: "M" },
  },
  Enigmatic5227: {
    question1: { answers: ["Rebase", "rebase"], points: 10, letter: "R" },
    question2: { answers: ["Bubble sort", "bubble sort"], points: 10, letter: "O" },
    question3: { answers: ["Exception", "exception"], points: 10, letter: "S" },
    question4: { answers: ["Assignment", "assignment"], points: 10, letter: "S" },
    question5: { answers: ["Destructor", "destructor"], points: 10, letter: "U" },
    question6: { answers: ["Shallow Copy", "shallow copy"], points: 10, letter: "M" },
  },
  Crashers5488: {
    question1: { answers: ["pwd", "PWD"], points: 10, letter: "R" },
    question2: { answers: ["Stack pointer", "stack pointer"], points: 10, letter: "O" },
    question3: { answers: ["6"], points: 10, letter: "S" },
    question4: { answers: ["Polymorphic Object", "polymorphic object"], points: 10, letter: "S" },
    question5: { answers: ["Memory", "memory","Memorization"], points: 10, letter: "U" },
    question6: { answers: ["Singleton", "singleton"], points: 10, letter: "M" },
  },
  Elite7764: {
    question1: { answers: ["Map", "map"], points: 10, letter: "R" },
    question2: { answers: ["Tuple", "tuple"], points: 10, letter: "O" },
    question3: { answers: ["Set", "set"], points: 10, letter: "S" },
    question4: { answers: ["Factory", "factory"], points: 10, letter: "S" },
    question5: { answers: ["Leak", "leak"], points: 10, letter: "U" },
    question6: { answers: ["Operator Overloading", "operator overloading"], points: 10, letter: "M" },
  },
  Hustle6873: {
    question1: { answers: ["5"], points: 10, letter: "R" },
    question2: { answers: ["6"], points: 10, letter: "O" },
    question3: { answers: ["Modulo", "modulo"], points: 10, letter: "S" },
    question4: { answers: ["DHCP", "dhcp"], points: 10, letter: "S" },
    question5: { answers: ["Symmetric", "symmetric"], points: 10, letter: "U" },
    question6: { answers: ["Lambda Expression", "lambda expression"], points: 10, letter: "M" },
  },
  Codelog8535: {
    question1: { answers: ["Asterisk", "*", "asterisk"], points: 10, letter: "R" },
    question2: { answers: ["313"], points: 10, letter: "O" },
    question3: { answers: ["Vector", "vector"], points: 10, letter: "S" },
    question4: { answers: ["Dict", "dict"], points: 10, letter: "S" },
    question5: { answers: ["Leak", "leak"], points: 10, letter: "U" },
    question6: { answers: ["Priority_queue", "priority_queue"], points: 10, letter: "M" },
  }
};

// Expected letter sequence
const correctSequence = ["R", "O", "S", "S", "U", "M"];


// Per-team custom questions
const teamQuestions = {
  Wizards1289: {
    question1: "Not stack, not heap, but grows downward.",
    question2: "I hold 256 keys, but only one can open at a time.",
    question3: "Protocol used for secure file transfer over SSH.",
    question4: "Which specifier prevents a function from being evaluated at runtime if a compile-time value is possible?",
    question5: "Which container allows O(1) insertions/removals from both ends but not from the middle?",
    question6: "Born from nothing, I initialize the world. I take no input, but I build from scratch. Who am I?",
  },
  Liquid6384: {
    question1: "Which keyword prevents data races in multithreading?",
    question2: "Which memory technique moves data between RAM and disk?",
    question3: "Which pattern constructs a complex object step-by-step, often used for UIs or config objects?",
    question4: "What issue occurs when memory is used after being freed?",
    question5: "I seem like a method, but I don’t belong to an object. I act without an instance. What am I?",
    question6: "You declare me in a loop, but I haunt you outside. I'm a trap in disguise. What mistake am I?",
  },
  Cache9187: {
    question1: "An odd prime less than 10 and used in hash base.",
    question2: "I am a 2-digit number. My tens digit is double my units digit. If you reverse me, I decrease by 27.",
    question3: "Built-in function to dynamically evaluate a string as Python expression.",
    question4: "I grow with you but vanish on exit. I am memory, but only briefly.",
    question5: "When a class inherits two classes that each inherit from the same base class, the ambiguity is resolved using which type of inheritance?",
    question6: "Which specifier prevents a function from being evaluated at runtime if a compile-time value is possible?",
  },
  Hostle9794: {
    question1: "Pick the term that doesn’t logically belong: List, Dictionary, Tuple, Array",
    question2: "An odd prime less than 10 and used in hash base.",
    question3: "A 3-digit numeric password has no repeating digits, ends in 7, and digits add up to 12. Find the middle digit.",
    question4: "My parent is class, my birth is init. What am I?",
    question5: "Attribute in HTML forms used to prevent editing of a field.",
    question6: "Two classes claim the same name, but I solve the dispute in the base. Who brings order to this chaos?",
  },
  Digging4947: {
    question1: "At what time between 2 and 3 will the hands of the clock overlap?",
    question2: "Missing base case in recursion leads to this.",
    question3: "Two hands full of ones; they meet, and none remain. What’s the operation?",
    question4: "SQL keyword used to eliminate duplicate results in a query.",
    question5: "Which type of polymorphism is resolved during runtime in C++?",
    question6: "Which pattern lets you define a common interface for creating objects, but lets subclasses decide which class to instantiate?",
  },
  Enigmatic5227: {
    question1: "Which Git command is used to apply changes from one branch onto another without creating a merge commit?",
    question2: "Sorting algorithm that swaps adjacent elements if they are in the wrong order.",
    question3: "You only meet me when things go wrong. I’m typed, but not your usual way",
    question4: "To prevent shallow copy issues in C++, which function should be manually defined besides destructor and copy constructor?",
    question5: "I live in C++, but I’m no regular member. You can't call me directly, yet I act when a class ends its story. Who am I?",
    question6: "You thought you copied me, but all you did was pass my name. Now we’re tied to the same fate. What did you do?",
  },
  Crashers5488: {
    question1: "The Unix command that reveals the current working directory of the shell session.",
    question2: "Register that usually stores the memory address of the top of the stack.",
    question3: "Top of a triangle has 1. Below it, every number is the sum of the two above it. What’s the 4th row’s center value?",
    question4: "I wear many masks but never reveal my type. Only at runtime do I show my true self. What am I?",
    question5: "You call me recursive, but I forget the past. What’s missing?",
    question6: "Which design pattern restricts a class to a single instance?",
  },
  Elite7764: {
    question1: "Which STL container stores key-value pairs in a sorted order by default?",
    question2: "Immutable built-in sequence type in Python that consumes less memory and can be used as dictionary keys.",
    question3: "I accept logic, reject duplicates, and my brackets curve",
    question4: "Which pattern lets you define a common interface for creating objects, but lets subclasses decide which class to instantiate?",
    question5: "If a derived class object is accessed through a base class pointer, and the base class lacks a virtual destructor, it may cause?",
    question6: "I look like a function, but I’m tied to a type. I let objects act like values. What am I?",
  },
  Hustle6873: {
    question1: "A binary number 10100 is right-shifted by 2. What is the decimal equivalent of the result?",
    question2: "In a 3x3 grid, how many paths exist from top-left to bottom-right if only right or down moves are allowed?",
    question3: "I divide, yet my symbol is not a slash. I am prioritized high.",
    question4: "Which network protocol assigns dynamic IP addresses?",
    question5: "Which encryption method uses the same key for encryption and decryption?",
    question6: "I’m a function with no name, yet I exist. I’m born in a line and die just as quick. What am I?",
  },
  Codelog8535: {
    question1: "Which symbol is used for pointer declaration in C++?",
    question2: "If BAD = 213, then DAD = ?",
    question3: "I hold many values, but unlike arrays, I can grow. My elements shift, and my memory flows. What STL container am I?",
    question4: "I’m unordered, key to value, and curly all over.",
    question5: "If a derived class object is accessed through a base class pointer, and the base class lacks a virtual destructor, it may cause?",
    question6: "Which STL container behaves like a heap?",
  },
};

// Score-based riddles
const scoreRiddles = {
  0: "Voiceless guides in paper form ,Silent minds that know the norm.",
  10: "Where logic lives and code is king ,The keys you press make ideas sing.",
  20: "Codes cant run here ,just take the measure and listen to the 'Cling and Clangs'.",
  30: "Do you have the capacity to resist the inducing combination of series and parallel universe.",
  40: "The very first hello to the world inside.",
  50: "I will take you through the ups and downs of your Everyday timetable."
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


