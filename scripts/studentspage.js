const student = {
  group: "",
  firstName: "",
  lastName: "",
  gender: "",
  birthDate: "",
};

const keys = Object.keys(student);

let modalHeader, warningTextMsg;
let errorMsgs, inputFields;
let selectAllCheckbox,
  rowCheckboxes,
  editButtons,
  deleteButtons,
  checkedBoxes = [];
let studentId = 2;

function refreshEventListeners() {
  const addBtn = document.getElementById("btn-add");
  const closeModalWindowBtnX = document.getElementById("btn-modal-input-x");
  const closeModalWindowBtnOk = document.getElementById("btn-modal-input-ok");
  const submitStudentDataBtn = document.getElementById("submitStudentDataBtn");
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

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      modalHeader.innerText = "Add Student";
      openModalWindow("modal-input-student");
    });
  }

  if (closeModalWindowBtnX) {
    closeModalWindowBtnX.addEventListener("click", function () {
      resetInputForm();
      closeModalWindow("modal-input-student");
    });
  }

  if (closeModalWindowBtnOk) {
    closeModalWindowBtnOk.addEventListener("click", function () {
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === "gender") {
          student[keys[i]] =
            inputFields[3].value === "Male"
              ? "M"
              : inputFields[3].value === "Female"
              ? "F"
              : "";
        } else student[keys[i]] = inputFields[i].value;
      }

      if (isInputValid(student)) {
        addStudent(student);
      }
      resetInputForm();
      closeModalWindow("modal-input-student");
    });
  }

  if (submitStudentDataBtn) {
    submitStudentDataBtn.addEventListener("click", function () {
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === "gender") {
          student[keys[i]] =
            inputFields[3].value === "Male"
              ? "M"
              : inputFields[3].value === "Female"
              ? "F"
              : "";
        } else student[keys[i]] = inputFields[i].value;
      }

      if (isInputValid(student)) {
        addStudent(student);
        resetInputForm();
        closeModalWindow("modal-input-student");
      }
    });
  }

  for (let i = 0; i < inputFields.length; i++) {
    inputFields[i].addEventListener("focus", function () {
      inputFields[i].style.color = "black";
      inputFields[i].style.border = "";
      errorMsgs[i].style.display = "none";
    });
  }

  if (confirmDeleteStudentBtn) {
    confirmDeleteStudentBtn.addEventListener("click", function () {
      debugger;
      const modal = document.getElementById("modal-delete-student");
      const row = document.getElementById(modal.dataset.rowId);

      if (row) {
        let checkbox = row.querySelector("input[type='checkbox']");
        let index = checkedBoxes.indexOf(checkbox);
        if (index !== -1) {
          checkedBoxes.splice(index, 1);
        }
        row.remove();
      }

      debugger;
      closeModalWindow("modal-delete-student");
    });
  }

  if (selectAllCheckbox) {
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
  }

  if (rowCheckboxes) {
    Array.from(rowCheckboxes).forEach((checkbox) => {
      checkbox.addEventListener("click", function () {
        if (checkbox.checked) {
          checkedBoxes.push(checkbox);
          if (checkedBoxes.length === rowCheckboxes.length) {
            selectAllCheckbox.checked = true;
          }
        } else {
          selectAllCheckbox.checked = false;

          let index = checkedBoxes.indexOf(checkbox);
          if (index !== -1) {
            checkedBoxes.splice(index, 1);
          }
        }

        updateOptionsStatus();
      });
    });

    if (editButtons) {
      Array.from(editButtons).forEach((btn) =>
        btn.addEventListener("click", function () {
          modalHeader.innerText = "Edit Student";
          openModalWindow("modal-input-student");
        })
      );
    }

    if (deleteButtons) {
      Array.from(deleteButtons).forEach((btn) =>
        btn.addEventListener("click", function () {
          let row = btn.closest("tr");
          let name = row.querySelector("td:nth-child(3)");
          warningTextMsg.innerText = `Are you sure you want to delete user ${name.textContent.trim()}?`;

          const modal = document.getElementById("modal-delete-student");
          modal.dataset.rowId = row.id;

          openModalWindow("modal-delete-student");
        })
      );
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
    inputFields[i].style.border = "";
    inputFields[i].style.color = "";
    errorMsgs[i].style.display = "none";
  }
}

