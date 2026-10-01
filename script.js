const SUPABASE_URL = "https://uanypbbojgejbhjusylf.supabase.co";
const SUPABASE_KEY = "sb_publishable_f2vuR2kgcoyuXA824ZSVHg_W11RhjbB";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
console.log("Supabase connected:", !!supabaseClient);
window.ADMIN_WHATSAPP = "918090279768";
window.ADMIN_SECRET_CODE = "10062009";
window.ADMIN_PASSWORD = "admin123";
window.STUDENT_RATE_PER_PAGE = 20;
window.WRITER_RATE_PER_PAGE = 14;

window.globalOrders = JSON.parse(localStorage.getItem("assignmate_master_orders")) || [];
async function loadOrdersFromSupabase() {
  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase orders error:", error);
    return;
  }

  window.globalOrders = data || [];
  console.log("Orders loaded from Supabase:", window.globalOrders);
}
loadOrdersFromSupabase();
window.registeredWriters = JSON.parse(localStorage.getItem("assignmate_registered_writers")) || {};

window.activeStudentPhone = localStorage.getItem("assignmate_active_student") || null;
window.activeWriterPhone = localStorage.getItem("assignmate_active_writer_phone") || null;
window.isAdminLoggedIn = localStorage.getItem("assignmate_admin_session") === "true";

window.generatedStudentOTP = null;
window.generatedWriterOTP = null;

window.switchTab = function(tab) {
  const studentPortal = document.getElementById("student-portal");
  const writerPortal = document.getElementById("writer-portal");
  const adminPortal = document.getElementById("admin-portal");

  if (studentPortal) studentPortal.classList.toggle("portal-hidden", tab !== "student");
  if (writerPortal) writerPortal.classList.toggle("portal-hidden", tab !== "writer");
  if (adminPortal) adminPortal.classList.toggle("portal-hidden", tab !== "admin");

  const btnStudent = document.getElementById("btn-student");
  const btnWriter = document.getElementById("btn-writer");
  const btnAdmin = document.getElementById("btn-admin");

  if (btnStudent) btnStudent.classList.toggle("active", tab === "student");
  if (btnWriter) btnWriter.classList.toggle("active", tab === "writer");
  if (btnAdmin) btnAdmin.classList.toggle("active", tab === "admin");

  if (tab === "student" && window.activeStudentPhone) window.renderStudentOrders();
  if (tab === "writer" && window.activeWriterPhone) window.renderWriterMarketplace();
  if (tab === "admin") {
    if (window.isAdminLoggedIn) window.showAdminDashboard();
    else window.lockAdminHub();
  }
};

window.calculateCost = function(pages) {
  const total = (parseInt(pages) || 0) * window.STUDENT_RATE_PER_PAGE;
  const priceElem = document.getElementById("priceDisplay");
  if (priceElem) {
    priceElem.innerHTML = "Total Payable Amount: <strong>₹" + total + "</strong> (" + (pages || 0) + " Pages × ₹20/page)";
  }
};

window.sendStudentOTP = function() {
  const phoneInput = document.getElementById("studentPhone");
  if (!phoneInput) return;
  const phone = phoneInput.value.trim();
  if (phone.length < 10) return alert("Kripya sahi 10-digit mobile number daalein.");

  window.generatedStudentOTP = "1234";
  const otpBox = document.getElementById("student-otp-box");
  if (otpBox) otpBox.style.display = "block";
  alert("Verification Code Mobile Number " + phone + " par bhej diya gaya hai.\nDemo OTP Code: 1234");
};

window.verifyStudentOTP = function() {
  const phoneInput = document.getElementById("studentPhone");
  const otpInput = document.getElementById("studentOtpCode");
  if (!phoneInput || !otpInput) return;

  const phone = phoneInput.value.trim();
  const otp = otpInput.value.trim();

  if (otp === window.generatedStudentOTP || otp === "1234") {
    window.activeStudentPhone = phone;
    localStorage.setItem("assignmate_active_student", phone);
    window.showStudentDashboard();
  } else {
    alert("Galat OTP! Kripya sahi code enter karein.");
  }
};

window.logoutStudent = function() {
  localStorage.removeItem("assignmate_active_student");
  window.activeStudentPhone = null;
  const authBox = document.getElementById("student-auth");
  const dashBox = document.getElementById("student-dashboard");
  if (authBox) authBox.style.display = "block";
  if (dashBox) dashBox.style.display = "none";
};

