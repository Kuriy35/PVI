function openModalWindow(windowId) {
  const modalWindow = document.getElementById(windowId);
  modalWindow.style.display = "flex";
}

function closeModalWindow(windowId) {
  const modalWindow = document.getElementById(windowId);
  modalWindow.style.display = "none";
}

function refreshEventListeners() {
  const addBtn = document.getElementById("btn-add");
  const closeModalWindowBtnX = document.getElementById("btn-modal-close-x");
  const closeModalWindowBtnOk = document.getElementById("btn-modal-close-ok");

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      openModalWindow("modal-input-student");
    });
  }

  if (closeModalWindowBtnX) {
    closeModalWindowBtnX.addEventListener("click", function () {
      closeModalWindow("modal-input-student");
    });
  }

  if (closeModalWindowBtnOk) {
    closeModalWindowBtnOk.addEventListener("click", function () {
      closeModalWindow("modal-input-student");
    });
  }
}
