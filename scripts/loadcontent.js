const notificationIndicator = document.getElementById("notificationIndicator");
const bell = document.getElementById("notificationBell");
const studentsPageLink = document.getElementById("navbar-element-students");
const navigationMenu = document.getElementById("navbar-list");

function loadPage(page) {
  fetch(page)
    .then((response) => response.text())
    .then((html) => {
      document.querySelector(".content").innerHTML = html;
      refreshEventListeners();
    });
}

bell.addEventListener("click", function () {
  loadPage("/pages/messages.html");

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
  .getElementById("navbar-element-dashboard")
  .addEventListener("click", function () {
    loadPage("/pages/dashboard.html");

    for (let i = 0; i < navigationMenu.children.length; ++i) {
      navigationMenu.children[i].classList.remove("navbar-active");
    }

    this.classList.add("navbar-active");
  });

studentsPageLink.addEventListener("click", function () {
  loadPage("/pages/students.html");

  for (let i = 0; i < navigationMenu.children.length; ++i) {
    navigationMenu.children[i].classList.remove("navbar-active");
  }

  this.classList.add("navbar-active");
});

document
  .getElementById("navbar-element-tasks")
  .addEventListener("click", function () {
    loadPage("/pages/tasks.html");

    for (let i = 0; i < navigationMenu.children.length; ++i) {
      navigationMenu.children[i].classList.remove("navbar-active");
    }

    this.classList.add("navbar-active");
  });

document.getElementById("logo").addEventListener("click", function () {
  loadPage("/pages/students.html");

  for (let i = 0; i < navigationMenu.children.length; ++i) {
    navigationMenu.children[i].classList.remove("navbar-active");
  }

  studentsPageLink.classList.add("navbar-active");
});

document
  .getElementById("notificationBell")
  .addEventListener("click", function () {
    for (let i = 0; i < navigationMenu.children.length; i++) {
      navigationMenu.children[i].classList.remove("navbar-active");
    }
  });
