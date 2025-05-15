let teamsData = [];
const IPV4 = "https://rossum-hunt.onrender.com/";

async function loadTeams() {
  const res = await fetch(IPV4 + "teams");
  teamsData = await res.json();
}

async function loadRiddle(teamCode) {
  const res = await fetch(IPV4 + "get-riddle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamCode })
  });

  const data = await res.json();
  document.getElementById("riddle").textContent = data.riddle || "No riddle at your score.";
}

function renderDashboard() {
  const teamCode = localStorage.getItem("teamCode");
  if (!teamCode) {
    window.location.href = "login.html";
    return;
  }

  const team = teamsData.find(t => t.teamCode === teamCode);
  if (!team) {
    alert("Team not found.");
    localStorage.removeItem("teamCode");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("teamInfo").textContent = `${team.teamName} (Score: ${team.score})`;
  document.getElementById("letters").textContent = team.lettersUnlocked.join(" ") || "None";
}

function renderLeaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";

  const sortedTeams = [...teamsData].sort((a, b) => b.score - a.score);
  const currentTeamCode = localStorage.getItem("teamCode");

  sortedTeams.forEach((team, index) => {
    const li = document.createElement("li");

    const entry = document.createElement("div");
    entry.className = "leaderboard-entry";

    const left = document.createElement("div");
    left.className = "entry-left";
    left.innerHTML = `<span class="rank">#${index + 1}</span> <strong>${team.teamName}</strong> - ${team.score} pts`;

    const right = document.createElement("div");
    if (team.score >= 60) {
      const badge = document.createElement("span");
      badge.className = "winner-badge";
      badge.textContent = "Winner";
      right.appendChild(badge);
    }

    entry.appendChild(left);
    entry.appendChild(right);
    li.appendChild(entry);

    if (team.teamCode === currentTeamCode) {
      li.classList.add("current-team");
    }
    if (index === 0) li.classList.add("gold");
    else if (index === 1) li.classList.add("silver");
    else if (index === 2) li.classList.add("bronze");

    leaderboard.appendChild(li);
  });
}

// Initialization
(async () => {
  await loadTeams();
  const teamCode = localStorage.getItem("teamCode");
  if (teamCode) await loadRiddle(teamCode);
  renderDashboard();
  renderLeaderboard();
})();
