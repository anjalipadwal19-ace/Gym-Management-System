import { db } from "./firebase.js";
import { collection, getDocs, addDoc, query, where }
    from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= Role Check ================= */
window.onload = () => {
    if (localStorage.getItem("role") !== "staff") {
        window.location.href = "login.html";
        return;
    }
    document.getElementById("app").style.display = "block";
};

/* ================= Logout ================= */
window.logout = function () {
    localStorage.clear();
    window.location.href = "login.html";
}

/* ================= Section Control (Admin Style) ================= */
window.loadSection = async function (section) {
    const content = document.getElementById("main-content");
    switch (section) {
        case "dashboard":
            renderDashboard().then(html => {
                content.innerHTML = html;
            });
            break;
        case "member":
            loadMembers();
            break;
        case "attendance":
            loadAttendance();
            break;
        case "payment":
            loadPayments();
            break;
    }
}

/* ================= Dashboard ================= */
async function renderDashboard() {

    /* ================= Members ================= */
    const memberSnap =
        await getDocs(collection(db, "members"));
    let totalMembers = memberSnap.size;
    let activeMembers = 0;
    memberSnap.forEach(doc => {
        const m = doc.data();
        if (m.status === "Active") {
            activeMembers++;
        }
    });


    /* ================= Payments ================= */
    const paymentSnap =
        await getDocs(collection(db, "payments"));
    let totalEarning = 0;
    paymentSnap.forEach(doc => {
        totalEarning += Number(doc.data().amount || 0);
    });


    /* ================= Attendance ================= */
    const attendanceSnap =
        await getDocs(collection(db, "attendance"));
    let presentStaff = attendanceSnap.size;


    /* ================= Announcement ================= */
    const announceSnap = await getDocs(collection(db, "announcements"));
    let announcementsHTML = "";
    announceSnap.forEach(doc => {
        const a = doc.data();
        announcementsHTML += `
            <p> ${a.text} <br>
            <small>${a.date}</small></p>
            <hr>
        `;
    });

    /* ================= UI ================= */
    return `
        <div>

        <div class="card">
        <h3>${activeMembers}</h3>
        <p>Active Members</p>
        </div>

        <div class="card">
        <h3>${totalMembers}</h3>
        <p>Registered Members</p>
        </div>

        <div class="card">
        <h3>₹ ${totalEarning}</h3>
        <p>Total Earnings</p>
        </div>

        <div class="card">
        <h3>${presentStaff}</h3>
        <p>Attendance Records</p>
        </div>

        </div>

        <div class="card" style="width:95%">
        <h3>Gym Announcements</h3>
        ${announcementsHTML || "No Announcements"}
        </div>
    `;
}

/* ================= Member Management ================= */
async function loadMembers() {
    const snap = await getDocs(collection(db, "members"));
    let rows = "";
    snap.forEach(doc => {
        const m = doc.data();
        rows += `
            <tr>
            <td>${m.name}</td>
            <td>${m.join}</td>
            <td>${m.address}</td>
            <td>${m.contact}</td>
            <td>
            <button>Edit</button>
            <button>Delete</button>
            </td>
            </tr>
            `;
                });
                document.getElementById("main-content").innerHTML = `
            <input placeholder="Search Member">
            <button onclick="showForm()">Add Member</button>
            <table>
            <tr>
            <th>Name</th>
            <th>DOR</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Action</th>
            </tr>
            ${rows}
            </table>
            <div class="formBox" id="memberForm">
            <h3>Add Member</h3>
            <input id="mName" placeholder="Name">
            <input id="mUser" placeholder="Username">
            <input id="mPass" placeholder="Password">
            <input id="mAddress" placeholder="Address">
            <input id="mContact" placeholder="Contact">
            <input id="mPlan" placeholder="Membership Plan">
            <button onclick="addMember()">Add Member</button>
            </div>
        `;
}

/* ================= Add Member ================= */
async function addMember() {
    await addDoc(collection(db, "members"), {
        name: mName.value,
        username: mUser.value,
        password: mPass.value,
        address: mAddress.value,
        contact: mContact.value,
        plan: mPlan.value,
        join: new Date().toLocaleDateString()
    });
    alert("Member Added");
    loadSection("member");
}
window.addMember = addMember;

/* ================= Attendance ================= */
async function loadAttendance() {
    const snap = await getDocs(collection(db, "members"));
    let rows = "";
    snap.forEach(doc => {
        const m = doc.data();
        rows += `
            <tr>
            <td>${m.name}</td>
            <td>${m.contact}</td>
            <td>${m.plan}</td>
            <td>
            <button onclick="markAttendance('${m.name}','Check In')">
            Check In
            </button>
            <button onclick="markAttendance('${m.name}','Check Out')">
            Check Out
            </button>
            </td>
            </tr>
            `;
                });
                document.getElementById("main-content").innerHTML = `
            <input placeholder="Search Member">
            <table>
            <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Service</th>
            <th>Action</th>
            </tr>
            ${rows}
            </table>
        `;
}

/* ================= Payment ================= */
async function loadPayments() {
    const snap = await getDocs(collection(db, "members"));
    let rows = "";
    snap.forEach(doc => {
        const m = doc.data();
        rows += `
                <tr>
                <td>${m.name}</td>
                <td>${m.contact}</td>
                <td>${m.lastPayment || "-"}</td>
                <td>${m.amount || "-"}</td>
                <td>Fitness</td>
                <td>${m.plan}</td>
                <td>${m.diet || "-"}</td>
                <td>
                <button onclick="showReceipt('${m.name}')">
                Make Payment
                </button>
                <button onclick="sendAlert()">
                Alert
                </button>
                </td>
                </tr>
            `;
                });
            document.getElementById("main-content").innerHTML = `
                <input placeholder="Search Payment">
                <table>
                <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Last Payment</th>
                <th>Amount</th>
                <th>Service</th>
                <th>Plan</th>
                <th>Diet</th>
                <th>Action</th>
                </tr>
                ${rows}
                </table>
                <div class="receipt" id="receipt"></div>
            `;
}

/* ================= Receipt ================= */
window.showReceipt = function (name) {
    document.getElementById("receipt").style.display = "block";
    document.getElementById("receipt").innerHTML = `
        <h3>Perfect Gym</h3>
        <p>Name: ${name}</p>
        <p>Payment Successful</p>
        <button onclick="printReceipt()">Print PDF</button>
    `;
}

function printReceipt() {
    window.print();
}
window.printReceipt = printReceipt;

/* ================= Alert ================= */
function sendAlert() {
    alert("Reminder Sent Successfully!");
}
window.sendAlert = sendAlert;

/* ================= Mark Attendance ================= */
async function markAttendance(member) {
    const today = new Date().toLocaleDateString();
    const q = query(
        collection(db, "attendance"),
        where("memberId", "==", member.id),
        where("date", "==", today)
    );
    const snap = await getDocs(q);
    const status = snap.empty
        ? "Check In"
        : "Check Out";
    await addDoc(collection(db, "attendance"), {
        memberId: member.id,
        memberName: member.name,
        date: today,
        time: new Date().toLocaleTimeString(),
        status: status
    });
    alert(member.name + " " + status);
}
window.markAttendance = markAttendance;

/* ================= Form Show ================= */
function showForm() {
    document.getElementById("memberForm").style.display = "block";
}
window.showForm = showForm;