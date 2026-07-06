const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

window.addEventListener("load", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

const scorecard = {
  hole: 1,
  pars: [2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 3, 2, 2, 3, 2, 3, 2, 3],
  players: [],
  scores: [],
};

const sampleLeaderboard = [
  { name: "Cole Tested This", score: 41, date: "Launch" },
];

const leaderboardKey = "adventureCoveLeaderboard";
const placeholderNames = new Set(["The Putters", "Cove Crew", "Team Birdie"]);

const playersPanel = document.querySelector("#players-panel");
const roundPanel = document.querySelector("#round-panel");
const finishPanel = document.querySelector("#finish-panel");
const stepLabel = document.querySelector("#scorecard-step");
const scorecardHeading = document.querySelector("#scorecard-heading");
const playerInputs = [...document.querySelectorAll(".player-fields input")];
const startRoundButton = document.querySelector("#start-round");
const resetScorecardButton = document.querySelector("#reset-scorecard");
const currentHole = document.querySelector("#current-hole");
const currentPar = document.querySelector("#current-par");
const currentLeader = document.querySelector("#current-leader");
const scoreRows = document.querySelector("#score-rows");
const prevHoleButton = document.querySelector("#prev-hole");
const nextHoleButton = document.querySelector("#next-hole");
const winnerLine = document.querySelector("#winner-line");
const winnerDetail = document.querySelector("#winner-detail");
const resultsTable = document.querySelector("#results-table");
const publishOptIn = document.querySelector("#publish-opt-in");
const leaderboardName = document.querySelector("#leaderboard-name");
const saveLeaderboardButton = document.querySelector("#save-leaderboard");
const keepPrivateButton = document.querySelector("#keep-private");
const leaderboardList = document.querySelector("#leaderboard-list");
const playerError = document.querySelector("#player-error");

function setScorecardPanel(panel) {
  [playersPanel, roundPanel, finishPanel].forEach((item) => item?.classList.remove("is-active"));
  panel?.classList.add("is-active");
}

function getLeaderboard() {
  const saved = JSON.parse(localStorage.getItem(leaderboardKey) || "[]").filter(
    (entry) => entry?.name && !placeholderNames.has(entry.name),
  );
  localStorage.setItem(leaderboardKey, JSON.stringify(saved));
  return [...saved, ...sampleLeaderboard].sort((a, b) => a.score - b.score).slice(0, 8);
}

function saveLeaderboardEntry(entry) {
  const saved = JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
  saved.push(entry);
  localStorage.setItem(leaderboardKey, JSON.stringify(saved.sort((a, b) => a.score - b.score).slice(0, 20)));
}

function renderLeaderboard() {
  if (!leaderboardList) return;

  leaderboardList.innerHTML = getLeaderboard()
    .map(
      (entry, index) => `
        <div class="leaderboard-row">
          <span>${index + 1}</span>
          <strong>${entry.name}<small>${entry.date || "Posted"}</small></strong>
          <em>${entry.score}</em>
        </div>
      `,
    )
    .join("");
}

function totals() {
  return scorecard.players.map((player, index) => ({
    name: player,
    score: scorecard.scores[index].reduce((sum, value) => sum + (value || 0), 0),
  }));
}

function leader() {
  return [...totals()].sort((a, b) => a.score - b.score)[0];
}

function updateScorecardChrome() {
  if (!currentHole || !currentPar || !currentLeader) return;

  currentHole.textContent = scorecard.hole;
  currentPar.textContent = scorecard.pars[scorecard.hole - 1];
  const roundLeader = leader();
  currentLeader.textContent = roundLeader ? `${roundLeader.name} (${roundLeader.score})` : "-";
  prevHoleButton.disabled = scorecard.hole === 1;
  nextHoleButton.innerHTML =
    scorecard.hole === 18
      ? 'Finish Round <i data-lucide="flag"></i>'
      : 'Next Hole <i data-lucide="arrow-right"></i>';
  window.lucide?.createIcons();
}

function renderScoreRows() {
  if (!scoreRows) return;

  scoreRows.innerHTML = scorecard.players
    .map((player, index) => {
      const score = scorecard.scores[index][scorecard.hole - 1];
      const displayScore = score || scorecard.pars[scorecard.hole - 1];
      const total = scorecard.scores[index].reduce((sum, value) => sum + (value || 0), 0);
      return `
        <div class="score-row" data-player="${index}">
          <strong>${player}</strong>
          <div class="score-stepper" aria-label="${player} score for hole ${scorecard.hole}">
            <button type="button" data-score-action="minus" aria-label="Decrease ${player} score">-</button>
            <span>${displayScore}</span>
            <button type="button" data-score-action="plus" aria-label="Increase ${player} score">+</button>
          </div>
          <span class="score-total">Total ${total}</span>
        </div>
      `;
    })
    .join("");

  updateScorecardChrome();
}

function startRound() {
  if (!stepLabel || !scorecardHeading) return;

  const names = playerInputs.map((input) => input.value.trim()).filter(Boolean);

  if (!names.length) {
    if (playerError) {
      playerError.textContent = "Add at least one player to start a round.";
    }
    playerInputs[0].focus();
    return;
  }

  if (playerError) {
    playerError.textContent = "";
  }

  scorecard.players = names;
  scorecard.hole = 1;
  scorecard.scores = names.map(() => scorecard.pars.map(() => null));
  stepLabel.textContent = "Scorecard";
  scorecardHeading.textContent = "Hole-by-Hole Scoring";
  setScorecardPanel(roundPanel);
  renderScoreRows();
}

function finishRound() {
  if (!winnerLine || !winnerDetail || !resultsTable) return;

  const sorted = [...totals()].sort((a, b) => a.score - b.score);
  const winner = sorted[0];

  winnerLine.textContent = `${winner.name} - ${winner.score}`;
  winnerDetail.textContent = `Final score after 18 holes. Par for the course is ${scorecard.pars.reduce(
    (sum, value) => sum + value,
    0,
  )}.`;
  leaderboardName.value = winner.name;
  publishOptIn.checked = false;
  resultsTable.innerHTML = sorted
    .map(
      (result, index) => `
        <div class="result-row">
          <span>${index + 1}</span>
          <strong>${result.name}</strong>
          <em>${result.score}</em>
        </div>
      `,
    )
    .join("");

  stepLabel.textContent = "Round Complete";
  scorecardHeading.textContent = "Final Results";
  setScorecardPanel(finishPanel);
}

function resetScorecard() {
  if (!stepLabel || !scorecardHeading) return;

  scorecard.hole = 1;
  scorecard.players = [];
  scorecard.scores = [];
  if (playerError) {
    playerError.textContent = "";
  }
  stepLabel.textContent = "Players";
  scorecardHeading.textContent = "Start a Round";
  setScorecardPanel(playersPanel);
}

startRoundButton?.addEventListener("click", startRound);

resetScorecardButton?.addEventListener("click", resetScorecard);

scoreRows?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-score-action]");
  if (!button) return;

  const row = button.closest(".score-row");
  const playerIndex = Number(row.dataset.player);
  const holeIndex = scorecard.hole - 1;
  const change = button.dataset.scoreAction === "plus" ? 1 : -1;
  const currentScore = scorecard.scores[playerIndex][holeIndex] || scorecard.pars[holeIndex];
  const nextScore = Math.min(12, Math.max(1, currentScore + change));
  scorecard.scores[playerIndex][holeIndex] = nextScore;
  renderScoreRows();
});

prevHoleButton?.addEventListener("click", () => {
  scorecard.hole = Math.max(1, scorecard.hole - 1);
  renderScoreRows();
});

nextHoleButton?.addEventListener("click", () => {
  scorecard.players.forEach((_, index) => {
    const holeIndex = scorecard.hole - 1;
    if (!scorecard.scores[index][holeIndex]) {
      scorecard.scores[index][holeIndex] = scorecard.pars[holeIndex];
    }
  });

  if (scorecard.hole === 18) {
    finishRound();
    return;
  }

  scorecard.hole += 1;
  renderScoreRows();
});

keepPrivateButton?.addEventListener("click", () => {
  resetScorecard();
  document.querySelector(".scorecard-stage")?.scrollIntoView();
});

saveLeaderboardButton?.addEventListener("click", () => {
  if (publishOptIn.checked) {
    const winner = leader();
    saveLeaderboardEntry({
      name: leaderboardName.value.trim() || winner.name,
      score: winner.score,
      date: new Date().toLocaleDateString(),
    });
    renderLeaderboard();
  }

  resetScorecard();
  document.querySelector(".scorecard-stage")?.scrollIntoView();
});

renderLeaderboard();
