import { db } from "./firebase.js";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where }
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

window.onload = async () => {
    if (localStorage.getItem("role") !== "admin") {
        window.location.href = "login.html";
        return;
    }
    document.getElementById( "dashboard-section" ).style.display = "block";
    await loadSection("dashboard");
    await checkMembershipExpiry();
    await generatePaymentReminders();
};

// ------------------- Sidebar Section Loader -------------------
async function loadSection(section) {
    const content = document.getElementById('main-content');
    switch (section) {
        case 'dashboard': content.innerHTML = await renderDashboard(); break;
        case 'members': content.innerHTML = await renderMembers(); break;
        case 'attendance': content.innerHTML = await renderAttendance(); break;
        case 'payment': content.innerHTML = await renderPayment(); break;
        case 'staff': content.innerHTML = await renderStaff(); break;
        case 'plans': content.innerHTML = await renderPlans(); break;
        case 'announcement': content.innerHTML = await renderAnnouncement(); break;
        case 'report': content.innerHTML = await renderReport(); break;
    }
}

// ------------------- Membership Expiry Checker -------------------
async function checkMembershipExpiry() {
    const members = await getCollectionData("members");
    const today = new Date();
    const plans = await getCollectionData("membershipPlans");
    for (const m of members) {
        if (!m.lastPaymentDate) continue;
        const plan = plans.find(p => p.name === m.plan);
        if (!plan) continue;
        const expiryDate = new Date(m.lastPaymentDate);
        expiryDate.setDate(
            expiryDate.getDate() + Number(plan.duration)
        );
    }
}

// ------------------- Reminder Generator -------------------
async function generatePaymentReminders() {
    const members = await getCollectionData("members");
    const today = new Date();
    for (const m of members) {
        if (!m.lastPaymentDate)
            continue;
        const expiry = new Date(m.lastPaymentDate);
        expiry.setDate(
            expiry.getDate() + Number(m.duration)
        );
        const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
        
        if (diffDays <= 5 && diffDays > 0) {
            const q = query(
                collection(db, "reminders"),
                where("name", "==", m.name),
                where("message", "==",
                    "Membership expiring soon")
            );
            const snap = await getDocs(q);

            if (snap.empty) {
                await addDoc(
                    collection(db, "reminders"),
                    {
                        name: m.name,
                        contact: m.contact,
                        message:
                            "Membership expiring soon",
                        date:
                            new Date().toLocaleDateString()
                    });
            }
        }
    }
}

