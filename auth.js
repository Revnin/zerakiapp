// js/auth.js

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("teacherLoginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const errorBox = document.getElementById("loginError");

      auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("Teacher logged in:", user.email);

          // ✅ Redirect to the dashboard
          window.location.href = "teacher-dashboard.html";
        })
        .catch((error) => {
          console.error("Login error:", error.message);
          errorBox.textContent = "Login failed: " + error.message;
        });
    });
  }
});
