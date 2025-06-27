const student = JSON.parse(localStorage.getItem("student"));
if (!student) {
  alert("Login required.");
  window.location.href = "student-login.html";
}

document.getElementById("studentName").textContent = student.name;
document.getElementById("studentAdm").textContent = student.adm;
document.getElementById("studentClass").textContent = student.class;
document.getElementById("studentStream").textContent = student.stream;

const marksTableBody = document.querySelector("#marksTable tbody");

let totalMarks = 0;
let subjectCount = 0;

const allSubjects = [
  "English", "Kiswahili", "Mathematics",
  "Biology", "Physics", "Chemistry",
  "History", "Geography", "CRE", "IRE", "HRE",
  "Business Studies", "Agriculture", "Computer Studies", "Home Science", "Art and Design"
];

db.collection("marks")
  .where("studentId", "==", student.id)
  .get()
  .then(snapshot => {
    const marksData = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      marksData[data.subject] = data.mark;
    });

    const chartSubjects = [];
    const chartMarks = [];

    allSubjects.forEach(subject => {
      const mark = marksData[subject];
      const displayMark = mark !== undefined ? mark : "--";
      const grade = mark !== undefined ? getKCSEGrade(mark) : "E";

      if (mark !== undefined) {
        totalMarks += mark;
        subjectCount++;
      }

      // Add to table
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${subject}</td>
        <td>${displayMark}</td>
        <td>${grade}</td>
      `;
      marksTableBody.appendChild(row);

      // Add to chart
      chartSubjects.push(subject);
      chartMarks.push(mark !== undefined ? mark : 0);
    });

    const avg = subjectCount > 0 ? (totalMarks / subjectCount).toFixed(2) : 0;
    document.getElementById("average").textContent = avg;

    generateChart(chartSubjects, chartMarks);
    calculatePositions(avg);
  })
  .catch(error => {
    console.error("Error loading marks:", error);
  });

function getKCSEGrade(mark) {
  if (mark >= 85) return "A";
  if (mark >= 80) return "A-";
  if (mark >= 75) return "B+";
  if (mark >= 70) return "B";
  if (mark >= 65) return "B-";
  if (mark >= 60) return "C+";
  if (mark >= 55) return "C";
  if (mark >= 50) return "C-";
  if (mark >= 45) return "D+";
  if (mark >= 40) return "D";
  if (mark >= 35) return "D-";
  return "E";
}

function calculatePositions(myAvg) {
  db.collection("students")
    .where("class", "==", student.class)
    .get()
    .then(snap => {
      const fetchMarksPromises = [];

      snap.forEach(doc => {
        const stu = { id: doc.id, ...doc.data() };
        fetchMarksPromises.push(
          db.collection("marks")
            .where("studentId", "==", stu.id)
            .get()
            .then(marksSnap => {
              let total = 0;
              let count = 0;

              marksSnap.forEach(m => {
                total += m.data().mark;
                count++;
              });

              stu.avg = count > 0 ? (total / count).toFixed(2) : 0;
              return stu;
            })
        );
      });

      return Promise.all(fetchMarksPromises);
    })
    .then(results => {
      const allStudents = results.filter(stu => stu.avg !== undefined);

      const sortedClass = [...allStudents].sort((a, b) => b.avg - a.avg);
      const classIndex = sortedClass.findIndex(s => s.id === student.id);
      document.getElementById("classPosition").textContent = `${classIndex + 1} / ${sortedClass.length}`;

      const sameStream = allStudents.filter(s => s.stream === student.stream);
      const sortedStream = [...sameStream].sort((a, b) => b.avg - a.avg);
      const streamIndex = sortedStream.findIndex(s => s.id === student.id);
      document.getElementById("streamPosition").textContent = `${streamIndex + 1} / ${sameStream.length}`;
    })
    .catch(err => {
      console.error("Ranking error:", err);
    });
}

function generateChart(subjects, marks) {
  const ctx = document.getElementById("marksChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [{
        label: "Marks",
        data: marks,
        backgroundColor: "#003366cc",
        borderColor: "#003366",
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}