window.showStudentDashboard = function() {
  const authBox = document.getElementById("student-auth");
  const dashBox = document.getElementById("student-dashboard");
  const userElem = document.getElementById("activeStudentUser");

  if (authBox) authBox.style.display = "none";
  if (dashBox) dashBox.style.display = "block";
  if (userElem) userElem.innerText = window.activeStudentPhone;

  window.renderStudentOrders();
};

window.sendWriterOTP = function() {
  const phoneInput = document.getElementById("writerPhoneInput");
  if (!phoneInput) return;
  const phone = phoneInput.value.trim();
  if (phone.length < 10) return alert("Kripya sahi 10-digit mobile number daalein.");

  window.generatedWriterOTP = "1234";
  const otpBox = document.getElementById("writer-otp-box");
  if (otpBox) otpBox.style.display = "block";
  alert("Writer Verification Code Mobile Number " + phone + " par bhej diya gaya hai.\nDemo OTP Code: 1234");
};

window.verifyWriterOTP = function() {
  const phoneInput = document.getElementById("writerPhoneInput");
  const otpInput = document.getElementById("writerOtpCode");
  if (!phoneInput || !otpInput) return;

  const phone = phoneInput.value.trim();
  const otp = otpInput.value.trim();

  if (otp === window.generatedWriterOTP || otp === "1234") {
    window.activeWriterPhone = phone;
    localStorage.setItem("assignmate_active_writer_phone", phone);
    
    if (!window.registeredWriters[phone]) {
      window.registeredWriters[phone] = {
        name: "",
        phone: phone,
        upi: "Not Provided",
        location: "Not Provided"
      };
      localStorage.setItem("assignmate_registered_writers", JSON.stringify(window.registeredWriters));
    }

    window.showWriterDashboard();
  } else {
    alert("Galat OTP! Kripya sahi code enter karein.");
  }
};

window.createStudentOrder = function(e) {
  if (e) e.preventDefault();

  const topic = document.getElementById("orderTopic").value;
  const pages = parseInt(document.getElementById("orderPages").value);
  const location = document.getElementById("studentLoc").value;
  const utr = document.getElementById("orderUTR").value.trim();

  const totalPrice = pages * window.STUDENT_RATE_PER_PAGE;
  const writerPayoutAmount = pages * window.WRITER_RATE_PER_PAGE;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderCode = "AM" + randomNum;

  const utrLast4 = utr.length >= 4 ? utr.slice(-4) : "0000";
  const exactUniqueCode = orderCode + pages + utrLast4;

  const newOrder = {
    code: orderCode,
    secretUniqueCode: exactUniqueCode,
    studentPhone: window.activeStudentPhone,
    studentLocation: location,
    topic: topic,
    pages: pages,
    studentPaid: totalPrice,
    writerPayout: writerPayoutAmount,
    utr: utr,
    writerDetails: null,
    status: "Pending Admin Approval", 
    adminApproved: false,
    studentApproved: false,
    payoutClaimed: false
  };

  window.globalOrders.push(newOrder);
  localStorage.setItem("assignmate_master_orders", JSON.stringify(window.globalOrders));
  window.renderStudentOrders();

  const msg = "Hello Admin, Maine Naya Order Request Submit Kiya Hai:%0A%0A" +
    "*Order Code:* " + orderCode + "%0A" +
    "*Unique Code:* " + exactUniqueCode + "%0A" +
    "*Topic:* " + topic + "%0A" +
    "*Pages:* " + pages + " (Total Paid: ₹" + totalPrice + ")%0A" +
    "*Student Location:* " + location + "%0A" +
    "*UTR Number:* " + utr + "%0A" +
    "*Student Mobile:* " + window.activeStudentPhone + "%0A%0A" +
    "Kripya Payment Verify Karke Order Approve Karein.";

  window.open("https://wa.me/" + window.ADMIN_WHATSAPP + "?text=" + msg, '_blank');
};