// ------------------- Dashboard -------------------
async function renderDashboard() {
    const members = await getCollectionData("members");
    const staff = await getCollectionData("staff");
    const announcements = await getCollectionData("announcements");
    const reminders = await getCollectionData("reminders");
    const plans = await getCollectionData("membershipPlans");
    const today = new Date();
    let expiredMembers = [];
    let dueSoonMembers = [];

    members.forEach(m => {
        if (!m.lastPaymentDate) return;
        const lastPayment = new Date(m.lastPaymentDate);
        const expiryDate = new Date(lastPayment);
        const plan = plans.find(p => p.name === m.plan);
        if (!plan) return;
        expiryDate.setDate(
            expiryDate.getDate() + Number(plan.duration)
        );
        const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);
        if (diffDays <= 0) expiredMembers.push(m);
        else if (diffDays <= 5) dueSoonMembers.push(m);
    });

    const activeMembers = members.filter(m => m.status === 'active').length;
    const registeredMembers = members.length;

    setTimeout(() => {
        new Chart(document.getElementById('earning-chart'), { type: 'line', data: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Earnings', data: [1000, 1500, 2000] }] } });
        new Chart(document.getElementById('member-chart'), { type: 'pie', data: { labels: ['Male', 'Female', 'Other'], datasets: [{ data: [10, 5, 2] }] } });
    }, 100);

    return `
        <!-- 3x3 CARDS GRID -->
        <div class="dashboard-cards" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom:20px;">
            <div class="card">Expired Members: ${expiredMembers.length}</div>
            <div class="card">Payment Reminders: ${reminders.length}</div>
            <div class="card">Due Soon (5 Days): ${dueSoonMembers.length}</div>
            <div class="card">Active Members: ${activeMembers}</div>
            <div class="card">Registered Members: ${registeredMembers}</div>
            <div class="card">Total Earning: $0</div>
            <div class="card">Total Staff: ${staff.length}</div>
            <div class="card">Present Members: 0</div>
            <div class="card">Present Staff: 0</div>
        </div>

        <!-- LINE CHART -->
        <div class="card" style="margin-bottom:20px;">
            <h3>Earning and Expense Report</h3>
            <canvas id="earning-chart"></canvas>
        </div>

        <!-- PIE CHART + ANNOUNCEMENTS -->
        <div style="display:flex; gap:20px;">
            <div class="card" style="flex:1;">
                <h3>Registered Member Chart</h3>
                <canvas id="member-chart"></canvas>
            </div>
            <div class="card" style="flex:1;">
                <h3>Gym Announcements</h3>
                <div class="announcement-list">
                    ${announcements.map(a => `<p>${a.text} (${a.date})</p>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// ------------------- Members -------------------
async function loadMembers() {
    const snapshot = await getDocs(collection(db, "members"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function renderMembers() {
    return `
        <div class="tabs" id="members-tabs">
            <div class="tab active" onclick="showSubTab(event,'register')">Register Member</div>
            <div class="tab" onclick="showSubTab(event,'progress')">Member Progress</div>
            <div class="tab" onclick="showSubTab(event,'status')">Member Status</div>
        </div>
        <div id="member-content">${await renderRegisterMembers()}</div>
    `;
}

async function renderRegisterMembers() {
    const members = await loadMembers();
    const plans = await getCollectionData("membershipPlans");
    return `
        <button onclick="showAddMemberForm()">Add Member</button>
        <table class="table" id="members-table">
            <thead>
                <tr><th>Name</th><th>DOR</th><th>Address</th><th>Contact</th><th>Action</th></tr>
            </thead>
            <tbody>
                ${members.map(m => `
                    <tr>
                        <td>${m.name}</td>
                        <td>${m.join || 'N/A'}</td>
                        <td>${m.address}</td>
                        <td>${m.contact}</td>
                        <td>
                            <button onclick="editMember('${m.id}')">Edit</button>
                            <button onclick="deleteMember('${m.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div id="add-member-form" class="hidden">
            <form class="form" onsubmit="addMember(event)">
                <input name="name" placeholder="Name" required>
                <input name="address" placeholder="Address" required>
                <input name="contact" placeholder="Contact" required>
                <input name="username" placeholder="Username" required>
                <input name="password" type="password" required>
                <select name="plan" required>
                    ${plans.length ? plans.map(p => `<option value="${p.name}">${p.name}</option>`).join("") : `<option>No Plan</option>`}
                </select>
                <button type="submit">Add Member</button>
            </form>
        </div>
    `;
}

async function showSubTab(e, tab) {
    const tabsContainer = e.currentTarget.parentElement;
    tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const content = document.getElementById('member-content');
    if (tab === 'register') content.innerHTML = await renderRegisterMembers();
    else if (tab === 'progress') content.innerHTML = await renderMemberProgress();
    else if (tab === 'status') content.innerHTML = await renderMemberStatus();
}

// ------------------- Member Progress + Status -------------------
async function renderMemberProgress() {
    const members = await getCollectionData("members");
    return `
        <table class="table">
        <thead>
        <tr>
        <th>Name</th>
        <th>Initial Weight</th>
        <th>Current Weight</th>
        <th>Plan</th>
        </tr>
        </thead>
        <tbody>
        ${members.map(m => `
            <tr>
            <td>${m.name}</td>
            <td>${m.initialWeight || "N/A"}</td>
            <td>${m.currentWeight || "N/A"}</td>
            <td>${m.plan || "N/A"}</td>
            </tr>
        `).join("")}
        </tbody>
        </table>
    `;
}

async function renderMemberStatus() {
    const members = await getCollectionData("members");
    return `
        <table class="table">
        <thead>
        <tr>
        <th>Name</th>
        <th>Contact</th>
        <th>Plan</th>
        <th>Status</th>
        </tr>
        </thead>
        <tbody>
        ${members.map(m => `
            <tr>
            <td>${m.name}</td>
            <td>${m.contact}</td>
            <td>${m.plan}</td>
            <td>${m.status}</td>
            </tr>
        `).join("")}
        </tbody>
        </table>
    `;
}

// ------------------- Attendance -------------------
async function renderAttendance() {
    return `
        <div class="tabs">
        <div class="tab active"
        onclick="showAttendanceSubTab(event,'member')">
        Member Attendance
        </div>
        <div class="tab"
        onclick="showAttendanceSubTab(event,'staff')">
        Staff Attendance
        </div>
        </div>
        <div id="attendance-content">
        ${await renderMemberAttendance()}
        </div>
    `;
}

async function renderMemberAttendance() {
    const members = await getCollectionData("members");
    return `
        <table class="table">
        <thead>
        <tr>
        <th>Name</th>
        <th>Contact</th>
        <th>Action</th>
        </tr>
        </thead>
        <tbody>
        ${members.map(m => `
        <tr>
        <td>${m.name}</td>
        <td>${m.contact}</td>
        <td>
        <button onclick="checkInOut('${m.id}')">
        Check In / Out
        </button>
        </td>
        </tr>
        `).join("")}
        </tbody>
        </table>
    `;
}

async function renderStaffAttendance() {
    const staff = await getCollectionData("staff");
    return `
        <table class="table">
        <thead>
        <tr>
        <th>Name</th>
        <th>Contact</th>
        <th>Position</th>
        </tr>
        </thead>
        <tbody>
        ${staff.map(s => `
        <tr>
        <td>${s.name}</td>
        <td>${s.contact}</td>
        <td>${s.position}</td>
        </tr>
        `).join("")}
        </tbody>
        </table>
    `;
}

async function showAttendanceSubTab(e, tab) {
    const tabs = e.currentTarget.parentElement;
    tabs.querySelectorAll('.tab')
        .forEach(t => t.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const content = document.getElementById("attendance-content");
    if (tab === "member")
        content.innerHTML = await renderMemberAttendance();
    else
        content.innerHTML = await renderStaffAttendance();
}

async function checkInOut(memberId) {
    const members = await getCollectionData("members");
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const now = new Date();
    await addDoc(collection(db, "attendance"), {
        memberId: member.id,
        name: member.name,
        status: "Check In",
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    });
    alert("Attendance Saved");
}

// ------------------- Payment -------------------
async function renderPayment() {
    const payments = await getCollectionData("payments");
    return `
        <table class="table">
        <thead>
        <tr>
        <th>Name</th>
        <th>Amount</th>
        <th>Date</th>
        </tr>
        </thead>
        <tbody>
        ${payments.map(p => `
        <tr>
        <td>${p.name}</td>
        <td>${p.amount}</td>
        <td>${p.date}</td>
        </tr>
        `).join("")}
        </tbody>
        </table>
    `;
}

// ------------------- Staff Management -------------------
async function renderStaff() {
    const staff = await getCollectionData("staff");
    return `
        <button onclick="showAddStaffForm()"> Add Staff </button>
        <table class="table">
        <thead>
        <tr>
        <th>Name</th>
        <th>Contact</th>
        <th>Position</th>
        <th>Action</th>
        </tr>
        </thead>
        <tbody>
        ${staff.map(s => `
        <tr>
        <td>${s.name}</td>
        <td>${s.contact}</td>
        <td>${s.position}</td>
        <td>
        <button onclick="removeStaff('${s.id}')"> Remove </button>
        </td>
        </tr>
        `).join("")}
        </tbody>
        </table>
        <div id="add-staff-form" class="hidden">
        <form class="form" onsubmit="addStaff(event)">
        <input name="name" required placeholder="Name">
        <input name="contact" required placeholder="Contact">
        <input name="position" required placeholder="Position">
        <input name="username" required placeholder="Username">
        <input name="password" required placeholder="Password">
        <button>Add Staff</button>
        </form>
        </div>
    `;
}

function showAddStaffForm() {
    document.getElementById("add-staff-form")
        .classList.remove("hidden");
}

async function addStaff(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    await addDoc(collection(db, "staff"), {
        name: f.get("name"),
        contact: f.get("contact"),
        position: f.get("position"),
        username: f.get("username"),
        password: f.get("password")
    });
    alert("Staff Added");
    loadSection("staff");
}

async function removeStaff(id) {
    await deleteDoc(doc(db, "staff", id));
    loadSection("staff");
}

// ------------------- Diet + MemberShip Plan -------------------
async function renderPlans() {
    const diets = await getCollectionData("dietPlans");
    const plans = await getCollectionData("membershipPlans");
    return `
        <div class="card">
        <h3>Diet Plans</h3>
        <ul> ${diets.map(d => `<li>${d.name}</li>`).join("")} </ul>
        <h3>Membership Plans</h3>
        <ul> ${plans.map(p => `<li>${p.name} - ₹${p.price}</li> `).join("")} </ul>
        </div>
    `;
}

// ------------------- Announcement -------------------
async function renderAnnouncement() {
    const announcements =
        await getCollectionData("announcements");
    return `
        <button onclick="showAddAnnouncementForm()"> Add Announcement </button>
        <div id="add-announcement-form"
        class="hidden">
        <form onsubmit="addAnnouncement(event)">
        <textarea name="text" required></textarea>
        <input type="date" name="date" required>
        <button>Publish</button>
        </form>
        </div>
        <div>
        ${announcements.map(a =>
                `<p>${a.text} (${a.date})</p>`
            ).join("")}
        </div>
    `;
}

function showAddAnnouncementForm() {
    document.getElementById( "add-announcement-form" ).classList.remove("hidden");
}

async function addAnnouncement(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    await addDoc(
        collection(db, "announcements"),
        {
            text: f.get("text"),
            date: f.get("date")
        });
    loadSection("announcement");
}

// ------------------- Report -------------------
async function renderReport() {
    setTimeout(() => {
        new Chart(
            document.getElementById("report-chart"),
            {
                type: "bar",
                data: {
                    labels: ["Jan", "Feb", "Mar"],
                    datasets: [
                        {
                            label: "Members",
                            data: [10, 20, 30]
                        }
                    ]
                }
            });
    }, 100);
    return `
        <div class="card">
        <h3>Gym Report</h3>
        <canvas id="report-chart"></canvas>
        </div>
    `;
}

// ------------------- Utility -------------------
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

async function getCollectionData(name) {
    const snapshot = await getDocs(collection(db, name));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ------------------- Add Member Form -------------------
function showAddMemberForm() {
    document.getElementById("add-member-form").classList.remove("hidden");
}

async function addMember(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    await addDoc(collection(db, "members"), {
        name: f.get("name"),
        address: f.get("address"),
        contact: f.get("contact"),
        username: f.get("username"),
        password: f.get("password"),
        plan: f.get("plan"),
        status: "active",
        join: new Date().toLocaleDateString(),
        lastPaymentDate: new Date().toISOString()
    });
    alert("Member Added Successfully");
    loadSection("members");
}

async function deleteMember(id) {
    await deleteDoc(doc(db, "members", id));
    alert("Member Deleted");
    loadSection("members");
}

function editMember(id) {
    alert("Edit feature coming soon");
}

// ------------------- Make functions global -------------------
window.loadSection = loadSection;
window.logout = logout;
window.showSubTab = showSubTab;
window.showAttendanceSubTab = showAttendanceSubTab;
window.showAddStaffForm = showAddStaffForm;
window.addStaff = addStaff;
window.removeStaff = removeStaff;
window.showAddAnnouncementForm = showAddAnnouncementForm;
window.addAnnouncement = addAnnouncement;
window.checkInOut = checkInOut;
window.showAddMemberForm = showAddMemberForm;
window.addMember = addMember;
window.deleteMember = deleteMember;
window.editMember = editMember;

window.renderDashboard = renderDashboard;
window.renderMembers = renderMembers;
window.renderStaff = renderStaff;
window.renderAttendance = renderAttendance;
window.renderPayments = renderPayments;