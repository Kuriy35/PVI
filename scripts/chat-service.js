let selectedUsers = [];
let currentChatType = "group";
let chatNameInputValue, chatDescriptionInputValue;
const chatState = {
  id: "",
  name: "",
  description: "",
  participants: [],
};

function openCreateChatModal() {
  document.getElementById("createChatModal").style.display = "block";
}

function closeCreateChatModal() {
  closeModal("createChatModal");
  chatNameInputValue = document.getElementById("chatName").value.trim();
  chatDescriptionInputValue = document
    .getElementById("chatDescription")
    .value.trim();
  document.getElementById("chatName").value = "";
  document.getElementById("chatDescription").value = "";
}

function proceedToAddUsers() {
  const chatName = document.getElementById("chatName").value;
  if (!chatName.trim()) {
    alert("Будь ласка, введіть назву чату");
    return;
  }
  closeCreateChatModal();
  openAddUsersModal(true);
}

function openAddUsersModal(isNewChat = false) {
  if (isNewChat) {
    getAvailableUsersList();
  } else {
    getAvailableUsersList(chatState.participants);
    closeModal("chatInfoModal");
  }
  selectedUsers = [];
  document.querySelectorAll(".user-item").forEach((item) => {
    item.classList.remove("selected");
  });

  document.getElementById("addUsersModal").style.display = "block";
}

function getAvailableUsersList(alreadyAdded = []) {
  fetch("index.php?controller=students&action=getAllGeneralData")
    .then((response) => response.json())
    .then((data) => {
      const addedIds = alreadyAdded.map((id) => String(id));

      const filteredUsers = data.filter((user) => {
        return !addedIds.includes(String(user.id));
      });

      renderAvailableToAddUserList(filteredUsers);
    })
    .catch((error) => console.error("Failed to get user list:", error));
}

function renderAvailableToAddUserList(userDataList) {
  const userList = document.getElementById("userList");
  if (!userList) return;

  userList.innerHTML = "";

  const fragment = document.createDocumentFragment();
  userDataList.forEach((user) => {
    if (user.id != window.authUserId) {
      fragment.appendChild(renderAvailableToAddUser(user));
    }
  });

  userList.appendChild(fragment);

  const userListItems = userList.querySelectorAll(".user-item");
  if (!userListItems) return;

  userListItems.forEach((item) => {
    item.addEventListener("click", () => {
      toggleUser(item, item.getAttribute("data-id"));
    });
  });
}

function renderAvailableToAddUser(userData) {
  if (!userData) {
    console.error("Can`t render undefined user (received user value is null)!");
    return;
  }

  const template = document.getElementById("userToAddTemplate");
  const clone = template.content.cloneNode(true);

  clone.querySelector(
    ".user-name"
  ).textContent = `${userData.first_name} ${userData.last_name}`;
  clone.querySelector(".user-item").setAttribute("data-id", userData.id);

  return clone;
}

function toggleUser(element, userId) {
  element.classList.toggle("selected");
  if (selectedUsers.includes(userId)) {
    selectedUsers = selectedUsers.filter((id) => id !== userId);
  } else {
    selectedUsers.push(userId);
  }
}