function isInputValid(student) {
  let isValid = true;
  for (let i = 0; i < keys.length; i++) {
    let isValidCurrent = true;
    if (student[keys[i]] === "" || student[keys[i]] === null) {
      isValidCurrent = false;
      errorMsgs[i].innerText = "This field cannot be empty";
    } else if (
      keys[i] === "firstName" &&
      !student[keys[i]].match(/^[a-zA-Z\s-]+$/)
    ) {
      isValidCurrent = false;
      errorMsgs[i].innerText =
        "First name can only contain letters, spaces, and hyphens.";
    } else if (
      keys[i] === "lastName" &&
      !student[keys[i]].match(/^[a-zA-Z\s-]+$/)
    ) {
      isValidCurrent = false;
      errorMsgs[i].innerText =
        "Last name can only contain letters, spaces, and hyphens.";
    } else if (keys[i] === "birthDate") {
      const dateNow = new Date();
      const selectedDate = new Date(student[keys[i]]);
      if (selectedDate > dateNow) {
        isValidCurrent = false;
        errorMsgs[i].innerText = "Birthdate cannot be in the future";
      } else {
        let [year, month, day] = student[keys[i]].split("-");
        student[keys[i]] = `${day}.${month}.${year}`;
      }
    }
    if (!isValidCurrent) {
      inputFields[i].style.border = "2px solid red";
      errorMsgs[i].style.display = "block";
      isValid = false;
    }
  }

  if (isValid) return true;
  else return false;
}

function addStudent(student) {
  const table = document.getElementById("studentsTable");
  const tbody = table.querySelector("tbody");
  const newRow = document.createElement("tr");

  newRow.id = `student${studentId}`;

  const checkboxTd = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `checkboxStudent${studentId}`;
  checkbox.classList.add("checkbox-row-element");
  checkbox.addEventListener("click", function () {
    if (checkbox.checked) {
      checkedBoxes.push(checkbox);
      if (checkedBoxes.length === rowCheckboxes.length) {
        selectAllCheckbox.checked = true;
      }
    } else {
      selectAllCheckbox.checked = false;

      let index = checkedBoxes.indexOf(checkbox);
      if (index !== -1) {
        checkedBoxes.splice(index, 1);
      }
    }

    updateOptionsStatus();
  });
  selectAllCheckbox.checked = false;
  checkboxTd.appendChild(checkbox);
  newRow.appendChild(checkboxTd);

  const groupTd = document.createElement("td");
  groupTd.textContent = student.group;
  newRow.appendChild(groupTd);

  const nameTd = document.createElement("td");
  nameTd.textContent = `${student.firstName} ${student.lastName}`;
  newRow.appendChild(nameTd);

  const genderTd = document.createElement("td");
  genderTd.textContent = student.gender;
  newRow.appendChild(genderTd);

  const birthDateTd = document.createElement("td");
  birthDateTd.textContent = student.birthDate;
  newRow.appendChild(birthDateTd);

  const statusTd = document.createElement("td");
  const statusCircle = document.createElement("span");
  statusCircle.classList.add("status-user", "offline");
  statusTd.appendChild(statusCircle);
  newRow.appendChild(statusTd);

  const actionsTd = document.createElement("td");

  const editBtn = document.createElement("button");
  editBtn.classList.add("btn-action", "btn-success", "btn-edit");
  editBtn.type = "button";
  editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
  editBtn.addEventListener("click", function () {
    modalHeader.innerText = "Edit Student";
    openModalWindow("modal-input-student");
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("btn-action", "btn-danger", "btn-delete");
  deleteBtn.type = "button";
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  deleteBtn.addEventListener("click", function () {
    let row = deleteBtn.closest("tr");
    let name = row.querySelector("td:nth-child(3)");
    warningTextMsg.innerText = `Are you sure you want to delete user ${name.textContent.trim()}?`;

    const modal = document.getElementById("modal-delete-student");
    modal.dataset.rowId = row.id;

    openModalWindow("modal-delete-student");
  });

  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(deleteBtn);
  newRow.appendChild(actionsTd);
  tbody.appendChild(newRow);

  studentId++;
}

function updateOptionsStatus() {
  disableButtons(editButtons);
  disableButtons(deleteButtons);

  if (selectAllCheckbox.checked) {
    checkedBoxes = Array.from(rowCheckboxes);
  }

  if (checkedBoxes.length === 1) {
    let checkbox = checkedBoxes[0];

    const studentId = checkbox.id.replace("checkboxStudent", "student");
    const rowElement = document.getElementById(studentId);

    if (rowElement) {
      const editBtn = rowElement.querySelector(".btn-edit");
      const deleteBtn = rowElement.querySelector(".btn-delete");

      enableButtons([editBtn, deleteBtn]);
    }
  } else {
    enableButtons(deleteButtons);
  }
}

function enableButtons(buttons) {
  Array.from(buttons).forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("btn-neutral");
  });
}

function disableButtons(buttons) {
  Array.from(buttons).forEach((btn) => {
    btn.disabled = true;
    btn.classList.add("btn-neutral");
  });
}
