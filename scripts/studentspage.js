let closeModalInputBtnX, closeModalDeleteBtnX;
let modalHeader, warningTextMsg;
let errorMsgs, inputFields;
let errorMsgsLogin, inputFieldsLogin;
window.selectAllCheckbox;
window.checkedBoxes = [];
let rowCheckboxes,
  editButtons,
  deleteButtons,
  idsToDeleteArray = [],
  deleteSelectedBtn;

let currentPage = 1;
window.tablePageSize = 7;

function refreshEventListeners(totalStudentCount = null) {
  window.isAuth
    ? refreshEventListenersAuth(totalStudentCount)
    : refreshEventListenersGuest();
}

function refreshEventListenersAuth(totalStudentCount = null) {
  const addBtn = document.getElementById("btn-add");
  closeModalInputBtnX = document.getElementById("btn-modal-input-x");
  const closeModalInputBtnOk = document.getElementById("btn-modal-input-ok");
  const submitStudentDataBtn = document.getElementById("submitStudentDataBtn");
  closeModalDeleteBtnX = document.getElementById("closeModalDeleteBtnX");
  const closeModalDeleteBtnCancel = document.getElementById(
    "closeModalDeleteBtnCancel"
  );
  const confirmDeleteStudentBtn = document.getElementById(
    "confirmDeleteStudent"
  );
  modalHeader = document.getElementById("modalStudentsDataHeader");
  warningTextMsg = document.getElementById("warningTextMsg");

  inputFields = document.querySelectorAll(".input-student-data-field");
  errorMsgs = document.querySelectorAll(".validation-error-output");

  selectAllCheckbox = document.getElementById("selectAllCheckbox");
  rowCheckboxes = document.getElementsByClassName("checkbox-row-element");
  editButtons = document.getElementsByClassName("btn-edit");
  deleteButtons = document.getElementsByClassName("btn-delete");
  deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

  if (addBtn) {
    if (!addBtn.hasAttribute("addStudent-click-listener-added")) {
      addBtn.addEventListener("click", function () {
        modalHeader.innerText = "Add Student";
        submitStudentDataBtn.innerText = "Create";

        openModalWindow("modal-input-student");

        const inputFormActionType = document.getElementById(
          "inputFormActionType"
        );
        inputFormActionType.value = "addStudent";

        closeModalInputBtnX.focus();
      });
      addBtn.setAttribute("addStudent-click-listener-added", "true");
    }
  }

  if (closeModalInputBtnX) {
    if (!closeModalInputBtnX.hasAttribute("closeModal-click-listener-added")) {
      closeModalInputBtnX.addEventListener("click", function () {
        resetInputForm();
        closeModalWindow("modal-input-student");
        addBtn.focus();
      });
      closeModalInputBtnX.setAttribute(
        "closeModal-click-listener-added",
        "true"
      );
    }
  }

  if (submitStudentDataBtn) {
    if (
      !submitStudentDataBtn.hasAttribute(
        "submitStudentData-click-listener-added"
      )
    ) {
      submitStudentDataBtn.addEventListener("click", function () {
        const form = document.getElementById("studentForm");
        const formData = new FormData(form);

        fetch("index.php", {
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data["status"]) {
              if (data["action"] === "addStudent") {
                showToastMessage("Student added successfully!", "success");
                renderNewStudent(data["student"]);
                resetInputForm();
              } else if (data["action"] === "editStudent") {
                showToastMessage("Student edited successfully!", "success");
                window.location.href = data["redirect"];
              }
              closeModalWindow("modal-input-student");
            } else {
              debugger;
              const keys = Object.keys(data["errors"]);

              for (let i = 0; i < keys.length; i++) {
                const inputWithError = document.getElementById(
                  `${keys[i]}_input`
                );
                const errorMessage = document.getElementById(
                  `${keys[i]}_error_message`
                );

                debugger;
                if (inputWithError != null && errorMessage != null) {
                  inputWithError.classList.add("validation-error-input-field");
                  errorMessage.classList.add("validation-error-output-active");
                  errorMessage.textContent = data["errors"][keys[i]];
                }
              }
              if (data.errors["duplicate"])
                showToastMessage(data.errors["duplicate"], "error");
            }
          })
          .catch((error) => console.error("Operation failed:", error));
      });
      submitStudentDataBtn.setAttribute(
        "submitStudentData-click-listener-added",
        "true"
      );
    }
  }

  if (inputFields) {
    for (let i = 0; i < inputFields.length; i++) {
      if (!inputFields[i].hasAttribute("field-focus-listener-added")) {
        inputFields[i].addEventListener("focus", function () {
          inputFields[i].classList.remove("validation-error-input-field");
          errorMsgs[i].classList.remove("validation-error-output-active");
          inputFields[i].style.color = "black";
        });
        inputFields[i].setAttribute("field-focus-listener-added", "true");
      }
    }
  }

  if (closeModalDeleteBtnX) {
    if (!closeModalDeleteBtnX.hasAttribute("closeModal-click-listener-added")) {
      closeModalDeleteBtnX.addEventListener("click", function () {
        closeModalWindow("modal-delete-student");
        addBtn.focus();
      });
      closeModalDeleteBtnX.setAttribute(
        "closeModal-click-listener-added",
        "true"
      );
    }
  }

  if (closeModalDeleteBtnCancel) {
    if (
      !closeModalDeleteBtnCancel.hasAttribute(
        "closeModalCancel-click-listener-added"
      )
    ) {
      closeModalDeleteBtnCancel.addEventListener("click", function () {
        closeModalWindow("modal-delete-student");
        addBtn.focus();
      });
      closeModalDeleteBtnCancel.setAttribute(
        "closeModalCancel-click-listener-added",
        "true"
      );
    }
  }

  if (confirmDeleteStudentBtn) {
    if (
      !confirmDeleteStudentBtn.hasAttribute(
        "deleteStudents-click-listener-added"
      )
    ) {
      confirmDeleteStudentBtn.addEventListener("click", function () {
        const formData = new FormData();
        formData.append("controller", "students");
        formData.append("action", "deleteStudents");
        idsToDeleteArray.forEach((id) => {
          formData.append("idArray[]", id);
        });

        fetch("index.php", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            idsToDeleteArray = [];
            if (data.status) {
              loadPage("students").catch((error) =>
                console.error("Error loading page:", error)
              );
            } else {
              showToastMessage(data.errors[0], "error");
            }
            closeModalWindow("modal-delete-student");
          })
          .catch((error) => console.error("Error occurred:", error));
      });
      confirmDeleteStudentBtn.setAttribute(
        "deleteStudents-click-listener-added",
        "true"
      );
    }
  }

  if (selectAllCheckbox) {
    if (!selectAllCheckbox.hasAttribute("selectAll-click-listener-added")) {
      selectAllCheckbox.addEventListener("click", function () {
        Array.from(rowCheckboxes).forEach(
          (checkbox) => (checkbox.checked = selectAllCheckbox.checked)
        );

        if (!selectAllCheckbox.checked) {
          checkedBoxes = [];
        }
        updateOptionsStatus();
      });
      selectAllCheckbox.click();
      selectAllCheckbox.setAttribute("selectAll-click-listener-added", "true");
    }
  }

  if (rowCheckboxes) {
    Array.from(rowCheckboxes).forEach((checkbox) => {
      if (!checkbox.hasAttribute("selectRow-click-listener-added")) {
        checkbox.addEventListener("click", function () {
          addCheckboxToCheckedList(checkbox);
        });
        checkbox.setAttribute("selectRow-click-listener-added", "true");
      }
    });
  }

  if (deleteSelectedBtn) {
    if (
      !deleteSelectedBtn.hasAttribute(
        "deleteSelectedStudents-click-listener-added"
      )
    ) {
      deleteSelectedBtn.addEventListener("click", function () {
        warningTextMsg.innerText = `Are you sure you want to delete selected ${checkedBoxes.length} students?`;
        checkedBoxes.forEach((checkbox) => {
          idsToDeleteArray.push(checkbox.id.replace("checkboxStudent", ""));
        });
        openModalWindow("modal-delete-student");
      });
      deleteSelectedBtn.setAttribute(
        "deleteSelectedStudents-click-listener-added",
        "true"
      );
    }
  }

  setupPagination(totalStudentCount, tablePageSize);
}

