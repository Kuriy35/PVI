const notificationIndicator = document.getElementById("notificationIndicator");
const bell = document.getElementById("bellContainer");
const studentsPageLink = document.getElementById("navbar-element-students");
const navigationMenu = document.getElementById("navbar-list");
const logoCMS = document.getElementById("logo");

function loadPage(page) {
  fetch(page)
    .then((response) => response.text())
    .then((html) => {
      document.querySelector(".content").innerHTML = html;
      if (page.includes("students.html")) {
        refreshEventListeners();
      }
    });
}

function clearActiveNav() {
  navigationMenu.querySelectorAll(".navbar-active").forEach((elem) => {
    elem.classList.remove("navbar-active");
  });
}

function enableKeyboardClick(element) {
  element.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      element.click();
    }
  });
}

bell.addEventListener("click", function () {
  loadPage("/pages/messages.html");
  clearActiveNav();

  notificationIndicator.style.display = "none";
  notificationIndicator.style.fontSize = "12px";
  notificationIndicator.innerText = "0";
});

document.getElementById("navbar").addEventListener("dblclick", function () {
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

document.addEventListener("DOMContentLoaded", function () {
  loadPage("/pages/students.html");

  studentsPageLink.classList.add("navbar-active");
});

document
  .getElementById("navbar-list")
  .addEventListener("click", function (event) {
    const target = event.target.closest("li");
    if (!target) return;

    clearActiveNav();
    target.classList.add("navbar-active");

    const pages = {
      "navbar-element-dashboard": "/pages/dashboard.html",
      "navbar-element-students": "/pages/students.html",
      "navbar-element-tasks": "/pages/tasks.html",
    };

    const page = pages[target.id];
    if (page) loadPage(page);
  });

logoCMS.addEventListener("click", function () {
  loadPage("/pages/students.html");

  clearActiveNav();

  studentsPageLink.classList.add("navbar-active");
});

document.querySelectorAll("#navbar-list li").forEach(enableKeyboardClick);

enableKeyboardClick(logoCMS);
enableKeyboardClick(bell);
