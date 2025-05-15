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
    question5: { answers: ["Memoization", "memoization"], points: 10, letter: "U" },
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
    question1: "Which container stores elements of the same data type in contiguous memory locations?",
    question2: "An odd prime less than 10 and used in hash base.",
    question3: "How many sides does a square root of a cube have? (Numeric answer)",
    question4: "Which programming concept allows combining data and functions into a single unit?",
    question5: "A class member that cannot be modified after initialization is marked as?",
    question6: "Which inheritance type solves the diamond problem in C++?",
  },
  Digging4947: {
    question1: "What is the binary representation of decimal 2.625?",
    question2: "Integer overflow leads to unexpected behavior. What is this phenomenon called?",
    question3: "Which bitwise operation returns 1 only if exactly one of the bits is 1?",
    question4: "Which SQL keyword ensures unique values in the result set?",
    question5: "Which language feature allows allocation of memory during runtime?",
    question6: "Which design pattern provides a way to delegate the instantiation logic to subclasses?",
  },
  Enigmatic5227: {
    question1: "Which Git command is used to apply changes from one branch onto another without creating a merge commit?",
    question2: "Which sorting algorithm repeatedly swaps adjacent elements if they are in the wrong order?",
    question3: "Which C++ mechanism allows catching and handling runtime errors?",
    question4: "Which operator is overloaded during copy assignment in C++?",
    question5: "Which special class method is invoked automatically during object destruction?",
    question6: "A copy that shares references rather than values is known as what type of copy?",
  },
  Crashers5488: {
    question1: "Which command prints the current working directory in Linux?",
    question2: "Which register points to the top of the current function call’s stack frame?",
    question3: "How many bytes are in 3-bit hex code?",
    question4: "An object of a class with at least one virtual function is called a?",
    question5: "What optimization technique stores previously computed results to avoid recomputation?",
    question6: "Which pattern ensures a class has only one instance and provides a global access point?",
  },
  Elite7764: {
    question1: "Which STL container stores key-value pairs in a sorted order by default?",
    question2: "Which STL structure can be used to store a group of values with different data types?",
    question3: "Which container stores unique elements in sorted order?",
    question4: "Which pattern provides an interface for creating families of related objects without specifying their concrete classes?",
    question5: "When memory is not deallocated properly, it leads to a?",
    question6: "Which feature allows defining how operators behave for class objects?",
  },
  Hustle6873: {
    question1: "How many distinct prime numbers are less than 10?",
    question2: "How many legs do 3 insects and 1 spider have in total?",
    question3: "What operation finds the remainder of division?",
    question4: "Which network protocol assigns dynamic IP addresses?",
    question5: "Which encryption method uses the same key for encryption and decryption?",
    question6: "What is the name of the anonymous function introduced in C++11?",
  },
  Codelog8535: {
    question1: "Which symbol is used for pointer declaration in C++?",
    question2: "Reverse of 313 is?",
    question3: "Which STL container provides dynamic array with automatic resizing?",
    question4: "Which Python structure stores key-value pairs?",
    question5: "What is it called when memory is not released properly?",
    question6: "Which STL container provides a constant-time priority queue?",
  },
};

// Score-based riddles
const scoreRiddles = {
  0: "I speak without a mouth and hear without ears. What am I?",
  10: "I am not alive, but I grow; I don’t have lungs, but I need air.",
  20: "I have keys but no locks. I have space but no room.",
  30: "I fly without wings. I cry without eyes. What am I?",
  40: "The more you take, the more you leave behind. What are they?",
  50: "I’m the end of the hunt. Find me where winners shine!"
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


