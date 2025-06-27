// Uses already-declared `auth` and `db` from firebase-config.js

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("You are not logged in.");
    window.location.href = "teacher-login.html";
    return;
  }

  try {
    const teacherRef = db.collection("teachers").doc(user.uid);
    const doc = await teacherRef.get();

    if (!doc.exists) {
      alert("No teacher profile found. Please contact admin.");
      return;
    }

    const teacher = doc.data();

    // Display welcome message
    const welcomeEl = document.getElementById("welcomeMessage");
    if (welcomeEl && teacher.name) {
      welcomeEl.textContent = `👋 Welcome, ${teacher.name}`;
    }

    // Set subject in read-only input
    const subjectInput = document.getElementById("markSubject");
    if (subjectInput) {
      subjectInput.value = teacher.subject || "Not Assigned";
    }

    // Load students and show marks
    loadStudents(teacher.subject);

  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    alert("There was a problem fetching your profile.");
  }
});

async function loadStudents(subject) {
  const tableBody = document.querySelector("#studentTable tbody");
  tableBody.innerHTML = "";

  try {
    const snapshot = await db.collection("students").get();

    for (const doc of snapshot.docs) {
      const student = doc.data();
      const studentId = doc.id;

      let existingMark = "";
      try {
        const markDoc = await db.collection("marks").doc(studentId).get();
        if (markDoc.exists && markDoc.data()[subject] !== undefined) {
          existingMark = markDoc.data()[subject];
        }
      } catch (err) {
        console.warn(`Couldn't load mark for ${student.name}`);
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.name}</td>
        <td>${student.adm}</td>
        <td>${student.class}</td>
        <td>${student.stream}</td>
        <td><input type="number" id="mark-${studentId}" value="${existingMark}" min="0" max="100" /></td>
        <td><button onclick="submitMark('${studentId}', '${subject}')">Save</button></td>
      `;
      tableBody.appendChild(row);
    }

  } catch (error) {
    console.error("Error loading students:", error);
    alert("Failed to load students.");
  }
}

async function submitMark(studentId, subject) {
  const input = document.getElementById(`mark-${studentId}`);
  const mark = parseInt(input.value);

  if (input.value === "") {
    alert("Please enter a mark.");
    return;
  }

  if (isNaN(mark) || mark < 0 || mark > 100) {
    alert("Enter a valid mark between 0 and 100.");
    return;
  }

  try {
    await db.collection("marks").doc(studentId).set({
      [subject]: mark
    }, { merge: true });

    input.style.backgroundColor = "#e0ffe0"; // Light green
    setTimeout(() => input.style.backgroundColor = "", 1000);

  } catch (error) {
    console.error("Error saving mark:", error);
    alert("Failed to save mark. Try again.");
  }
}
