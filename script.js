// NOTE: Firebase imports are now loaded only ONCE
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Login
window.login = function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
};

// Register
window.register = function () {
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Registration successful!");
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert("Registration failed: " + error.message);
    });
};

// Logout
window.logout = function () {
  signOut(auth).then(() => {
    alert("Logged out!");
    window.location.href = "index.html";
  }).catch((error) => {
    alert("Error logging out: " + error.message);
  });
};

// Tab Toggle
window.toggleTab = function (tab) {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("registerForm").classList.remove("active");
  document.getElementById("loginTab").classList.remove("active");
  document.getElementById("registerTab").classList.remove("active");

  if (tab === "login") {
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("loginTab").classList.add("active");
  } else {
    document.getElementById("registerForm").classList.add("active");
    document.getElementById("registerTab").classList.add("active");
  }
};

// Iframe Page Navigator
window.navigate = function (page) {
  document.getElementById("pageFrame").src = page;
};

// Default Attendance Date
window.onload = function () {
  const dateField = document.getElementById("attendanceDate");
  if (dateField) {
    const today = new Date().toISOString().split("T")[0];
    dateField.value = today;
  }
  const downloadDateField = document.getElementById("downloadDate");
  if (downloadDateField) {
    const today = new Date().toISOString().split("T")[0];
    downloadDateField.value = today;
  }
};

// ADD STUDENT
window.addStudent = async function () {
  const course = document.getElementById("course").value;
  const semester = document.getElementById("semester").value;
  const subject = document.getElementById("subject").value;
  const name = document.getElementById("name").value;
  const roll = document.getElementById("roll").value;
  const contact = document.getElementById("contact").value;

  if (!course || !semester || !subject || !name || !roll || !contact) {
    alert("Please fill all fields.");
    return;
  }

  try {
    await addDoc(collection(db, "students"), {
      course,
      semester,
      subject,
      name,
      roll,
      contact
    });
    document.getElementById("add-status").innerText = "✅ Student added successfully!";
    document.getElementById("name").value = "";
    document.getElementById("roll").value = "";
    document.getElementById("contact").value = "";
    window.loadStudents?.();
  } catch (error) {
    alert("❌ Error adding student: " + error.message);
  }
};

// REMOVE STUDENT
window.removeStudent = async function () {
  const course = document.getElementById("removeCourse").value;
  const semester = document.getElementById("removeSemester").value;
  const roll = document.getElementById("removeRoll").value;

  if (!course || !semester || !roll) {
    alert("❌ Please fill course, semester, and roll no.");
    return;
  }

  const q = query(
    collection(db, "students"),
    where("course", "==", course),
    where("semester", "==", semester),
    where("roll", "==", roll)
  );

  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      document.getElementById("remove-status").innerText = "❌ No student found with this roll number.";
      return;
    }

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, "students", docSnap.id));
    });

    document.getElementById("remove-status").innerText = "✅ Student removed successfully!";
    document.getElementById("removeRoll").value = "";
    window.loadStudents?.();
  } catch (err) {
    document.getElementById("remove-status").innerText = "❌ Error: " + err.message;
  }
};

// LOAD STUDENTS
let studentQueue = [];
let currentStudentIndex = 0;

window.loadStudents = async function () {
  const course = document.getElementById("course")?.value;
  const semester = document.getElementById("semester")?.value;
  const subject = document.getElementById("subject")?.value;

  if (!course || !semester || !subject) {
    return;
  }

  const q = query(collection(db, "students"),
    where("course", "==", course),
    where("semester", "==", semester),
    where("subject", "==", subject));

  const snapshot = await getDocs(q);
  studentQueue = [];
  snapshot.forEach((docSnap) => {
    studentQueue.push(docSnap.data());
  });

  currentStudentIndex = 0;
  showNextCard();
};

function showNextCard() {
  const area = document.getElementById("card-area");
  if (!area) return;

  area.innerHTML = "";

  if (currentStudentIndex >= studentQueue.length) {
    area.innerHTML = "<p>✅ Attendance Completed!</p>";
    return;
  }

  const s = studentQueue[currentStudentIndex];

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>${s.name}</h3>
    <p>Roll No: ${s.roll}</p>
    <p>Contact: ${s.contact}</p>
    <div class="btn-group">
      <button class="present-btn">P</button>
      <button class="absent-btn">A</button>
    </div>
  `;

  card.querySelector(".present-btn").addEventListener("click", () => window.markAttendance(s, "P", card));
  card.querySelector(".absent-btn").addEventListener("click", () => window.markAttendance(s, "A", card));

  area.appendChild(card);
}

// MARK ATTENDANCE
window.markAttendance = async function (student, status) {
  const subject = document.getElementById("subject").value.trim();
  const course = document.getElementById("course").value.trim();
  const semester = document.getElementById("semester").value.trim();
  const date = document.getElementById("attendanceDate")?.value.trim() || new Date().toISOString().split("T")[0];

  const safeSubject = subject.replace(/\s+/g, "_");
  const safeCourse = course.replace(/\s+/g, "_");
  const safeSemester = semester.replace(/\s+/g, "_");

  const collectionName = `attendance/${date}/${safeSubject}_${safeCourse}_${safeSemester}`;

  try {
    const ref = doc(db, collectionName, student.roll);
    await setDoc(ref, {
      name: student.name,
      roll: student.roll,
      contact: student.contact,
      status,
      timestamp: new Date(),
      course,
      semester,
      subject,
      date
    });

    currentStudentIndex++;
    showNextCard();
  } catch (err) {
    alert("❌ Error saving attendance: " + err.message);
  }
};

// DOWNLOAD ATTENDANCE WITH DATE SUPPORT
window.downloadAttendance = async function () {
  const course = document.getElementById("course").value;
  const semester = document.getElementById("semester").value;
  const subject = document.getElementById("subject").value;
  const date = document.getElementById("downloadDate")?.value;

  if (!course || !semester || !subject || !date) {
    alert("Please select course, semester, subject and date.");
    return;
  }

  const path = `${subject}_${course}_${semester}`;
  const subCollection = collection(db, `attendance/${date}/${path}`);
  const snapshot = await getDocs(subCollection);

  const attendanceData = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    attendanceData.push({
      Date: date,
      Name: data.name,
      Roll: data.roll,
      Contact: data.contact,
      Status: data.status,
      Course: data.course,
      Semester: data.semester,
      Subject: data.subject
    });
  });

  if (attendanceData.length === 0) {
    document.getElementById("download-status").innerText = "❌ No attendance records found.";
    return;
  }

  const ws = XLSX.utils.json_to_sheet(attendanceData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  XLSX.writeFile(wb, `Attendance_${subject}_${course}_${semester}_${date}.xlsx`);
  document.getElementById("download-status").innerText = "✅ Excel downloaded!";
};

// ✅ Attach button listeners after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector("button[onclick='addStudent()']");
  const removeBtn = document.querySelector("button[onclick='removeStudent()']");

  if (addBtn) addBtn.addEventListener("click", window.addStudent);
  if (removeBtn) removeBtn.addEventListener("click", window.removeStudent);
});
