const notificationIndicator = document.getElementById("notificationIndicator");
const bell = document.getElementById("bellContainer");
const studentsPageLink = document.getElementById("navbar-element-students");
const navigationMenu = document.getElementById("navbar-list");
const logoCMS = document.getElementById("logo");
const navbar = document.getElementById("navbar");
const navbarList = document.getElementById("navbar-list");

function loadPage(page) {
  const timestamp = new Date().getTime();

  fetch(`index.php?page=${page}&_=${timestamp}`, {
    cache: "no-store",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => response.text())
    .then((html) => {
      const mainContent = document.querySelector("main.content");
      mainContent.innerHTML = html;

      history.pushState({ page }, "", `index.php?page=${page}`);

      if (page === "students") {
        let tablePageNumber = 1;
        loadStudentsPage(tablePageNumber, tablePageSize);
      }
    })
    .catch((error) => console.error("Error loading page:", error));
}

function loadStudentsPage(tablePageNumber = 1, tablePageSize = 8) {
  fetch(
    `index.php?controller=students&action=getPaginated&tablePageNumber=${tablePageNumber}&tablePageSize=${tablePageSize}`,
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (window.isAuth) {
        checkedBoxes = [];
        renderStudentsTable(data.students);
        refreshEventListeners(data.total);
        updateOptionsStatus();
        studentsPageLink.classList.add("navbar-active");
      } else {
        refreshEventListeners();
      }
    })
    .catch((error) => console.error("Error loading students:", error));
}

function renderStudentsTable(students) {
  const tbody = document.querySelector("#studentsTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const fragment = document.createDocumentFragment();
  students.forEach((student) => {
    fragment.appendChild(renderStudentRow(student));
  });

  tbody.appendChild(fragment);
}

function renderStudentRow(student) {
  if (!student) {
    console.error(
      "Can`t render undefined student (received student value is null)!"
    );
    return;
  }

  const template = document.getElementById("studentRowTemplate");
  const clone = template.content.cloneNode(true);
  const row = clone.querySelector("tr");

  row.id = student.id;

  const checkbox = clone.querySelector("input[type='checkbox']");
  checkbox.id = `checkboxStudent${student.id}`;
  checkbox.setAttribute(
    "aria-label",
    `Select student ${student.first_name} ${student.last_name}`
  );

  checkbox.addEventListener("click", function () {
    addCheckboxToCheckedList(checkbox);
  });

  if (selectAllCheckbox.checked) checkbox.click();

  checkbox.setAttribute("selectRow-click-listener-added", "true");

  clone.querySelector(".group").textContent = student.group_name;
  clone.querySelector(
    ".name"
  ).textContent = `${student.first_name} ${student.last_name}`;
  clone.querySelector(".gender").textContent =
    student.gender === "Male"
      ? "M"
      : student.gender === "Female"
      ? "F"
      : "Unknown";

  const [year, month, day] = student.birthday.split("-");
  clone.querySelector(".birthday").textContent = `${day}.${month}.${year}`;

  const status = clone.querySelector(".status-user");
  const authUsername = document.getElementById("logged-in-username");
  if (authUsername) {
    student.first_name + " " + student.last_name === authUsername.textContent
      ? status.classList.add("online")
      : status.classList.add("offline");
  } else status.classList.add("offline");

  const editBtn = clone.querySelector(".btn-edit");
  editBtn.setAttribute(
    "aria-label",
    `Edit student ${student.first_name} ${student.last_name}`
  );
  editBtn.addEventListener("click", () => openEditModalWindow(editBtn));

  const deleteBtn = clone.querySelector(".btn-delete");
  deleteBtn.setAttribute(
    "aria-label",
    `Delete student ${student.first_name} ${student.last_name}`
  );
  deleteBtn.addEventListener("click", () => openDeleteModalWindow(deleteBtn));

  return clone;
}

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("./service-worker.js")
//     .then((reg) => console.log("Service Worker зареєстровано", reg))
//     .catch((err) => console.log("Помилка реєстрації SW", err));
// }

function clearActiveNav() {
  navigationMenu.querySelectorAll(".navbar-active").forEach((elem) => {
    elem.classList.remove("navbar-active");
  });
}

function enableKeyboardClick(element) {
  if (element) {
    element.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        element.click();
      }
    });
  }
}

if (bell) {
  bell.addEventListener("click", function () {
    loadPage("messages");
    clearActiveNav();

    notificationIndicator.style.display = "none";
    notificationIndicator.style.fontSize = "12px";
    notificationIndicator.innerText = "0";
  });
}

if (navbar && bell) {
  navbar.addEventListener("dblclick", function () {
    bell.classList.add("shake");
    setTimeout(() => bell.classList.remove("shake"), 500);

    let messagesCount = parseInt(notificationIndicator.innerText);

    if (messagesCount != null) {
      messagesCount++;

      if (messagesCount <= 9) {
        notificationIndicator.innerText = messagesCount;
      } else {
        notificationIndicator.innerText = "9+";
        notificationIndicator.style.fontSize = "10px";
      }

      notificationIndicator.style.display = "flex";
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const mainContent = document.querySelector("main.content");
  const currentUrlParams = new URLSearchParams(window.location.search);
  const currentPage = currentUrlParams.get("page");

  if (currentPage === "students") {
    let tablePageNumber = 1;
    loadStudentsPage(tablePageNumber, tablePageSize);
  }
});

if (navbarList) {
  navbarList.addEventListener("click", function (event) {
    const target = event.target.closest("button");
    if (!target) return;

    clearActiveNav();
    target.classList.add("navbar-active");

    const views = {
      "navbar-element-dashboard": "dashboard",
      "navbar-element-students": "students",
      "navbar-element-tasks": "tasks",
    };

    const page = views[target.id];

    if (!window.isAuth) {
      showLoginModal();
    } else loadPage(page);
  });
}

if (logoCMS) {
  logoCMS.addEventListener("click", function () {
    loadPage("students");

    clearActiveNav();

    studentsPageLink.classList.add("navbar-active");
  });
}

document.querySelectorAll("#navbar-list li").forEach(enableKeyboardClick);

enableKeyboardClick(logoCMS);
enableKeyboardClick(bell);

function showToastMessage(message, type) {
  const toast = document.createElement("div");
  toast.classList.add(
    "toast",
    type === "error" ? "toast-error" : "toast-success"
  );
  toast.textContent = message;

  const toastContainer = document.getElementById("toast-container");
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
