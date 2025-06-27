// js/student-auth.js

document.getElementById("studentLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const adm = document.getElementById("adm").value.trim();
  const password = document.getElementById("password").value;

  try {
    const snapshot = await db.collection("students")
      .where("adm", "==", adm)
      .limit(1)
      .get();

    if (snapshot.empty) {
      document.getElementById("loginError").textContent = "Invalid admission number.";
      return;
    }

    const student = snapshot.docs[0].data();

    // Check password (optional: hash or secure it later)
    if (student.password !== password) {
      document.getElementById("loginError").textContent = "Incorrect password.";
      return;
    }

    // Save student data locally and redirect
    localStorage.setItem("student", JSON.stringify({ id: snapshot.docs[0].id, ...student }));
    window.location.href = "student-dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    document.getElementById("loginError").textContent = "Login failed. Try again.";
  }
});
