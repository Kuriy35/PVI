const CACHE_NAME = "lab-project-cache-v1";
const urlsToCache = [
  "/",
  "/lab_project/index.html",
  "/lab_project/pages/students.html",
  "/lab_project/pages/dashboard.html",
  "/lab_project/pages/messages.html",
  "/lab_project/pages/tasks.html",
  "/lab_project/styles/main.css",
  "/lab_project/styles/navbar.css",
  "/lab_project/styles/header.css",
  "/lab_project/scripts/loadcontent.js",
  "/lab_project/scripts/studentspage.js",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Помилка кешування:", error);
      })
  );
});

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request) // Спочатку пробуємо взяти з мережі
      .then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone()); // Оновлюємо кеш
          return response;
        });
      })
      .catch(() => caches.match(event.request)) // Якщо немає інтернету – беремо кеш
  );
});

self.addEventListener("activate", (event) => {
  clients.claim();
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
