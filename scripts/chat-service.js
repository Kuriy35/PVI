const socket = io("http://localhost:3000");

socket.on("connectionConfirmed", (data) => {
  console.log("Connection confirmed:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

let selectedUsers = [];
let lastMessagesByChat = {};

let chatNameInputValue, chatDescriptionInputValue;
const currentChat = {
  id: "",
  name: "",
  description: "",
  participants: [],
};

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
  confirmCreateChatBtn.addEventListener("click", () => {
    if (selectedUsers.length === 0) {
      alert("Будь ласка, виберіть хоча б одного учасника");
      return;
    }

    const modal = document.getElementById("addUsersModal");
    const mode = modal.dataset.mode;

    if (mode === "create") {
      createChat();
    } else if (mode === "add") {
      const chatId = modal.dataset.chatId;
      addUsersToExistingChat(chatId);
    }

    closeModal("addUsersModal");
  });
  addNewUsersToChat.addEventListener("click", () => {
    openAddUsersModal(false, currentChat.id);
  });
  sendMessageBtn.addEventListener("click", sendMessage);
}

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

export function generateAvatarData(name) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFC107",
    "#FF9800",
    "#FF5722",
  ];

  const hash = name
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colorIndex = hash % colors.length;

  return {
    initials,
    color: colors[colorIndex],
  };
}

function proceedToAddUsers() {
  const chatName = document.getElementById("chatName").value;
  if (!chatName.trim()) {
    alert("Please enter a chat name");
    return;
  }
  closeCreateChatModal();
  openAddUsersModal(true);
}

