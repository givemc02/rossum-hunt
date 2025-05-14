// dashboard/script.js
let teamsData = [];
const IPV4 = "https://rossum-hunt.onrender.com/"
async function loadTeams() {
  const res = await fetch(IPV4 + "teams");
  teamsData = await res.json();
}

function showDashboard() {
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

  document.getElementById("teamInfo").innerText = `Hello ${team.teamName}! Your Score: ${team.score}`;
  document.getElementById("letters").innerText = team.lettersUnlocked.join(" ") || "None";

// Fetch and display the current riddle
// Load team-specific riddle
fetch(IPV4 + "get-riddle", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ teamCode })
})
.then(res => res.json())
.then(data => {
  const riddleElem = document.getElementById("riddle");
  if (data.riddle) {
    riddleElem.innerText = `Next QR Destination Riddle: ${data.riddle}`;
  } else {
    riddleElem.innerText = "You've completed the hunt! 🏁";
  }
})
.catch(() => {
  document.getElementById("riddle").innerText = "Unable to load riddle.";
});



  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";

// First, identify the winner: first team to reach 60
let winnerTeamCode = null;

teamsData.forEach(t => {
  if (t.score === 60) {
    if (
      !winnerTeamCode ||
      new Date(t.updatedAt) < new Date(teamsData.find(x => x.teamCode === winnerTeamCode)?.updatedAt)
    ) {
      winnerTeamCode = t.teamCode;
    }
  }
});

// Sort for leaderboard
teamsData
  .sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
  })
  .forEach((t, index) => {
    const li = document.createElement("li");

    let winnerTag = (t.teamCode === winnerTeamCode)
      ? `<span class="winner">🏆 Winner</span>`
      : "";

    const isWinner = t.score === 60 && teamsData.every(other =>
  other.teamCode === t.teamCode || other.score < 60 || new Date(t.updatedAt) < new Date(other.updatedAt)
);

li.innerHTML = `
  <div class="leaderboard-entry">
    <div class="entry-left">
      <span class="rank">#${index + 1}</span>
      <span class="team-name">${t.teamName}</span>:
      <strong>${t.score}</strong>
    </div>
    ${isWinner ? `<div class="winner-badge">🏆 Winner</div>` : ""}
  </div>
`;


    if (t.teamCode === teamCode) li.classList.add("current-team");
    if (index === 0) li.classList.add("gold");
    else if (index === 1) li.classList.add("silver");
    else if (index === 2) li.classList.add("bronze");

    leaderboard.appendChild(li);
  });
}

window.onload = async () => {
  await loadTeams();
  showDashboard();
};
