import { db } from "./firebase.js";
import { collection, query, where, getDocs }
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

window.login = async function (role) {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    if (!username || !password) {
        alert("Enter credentials");
        return;
    }

    // ===== Admin =====
    if (role === "admin") {
        const q = query(
            collection(db, "admin"),
            where("username", "==", username),
            where("password", "==", password)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
            localStorage.setItem("role", "admin");
            localStorage.setItem(
                "loggedAdmin",
                JSON.stringify({ id: snap.docs[0].id, ...snap.docs[0].data() })
            );
            window.location = "admin.html";
            return;
        }
    }

    // ===== Customer =====
    if (role === "customer") {
        const q = query(
            collection(db, "members"),
            where("username", "==", username),
            where("password", "==", password)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
            localStorage.setItem("role", "customer");
            localStorage.setItem(
                "loggedCustomer",
                JSON.stringify({ id: snap.docs[0].id, ...snap.docs[0].data() })
            );
            window.location = "customer.html";
            return;
        }
    }

    // ===== Staff =====
    if (role === "staff") {
        const q = query(
            collection(db, "staff"),
            where("username", "==", username),
            where("password", "==", password)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
            localStorage.setItem("role", "staff");
            localStorage.setItem(
                "loggedStaff",
                JSON.stringify({ id: snap.docs[0].id, ...snap.docs[0].data() })
            );
            window.location = "staff.html";
            return;
        }
    }
    alert("Invalid Login");
}