
function openOurStory() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("main").classList.remove("hidden");
}

function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function saveLetter() {
  const name = document.getElementById("letterName").value.trim();
  const message = document.getElementById("letterText").value.trim();

  if (!name || !message) {
    alert("Please enter your name and love letter.");
    return;
  }

  const letters = getData("loveLetters");
  letters.unshift({ name, message });

  localStorage.setItem("loveLetters", JSON.stringify(letters));

  document.getElementById("letterText").value = "";
  showLetters();
}

function showLetters() {
  const letters = getData("loveLetters");

  document.getElementById("letters").innerHTML = letters.map((letter, index) => `
    <div class="card">
      <h3>💌 From ${escapeHTML(letter.name)}</h3>
      <p>${escapeHTML(letter.message).replace(/\n/g, "<br>")}</p>
      <button onclick="deleteLetter(${index})">Delete</button>
    </div>
  `).join("");
}

function deleteLetter(index) {
  if (!confirm("Delete this love letter?")) return;

  const letters = getData("loveLetters");
  letters.splice(index, 1);

  localStorage.setItem("loveLetters", JSON.stringify(letters));
  showLetters();
}

function showReasons() {
  const reasons = getData("customReasons");

  document.getElementById("reasons").innerHTML = reasons.map((reason, index) => `
    <div class="reason">${index + 1}. ${escapeHTML(reason)}</div>
  `).join("");
}

function addReason() {
  const input = document.getElementById("customReason");
  const reason = input.value.trim();

  if (!reason) {
    alert("Write a reason first.");
    return;
  }

  const reasons = getData("customReasons");
  reasons.push(reason);

  localStorage.setItem("customReasons", JSON.stringify(reasons));
  input.value = "";

  showReasons();
}

function saveDate() {
  const name = document.getElementById("dateName").value.trim();
  const date = document.getElementById("specialDate").value;

  if (!name || !date) {
    alert("Enter the occasion and date.");
    return;
  }

  const dates = getData("specialDates");
  dates.push({ name, date });

  localStorage.setItem("specialDates", JSON.stringify(dates));

  document.getElementById("dateName").value = "";
  document.getElementById("specialDate").value = "";

  showDates();
}

function showDates() {
  const dates = getData("specialDates");

  document.getElementById("dates").innerHTML = dates.map((item, index) => `
    <div class="reason">
      <strong>${escapeHTML(item.name)}</strong><br>
      ${escapeHTML(item.date)}
      <br>
      <button onclick="deleteDate(${index})">Delete</button>
    </div>
  `).join("");
}

function deleteDate(index) {
  const dates = getData("specialDates");
  dates.splice(index, 1);

  localStorage.setItem("specialDates", JSON.stringify(dates));
  showDates();
}

showLetters();
showReasons();
showDates();
