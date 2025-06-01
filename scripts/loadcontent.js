import * as chatServiceModule from "./chat-service.js";

const bell = document.getElementById("bellContainer");
const studentsPageLink = document.getElementById("navbar-element-students");
const logoCMS = document.getElementById("logo");
const navbarList = document.getElementById("navbar-list");
const logoutBtn = document.getElementById("logoutButton");

function loadPage(page) {
  return fetch(`index.php?page=${page}`, {
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
      } else if (page === "messages") {
        loadMessagesPage();
      }
      return html;
    });
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

window.loadStudentsPage = loadStudentsPage;

async function loadMessagesPage() {
  await loadUserChats();
  chatServiceModule.refreshEventListeners();
}

async function loadUserChats() {
  if (!window.authUserId) return;

  const chats = await chatServiceModule.getCurrentUserChats(window.authUserId);
  await chatServiceModule.UpdateChatsAndNotifications(chats);
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
  navbarList.querySelectorAll(".navbar-active").forEach((elem) => {
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
    if (!window.isAuth) {
      showLoginModal();
      return;
    }

    clearActiveNav();

    loadPage("messages").catch((error) =>
      console.error("Error loading page:", error)
    );
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const currentUrlParams = new URLSearchParams(window.location.search);
  let currentPage = currentUrlParams.get("page");

  await setAuthUserData();

  if (currentPage === "students") {
    let tablePageNumber = 1;
    loadStudentsPage(tablePageNumber, tablePageSize);
  } else if (currentPage === "messages") {
    await loadMessagesPage();
    let activeChatId = currentUrlParams.get("chat");
    const activeChatElement = document.getElementById(`${activeChatId}`);
    if (activeChatElement) activeChatElement.click();
  }

  if (logoutBtn) {
    if (!logoutBtn.hasAttribute("logout-click-listener-added")) {
      logoutBtn.addEventListener("click", function () {
        fetch("index.php?controller=auth&action=logout")
          .then((response) => response.json())
          .then((data) => {
            if (data.redirect) {
              window.location.href = data.redirect;
            } else if (data.error) {
              console.error("Logout failed:", data.error);
            }
          })
          .catch((error) => console.error("Failed to logout:", error));
      });
      logoutBtn.setAttribute("logout-click-listener-added", "true");
    }
  }
});

async function setAuthUserData() {
  try {
    const response = await fetch("index.php?action=getAuthUserData");
    const data = await response.json();

    if (!data) {
      window.authUserId = null;
      window.authUserFirstName = null;
      window.authUserLastName = null;
    } else {
      window.authUserId = data["id"];
      window.authUserFirstName = data["first_name"];
      window.authUserLastName = data["last_name"];
    }

    if (window.authUserId) {
      chatServiceModule.connectUser(window.authUserId);
      chatServiceModule.renderUserNotifications(window.authUserId);
    }
  } catch (error) {
    console.error("Failed to set auth user data:", error);
  }
}

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
    } else loadPage(page).catch((error) => console.error("Error loading page:", error));
  });
}

if (logoCMS) {
  logoCMS.addEventListener("click", function () {
    loadPage("students").catch((error) =>
      console.error("Error loading page:", error)
    );

    clearActiveNav();

    studentsPageLink.classList.add("navbar-active");
  });
}

document.querySelectorAll("#navbar-list li").forEach(enableKeyboardClick);

enableKeyboardClick(logoCMS);
enableKeyboardClick(bell);