function openAddUsersModal(isNewChat = false, chatId = null) {
  const modal = document.getElementById("addUsersModal");
  if (isNewChat) {
    getAvailableUsersList();
    modal.dataset.mode = "create";
  } else {
    modal.dataset.mode = "add";
    modal.dataset.chatId = chatId;
    getAvailableUsersList(currentChat.participants);
    closeModal("chatInfoModal");
  }
  selectedUsers = [];
  document.querySelectorAll(".user-item").forEach((item) => {
    item.classList.remove("selected");
  });

  modal.style.display = "block";
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

  const fullName = `${userData.first_name} ${userData.last_name}`;
  const avatarData = generateAvatarData(fullName);

  const avatarElement = clone.querySelector(".avatar-circle");
  avatarElement.textContent = avatarData.initials;
  avatarElement.style.backgroundColor = avatarData.color;

  clone.querySelector(".user-name").textContent = fullName;
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

async function createChat() {
  try {
    selectedUsers.push(window.authUserId);

    const socketResponse = await new Promise((resolve) => {
      socket.emit(
        "createChat",
        window.authUserId,
        chatNameInputValue,
        chatDescriptionInputValue,
        selectedUsers,
        (response) => {
          resolve(response);
        }
      );
    });

    if (!socketResponse.success) {
      console.error("Failed to create users:", socketResponse.error);
      return;
    }

    const chats = await getCurrentUserChats(window.authUserId);
    UpdateChatsAndNotifications(chats);
  } catch (error) {
    console.error("addUsersToExistingChat failed:", error);
  }
}

async function addUsersToExistingChat(chatId) {
  try {
    const socketResponse = await new Promise((resolve) => {
      socket.emit("addUsersToChat", chatId, selectedUsers, (response) => {
        resolve(response);
      });
    });

    if (!socketResponse.success) {
      console.error("Failed to add users:", socketResponse.error);
      return;
    }
    return socketResponse.chat;
  } catch (error) {
    console.error("addUsersToExistingChat failed:", error);
  }
}

export async function UpdateChatsAndNotifications(
  chats,
  onlyNotificationsUpdate = false
) {
  const chatListContainer = document.querySelector(".chat-list");
  let chatElements = null;

  if (chatListContainer) {
    if (chats.length === 0) {
      chatListContainer.innerHTML = "<p>У вас ще немає чатів</p>";
      return;
    }

    if (!onlyNotificationsUpdate) {
      chatListContainer.innerHTML = "";

      const fragment = document.createDocumentFragment();

      chats.forEach((chat) => {
        fragment.appendChild(renderChatItem(chat));
      });

      chatListContainer.appendChild(fragment);
    }

    chatElements = chatListContainer.querySelectorAll(".chat-list-item");
  }

  await renderUserNotifications(window.authUserId, chatElements);

  if (chatElements) {
    chatElements.forEach((chatItem) => {
      chatItem.addEventListener("click", () => {
        selectChat(chatItem);
      });
    });
  }
}

function renderChatItem(chat) {
  const template = document.getElementById("chatListItemTemplate");
  const clone = template.content.cloneNode(true);

  const chatListItem = clone.querySelector(".chat-list-item");
  chatListItem.id = chat._id;

  const avatarElement = clone.querySelector(".avatar-circle");
  const { initials, color } = generateAvatarData(chat.name);
  avatarElement.textContent = initials;
  avatarElement.style.backgroundColor = color;

  clone.querySelector(".chat-name-item").textContent = chat.name;

  const chatPreviewElement = clone.querySelector(".chat-preview");
  const chatPreviewAuthor = chatPreviewElement.querySelector(".message-author");
  const chatPreviewMessage = chatPreviewElement.querySelector(".message-text");

  if (chat.lastMessage) {
    const preview = shortenPreviewText(
      chat.lastMessage.authorName,
      chat.lastMessage.text
    );

    chatPreviewAuthor.textContent = preview.author;
    chatPreviewMessage.textContent = preview.text;
  } else {
    chatPreviewAuthor.textContent = "";
    chatPreviewMessage.textContent = "Чат створено";
  }

  const timeElement = clone.querySelector(".chat-last-message-time");
  updateChatListItemTime(timeElement, chat.lastActivityAt);

  return clone;
}

export async function selectChat(chatElement) {
  const chatMessagesContainer = document.querySelector(".chat-main-container");

  clearChat();

  getMessagesForChat(chatElement.id)
    .then((data) => {
      const fragment = document.createDocumentFragment();
      data.forEach((message) => {
        fragment.appendChild(renderMessage(message));
      });

      chatMessagesContainer.appendChild(fragment);
      scrollToBottom(chatMessagesContainer);
    })
    .catch((err) =>
      console.error("Failed to get messages for this chat:", err)
    );

  document.querySelectorAll(".chat-list-item.active").forEach((item) => {
    item.classList.remove("active");
  });

  chatElement.classList.add("active");

  currentChat.id = chatElement.id;
  currentChat.name = chatElement.querySelector(".chat-name-item").textContent;

  const avatarData = generateAvatarData(currentChat.name);

  const avatarElement = document.querySelector(".chat-header .avatar-circle");
  avatarElement.textContent = avatarData.initials;
  avatarElement.style.backgroundColor = avatarData.color;

  document.getElementById("current-chat-name").textContent = currentChat.name;

  document.getElementById("current-chat-status").textContent = "Members";
  document.getElementById("current-chat-status").style.cursor = "pointer";

  document.querySelector(".empty-chat-header").style.display = "none";
  document.querySelector(".chat-header").style.display = "flex";
  document.querySelector(".chat-main-container").style.display = "flex";
  document.querySelector(".chat-input-container").style.display = "flex";

  const unreadMessagesCount = parseInt(
    chatElement.querySelector(".chat-notifications-number").textContent
  );
  const currentUnreadMessagesCount = parseInt(
    document.getElementById("notificationIndicator").textContent
  );

  if (unreadMessagesCount <= 0 || isNaN(unreadMessagesCount)) return;

  const updatedUnreadMessagesCount =
    currentUnreadMessagesCount - unreadMessagesCount;

  if (markChatAsViewed(currentChat.id, window.authUserId)) {
    setNotificationsCount(updatedUnreadMessagesCount);
    showNotifications();

    const chats = await getCurrentUserChats(window.authUserId);
    UpdateChatsAndNotifications(chats, true);
  }
}

async function markChatAsViewed(chatId, userId) {
  try {
    const socketResponse = await new Promise((resolve) => {
      socket.emit("messagesViewed", chatId, userId, (response) => {
        resolve(response);
      });
    });

    return socketResponse.success;
  } catch (error) {
    console.error("markChatViewed failed:", error);
  }
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

  const isOutgoing =
    window.authUserId.toString() === messageData.authorId.toString();
  const templateType = isOutgoing
    ? "messageOutgoingTemplate"
    : "messageIncomingTemplate";
  const template = document.getElementById(templateType);
  const clone = template.content.cloneNode(true);

  const avatarData = generateAvatarData(messageData.authorName);
  const avatarElement = clone.querySelector(".avatar-circle");
  avatarElement.textContent = avatarData.initials;
  avatarElement.style.backgroundColor = avatarData.color;

  clone.querySelector(".message-text").textContent = messageData.text;
  clone.querySelector(".message-time").textContent = formattedTime;

  const messageAuthorClassType = isOutgoing
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

  const messageData = JSON.stringify({
    chatId: currentChat.id,
    authorId: window.authUserId,
    authorName: `${window.authUserFirstName} ${window.authUserLastName}`,
    text: message,
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Message sending timeout"));
    }, 10000);

    socket.emit("sendMessage", messageData, (response) => {
      clearTimeout(timeout);

      if (response.success) {
        resolve(response.message);
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

async function openChatInfoModal() {
  try {
    const socketResponse = await new Promise((resolve) => {
      socket.emit("getChatInfo", currentChat.id, (response) => {
        resolve(response);
      });
    });

    if (!socketResponse.success) {
      console.error("Failed to get chat info message:", socketResponse.error);
      return;
    }

    currentChat.participants = socketResponse.chat.users;
    currentChat.description = socketResponse.chat.description;
    const participantsWithStatus = socketResponse.participantsWithStatus;

    const response = await fetch(
      "index.php?controller=students&action=getFullNameById",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ userIdsToGet: currentChat.participants }),
      }
    );

    if (!response.ok) throw new Error("Failed to get full names");

    const responseData = await response.json();
    renderParticipantsList(responseData, participantsWithStatus);

    document.getElementById("chatInfoTitle").textContent = currentChat.name;
    document.getElementById("chatInfoDescription").textContent =
      currentChat.description;
    document.getElementById("chatInfoModal").style.display = "block";
  } catch (error) {
    console.error("openChatInfoModal failed:", error);
  }
}

function renderParticipantsList(participantsData, participantsWithStatus) {
  const participantsList = document.getElementById("participantsList");
  participantsList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  participantsData.forEach((participant) => {
    fragment.appendChild(
      renderParticipantElement(participant, participantsWithStatus)
    );
  });

  participantsList.appendChild(fragment);
}

function renderParticipantElement(participant, participantsWithStatus) {
  const template = document.getElementById("participantTemplate");
  const clone = template.content.cloneNode(true);

  const fullName = `${participant.first_name} ${participant.last_name}`;
  const isCurrentUser =
    participant.id.toString() === window.authUserId.toString();

  const avatarData = generateAvatarData(fullName);
  const avatarElement = clone.querySelector(".avatar-circle");
  avatarElement.textContent = avatarData.initials;
  avatarElement.style.backgroundColor = avatarData.color;

  const nameElement = clone.querySelector(".participant-name");
  nameElement.textContent = isCurrentUser ? `${fullName} (Ви)` : fullName;

  if (isCurrentUser) {
    nameElement.classList.add("current-user");
    clone.querySelector(".participant").classList.add("current-user-container");
  }

  const participantStatus = participantsWithStatus.find(
    (statusItem) => statusItem.userId.toString() === participant.id.toString()
  );

  const statusElement = clone.querySelector(".participant-status");
  if (statusElement && participantStatus) {
    statusElement.textContent = participantStatus.status;
    statusElement.classList.add(
      participantStatus.status === "Online" ? "status-online" : "status-offline"
    );
  }

  return clone;
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

export async function getCurrentUserChats(userId) {
  try {
    const socketResponse = await new Promise((resolve) => {
      socket.emit("getChatsList", userId, (response) => {
        resolve(response);
      });
    });

    if (!socketResponse.success) {
      console.error("Failed to get chat info message:", socketResponse.error);
      return;
    }
    return socketResponse.chats;
  } catch (error) {
    console.error("openChatInfoModal failed:", error);
  }
}

function getMessagesForChat(chatId) {
  return fetch(`http://localhost:3000/api/messages/chat/${chatId}`).then(
    (res) => res.json()
  );
}

export function connectUser(userId) {
  socket.emit("userConnected", userId);
}

export async function renderUserNotifications(userId, chatElements = null) {
  const userNotifications = await getUserNotifications(userId);

  setNotificationsCount(userNotifications.length);

  const notificationsByChatId = new Map();
  userNotifications.forEach((notif) => {
    const chatId = notif.chat._id;
    if (!notificationsByChatId.get(chatId)) {
      notificationsByChatId.set(chatId, []);
    }
    notificationsByChatId.get(chatId).push(notif);
  });

  if (chatElements !== null) {
    chatElements.forEach((chatElement) => {
      const notifsArray = notificationsByChatId.get(chatElement.id);
      const unreadCount = notifsArray ? notifsArray.length : 0;
      updateChatListItemNotifications(chatElement, unreadCount);
    });
  }

  const chats = await getCurrentUserChats(userId);

  const chatsNotByMe = chats
    .filter(
      (chat) =>
        chat.lastMessage?.authorId.toString() !== window.authUserId.toString()
    )
    .slice(0, 3);

  chatsNotByMe.forEach((chat) => {
    const notifsArray = notificationsByChatId.get(chat._id);
    const unreadCount = notifsArray ? notifsArray.length : 0;
    updateLastMessagesMenu(chat.lastMessage, chat.name, chat._id, unreadCount);
  });

  showNotifications();
}

async function getUserNotifications(userId) {
  try {
    const socketResponse = await new Promise((resolve) => {
      socket.emit("getUserNotifications", userId, (response) => {
        resolve(response);
      });
    });

    if (!socketResponse.success) {
      console.error("Failed to get user notifications:", socketResponse.error);
      return;
    }
    return socketResponse.notifications;
  } catch (error) {
    console.error("getUserNotifications failed:", error);
  }
}

function updateChatListItemNotifications(chatElement, unreadCount) {
  const notificationElement = chatElement.querySelector(
    ".chat-notifications-number"
  );

  if (unreadCount > 0) {
    notificationElement.textContent = unreadCount.toString();
    chatElement.classList.add("unread");
    notificationElement.style.display = "flex";
  } else {
    notificationElement.textContent = "0";
    chatElement.classList.remove("unread");
    notificationElement.style.display = "none";
  }
}

export function updateChatListItemTime(timeElement, time) {
  timeElement.textContent = formatMessageTime(time);
}

function scrollToBottom(element, smoothScroll = false) {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smoothScroll ? "smooth" : "auto",
  });
}

export function shortenPreviewText(authorName, messageText, maxLength = 30) {
  const fullText = `${authorName}: ${messageText}`;

  if (fullText.length <= maxLength) {
    return {
      author: authorName === "" ? authorName : authorName + ":",
      text: messageText,
    };
  }

  const availableLength = maxLength - authorName.length - 2;
  let shortenedText = messageText.substring(0, availableLength);

  if (availableLength < messageText.length) {
    shortenedText += "…";
  }

  return {
    author: authorName === "" ? authorName : authorName + ":",
    text: shortenedText,
  };
}

export async function updateLastMessagesMenu(
  newMessage,
  chatName,
  chatId,
  unreadCount = 0
) {
  if (!chatId) return;
  if (!newMessage) {
    newMessage = {};
    newMessage.authorName = "";
    newMessage.text = "Чат створено";

    try {
      const socketResponse = await new Promise((resolve) => {
        socket.emit("getChatInfo", chatId, (response) => {
          resolve(response);
        });
      });

      if (!socketResponse.success) {
        console.error("Failed to get chat info message:", socketResponse.error);
        return;
      }

      newMessage.createdAt = socketResponse.chat.lastActivityAt;
    } catch (error) {
      console.error("getChatInfo failed:", error);
    }
  }

  const lastMessagesMenu = document.querySelector(".dropdown-content-messages");

  lastMessagesByChat[chatId] = { newMessage, chatName, chatId, unreadCount };

  const latestMessages = Object.values(lastMessagesByChat)
    .sort(
      (a, b) =>
        new Date(b.newMessage.createdAt) - new Date(a.newMessage.createdAt)
    )
    .slice(0, 3);

  lastMessagesMenu.innerHTML = "";

  latestMessages.forEach((messageData) => {
    const menuItem = renderLastMessagesMenuItem(
      messageData.newMessage,
      messageData.chatName,
      messageData.chatId,
      messageData.unreadCount
    );
    lastMessagesMenu.appendChild(menuItem);
  });

  lastMessagesMenu
    .querySelectorAll(".dropdown-content-messages-element")
    .forEach((element) =>
      element.addEventListener("click", () => {
        chatId = element.getAttribute("data-chat-id");
        window.location.href = `/CMS/index.php?page=messages&chat=${chatId}`;
      })
    );
}

function renderLastMessagesMenuItem(
  messageData,
  chatName,
  chatId,
  unreadCount = 0
) {
  if (!chatId) return null;

  const template = document.getElementById("lastMessagesMenuItemTemplate");
  const clone = template.content.cloneNode(true);

  const avatarElement = clone.querySelector(".avatar-circle");
  const { initials, color } = generateAvatarData(chatName);
  avatarElement.textContent = initials;
  avatarElement.style.backgroundColor = color;

  clone.querySelector(".chat-name-preview").textContent = chatName;

  const timeElement = clone.querySelector(".message-time-menu");
  timeElement.textContent = formatMessageTime(messageData.createdAt);

  const authorSpan = clone.querySelector(".message-author-preview");
  const { author, text } = shortenPreviewText(
    messageData.authorName,
    messageData.text
  );

  authorSpan.className = "message-author-preview";
  authorSpan.textContent = author;

  const textSpan = clone.querySelector(".message-text-preview");
  textSpan.textContent = text;

  const notificationsNumber = clone.querySelector(".chat-notifications-number");
  if (unreadCount > 0) {
    notificationsNumber.textContent = unreadCount.toString();
    notificationsNumber.style.display = "flex";
    clone.querySelector("li").classList.add("unread");
  } else {
    notificationsNumber.textContent = "0";
    notificationsNumber.style.display = "none";
    clone.querySelector("li").classList.remove("unread");
  }

  clone.querySelector("li").setAttribute("data-chat-id", chatId);

  return clone;
}

export function formatMessageTime(time) {
  const date = new Date(time);
  const now = new Date();

  if (isSameDay(date, now)) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (isSameYear(date, now)) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } else {
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function isSameYear(date1, date2) {
  return date1.getFullYear() === date2.getFullYear();
}

function setNotificationsCount(notifCount = 0) {
  const notificationIndicator = document.getElementById(
    "notificationIndicator"
  );

  notificationIndicator.textContent = notifCount;
}

function showNotifications(addNew = false) {
  const bell = document.getElementById("bellContainer");
  const notificationIndicator = document.getElementById(
    "notificationIndicator"
  );

  let messagesCount = parseInt(notificationIndicator.textContent) || 0;

  if (addNew) {
    messagesCount++;
  }

  if (messagesCount <= 99) {
    notificationIndicator.textContent = messagesCount;
  } else {
    notificationIndicator.textContent = "99+";
    notificationIndicator.style.fontSize = "9px";
  }

  if (messagesCount > 0) {
    notificationIndicator.style.display = "flex";
    bell.classList.add("shake");
    setTimeout(() => bell.classList.remove("shake"), 500);
  } else notificationIndicator.style.display = "none";
}

socket.on("messageReceived", async (response) => {
  const currentUrlParams = new URLSearchParams(window.location.search);
  const currentPage = currentUrlParams.get("page");

  if (
    currentPage === "messages" &&
    response.message.chatId._id.toString() === currentChat.id.toString()
  ) {
    const chatMessagesContainer = document.querySelector(
      ".chat-main-container"
    );
    chatMessagesContainer.appendChild(renderMessage(response.message));
    scrollToBottom(chatMessagesContainer, true);
    markChatAsViewed(currentChat.id, window.authUserId);
  } else if (
    response.message.authorId.toString() !== window.authUserId.toString()
  ) {
    showNotifications(true);
  }

  const chats = await getCurrentUserChats(window.authUserId);
  UpdateChatsAndNotifications(chats);
});

socket.on("addedToNewChat", async () => {
  const chats = await getCurrentUserChats(window.authUserId);
  UpdateChatsAndNotifications(chats);
});
