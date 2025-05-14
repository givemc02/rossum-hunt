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
fetch(IPV4 + "get-riddle", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ teamCode })
})
.then(res => res.json())
.then(data => {
  if (data.riddle) {
    document.getElementById("riddle").innerText = data.riddle;
  } else {
    document.getElementById("riddle").innerText = "No riddle yet. Solve more questions!";
  }
})
.catch(err => {
  console.error("Failed to fetch riddle:", err);
  document.getElementById("riddle").innerText = "Error loading riddle.";
});


  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";

  teamsData
  .sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;

    const dateA = new Date(a.updatedAt || 0);
    const dateB = new Date(b.updatedAt || 0);

    return dateA - dateB;  // Fix: show earlier scorer higher
  })

  .forEach((t, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="rank">#${index + 1}</span> ${t.teamName}: <strong>${t.score}</strong>`;

    if (t.teamCode === teamCode) {
      li.classList.add("current-team");
    }

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