function renderNewStudent(student) {
  const tbody = document.querySelector("#studentsTable tbody");
  const fragment = document.createDocumentFragment();
  fragment.appendChild(renderStudentRow(student));
  tbody.appendChild(fragment);
  refreshEventListeners();
  updateOptionsStatus();
}

function refreshEventListenersGuest() {
  inputFieldsLogin = document.querySelectorAll(
    ".input-student-data-field-login"
  );
  errorMsgsLogin = document.querySelectorAll(".validation-error-output_login");

  const logInBtn = document.getElementById("logInButton");
  logInBtn.addEventListener("click", function () {
    showLoginModal();
  });

  const guestModeAuthorizationBtn = document.getElementById(
    "guestModeAuthorizationBtn"
  );
  guestModeAuthorizationBtn.addEventListener("click", function () {
    showLoginModal();
  });

  if (submitLoginForm) {
    if (!submitLoginForm.hasAttribute("submitLogin-click-listener-added")) {
      submitLoginForm.addEventListener("click", function () {
        const form = document.getElementById("loginForm");
        const formData = new FormData(form);

        fetch("index.php", {
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data["success"]) {
              window.location.reload();
            } else {
              const keys = Object.keys(data["errors"]);

              for (let i = 0; i < keys.length; i++) {
                const inputWithError = document.getElementById(`${keys[i]}`);
                const errorMessage = document.getElementById(
                  `${keys[i]}_error_message`
                );

                if (inputWithError != null && errorMessage != null) {
                  inputWithError.classList.add("input-error");
                  errorMessage.classList.add("validation-error-output-active");
                  errorMessage.textContent = data["errors"][keys[i]];
                }
              }
              showToastMessage("Wrong username or password", "error");
            }
          })
          .catch((error) => console.error("Operation failed:", error));
      });
      submitLoginForm.setAttribute("submitLogin-click-listener-added", "true");
    }
  }

  if (inputFieldsLogin) {
    for (let i = 0; i < inputFieldsLogin.length; i++) {
      if (!inputFieldsLogin[i].hasAttribute("field-focus-listener-added")) {
        inputFieldsLogin[i].addEventListener("focus", function () {
          inputFieldsLogin[i].classList.remove("input-error");
          errorMsgsLogin[i].classList.remove("validation-error-output-active");
          inputFieldsLogin[i].style.color = "black";
        });
        inputFieldsLogin[i].setAttribute("field-focus-listener-added", "true");
      }
    }
  }
}

