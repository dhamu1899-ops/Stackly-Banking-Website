/* =========================
   GLOBAL VARIABLES
========================= */

const loader = document.getElementById("loader");
const app = document.getElementById("app");

const pageIds = [
    "landingPage",
    "loginPage",
    "signupPage",
    "notFoundPage",
    "dashboardPage"
];

let currentRole = "user";
let currentEmail = "user@gmail.com";
let currentName = "User";

/* =========================
   LOADER
========================= */

window.addEventListener("load", () => {
    const savedSession = JSON.parse(localStorage.getItem("stacklySession") || "null");

    setTimeout(() => {
        loader.style.display = "none";
        app.classList.remove("hide");

        if (savedSession && savedSession.email && savedSession.role) {
            currentRole = savedSession.role;
            currentEmail = savedSession.email;
            currentName = savedSession.name || getNameFromEmail(currentEmail);
            openDashboard(false);
        }
    }, 800);
});

/* =========================
   PAGE NAVIGATION
========================= */

function hidePages() {
    pageIds.forEach((id) => {
        document.getElementById(id).classList.remove("active-page");
    });
}

function closeMenus() {
    document.getElementById("headerNav")?.classList.remove("open");
    document.getElementById("sidebar")?.classList.remove("open");
}

function showLanding() {
    hidePages();
    closeMenus();

    document.getElementById("landingPage").classList.add("active-page");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showLogin() {
    hidePages();
    closeMenus();

    document.getElementById("loginPage").classList.add("active-page");
}

function showSignup() {
    hidePages();
    closeMenus();

    document.getElementById("signupPage").classList.add("active-page");
}

function open404() {
    hidePages();
    closeMenus();

    document.getElementById("notFoundPage").classList.add("active-page");
}

function scrollToSection(id) {
    showLanding();

    setTimeout(() => {
        document.getElementById(id).scrollIntoView({
            behavior: "smooth"
        });
    }, 80);
}

/* =========================
   MOBILE MENUS
========================= */

function toggleMenu() {
    document.getElementById("headerNav").classList.toggle("open");
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

/* =========================
   TOAST MESSAGE
========================= */

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.style.background = type === "error" ? "#ef4444" : "#16a34a";
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

/* =========================
   USER NAME FROM EMAIL
========================= */

function getNameFromEmail(email) {
    const name = (email.split("@")[0] || "User")
        .replace(/[0-9._-]/g, " ")
        .trim()
        .split(" ")[0];

    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/* =========================
   SIGN UP
========================= */

document.getElementById("signupForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const role = document.getElementById("signupRole").value;
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (password !== confirm) {
        showToast("Password and confirm password do not match", "error");
        return;
    }

    const users = JSON.parse(localStorage.getItem("stacklyUsers") || "[]");
    const existingIndex = users.findIndex(
        (user) => user.email === email && user.role === role
    );

    const userData = { role, name, email, password };

    if (existingIndex >= 0) {
        users[existingIndex] = userData;
    } else {
        users.push(userData);
    }

    localStorage.setItem("stacklyUsers", JSON.stringify(users));
    localStorage.setItem("stacklyUser", JSON.stringify(userData));

    showToast("Sign up successful!");

    setTimeout(() => {
        showLogin();

        document.getElementById("loginEmail").value = email;
        document.getElementById("loginRole").value = role;
    }, 900);
});

/* =========================
   LOGIN
========================= */

document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    currentRole = document.getElementById("loginRole").value;
    currentEmail = document.getElementById("loginEmail").value.trim();

    const password = document.getElementById("loginPassword").value;
    const users = JSON.parse(localStorage.getItem("stacklyUsers") || "[]");
    const oldSavedUser = JSON.parse(localStorage.getItem("stacklyUser") || "null");
    const savedUser =
        users.find((user) => user.email === currentEmail && user.role === currentRole) ||
        (oldSavedUser &&
        oldSavedUser.email === currentEmail &&
        oldSavedUser.role === currentRole
            ? oldSavedUser
            : null);

    if (savedUser && savedUser.password !== password) {
        showToast("Invalid password", "error");
        return;
    }

    currentName = savedUser ? savedUser.name : getNameFromEmail(currentEmail);

    localStorage.setItem(
        "stacklySession",
        JSON.stringify({
            role: currentRole,
            email: currentEmail,
            name: currentName
        })
    );

    openDashboard(true);
});

/* =========================
   DASHBOARD
========================= */

