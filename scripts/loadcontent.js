function loadPage(page) {
  fetch(page)
    .then((response) => response.text())
    .then((html) => {
      document.querySelector(".content").innerHTML = html;
    })
    .catch((error) => console.error("Error loading the page:", error));
}
