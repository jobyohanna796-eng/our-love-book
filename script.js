console.log("OUR LOVE BOOK JAVASCRIPT LOADED");
document.addEventListener("DOMContentLoaded", function () {

  // FIREBASE CONFIGURATION
  const firebaseConfig = {
    apiKey: "AIzaSyBdXAIn1xwiA49vkEgqbpI0WRH5D4Egzcg",
    authDomain: "our-love-book.firebaseapp.com",
    projectId: "our-love-book",
    storageBucket: "our-love-book.firebasestorage.app",
    messagingSenderId: "1055443584526",
    appId: "1:1055443584526:web:7f8b98de0be30bb7cc1e5f",
    measurementId: "G-B3RZSV4Q67"
  };

  // INITIALIZE FIREBASE
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  // CREATE LOGIN SCREEN
  document.body.insertAdjacentHTML("afterbegin", `
    <div id="loginPanel" style="
      display:none;
      min-height:100vh;
      padding:30px 18px;
      text-align:center;
      background:#fff5f8;
      color:#54333e;
      font-family:Georgia,serif;
    ">
      <div style="
        max-width:400px;
        margin:60px auto;
        padding:25px;
        background:white;
        border-radius:18px;
        box-shadow:0 4px 20px #0001;
      ">
        <h1>Our Little World ❤️</h1>
        <p>Welcome Job & Dorcas 💗</p>

        <h2>Private Login</h2>

        <input
          id="loginEmail"
          type="email"
          placeholder="Your email address"
          style="width:100%;padding:13px;margin:10px 0;"
        >

        <input
          id="loginPassword"
          type="password"
          placeholder="Your password"
          style="width:100%;padding:13px;margin:10px 0;"
        >

        <button id="loginButton" style="
          width:100%;
          padding:13px;
          margin-top:10px;
          background:#b84d70;
          color:white;
          border:0;
          border-radius:10px;
          font-size:16px;
        ">
          Login ❤️
        </button>

        <p id="loginMessage"></p>
      </div>
    </div>
  `);

  const loginPanel = document.getElementById("loginPanel");
  const loginMessage = document.getElementById("loginMessage");
  const welcome = document.getElementById("welcome");
  const main = document.getElementById("main");

  // SAFE TEXT DISPLAY
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  // LOGIN
  document.getElementById("loginButton").addEventListener("click", async function () {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      loginMessage.textContent = "Enter your email and password.";
      return;
    }

    loginMessage.textContent = "Logging in...";

    try {
      await auth.signInWithEmailAndPassword(email, password);
      loginMessage.textContent = "";
    } catch (error) {
      loginMessage.textContent = "Login failed: " + error.message;
    }
  });

  // AUTHENTICATION CHECK
  auth.onAuthStateChanged(function (user) {

    if (user) {
      loginPanel.style.display = "none";
      welcome.style.display = "block";
      main.style.display = "none";

      // ADD LOGOUT BUTTON
      const header = document.querySelector("header");

      if (header && !document.getElementById("logoutButton")) {
        header.insertAdjacentHTML("beforeend", `
          <button id="logoutButton">Logout</button>
        `);

        document.getElementById("logoutButton").onclick = async function () {
          await auth.signOut();
        };
      }

      listenForLetters();
      listenForReasons();
      listenForDates();

    } else {
      loginPanel.style.display = "block";
      welcome.style.display = "none";
      main.style.display = "none";
    }
  });

  // OPEN LOVE STORY
  window.openOurStory = function () {
    if (!auth.currentUser) {
      alert("Please log in first.");
      return;
    }

    welcome.style.display = "none";
    main.style.display = "block";
  };

  // CURRENT USER
  function currentName() {
    return document.getElementById("letterName").value.trim();
  }

  // LOVE LETTERS
  window.saveLetter = async function () {

    const name = currentName();
    const message = document.getElementById("letterText").value.trim();

    if (!name || !message) {
      alert("Please enter your name and love letter.");
      return;
    }

    try {
      await db.collection("Loveletters").add({
        name: name,
        message: message,
        email: auth.currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      document.getElementById("letterText").value = "";
      alert("Your love letter has been sent! ❤️");

    } catch (error) {
      alert("Could not send letter: " + error.message);
    }
  };

  function listenForLetters() {
    db.collection("Loveletters").onSnapshot(snapshot => {

      const letters = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      letters.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      document.getElementById("letters").innerHTML =
        letters.map(letter => `
          <div class="card">
            <h3>💌 From ${escapeHTML(letter.name || "Someone special")}</h3>
            <p>${escapeHTML(letter.message || "").replace(/\n/g, "<br>")}</p>
            ${
              letter.email === auth.currentUser.email
                ? `<button onclick="deleteLetter('${letter.id}')">Delete</button>`
                : ""
            }
          </div>
        `).join("");

    }, error => {
      console.error("Love letters error:", error);
    });
  }

  window.deleteLetter = async function (id) {
    if (!confirm("Delete this love letter?")) return;

    try {
      const ref = db.collection("Loveletters").doc(id);
      const doc = await ref.get();

      if (doc.exists && doc.data().email === auth.currentUser.email) {
        await ref.delete();
      } else {
        alert("You can only delete your own letters.");
      }
    } catch (error) {
      alert("Could not delete letter: " + error.message);
    }
  };

  // REASONS
  window.addReason = async function () {

    const input = document.getElementById("customReason");
    const reason = input.value.trim();

    if (!reason) {
      alert("Write a reason first.");
      return;
    }

    try {
      await db.collection("Reasons").add({
        reason: reason,
        email: auth.currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      input.value = "";

    } catch (error) {
      alert("Could not save reason: " + error.message);
    }
  };

  function listenForReasons() {
    db.collection("Reasons").onSnapshot(snapshot => {

      document.getElementById("reasons").innerHTML =
        snapshot.docs.map((doc, index) => {
          const item = doc.data();

          return `
            <div class="reason">
              ${index + 1}. ${escapeHTML(item.reason)}
            </div>
          `;
        }).join("");

    }, error => {
      console.error("Reasons error:", error);
    });
  }

  // SPECIAL DATES
  window.saveDate = async function () {

    const name = document.getElementById("dateName").value.trim();
    const date = document.getElementById("specialDate").value;

    if (!name || !date) {
      alert("Enter the occasion and date.");
      return;
    }

    try {
      await db.collection("SpecialDates").add({
        name: name,
        date: date,
        email: auth.currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      document.getElementById("dateName").value = "";
      document.getElementById("specialDate").value = "";

    } catch (error) {
      alert("Could not save date: " + error.message);
    }
  };

  function listenForDates() {
    db.collection("SpecialDates").onSnapshot(snapshot => {

      document.getElementById("dates").innerHTML =
        snapshot.docs.map(doc => {
          const item = doc.data();

          return `
            <div class="reason">
              <strong>${escapeHTML(item.name)}</strong><br>
              ${escapeHTML(item.date)}
              <br>
              ${
                item.email === auth.currentUser.email
                  ? `<button onclick="deleteDate('${doc.id}')">Delete</button>`
                  : ""
              }
            </div>
          `;
        }).join("");

    }, error => {
      console.error("Dates error:", error);
    });
  }

  window.deleteDate = async function (id) {
    if (!confirm("Delete this special date?")) return;

    try {
      const ref = db.collection("SpecialDates").doc(id);
      const doc = await ref.get();

      if (doc.exists && doc.data().email === auth.currentUser.email) {
        await ref.delete();
      } else {
        alert("You can only delete your own dates.");
      }
    } catch (error) {
      alert("Could not delete date: " + error.message);
    }
  };

});