function openDashboard(showLoginMessage = true) {
    hidePages();
    closeMenus();

    document.getElementById("dashboardPage").classList.add("active-page");

    document.getElementById("profileEmail").textContent = currentEmail;

    document.getElementById("greeting").textContent = `Hi ${currentName}`;

    document.getElementById("roleText").textContent =
        currentRole === "admin"
            ? "Admin Banking Dashboard"
            : "User Banking Dashboard";

    document.getElementById("logoutAvatar").textContent =
        (currentName || currentRole || "U").charAt(0).toUpperCase();

    renderRoleContent();
    switchDashPage("dashboard");

    if (showLoginMessage) {
        showToast(`${currentRole === "admin" ? "Admin" : "User"} login successful!`);
    }
}

document.querySelectorAll(".side-link").forEach((button) => {
    button.addEventListener("click", () => {
        switchDashPage(button.dataset.page);

        if (window.innerWidth <= 1024) {
            toggleSidebar();
        }
    });
});

function switchDashPage(page) {
    document.querySelectorAll(".side-link").forEach((button) => {
        button.classList.remove("active");
    });

    document
        .querySelector(`.side-link[data-page="${page}"]`)
        .classList.add("active");

    document.querySelectorAll(".content-section").forEach((section) => {
        section.classList.remove("active-content");
    });

    document.getElementById(page + "Content").classList.add("active-content");
}

function logout() {
    localStorage.removeItem("stacklySession");

    currentRole = "user";
    currentEmail = "";
    currentName = "User";

    document.getElementById("loginForm")?.reset();
    document.getElementById("loginRole").value = "user";

    showToast("Logged out successfully!");

    setTimeout(showLogin, 850);
}

function renderRoleContent() {
    if (currentRole === "admin") {
        renderAdmin();
    } else {
        renderUser();
    }
}

/* =========================
   USER DASHBOARD CONTENT
========================= */

function renderUser() {
    document.getElementById("dashboardContent").innerHTML = `
        <div class="grid">
            <div class="dash-card balance">
                <p>Total Balance</p>
                <h2>₹4,85,250</h2>
                <span>+12.4% this month</span>
            </div>

            <div class="dash-card">
                <p>Savings</p>
                <h2>₹1,25,000</h2>
                <span>Goal 62%</span>
            </div>

            <div class="dash-card">
                <p>Monthly Spend</p>
                <h2>₹38,740</h2>
                <span>Bills & Shopping</span>
            </div>

            <div class="dash-card">
                <p>Credit Score</p>
                <h2>782</h2>
                <span>Excellent</span>
            </div>

            <div class="dash-card wide">
                <h3>Recent Transactions</h3>
                <div class="transaction"><span>Salary Credit</span><b class="green">+₹75,000</b></div>
                <div class="transaction"><span>Amazon Shopping</span><b>-₹2,499</b></div>
                <div class="transaction"><span>Electricity Bill</span><b>-₹1,850</b></div>
            </div>

            <div class="dash-card wide">
                <h3>Spending Overview</h3>
                <div class="bar-chart">
                    <span style="height:60%"></span>
                    <span style="height:80%"></span>
                    <span style="height:45%"></span>
                    <span style="height:90%"></span>
                    <span style="height:55%"></span>
                </div>
            </div>
        </div>
    `;

    document.getElementById("cardsContent").innerHTML = `
        <div class="grid">
            <div class="dash-card wide">
                <h3>My Debit Card</h3>
                <div class="card-visual">
                    <div class="card-row">
                        <b>Stackly Platinum</b>
                        <b>VISA</b>
                    </div>
                    <h2>**** **** **** 4821</h2>
                    <div class="card-row">
                        <span>${currentName}</span>
                        <span>12/29</span>
                    </div>
                </div>
            </div>

            <div class="dash-card">
                <p>Card Limit</p>
                <h2>₹2,00,000</h2>
                <span>Available ₹1,48,500</span>
            </div>

            <div class="dash-card">
                <p>Status</p>
                <h2>Active</h2>
                <span>International Off</span>
            </div>

            <div class="dash-card full">
                <h3>Card Controls</h3>
                <div class="quick-actions">
                    <button>Freeze Card</button>
                    <button>Change PIN</button>
                    <button>Set Limit</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("transfersContent").innerHTML = `
        <div class="grid">
            <div class="dash-card wide">
                <h3>Money Transfer</h3>
                <div class="transfer-form">
                    <input placeholder="Beneficiary Name" />
                    <input placeholder="Account Number" />
                    <input placeholder="Amount" />
                    <button class="primary" onclick="showToast('Static transfer request created!')">
                        Send Money
                    </button>
                </div>
            </div>

            <div class="dash-card">
                <p>UPI Limit</p>
                <h2>₹1,00,000</h2>
                <span>Per day</span>
            </div>

            <div class="dash-card">
                <p>Last Transfer</p>
                <h2>₹5,000</h2>
                <span>To Rahul</span>
            </div>

            <div class="dash-card full">
                <h3>Quick Transfers</h3>
                <div class="quick-actions">
                    <button>To Self</button>
                    <button>To Friend</button>
                    <button>Pay Bill</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("analyticsContent").innerHTML = `
        <div class="grid">
            <div class="dash-card">
                <p>Income</p>
                <h2>₹75,000</h2>
                <span>This month</span>
            </div>

            <div class="dash-card">
                <p>Expense</p>
                <h2>₹38,740</h2>
                <span>This month</span>
            </div>

            <div class="dash-card">
                <p>Savings Rate</p>
                <h2>48%</h2>
                <span>Good</span>
            </div>

            <div class="dash-card">
                <p>Investments</p>
                <h2>₹82,000</h2>
                <span>Growing</span>
            </div>

            <div class="dash-card full">
                <h3>Monthly Analytics</h3>
                <div class="bar-chart">
                    <span style="height:40%"></span>
                    <span style="height:60%"></span>
                    <span style="height:75%"></span>
                    <span style="height:50%"></span>
                    <span style="height:90%"></span>
                    <span style="height:70%"></span>
                </div>
            </div>
        </div>
    `;

    document.getElementById("settingsContent").innerHTML = `
        <div class="grid">
            <div class="dash-card">
                <div class="settings-avatar">${currentName.charAt(0)}</div>
                <h2>${currentName}</h2>
                <p>${currentEmail}</p>
            </div>

            <div class="dash-card">
                <p>Role</p>
                <h2>User</h2>
                <span>Customer Access</span>
            </div>

            <div class="dash-card wide">
                <h3>Settings</h3>
                <div class="setting-row"><span>Two Factor Authentication</span><b class="green">Enabled</b></div>
                <div class="setting-row"><span>Email Alerts</span><b class="green">On</b></div>
                <div class="setting-row"><span>Dark Secure Mode</span><b>Default</b></div>
            </div>

            <div class="dash-card full">
                <button class="primary" onclick="showToast('Settings saved!')">
                    Save Settings
                </button>
            </div>
        </div>
    `;
}

