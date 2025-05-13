const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const port = 8080;
const TEAMS_FILE = path.join(__dirname, 'teams.json');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    // Handle JSON API endpoints
    if (req.url === '/submit-answer') {
      let body = '';

      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        const { teamCode, questionId, answer } = JSON.parse(body || '{}');

        if (!teamCode || !questionId || !answer) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'Missing parameters' }));
        }

        // Load teams
        fs.readFile(TEAMS_FILE, 'utf-8', (err, data) => {
          if (err) {
            res.writeHead(500);
            return res.end(JSON.stringify({ error: 'Failed to read team data' }));
          }

          let teams = JSON.parse(data);
          let team = teams.find(t => t.teamCode === teamCode);

          if (!team) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: 'Team not found' }));
          }

          const correctAnswer = 'example'; // Replace with real logic
          const isCorrect = answer.toLowerCase().trim() === correctAnswer;

          if (!isCorrect) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: 'Incorrect answer' }));
          }

          if (!team.answeredQuestions) team.answeredQuestions = [];
          if (!team.lettersUnlocked) team.lettersUnlocked = [];

          if (!team.answeredQuestions.includes(questionId)) {
            team.answeredQuestions.push(questionId);
            team.score += 10;
            team.updatedAt = new Date().toISOString();
            team.lettersUnlocked.push('R'); // Add logic if needed
          }

          fs.writeFile(TEAMS_FILE, JSON.stringify(teams, null, 2), err => {
            if (err) {
              res.writeHead(500);
              return res.end(JSON.stringify({ error: 'Failed to save team data' }));
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          });
        });
      });

    } else if (req.url === '/teams') {
      fs.readFile(TEAMS_FILE, 'utf-8', (err, data) => {
        if (err) {
          res.writeHead(500);
          return res.end('Failed to read team data');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    } else {
      res.writeHead(404);
      res.end('API route not found');
    }

  } else if (req.method === 'GET') {
    // Serve static files
    let filePath = '.' + (req.url === '/' ? '/login.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
      case '.js': contentType = 'text/javascript'; break;
      case '.css': contentType = 'text/css'; break;
      case '.json': contentType = 'application/json'; break;
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

