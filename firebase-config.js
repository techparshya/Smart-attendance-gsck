// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_cnWPfCV-SUXxE9f7wmpmbOBMcjudSc8",
  authDomain: "studentattendanceapp-2c9a3.firebaseapp.com",
  projectId: "studentattendanceapp-2c9a3",
  storageBucket: "studentattendanceapp-2c9a3.appspot.com", // ✅ Fixed here
  messagingSenderId: "642173654992",
  appId: "1:642173654992:web:cebaf8db17f890548d4bd5"
};

export const app = initializeApp(firebaseConfig);


