// const CACHE_NAME = "lab-project-cache-v1";
// const urlsToCache = [
//   "/",
//   "./index.php",
//   "./views/students.php",
//   "./views/dashboard.php",
//   "./views/messages.php",
//   "./views/tasks.php",
//   "./views/styles/main.css",
//   "./views/styles/navbar.css",
//   "./views/styles/header.css",
//   "./views/styles/dropdown.css",
//   "./views/styles/modalwindows.css",
//   "./views/styles/studentpage.css",
//   "./scripts/loadcontent.js",
//   "./scripts/studentspage.js",
// ];

// self.addEventListener("install", (event) => {
//   self.skipWaiting();
//   event.waitUntil(
//     caches
//       .open(CACHE_NAME)
//       .then((cache) => {
//         return cache.addAll(urlsToCache);
//       })
//       .catch((error) => {
//         console.error("Помилка кешування:", error);
//       })
//   );
// });

// // self.addEventListener("fetch", (event) => {
// //   event.respondWith(
// //     caches.match(event.request).then((response) => {
// //       return response || fetch(event.request);
// //     })
// //   );
// // });

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then((response) => {
//         return caches.open(CACHE_NAME).then((cache) => {
//           cache.put(event.request, response.clone());
//           return response;
//         });
//       })
//       .catch(() => caches.match(event.request))
//   );
// });

// self.addEventListener("activate", (event) => {
//   clients.claim();
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames
//           .filter((name) => name !== CACHE_NAME)
//           .map((name) => caches.delete(name))
//       );
//     })
//   );
// });