/* =========================
   ADMIN DASHBOARD CONTENT
========================= */

function renderAdmin() {
    document.getElementById("dashboardContent").innerHTML = `
        <div class="grid">
            <div class="dash-card balance">
                <p>Total Customers</p>
                <h2>24,680</h2>
                <span>Admin Control</span>
            </div>

            <div class="dash-card">
                <p>Active Accounts</p>
                <h2>18,940</h2>
                <span>76.7%</span>
            </div>

            <div class="dash-card">
                <p>Pending KYC</p>
                <h2>1,328</h2>
                <span>Needs Review</span>
            </div>

            <div class="dash-card">
                <p>Daily Volume</p>
                <h2>₹8.7Cr</h2>
                <span>Today</span>
            </div>

            <div class="dash-card wide">
                <h3>Admin Activity</h3>
                <div class="transaction"><span>New Account Approved</span><b class="green">Done</b></div>
                <div class="transaction"><span>Fraud Alert Review</span><b class="red">High</b></div>
                <div class="transaction"><span>KYC Batch</span><b>Pending</b></div>
            </div>

            <div class="dash-card wide">
                <h3>Bank Performance</h3>
                <div class="bar-chart admin-bar">
                    <span style="height:85%"></span>
                    <span style="height:65%"></span>
                    <span style="height:95%"></span>
                    <span style="height:75%"></span>
                    <span style="height:90%"></span>
                </div>
            </div>
        </div>
    `;

    document.getElementById("cardsContent").innerHTML = `
        <div class="grid">
            <div class="dash-card balance">
                <p>Total Issued Cards</p>
                <h2>16,450</h2>
                <span>Debit + Credit</span>
            </div>

            <div class="dash-card">
                <p>Blocked Cards</p>
                <h2>214</h2>
                <span>Security hold</span>
            </div>

            <div class="dash-card">
                <p>New Requests</p>
                <h2>389</h2>
                <span>Today</span>
            </div>

            <div class="dash-card">
                <p>Card Revenue</p>
                <h2>₹42L</h2>
                <span>Monthly</span>
            </div>

            <div class="dash-card full">
                <h3>Card Admin Controls</h3>
                <div class="quick-actions">
                    <button>Approve Card</button>
                    <button>Block Card</button>
                    <button>Review Limits</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("transfersContent").innerHTML = `
        <div class="grid">
            <div class="dash-card balance">
                <p>Total Transfers</p>
                <h2>58,920</h2>
                <span>Today</span>
            </div>

            <div class="dash-card">
                <p>Failed Transfers</p>
                <h2>156</h2>
                <span>Review</span>
            </div>

            <div class="dash-card">
                <p>High Value</p>
                <h2>₹2.4Cr</h2>
                <span>Flagged</span>
            </div>

            <div class="dash-card">
                <p>Success Rate</p>
                <h2>98.2%</h2>
                <span>Stable</span>
            </div>

            <div class="dash-card full">
                <h3>Transfer Monitoring</h3>
                <div class="transaction"><span>IMPS Queue</span><b class="green">Normal</b></div>
                <div class="transaction"><span>NEFT Batch</span><b>Processing</b></div>
                <div class="transaction"><span>Suspicious Transfer</span><b class="red">Check</b></div>
            </div>
        </div>
    `;

    document.getElementById("analyticsContent").innerHTML = `
        <div class="grid">
            <div class="dash-card">
                <p>Bank Income</p>
                <h2>₹14.8Cr</h2>
                <span>Monthly</span>
            </div>

            <div class="dash-card">
                <p>Loan Growth</p>
                <h2>18%</h2>
                <span>Up</span>
            </div>

            <div class="dash-card">
                <p>Risk Score</p>
                <h2>Low</h2>
                <span>Healthy</span>
            </div>

            <div class="dash-card">
                <p>Branches</p>
                <h2>128</h2>
                <span>Active</span>
            </div>

            <div class="dash-card full">
                <h3>Admin Analytics Chart</h3>
                <div class="bar-chart admin-bar">
                    <span style="height:70%"></span>
                    <span style="height:88%"></span>
                    <span style="height:64%"></span>
                    <span style="height:96%"></span>
                    <span style="height:78%"></span>
                    <span style="height:90%"></span>
                </div>
            </div>
        </div>
    `;

    document.getElementById("settingsContent").innerHTML = `
        <div class="grid">
            <div class="dash-card">
                <div class="settings-avatar">${currentName.charAt(0)}</div>
                <h2>${currentName}</h2>
                <p>${currentEmail}</p>
            </div>

            <div class="dash-card">
                <p>Role</p>
                <h2>Admin</h2>
                <span>Full Access</span>
            </div>

            <div class="dash-card wide">
                <h3>Admin Settings</h3>
                <div class="setting-row"><span>Fraud Alerts</span><b class="green">Enabled</b></div>
                <div class="setting-row"><span>KYC Approval</span><b>Manual</b></div>
                <div class="setting-row"><span>Audit Logging</span><b class="green">On</b></div>
            </div>

            <div class="dash-card full">
                <button class="primary" onclick="showToast('Admin settings saved!')">
                    Save Admin Settings
                </button>
            </div>
        </div>
    `;
}


/* =========================================================
   FINAL FIX: after User/Admin login, dashboard opens from TOP
========================================================= */
function openDashboardFromTop() {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const dashboard =
      document.querySelector(".dashboard-page") ||
      document.querySelector(".dashboard") ||
      document.querySelector(".dash-main") ||
      document.querySelector(".main-content");

    if (dashboard) {
      dashboard.scrollTop = 0;
    }

    const header =
      document.querySelector(".topbar") ||
      document.querySelector(".top-header") ||
      document.querySelector(".dashboard-header");

    if (header) {
      header.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" });
    }

    setTimeout(() => window.scrollTo(0, 0), 50);
    setTimeout(() => window.scrollTo(0, 0), 150);
  });
}

window.addEventListener("load", openDashboardFromTop);
window.addEventListener("pageshow", openDashboardFromTop);

document.addEventListener("click", function(e) {
  const btn = e.target.closest("button, input[type='submit'], .login-btn, #loginBtn");
  if (!btn) return;

  const text = (btn.textContent || btn.value || "").toLowerCase();
  if (text.includes("login")) {
    setTimeout(openDashboardFromTop, 0);
    setTimeout(openDashboardFromTop, 100);
    setTimeout(openDashboardFromTop, 300);
  }
}, true);

document.addEventListener("submit", function() {
  setTimeout(openDashboardFromTop, 0);
  setTimeout(openDashboardFromTop, 100);
  setTimeout(openDashboardFromTop, 300);
}, true);


/* ================================
   LOGOUT -> HOME PAGE
================================ */

document.addEventListener("DOMContentLoaded", () => {

  const logoutBtn =
    document.getElementById("logoutBtn") ||
    document.querySelector(".logout-btn") ||
    document.querySelector(".profile button");

  if (logoutBtn) {

    logoutBtn.textContent = "Logout";

    logoutBtn.addEventListener("click", () => {

      /* clear saved login data */
      localStorage.clear();
      sessionStorage.clear();

      /* move to landing/home page */
      window.location.href = "index.html";

    });

  }

});


/* =========================================================
   FINAL GOOGLE PASSWORD MANAGER BLOCK
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("form").forEach(form => {
    form.setAttribute("autocomplete", "off");
  });

  document.querySelectorAll(".fake-password-input").forEach(input => {
    input.type = "text";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("data-lpignore", "true");
    input.setAttribute("data-1p-ignore", "true");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocapitalize", "off");
  });
});
