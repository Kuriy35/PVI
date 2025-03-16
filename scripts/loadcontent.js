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

document.getElementById("bellEvent").addEventListener("dblclick", function () {
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