function openModalWindow(windowId) {
  const modalWindow = document.getElementById(windowId);

  if (modalWindow) {
    modalWindow.style.display = "flex";
  }
}

function closeModalWindow(windowId) {
  const modalWindow = document.getElementById(windowId);

  if (modalWindow) {
    modalWindow.style.display = "none";
  }
}

function resetInputForm() {
  for (let i = 0; i < inputFields.length; i++) {
    if (inputFields[i].tagName === "SELECT") {
      inputFields[i].selectedIndex = 0;
    } else {
      inputFields[i].value = "";
    }
    inputFields[i].classList.remove("validation-error-input-field");
    errorMsgs[i].classList.remove("validation-error-output-active");
  }
}

function initializeEditForm(initializationRow) {
  const idField = document.getElementById("editedUserId");

  if (idField) {
    idField.value = initializationRow.id;
  } else console.error("Cannot set edited user ID!");

  inputFields[0].value = initializationRow
    .querySelector("td:nth-child(2)")
    .textContent.trim();
  let fullName = initializationRow.querySelector("td:nth-child(3)").textContent;
  [inputFields[1].value, inputFields[2].value] = fullName.trim().split(" ");
  inputFields[3].value =
    initializationRow.querySelector("td:nth-child(4)").textContent.trim() ===
    "M"
      ? "Male"
      : initializationRow
          .querySelector("td:nth-child(4)")
          .textContent.trim() === "F"
      ? "Female"
      : "Unknown";
  let birthDateText = initializationRow
    .querySelector("td:nth-child(5)")
    .textContent.trim();
  let [day, month, year] = birthDateText.split(".");
  inputFields[4].value = `${year}-${month}-${day}`;

  for (let i = 0; i < inputFields.length; i++) {
    inputFields[i].style.color = "black";
  }
}

function updateOptionsStatus() {
  disableButtons(editButtons);
  disableButtons(deleteButtons);

  if (selectAllCheckbox) {
    if (selectAllCheckbox.checked) {
      checkedBoxes = Array.from(rowCheckboxes);
    }
    if (checkedBoxes.length === 0) {
      disableButtons(editButtons);
      disableButtons(deleteButtons);
    } else if (checkedBoxes.length === 1) {
      let checkbox = checkedBoxes[0];

      const studentId = checkbox.id.replace("checkboxStudent", "");
      const rowElement = document.getElementById(studentId);

      if (rowElement) {
        const editBtn = rowElement.querySelector(".btn-edit");
        const deleteBtn = rowElement.querySelector(".btn-delete");

        enableButtons([editBtn, deleteBtn]);
      }
    } else {
      deleteSelectedBtn.style.display = "inline-block";

      enableButtons(deleteButtons);
    }
  }
}

function enableButtons(buttons) {
  if (buttons) {
    Array.from(buttons).forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("btn-neutral");
    });
  }
}

function disableButtons(buttons) {
  if (buttons) {
    Array.from(buttons).forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("btn-neutral");
    });
  }

  if (deleteSelectedBtn) deleteSelectedBtn.style.display = "none";
}

