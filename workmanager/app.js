const storageKey = "waterCompanyWorkOrders";

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `wo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const sampleOrders = [
  {
    id: createId(),
    customerName: "Sample Customer",
    accountNumber: "1001",
    phone: "555-0100",
    serviceAddress: "123 Main St",
    workType: "Leak",
    priority: "Urgent",
    assignedTo: "Field crew",
    status: "Open",
    requestText: "Customer reports water leaking near meter box.",
    actionNote: "Called customer and scheduled same-day inspection.",
    dueDate: new Date().toISOString().slice(0, 10),
    completedDate: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let orders = loadOrders();

const form = document.querySelector("#workOrderForm");
const tableBody = document.querySelector("#ordersTable");
const rowTemplate = document.querySelector("#rowTemplate");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const priorityFilter = document.querySelector("#priorityFilter");
const cancelEditBtn = document.querySelector("#cancelEditBtn");
const editModeBadge = document.querySelector("#editModeBadge");

function loadOrders() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(sampleOrders));
    return sampleOrders;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveOrders() {
  localStorage.setItem(storageKey, JSON.stringify(orders));
}

function formValue(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function setFormValue(id, value) {
  document.querySelector(`#${id}`).value = value || "";
}

function getFormData() {
  const now = new Date().toISOString();
  return {
    id: formValue("editingId") || createId(),
    customerName: formValue("customerName"),
    accountNumber: formValue("accountNumber"),
    phone: formValue("phone"),
    serviceAddress: formValue("serviceAddress"),
    workType: formValue("workType"),
    priority: formValue("priority"),
    assignedTo: formValue("assignedTo"),
    status: formValue("status"),
    requestText: formValue("requestText"),
    actionNote: formValue("actionNote"),
    dueDate: formValue("dueDate"),
    completedDate: formValue("completedDate"),
    createdAt: now,
    updatedAt: now
  };
}

function resetForm() {
  form.reset();
  setFormValue("editingId", "");
  editModeBadge.classList.add("hidden");
  cancelEditBtn.classList.add("hidden");
}

function renderOrders() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedPriority = priorityFilter.value;

  const filtered = orders
    .filter((order) => selectedStatus === "All" || order.status === selectedStatus)
    .filter((order) => selectedPriority === "All" || order.priority === selectedPriority)
    .filter((order) => {
      if (!query) return true;
      return Object.values(order).join(" ").toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (a.status === "Completed" && b.status !== "Completed") return 1;
      if (a.status !== "Completed" && b.status === "Completed") return -1;
      if (a.priority === "Urgent" && b.priority !== "Urgent") return -1;
      if (a.priority !== "Urgent" && b.priority === "Urgent") return 1;
      return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
    });

  tableBody.innerHTML = "";
  emptyState.classList.toggle("hidden", filtered.length > 0);

  filtered.forEach((order) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".customer").textContent = order.customerName;
    row.querySelector(".details").textContent = [order.accountNumber, order.phone, order.serviceAddress]
      .filter(Boolean)
      .join(" | ");
    row.querySelector(".request").textContent = `${order.workType}: ${order.requestText}`;
    row.querySelector(".note").textContent = order.actionNote ? `Latest note: ${order.actionNote}` : "";
    row.querySelector(".assigned").textContent = order.assignedTo || "Unassigned";
    row.querySelector(".due").textContent = order.completedDate
      ? `Completed ${formatDate(order.completedDate)}`
      : order.dueDate
        ? formatDate(order.dueDate)
        : "No due date";

    const statusPill = row.querySelector(".status-pill");
    statusPill.textContent = order.status;
    statusPill.classList.add(statusClass(order.status));

    const priorityPill = row.querySelector(".priority-pill");
    priorityPill.textContent = order.priority;
    priorityPill.classList.add(`priority-${order.priority.toLowerCase()}`);

    row.querySelector(".edit").addEventListener("click", () => editOrder(order.id));
    row.querySelector(".complete").addEventListener("click", () => completeOrder(order.id));
    row.querySelector(".delete").addEventListener("click", () => deleteOrder(order.id));
    tableBody.appendChild(row);
  });

  renderCounts();
}

function statusClass(status) {
  if (status === "Completed") return "status-completed";
  if (status.startsWith("Waiting")) return "status-waiting";
  if (status === "Scheduled") return "status-scheduled";
  return "status-open";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderCounts() {
  document.querySelector("#totalCount").textContent = orders.length;
  document.querySelector("#openCount").textContent = orders.filter((order) => order.status !== "Completed").length;
  document.querySelector("#urgentCount").textContent = orders.filter((order) => order.priority === "Urgent" && order.status !== "Completed").length;
  document.querySelector("#completedCount").textContent = orders.filter((order) => order.status === "Completed").length;
}

function editOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) return;

  Object.entries(order).forEach(([key, value]) => {
    const input = document.querySelector(`#${key}`);
    if (input) input.value = value || "";
  });

  editModeBadge.classList.remove("hidden");
  cancelEditBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function completeOrder(id) {
  const today = new Date().toISOString().slice(0, 10);
  orders = orders.map((order) =>
    order.id === id
      ? { ...order, status: "Completed", completedDate: order.completedDate || today, updatedAt: new Date().toISOString() }
      : order
  );
  saveOrders();
  renderOrders();
}

function deleteOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  const confirmed = confirm(`Delete work order for ${order.customerName}?`);
  if (!confirmed) return;

  orders = orders.filter((item) => item.id !== id);
  saveOrders();
  renderOrders();
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const headers = [
    "customerName",
    "accountNumber",
    "phone",
    "serviceAddress",
    "workType",
    "priority",
    "assignedTo",
    "status",
    "requestText",
    "actionNote",
    "dueDate",
    "completedDate",
    "createdAt",
    "updatedAt"
  ];

  const rows = orders.map((order) =>
    headers
      .map((header) => `"${String(order[header] || "").replaceAll('"', '""')}"`)
      .join(",")
  );

  downloadFile("water-company-work-orders.csv", [headers.join(","), ...rows].join("\n"), "text/csv");
}

function exportJson() {
  downloadFile("water-company-work-orders-backup.json", JSON.stringify(orders, null, 2), "application/json");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = getFormData();
  const existing = orders.find((order) => order.id === data.id);

  if (existing) {
    orders = orders.map((order) =>
      order.id === data.id
        ? { ...data, createdAt: order.createdAt, updatedAt: new Date().toISOString() }
        : order
    );
  } else {
    orders.unshift(data);
  }

  saveOrders();
  resetForm();
  renderOrders();
});

cancelEditBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderOrders);
statusFilter.addEventListener("change", renderOrders);
priorityFilter.addEventListener("change", renderOrders);
document.querySelector("#exportCsvBtn").addEventListener("click", exportCsv);
document.querySelector("#exportJsonBtn").addEventListener("click", exportJson);

document.querySelector("#importJsonInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Expected an array");
      orders = imported;
      saveOrders();
      renderOrders();
      event.target.value = "";
    } catch {
      alert("That backup file could not be restored.");
    }
  };
  reader.readAsText(file);
});

renderOrders();
