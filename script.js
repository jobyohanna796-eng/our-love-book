
console.log("OUR LOVE BOOK STARTING ❤️");

document.addEventListener("DOMContentLoaded", function () {
  const welcome = document.getElementById("welcome");
  const main = document.getElementById("main");

  // Show welcome immediately so a Firebase problem
  // cannot leave the entire website blank.
  welcome.style.display = "flex";
  main.style.display = "none";

  try {
    if (typeof firebase === "undefined") {
      throw new Error("Firebase library did not load.");
    }

    const firebaseConfig = {
      apiKey: "AIzaSyBdXAIn1xwiA49vkEgqbpI0WRH5D4Egzcg",
      authDomain: "our-love-book.firebaseapp.com",
      projectId: "our-love-book",
      storageBucket: "our-love-book.firebasestorage.app",
      messagingSenderId: "1055443584526",
      appId: "1:1055443584526:web:7f8b98de0be30bb7cc1e5f",
      measurementId: "G-B3RZSV4Q67"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

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
        ">
          <h1>Our Little World ❤️</h1>
          <p>Welcome Job & Dorcas 💗</p>
          <h2>Private Login</h2>
          <input id="loginEmail" type="email"
            placeholder="Your email address">
          <input id="loginPassword" type="password"
            placeholder="Your password">
          <button id="loginButton">Login ❤️</button>
          <p id="loginMessage"></p>
        </div>
      </div>
    `);

    const loginPanel = document.getElementById("loginPanel");
    const loginMessage = document.getElementById("loginMessage");

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    }

    document.getElementById("loginButton").onclick = async function () {
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
    };

    auth.onAuthStateChanged(function (user) {
      if (user) {
        loginPanel.style.display = "none";
        welcome.style.display = "flex";
        main.style.display = "none";

        const header = document.querySelector("header");

        if (header && !document.getElementById("logoutButton")) {
          header.insertAdjacentHTML("beforeend",
            '<button id="logoutButton">Logout</button>');

          document.getElementById("logoutButton").onclick =
            () => auth.signOut();
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

    window.openOurStory = function () {
      if (!auth.currentUser) {
        alert("Please log in first.");
        return;
      }

      welcome.style.display = "none";
      main.style.display = "block";
    };

    function listenForLetters() {
      db.collection("Loveletters").onSnapshot(snapshot => {
        const letters = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        letters.sort((a, b) =>
          (b.createdAt?.toMillis() || 0) -
          (a.createdAt?.toMillis() || 0)
        );

        document.getElementById("letters").innerHTML =
          letters.map(letter => `
            <div class="card">
              <h3>💌 From ${escapeHTML(letter.name || "Someone special")}</h3>
              <p>${escapeHTML(letter.message || "").replace(/\n/g, "<br>")}</p>
              ${letter.email === auth.currentUser.email
                ? `<button onclick="deleteLetter('${letter.id}')">Delete</button>`
                : ""}
            </div>
          `).join("");
      }, error => console.error("Letters:", error));
    }

    window.saveLetter = async function () {
      const name = document.getElementById("letterName").value.trim();
      const message = document.getElementById("letterText").value.trim();

      if (!name || !message) {
        alert("Please enter your name and love letter.");
        return;
      }

      try {
        await db.collection("Loveletters").add({
          name,
          message,
          email: auth.currentUser.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById("letterText").value = "";
        alert("Your love letter has been sent! ❤️");
      } catch (error) {
        alert("Could not send letter: " + error.message);
      }
    };

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

    function listenForReasons() {
      db.collection("Reasons").onSnapshot(snapshot => {
        document.getElementById("reasons").innerHTML =
          snapshot.docs.map((doc, index) => `
            <div class="reason">
              ${index + 1}. ${escapeHTML(doc.data().reason)}
            </div>
          `).join("");
      }, error => console.error("Reasons:", error));
    }

    window.addReason = async function () {
      const input = document.getElementById("customReason");
      const reason = input.value.trim();

      if (!reason) {
        alert("Write a reason first.");
        return;
      }

      try {
        await db.collection("Reasons").add({
          reason,
          email: auth.currentUser.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        input.value = "";
      } catch (error) {
        alert("Could not save reason: " + error.message);
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
                ${escapeHTML(item.date)}<br>
                ${item.email === auth.currentUser.email
                  ? `<button onclick="deleteDate('${doc.id}')">Delete</button>`
                  : ""}
              </div>
            `;
          }).join("");
      }, error => console.error("Dates:", error));
    }

    window.saveDate = async function () {
      const name = document.getElementById("dateName").value.trim();
      const date = document.getElementById("specialDate").value;

      if (!name || !date) {
        alert("Enter the occasion and date.");
        return;
      }

      try {
        await db.collection("SpecialDates").add({
          name,
          date,
          email: auth.currentUser.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById("dateName").value = "";
        document.getElementById("specialDate").value = "";
      } catch (error) {
        alert("Could not save date: " + error.message);
      }
    };

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

  } catch (error) {
    console.error("OUR LOVE BOOK ERROR:", error);
    welcome.style.display = "flex";
    alert("Website error: " + error.message);
  }
});