window.renderStudentOrders = function() {
  const container = document.getElementById("studentOrdersList");
  const countElem = document.getElementById("myOrderCount");
  if (!container) return;

  const myOrders = window.globalOrders.filter(o => o.studentPhone === window.activeStudentPhone);
  if (countElem) countElem.innerText = myOrders.length;
  container.innerHTML = myOrders.length === 0 ? "<p>Aapne abhi tak koi order submit nahi kiya hai.</p>" : "";

  myOrders.forEach(o => {
    let confirmBtnHTML = "";
    if (o.writerDetails && !o.studentApproved) {
      confirmBtnHTML = '<button type="button" class="action-btn success" style="margin-top:10px;" onclick="window.confirmStudentApproval(\'' + o.code + '\')">Confirm Pages Received & Approved</button>';
    } else if (o.studentApproved) {
      confirmBtnHTML = '<p style="color:var(--accent); font-weight:bold; margin-top:8px;">✔ Work Approved By You</p>';
    }

    let approvalBadge = o.adminApproved 
      ? '<span class="status-tag">' + o.status + '</span>' 
      : '<span class="status-tag status-pending">⏳ Waiting Admin Permission</span>';

    container.innerHTML += '<div class="order-item">' +
        '<div class="order-top">' +
          '<span class="code-tag">' + o.code + '</span>' +
          approvalBadge +
        '</div>' +
        '<p><strong>Topic:</strong> ' + o.topic + ' (' + o.pages + ' Pages)</p>' +
        '<p><strong>Paid Amount:</strong> ₹' + o.studentPaid + ' (₹20/page)</p>' +
        '<p><strong>Aapki Location:</strong> ' + o.studentLocation + '</p>' +
        '<p><strong>Writer Details:</strong> ' + (o.writerDetails ? '<span style="color:var(--accent);">' + o.writerDetails.name + ' (' + o.writerDetails.location + ')</span>' : '<em>Assign nahi hua</em>') + '</p>' +
        confirmBtnHTML +
      '</div>';
  });
};

window.confirmStudentApproval = function(code) {
  const index = window.globalOrders.findIndex(o => o.code === code);
  if (index !== -1) {
    window.globalOrders[index].studentApproved = true;
    window.globalOrders[index].status = "Completed & Student Approved";
    localStorage.setItem("assignmate_master_orders", JSON.stringify(window.globalOrders));
    alert("Confirmation Received! Ab Writer Payout Claim Kar Sakta Hai.");
    window.renderStudentOrders();
  }
};
window.saveWriterProfile = function(e) {
  if (e) e.preventDefault();
  const name = document.getElementById("writerProfileName").value.trim();
  const upi = document.getElementById("writerProfileUPI").value.trim();
  const loc = document.getElementById("writerProfileLoc").value.trim();

  if (!name || !upi || !loc) return alert("Kripya saari profile details bharein.");

  window.registeredWriters[window.activeWriterPhone] = {
    name: name,
    phone: window.activeWriterPhone,
    upi: upi,
    location: loc
  };

  localStorage.setItem("assignmate_registered_writers", JSON.stringify(window.registeredWriters));
  alert("Profile Update Ho Gayi Hai!");
  window.showWriterDashboard();
};

window.showWriterDashboard = function() {
  const authBox = document.getElementById("writer-auth");
  const dashBox = document.getElementById("writer-dashboard");
  const phoneElem = document.getElementById("activeWriterPhone");
  const nameElem = document.getElementById("activeWriterName");

  if (authBox) authBox.style.display = "none";
  if (dashBox) dashBox.style.display = "block";

  const currentWriter = window.registeredWriters[window.activeWriterPhone] || { name: "", phone: window.activeWriterPhone };
  if (phoneElem) phoneElem.innerText = window.activeWriterPhone;
  if (nameElem) nameElem.innerText = currentWriter.name || "Writer";

  if (document.getElementById("writerProfileName")) document.getElementById("writerProfileName").value = currentWriter.name || "";
  if (document.getElementById("writerProfileUPI")) document.getElementById("writerProfileUPI").value = currentWriter.upi === "Not Provided" ? "" : (currentWriter.upi || "");
  if (document.getElementById("writerProfileLoc")) document.getElementById("writerProfileLoc").value = currentWriter.location === "Not Provided" ? "" : (currentWriter.location || "");

  window.renderWriterMarketplace();
};