function searchUsers() {
  const searchUsersInput = document.querySelector(
    "#addUsersModal .user-search input"
  );

  const searchInputValue = searchUsersInput ? searchUsersInput.value : "";

  const userItems = document.querySelectorAll(".user-item");
  userItems.forEach((item) => {
    const userName = item.textContent.toLowerCase();
    if (userName.includes(searchInputValue.toLowerCase())) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

function createChat() {
  if (selectedUsers.length === 0) {
    alert("Будь ласка, виберіть хоча б одного учасника");
    return;
  }

  selectedUsers.push(window.authUserId);

  fetch(`http://localhost:3000/api/chats/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: chatNameInputValue,
      description: chatDescriptionInputValue,
      users: selectedUsers,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      alert(
        `Чат "${chatNameInputValue}" створено з ${selectedUsers.length} учасниками!`
      );
      closeModal("addUsersModal");
    })
    .catch((err) => console.error("Сталася помилка:", err));
}

export function selectChat(chatElement) {
  const chatMessagesContainer = document.querySelector(".chat-main-container");

  clearChat();

  getMessagesForChat(chatElement.getAttribute("data-id"))
    .then((data) => {
      const fragment = document.createDocumentFragment();
      data.forEach((message) => {
        fragment.appendChild(renderMessage(message));
      });

      chatMessagesContainer.appendChild(fragment);
    })
    .catch((err) =>
      console.error("Failed to get messages for this chat:", err)
    );

  document.querySelectorAll(".chat-list-item.active").forEach((item) => {
    item.classList.remove("active");
  });

  chatElement.classList.add("active");

  // currentChatType = type;
  chatState.id = chatElement.getAttribute("data-id");
  chatState.name = chatElement.querySelector(".chat-name-item").textContent;

  document.getElementById("current-chat-name").textContent = chatState.name;

  // if (type === "group") {
  //   const participantCount = Math.floor(Math.random() * 8) + 3;
  //   document.getElementById(
  //     "current-chat-status"
  //   ).textContent = `${participantCount} учасників`;
  //   document.getElementById("current-chat-status").style.cursor = "pointer";
  // } else {
  //   const statuses = [
  //     "У мережі",
  //     "Був 5 хвилин тому",
  //     "Була вчора",
  //     "Був вчора",
  //   ];
  //   const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  //   document.getElementById("current-chat-status").textContent = randomStatus;
  //   document.getElementById("current-chat-status").style.cursor = "default";
  // }
  document.getElementById("current-chat-status").textContent = "Online";
  document.getElementById("current-chat-status").style.cursor = "pointer";
}

function clearChat() {
  document.querySelector(".chat-main-container").innerHTML = "";
}

function renderMessage(messageData) {
  if (!messageData) return;

  const date = new Date(messageData.createdAt);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  const templateType =
    window.authUserId == messageData.authorId
      ? "messageOutgoingTemplate"
      : "messageIncomingTemplate";
  const template = document.getElementById(templateType);
  const clone = template.content.cloneNode(true);

  clone.querySelector(".message-text").textContent = messageData.text;
  clone.querySelector(".message-time").textContent = formattedTime;

  const messageAuthorClassType =
    window.authUserId == messageData.authorId
      ? ".message-author-outgoing"
      : ".message-author-incoming";

  const authorField = clone.querySelector(messageAuthorClassType);
  authorField.setAttribute("data-id", messageData._id);
  authorField.textContent = messageData.authorName;

  return clone;
}

function sendMessage() {
  const message = document.querySelector(
    ".chat-input-container .message-input"
  ).value;
  document.querySelector(".chat-input-container .message-input").value = "";

  fetch("http://localhost:3000/api/messages/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatId: chatState.id,
      authorId: window.authUserId,
      authorName: `${window.authUserFirstName} ${window.authUserLastName}`,
      text: message,
    }),
  }).catch((error) => console.error("Failed to send message:", error));
}

async function openChatInfoModal() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/chats/${chatState.id}`
    );
    if (!response.ok) throw new Error("Chat not found");
    const data = await response.json();

    chatState.participants = data[0].users;
    chatState.description = data[0].description;

    // Показати назву та опис
    document.getElementById("chatInfoTitle").textContent = chatState.name;
    document.getElementById("chatInfoDescription").textContent =
      chatState.description;
    document.getElementById("chatInfoModal").style.display = "block";

    getAvailableUsersList(chatState.participants);

    const fullNamesResponse = await fetch(
      "index.php?controller=students&action=getFullNameById",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ userIdsToGet: chatState.participants }),
      }
    );

    if (!fullNamesResponse.ok) throw new Error("Failed to get full names");

    const fullNames = await fullNamesResponse.json();
    renderParticipantsList(fullNames);
  } catch (error) {
    console.error("openChatInfoModal failed:", error);
  }
}

function renderParticipantsList(participants) {
  const participantsList = document.getElementById("participantsList");
  participantsList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  participants.forEach((participant) => {
    fragment.appendChild(renderParticipantElement(participant));
  });

  participantsList.appendChild(fragment);
}

function renderParticipantElement(participant) {
  const template = document.getElementById("participantTemplate");
  const clone = template.content.cloneNode(true);

  clone.querySelector(
    ".participant-name"
  ).textContent = `${participant.first_name} ${participant.last_name}`;

  return clone;
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

export function refreshEventListeners() {
  const createChatBtn = document.querySelector(".create-chat-btn");
  const chatStatus = document.getElementById("current-chat-status");
  const closeCreateChatModalBtn = document.querySelector(
    "#createChatModal .close"
  );
  const closeAddUserModalBtn = document.querySelector("#addUsersModal .close");
  const closeChatInfoModalBtn = document.querySelector("#chatInfoModal .close");
  const confirmAddUsersBtn = document.querySelector(
    "#createChatModal .modal-btn"
  );
  const searchUsersInput = document.querySelector(
    "#addUsersModal .user-search input"
  );
  const confirmCreateChatBtn = document.querySelector(
    "#addUsersModal .modal-btn"
  );
  const addNewUsersToChat = document.querySelector(
    "#chatInfoModal .add-participant-btn"
  );
  const sendMessageBtn = document.querySelector(".send-button");

  createChatBtn.addEventListener("click", openCreateChatModal);
  chatStatus.addEventListener("click", openChatInfoModal);
  closeCreateChatModalBtn.addEventListener("click", closeCreateChatModal);
  closeAddUserModalBtn.addEventListener("click", () => {
    closeModal("addUsersModal");
  });
  closeChatInfoModalBtn.addEventListener("click", () => {
    closeModal("chatInfoModal");
  });
  confirmAddUsersBtn.addEventListener("click", proceedToAddUsers);
  searchUsersInput.addEventListener("input", searchUsers);
  confirmCreateChatBtn.addEventListener("click", createChat);
  addNewUsersToChat.addEventListener("click", () => {
    openAddUsersModal();
  });
  sendMessageBtn.addEventListener("click", sendMessage);
}

export function getCurrentUserChats(userId) {
  return fetch(`http://localhost:3000/api/chats/user/${userId}`).then((res) =>
    res.json()
  );
}

function getMessagesForChat(chatId) {
  return fetch(`http://localhost:3000/api/messages/chat/${chatId}`).then(
    (res) => res.json()
  );
}
