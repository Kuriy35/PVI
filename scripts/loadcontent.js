function loadPage(page) {
  fetch(page)
    .then((response) => response.text())
    .then((html) => {
      document.querySelector(".content").innerHTML = html;
    })
    .catch((error) => console.error("Error loading the page:", error));
}

document
  .getElementById("notificationBell")
  .addEventListener("click", function () {
    const indicator = document.getElementById("notificationIndicator");

    loadPage("/pages/messages.html");

    indicator.style.display = "none";
    indicator.style.fontSize = "12px";
    indicator.innerText = "0";
  });

document.getElementById("navbar").addEventListener("dblclick", function () {
  const bell = document.getElementById("notificationBell");
  const indicator = document.getElementById("notificationIndicator");

  bell.classList.add("shake");
  setTimeout(() => bell.classList.remove("shake"), 500);

  let messagesCount = parseInt(indicator.innerText);
  messagesCount++;

  if (messagesCount <= 9) {
    indicator.innerText = messagesCount;
  } else {
    indicator.innerText = "9+";
    indicator.style.fontSize = "10px";
  }

  indicator.style.display = "flex";
});

document.addEventListener("DOMContentLoaded", function () {
  loadPage("/pages/students.html");

  const studentsPageLink = document.getElementById("navbar-element-students");
  studentsPageLink.classList.add("navbar-active");
});

document.getElementById("logo").addEventListener("click", function () {
  loadPage("./pages/students.html");
});

document
  .getElementById("navbar-element-dashboard")
  .addEventListener("click", function () {
    loadPage("./pages/dashboard.html");
  });

document
  .getElementById("navbar-element-students")
  .addEventListener("click", function () {
    loadPage("./pages/students.html");
  });

document
  .getElementById("navbar-element-tasks")
  .addEventListener("click", function () {
    loadPage("./pages/tasks.html");
  });

document
  .getElementById("navbar-element-dashboard")
  .addEventListener("click", function () {
    loadPage("/pages/dashboard.html");

    debugger;
    const navigationMenu = document.getElementById("navbar-list");
    for (let i = 0; i < navigationMenu.children.length; ++i) {
      navigationMenu.children[i].classList.remove("navbar-active");
    }

    this.classList.add("navbar-active");
  });

document
  .getElementById("navbar-element-students")
  .addEventListener("click", function () {
    loadPage("/pages/students.html");

    debugger;
    const navigationMenu = document.getElementById("navbar-list");
    for (let i = 0; i < navigationMenu.children.length; ++i) {
      navigationMenu.children[i].classList.remove("navbar-active");
    }

    this.classList.add("navbar-active");
  });

document
  .getElementById("navbar-element-tasks")
  .addEventListener("click", function () {
    loadPage("/pages/tasks.html");

    debugger;
    const navigationMenu = document.getElementById("navbar-list");
    for (let i = 0; i < navigationMenu.children.length; ++i) {
      navigationMenu.children[i].classList.remove("navbar-active");
    }

    this.classList.add("navbar-active");
  });

document.getElementById("logo").addEventListener("click", function () {
  loadPage("/pages/students.html");

  debugger;
  const navigationMenu = document.getElementById("navbar-list");
  for (let i = 0; i < navigationMenu.children.length; ++i) {
    navigationMenu.children[i].classList.remove("navbar-active");
  }

  const studentsPageLink = document.getElementById("navbar-element-students");
  studentsPageLink.classList.add("navbar-active");
});