function addCheckboxToCheckedList(checkbox) {
  if (checkbox.checked) {
    checkedBoxes.push(checkbox);
    if (rowCheckboxes) {
      if (checkedBoxes.length === Array.from(rowCheckboxes).length) {
        selectAllCheckbox.checked = true;
      }
    }
  } else {
    selectAllCheckbox.checked = false;

    let index = checkedBoxes.indexOf(checkbox);
    if (index !== -1) {
      checkedBoxes.splice(index, 1);
    }
  }

  updateOptionsStatus();
}

function openEditModalWindow(btn) {
  modalHeader.innerText = "Edit Student";
  submitStudentDataBtn.innerText = "Confirm";

  const inputFormActionType = document.getElementById("inputFormActionType");
  inputFormActionType.value = "editStudent";

  const row = btn.closest("tr");
  initializeEditForm(row);

  const modal = document.getElementById("modal-input-student");
  modal.dataset.rowId = row.id;

  openModalWindow("modal-input-student");
  closeModalInputBtnX.focus();
}

function openDeleteModalWindow(btn) {
  let row = btn.closest("tr");
  let name = row.querySelector("td:nth-child(3)");
  warningTextMsg.innerText = `Are you sure you want to delete user ${name.textContent.trim()}?`;

  idsToDeleteArray.push(row.id);

  openModalWindow("modal-delete-student");
  closeModalDeleteBtnX.focus();
}

function showLoginModal() {
  const guestModeOverlay = document.querySelector(".students-guest-overlay");
  if (guestModeOverlay) guestModeOverlay.style.display = "none";

  const modal = document.getElementById("loginModal");
  modal.style.display = "flex";

  const closeBtn = modal.querySelector(".close");
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
    if (guestModeOverlay) guestModeOverlay.style.display = "block";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      if (guestModeOverlay) guestModeOverlay.style.display = "block";
    }
  });
}

function setupPagination(total, tablePageSize) {
  const paginationContainer = document.querySelector(".menu-pagination");
  if (!paginationContainer || !total) return;

  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(total / tablePageSize);
  if (totalPages <= 1) return;

  const maxVisiblePages = 5;
  const createPageLink = (
    text,
    page = null,
    disabled = false,
    active = false
  ) => {
    const link = document.createElement("a");
    link.href = "#";
    link.classList.add("menu-pagination-element");
    if (disabled) link.classList.add("disabled");
    if (active) link.classList.add("active");
    link.textContent = text;
    if (page !== null) link.dataset.page = page;
    return link;
  };

  const render = () => {
    paginationContainer.innerHTML = "";

    // << and <
    paginationContainer.appendChild(createPageLink("<<", 1, currentPage === 1));
    paginationContainer.appendChild(
      createPageLink("<", currentPage - 1, currentPage === 1)
    );

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      paginationContainer.appendChild(createPageLink("1", 1));
      if (startPage > 2) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.classList.add("pagination-dots");
        paginationContainer.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationContainer.appendChild(
        createPageLink(i, i, false, i === currentPage)
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.classList.add("pagination-dots");
        paginationContainer.appendChild(dots);
      }
      paginationContainer.appendChild(createPageLink(totalPages, totalPages));
    }

    // > and >>
    paginationContainer.appendChild(
      createPageLink(">", currentPage + 1, currentPage === totalPages)
    );
    paginationContainer.appendChild(
      createPageLink(">>", totalPages, currentPage === totalPages)
    );
  };

  if (!paginationContainer.hasAttribute("pagination-click-added")) {
    paginationContainer.addEventListener("click", (event) => {
      event.preventDefault();
      const target = event.target;

      if (
        !target.classList.contains("menu-pagination-element") ||
        target.classList.contains("disabled")
      )
        return;

      const selectedPage = parseInt(target.dataset.page);
      if (!isNaN(selectedPage)) {
        currentPage = selectedPage;
        loadStudentsPage(currentPage, tablePageSize);
        updateCurrentPageUI(currentPage);
        render(); // re-render pagination
      }
    });
    paginationContainer.setAttribute("pagination-click-added", "true");
  }

  render(); // Initial render
}

function updateCurrentPageUI(pageNumber) {
  const paginationContainer = document.querySelector(".menu-pagination");
  if (!paginationContainer) return;

  const pageLinks = paginationContainer.querySelectorAll(
    ".menu-pagination-element"
  );

  debugger;

  pageLinks.forEach((link) => {
    link.classList.remove("current-page");
    if (parseInt(link.textContent) === pageNumber) {
      link.classList.add("current-page");
    }
  });
}

function showToastMessage(message, type) {
  const toast = document.createElement("div");
  toast.classList.add(
    "toast",
    type === "error" ? "toast-error" : "toast-success"
  );
  toast.textContent = message;

  const toastContainer = document.getElementById("toast-container");
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
