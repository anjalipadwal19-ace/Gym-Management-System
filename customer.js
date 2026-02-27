import { db } from "./firebase.js";
import { collection, addDoc, getDocs, query, where }
    from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= Role Check ================= */
if (localStorage.getItem("role") !== "customer") {
    window.location.href = "login.html";
} else {
    document.getElementById("mainApp").style.display = "block";
}

/* ================= Logout ================= */
window.logout = function () {
    localStorage.clear();
    window.location.href = "login.html";
}

/* ================= Sidebar Control ================= */
window.loadSection = async function (section) {
    const content = document.getElementById("main-content");
    switch (section) {
        case "dashboard":
            content.innerHTML = await renderDashboard();
            setTimeout(renderTask, 100);
            break;
        case "todo":
            content.innerHTML = renderTodo();
            break;
        case "reminder":
            loadReminder();
            break;
        case "attendance":
            loadAttendance();
            break;
        case "announcement":
            loadAnnouncement();
            break;
        case "report":
            renderReport().then(html => { content.innerHTML = html; });
            break;
    }
}

/* ================= Payment Status ================= */
async function checkPaymentStatus(user) {
    if (!user.lastPaymentDate)
        return "NOT PAID";
    const snap = await getDocs(collection(db, "membershipPlans"));
    let plans = [];
    snap.forEach(d => plans.push(d.data()));
    const plan = plans.find(p => p.name === user.plan);
    if (!plan) return "UNKNOWN";
    const expiry = new Date(user.lastPaymentDate);
    expiry.setDate(expiry.getDate() + parseInt(plan.duration));
    const diff = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "OVERDUE";
    if (diff <= 5) return "DUE_SOON";
    return "ACTIVE";
}

/* ================= Dashboard ================= */
async function renderDashboard() {
    let user = JSON.parse(localStorage.getItem("loggedCustomer")) || {};
    const paymentStatus = await checkPaymentStatus(user);
    return `
        <div class="card">
        <h3>Customer Detail</h3>
        <p>Name: ${user.name}</p>
        <p>Membership Plan: ${user.plan}</p>
        <p>Diet Plan: ${user.diet}</p>
        <p>Trainer: ${user.trainer}</p>
        <p>Status: ${user.status}</p>
        <p>Join Date: ${user.join}</p>
        <p>Payment: ${user.payment}</p>
        <p><b>Payment Status:</b> ${paymentStatus}</p>
        </div>
        <div class="card">
        <h3>To Do List</h3>
        <table>
        <thead>
        <tr>
        <th>Description</th>
        <th>Status</th>
        </tr>
        </thead>
        <tbody id="todoTable"></tbody>
        </table>
        </div>
    `;
}

/* ================= ToDo ================= */
async function addTask() {
    let text = document.getElementById("taskText").value;
    let status = document.getElementById("taskStatus").value;
    let user = JSON.parse(localStorage.getItem("loggedCustomer"));
    await addDoc(collection(db, "tasks"), {
        user: user.name,
        text: text,
        status: status
    });
    loadSection("dashboard");
}

window.addTask = addTask;

function renderTodo() {
    return `
        <div class="card">
        <h3>Add Task</h3>
        <input id="taskText" placeholder="Enter Task">
        <select id="taskStatus">
        <option>In Progress</option>
        <option>Pending</option>
        </select>
        <button onclick="addTask()">Add To List</button>
        </div>
    `;
}

async function renderTask() {
    let user = JSON.parse(localStorage.getItem("loggedCustomer"));
    const q = query(
        collection(db, "tasks"),
        where("user", "==", user.name)
    );
    const snap = await getDocs(q);
    let table = document.getElementById("todoTable");
    if (!table) return;
    table.innerHTML = "";
    snap.forEach(d => {
        const t = d.data();
        table.innerHTML += `<tr> <td>${t.text}</td> <td>${t.status}</td> </tr>`;
    });
}


/* ================= Reminder ================= */
async function loadReminder() {
    let user = JSON.parse(localStorage.getItem("loggedCustomer"));
    const q = query(
        collection(db, "reminders"),
        where("name", "==", user.name)
    );
    const snap = await getDocs(q);
    let html = "";
    if (snap.empty) {
        html = `<div class="alert">No Reminder</div>`;
    } else {
        snap.forEach(doc => {
            const r = doc.data();
            html += `<p> ${r.message}<br> Date: ${r.date}</p>`;
        });
        html = `<div class="alert">${html}</div>`;
    }
    document.getElementById("main-content").innerHTML = html;
}

/* ================= AttendanceT ================= */
async function loadAttendance() {
    let user = JSON.parse(localStorage.getItem("loggedCustomer"));
    const q = query(
        collection(db, "attendance"),
        where("memberId", "==", user.id)
    );
    const snap = await getDocs(q);
    let rows = "";
    snap.forEach(doc => {
        const a = doc.data();
        rows += ` <tr> <td>${a.date}</td> <td>${a.time}</td> <td>${a.status}</td> </tr>`;
    });
    document.getElementById("main-content").innerHTML = `
    <div class="card">
    <h3>My Attendance</h3>
    <table>
    <tr>
    <th>Date</th>
    <th>Time</th>
    <th>Status</th>
    </tr>
    ${rows || "<tr><td colspan='3'>No Attendance</td></tr>"}
    </table>
    </div>
    `;
}

/* ================= Announcement ================= */
async function loadAnnouncement() {
    const snap = await getDocs(collection(db, "announcements"));
    let html = "";
    snap.forEach(doc => {
        const a = doc.data();
        html += `<li>${a.text} (${a.date})</li>`;
    });
    document.getElementById("main-content").innerHTML = `
    <div class="card">
    <h3>Announcements</h3>
    <ul>${html}</ul>
    </div>`;
}

/* ================= Report ================= */
async function renderReport() {
    let user = JSON.parse(localStorage.getItem("loggedCustomer"));
    const q = query(
        collection(db, "attendance"),
        where("name", "==", user.name)
    );
    const snap = await getDocs(q);
    let total = 0;
    let lastVisit = "--";
    snap.forEach(doc => {
        const a = doc.data();
        if (a.status === "Check In") {
            total++;
            lastVisit = a.date;
        }
    });
    return `
        <div class="report-box">
        <h3>Perfect Gym</h3>
        <p>Pune, Maharashtra</p>
        <table>
        <tr>
        <th>Name</th>
        <th>Total Visits</th>
        <th>Last Visit</th>
        </tr>
        <tr>
        <td>${user.name}</td>
        <td>${total}</td>
        <td>${lastVisit}</td>
        </tr>
        </table>
        <p><b>Status:</b> Active</p>
        </div>
    `;
}

/* ================= Page Load ================= */
window.onload = function () {
    if (localStorage.getItem("role") !== "customer") {
        window.location.href = "login.html";
        return;
    }
    document.getElementById("mainApp").style.display = "block";
    loadSection("dashboard");
};