window.renderWriterMarketplace = function() {
  const openOrdersDiv = document.getElementById("writerOrdersList");
  const myAssignedDiv = document.getElementById("writerMyOrdersList");

  if (!openOrdersDiv || !myAssignedDiv) return;

  openOrdersDiv.innerHTML = "";
  myAssignedDiv.innerHTML = "";

  const activeWriterPhone = window.activeWriterPhone;

  window.globalOrders.forEach(order => {
    if (order.adminApproved) {
      if (!order.writerDetails) {
        const orderCard = document.createElement("div");
        orderCard.className = "order-item";
        orderCard.innerHTML = `
          <div class="order-top">
            <span class="code-tag">${order.code}</span>
            <span class="status-tag">${order.status}</span>
          </div>
          <p><strong>Topic:</strong> ${order.topic} (${order.pages} Pages)</p>
          <p><strong>Writer Payout:</strong> ₹${order.writerPayout}</p>
          <p><strong>Student Location:</strong> ${order.studentLocation}</p>
          <button type="button" class="action-btn success" style="margin-top:10px;" onclick="window.claimOrder('${order.code}')">Claim Assignment</button>
        `;
        openOrdersDiv.appendChild(orderCard);
      } else if (order.writerDetails && order.writerDetails.phone === activeWriterPhone) {
        const orderCard = document.createElement("div");
        orderCard.className = "order-item";
        
        let statusText = order.studentApproved ? '<span style="color:var(--accent); font-weight:bold;">✔ Student Approved</span>' : '<span style="color:#f59e0b; font-weight:bold;">⏳ Pending Student Confirmation</span>';
        
        let payoutBtnHTML = "";
        if (order.studentApproved) {
          payoutBtnHTML = '<button type="button" class="action-btn success" style="margin-top:10px; background:#10b981;" onclick="window.claimWriterPayout(\'' + order.code + '\')">💬 Claim Payout via WhatsApp</button>';
        }

        orderCard.innerHTML = `
          <div class="order-top">
            <span class="code-tag">${order.code}</span>
            <span class="status-tag">${order.status}</span>
          </div>
          <p><strong>Topic:</strong> ${order.topic} (${order.pages} Pages)</p>
          <p><strong>Writer Payout:</strong> ₹${order.writerPayout}</p>
          <p><strong>Student Location:</strong> ${order.studentLocation}</p>
          <p style="margin-top:8px;"><strong>Status:</strong> ${statusText}</p>
          ${payoutBtnHTML}
        `;
        myAssignedDiv.appendChild(orderCard);
      }
    }
  });

  if (openOrdersDiv.innerHTML === "") {
    openOrdersDiv.innerHTML = "<p>Koi bhi approved marketplace order available nahi hai.</p>";
  }
  if (myAssignedDiv.innerHTML === "") {
    myAssignedDiv.innerHTML = "<p>Aapne abhi tak koi order claim nahi kiya hai.</p>";
  }
};

window.claimOrder = function(code) {
  const writerInfo = window.registeredWriters[window.activeWriterPhone];
  
  if (!writerInfo || !writerInfo.name || writerInfo.upi === "Not Provided" || writerInfo.location === "Not Provided") {
    alert("⚠️ Error: Assignment claim karne se pehle apni Profile Details (Full Name, UPI ID aur Location) bharna aur save karna compulsory hai!");
    return;
  }

  const index = window.globalOrders.findIndex(o => o.code === code);
  if (index !== -1) {
    window.globalOrders[index].writerDetails = writerInfo;
    window.globalOrders[index].status = "Assigned to Writer";
    localStorage.setItem("assignmate_master_orders", JSON.stringify(window.globalOrders));
    alert("Assignment successfully claim ho gaya hai!");
    window.renderWriterMarketplace();
  }
};

window.claimWriterPayout = function(code) {
  const order = window.globalOrders.find(o => o.code === code);
  if (!order) return;

  const writerInfo = window.registeredWriters[window.activeWriterPhone] || {};

  const msg = "Hello Admin, Maine assignment successfully deliver kar diya hai aur student ne approve bhi kar diya hai.%0A%0A" +
    "*Order Code:* " + order.code + "%0A" +
    "*Unique Code:* " + order.secretUniqueCode + "%0A" +
    "*Topic:* " + order.topic + "%0A" +
    "*Total Payout Amount:* ₹" + order.writerPayout + "%0A" +
    "*Writer Name:* " + writerInfo.name + "%0A" +
    "*Writer UPI ID:* " + writerInfo.upi + "%0A" +
    "*Writer Phone:* " + writerInfo.phone + "%0A%0A" +
    "Kripya mera payout transfer karein.";

  window.open("https://wa.me/" + window.ADMIN_WHATSAPP + "?text=" + msg, '_blank');
};

window.logoutWriter = function() {
  window.activeWriterPhone = null;
  localStorage.removeItem("assignmate_active_writer_phone");
  const authBox = document.getElementById("writer-auth");
  const dashBox = document.getElementById("writer-dashboard");
  if (authBox) authBox.style.display = "block";
  if (dashBox) dashBox.style.display = "none";
};

window.verifyAdminLogin = function() {
  const inputInput = document.getElementById("adminPhoneInput");
  if (!inputInput) return;
  const inputCode = inputInput.value.trim();

  if (inputCode === window.ADMIN_SECRET_CODE) {
    const password = prompt("Enter Admin Secret Password:");
    if (password === window.ADMIN_PASSWORD) {
      window.isAdminLoggedIn = true;
      localStorage.setItem("assignmate_admin_session", "true");
      window.showAdminDashboard();
    } else {
      alert("Galat Password! Access Denied.");
    }
  } else {
    alert("Unauthorized Access! Invalid Admin Code.");
  }
};

window.lockAdminHub = function() {
  const authBox = document.getElementById("admin-auth");
  const dashBox = document.getElementById("admin-dashboard");
  if (authBox) authBox.style.display = "block";
  if (dashBox) dashBox.style.display = "none";
};

window.showAdminDashboard = function() {
  const authBox = document.getElementById("admin-auth");
  const dashBox = document.getElementById("admin-dashboard");

  if (authBox) authBox.style.display = "none";
  if (dashBox) dashBox.style.display = "block";

  window.renderAdminMaster();
};

window.logoutAdmin = function() {
  localStorage.setItem("assignmate_admin_session", "false");
  window.isAdminLoggedIn = false;
  window.lockAdminHub();
};

window.approveOrderbyAdmin = function(code) {
  const index = window.globalOrders.findIndex(o => o.code === code);
  if (index !== -1) {
    window.globalOrders[index].adminApproved = true;
    window.globalOrders[index].status = "Active Order (Approved)";
    localStorage.setItem("assignmate_master_orders", JSON.stringify(window.globalOrders));
    alert("Order " + code + " Approved! Ab ye Writer Marketplace mein sabko dikhega.");
    window.renderAdminMaster();
  }
};

window.renderAdminMaster = function() {
  const container = document.getElementById("adminOrdersMasterList");
  const countElem = document.getElementById("totalOrdersCount");
  const revElem = document.getElementById("totalRevenue");

  if (!container) return;

  if (countElem) countElem.innerText = window.globalOrders.length;

  const revenue = window.globalOrders.reduce((sum, o) => sum + (o.studentPaid - o.writerPayout), 0);
  if (revElem) revElem.innerText = "₹" + revenue;

  container.innerHTML = window.globalOrders.length === 0 ? "<p>Koi orders record mein nahi hain.</p>" : "";

  window.globalOrders.forEach(o => {
    let adminBtn = o.adminApproved 
      ? '<span style="color:#22c55e; font-weight:bold;">✔ Approved for Marketplace</span>' 
      : '<button type="button" class="action-btn success" style="padding:6px 12px; width:auto; background:#22c55e; color:#fff; border:none; border-radius:4px;" onclick="window.approveOrderbyAdmin(\'' + o.code + '\')">Approve Order for Writers</button>';

    let writerInfo = o.writerDetails 
      ? '<br>👤 Name: ' + o.writerDetails.name + ' <br>📞 Phone: ' + o.writerDetails.phone + ' <br>💳 UPI ID: ' + o.writerDetails.upi + ' <br>📍 Loc: ' + o.writerDetails.location 
      : '<em style="color:#f59e0b;">Not Assigned Yet</em>';

    container.innerHTML += '<div class="order-item admin-item" style="background:#f9fafb; border-left:4px solid #4f46e5; padding:15px; margin-bottom:15px; border-radius:8px;">' +
        '<div class="order-top" style="display:flex; justify-content:space-between; margin-bottom:10px;">' +
          '<span class="code-tag" style="background:#e0e7ff; color:#4f46e5; padding:4px 8px; font-weight:bold;">' + o.code + '</span>' +
          '<span class="status-tag" style="background:#d1fae5; color:#065f46; padding:4px 8px;">' + o.status + '</span>' +
        '</div>' +
        '<p><strong>Admin Permission:</strong> ' + adminBtn + '</p>' +
        '<p><strong>Topic:</strong> ' + o.topic + ' (' + o.pages + ' Pages)</p>' +
        '<p><strong>Student Approval:</strong> ' + (o.studentApproved ? '<span style="color:#22c55e; font-weight:bold;">✔ Approved</span>' : '<span style="color:#f59e0b;">⏳ Pending</span>') + '</p>' +
        '<p><strong>Formula Unique Code:</strong> <span style="color:#4f46e5; font-weight:bold;">' + o.secretUniqueCode + '</span>' + '</p>' +
        '<p><strong>Student:</strong> ' + o.studentPhone + ' | <strong>Loc:</strong> ' + o.studentLocation + ' | <strong>UTR:</strong> ' + o.utr + '</p>' +
        '<p><strong>Payment:</strong> Student Paid ₹' + o.studentPaid + ' | Writer Share ₹' + o.writerPayout + '</p>' +
        '<hr style="margin:10px 0;">' +
        '<p><strong>Writer Assigned:</strong> ' + writerInfo + '</p>' +
      '</div>';
  });
};
