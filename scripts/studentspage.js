const studentDataWithID = {
  group: "",
  firstName: "",
  lastName: "",
  gender: "",
  birthDate: "",
  id: "",
};

const keys = ["group", "firstName", "lastName", "gender", "birthDate"];

let closeModalInputBtnX, closeModalDeleteBtnX;
let modalHeader, warningTextMsg;
let errorMsgs, inputFields;
let selectAllCheckbox,
  rowCheckboxes,
  editButtons,
  deleteButtons,
  checkedBoxes = [],
  deleteSelectedBtn,
  studentRowsToDelete = [];
let studentId = 3;

let validationMode = "js";

function refreshEventListeners() {
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
    addBtn.addEventListener("click", function () {
      modalHeader.innerText = "Add Student";
      submitStudentDataBtn.innerText = "Create";

      openModalWindow("modal-input-student");
      closeModalInputBtnX.focus();
    });
  }

  if (closeModalInputBtnX) {
    closeModalInputBtnX.addEventListener("click", function () {
      resetInputForm();
      closeModalWindow("modal-input-student");
      addBtn.focus();
    });
  }

  if (closeModalInputBtnOk) {
    closeModalInputBtnOk.addEventListener("click", function () {
      readInputFields(studentDataWithID, keys, inputFields);
      if (isInputValid(studentDataWithID)) {
        if (submitStudentDataBtn.innerText === "Confirm") {
          const modal = document.getElementById("modal-input-student");
          editStudent(studentDataWithID, modal.dataset.rowId);
        } else {
          addStudent(studentDataWithID);
        }
        console.log(JSON.stringify(studentDataWithID));
      }
      resetInputForm();
      closeModalWindow("modal-input-student");
      addBtn.focus();
    });
  }

  if (submitStudentDataBtn) {
    submitStudentDataBtn.addEventListener("click", function () {
      readInputFields(studentDataWithID, keys, inputFields);
      if (isInputValid(studentDataWithID)) {
        if (submitStudentDataBtn.textContent === "Confirm") {
          const modal = document.getElementById("modal-input-student");
          editStudent(studentDataWithID, modal.dataset.rowId);
        } else {
          addStudent(studentDataWithID);
        }
        console.log(JSON.stringify(studentDataWithID));
        resetInputForm();
        closeModalWindow("modal-input-student");
        addBtn.focus();
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

  if (closeModalDeleteBtnX) {
    closeModalDeleteBtnX.addEventListener("click", function () {
      studentRowsToDelete = [];
      closeModalWindow("modal-delete-student");
      addBtn.focus();
    });
  }

  if (closeModalDeleteBtnCancel) {
    closeModalDeleteBtnCancel.addEventListener("click", function () {
      studentRowsToDelete = [];
      closeModalWindow("modal-delete-student");
      addBtn.focus();
    });
  }

  if (confirmDeleteStudentBtn) {
    confirmDeleteStudentBtn.addEventListener("click", function () {
      deleteStudents();
      closeModalWindow("modal-delete-student");
      addBtn.focus();
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
        addCheckboxToCheckedList(checkbox);
      });
    });
  }

  if (editButtons) {
    Array.from(editButtons).forEach((btn) =>
      btn.addEventListener("click", function () {
        openEditModalWindow(btn);
      })
    );
  }

  if (deleteButtons) {
    Array.from(deleteButtons).forEach((btn) =>
      btn.addEventListener("click", function () {
        openDeleteModalWindow(btn);
      })
    );
  }

  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener("click", function () {
      warningTextMsg.innerText = `Are you sure you want to delete selected ${checkedBoxes.length} students?`;

      checkedBoxes.forEach((checkbox) => {
        const studentId = checkbox.id.replace("checkboxStudent", "student");
        const rowElement = document.getElementById(studentId);

        studentRowsToDelete.push(rowElement);
      });

      openModalWindow("modal-delete-student");
    });
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

function readInputFields(studentData, keys, inputFields) {
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === "gender") {
      studentData[keys[i]] =
        inputFields[3].value === "Male"
          ? "M"
          : inputFields[3].value === "Female"
          ? "F"
          : "";
    } else studentData[keys[i]] = inputFields[i].value;
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

function initializeEditForm(initializationRow) {
  {
    const checkboxTd = initializationRow.querySelector("td:nth-child(1)");
    const checkbox = checkboxTd.children[0];
    const studentId = checkbox.id.replace("checkboxStudent", "student");
    studentDataWithID["id"] = studentId;

    studentDataWithID["group"] = initializationRow
      .querySelector("td:nth-child(2)")
      .textContent.trim();
    let fullName =
      initializationRow.querySelector("td:nth-child(3)").textContent;
    [studentDataWithID["firstName"], studentDataWithID["lastName"]] = fullName
      .trim()
      .split(" ");
    studentDataWithID["gender"] =
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
    studentDataWithID["birthDate"] = `${year}-${month}-${day}`;

    for (let i = 0; i < keys.length; i++) {
      inputFields[i].value = studentDataWithID[keys[i]];
      inputFields[i].style.color = "black";
    }
  }
}

function isInputValid(studentData) {
  let isValid = true;

  if (validationMode === "html") {
    const form = document.querySelector(".modal-student-data-body");
    isValid = form.checkValidity();
    if (!isValid) {
      form.reportValidity();
    }
    return isValid;
  }

  for (let i = 0; i < keys.length; i++) {
    let isValidCurrent = true;
    if (studentData[keys[i]] === "" || studentData[keys[i]] === null) {
      isValidCurrent = false;
      errorMsgs[i].innerText = "This field cannot be empty";
    } else if (
      keys[i] === "firstName" &&
      !studentData[keys[i]].match(/^[A-Z][a-zA-Z\s'\-]*$/)
    ) {
      isValidCurrent = false;
      errorMsgs[i].innerText =
        "Must start with a capital letter and only contain letters, spaces, ' and -";
    } else if (
      keys[i] === "lastName" &&
      !studentData[keys[i]].match(/^[A-Z][a-zA-Z\s'\-]*$/)
    ) {
      isValidCurrent = false;
      errorMsgs[i].innerText =
        "Must start with a capital letter and only contain letters, spaces, ' and -";
    } else if (keys[i] === "birthDate") {
      const dateNow = new Date();
      const selectedDate = new Date(studentData[keys[i]]);
      if (selectedDate > dateNow) {
        isValidCurrent = false;
        errorMsgs[i].innerText = "Birthdate cannot be in the future";
      } else {
        let [year, month, day] = studentData[keys[i]].split("-");
        studentData[keys[i]] = `${day}.${month}.${year}`;
      }
    }
    if (!isValidCurrent) {
      inputFields[i].style.border = "2px solid red";
      errorMsgs[i].style.display = "block";
      isValid = false;
    }
  }

  return isValid;
}

function addStudent(studentData) {
  const table = document.getElementById("studentsTable");
  const tbody = table.querySelector("tbody");
  const newRow = document.createElement("tr");

  newRow.id = `student${studentId}`;
  studentData.id = newRow.id;

  const checkboxTd = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `checkboxStudent${studentId}`;
  checkbox.classList.add("checkbox-row-element");
  checkbox.areaLabel = "Area";
  checkbox.addEventListener("click", function () {
    addCheckboxToCheckedList(checkbox);
  });
  selectAllCheckbox.checked = false;
  checkboxTd.appendChild(checkbox);
  newRow.appendChild(checkboxTd);

  const groupTd = document.createElement("td");
  groupTd.textContent = studentData.group;
  newRow.appendChild(groupTd);

  const nameTd = document.createElement("td");
  nameTd.textContent = `${studentData.firstName} ${studentData.lastName}`;
  newRow.appendChild(nameTd);

  checkbox.setAttribute(
    "aria-label",
    "Select student " + `${studentData.firstName} ${studentData.lastName}`
  );

  const genderTd = document.createElement("td");
  genderTd.textContent = studentData.gender;
  newRow.appendChild(genderTd);

  const birthDateTd = document.createElement("td");
  birthDateTd.textContent = studentData.birthDate;
  newRow.appendChild(birthDateTd);

  const statusTd = document.createElement("td");
  const statusCircle = document.createElement("span");
  statusCircle.classList.add("status-user", "offline");
  statusTd.appendChild(statusCircle);
  newRow.appendChild(statusTd);

  const actionsTd = document.createElement("td");
  actionsTd.style.display = "flex";
  actionsTd.style.justifyContent = "center";
  actionsTd.style.gap = "5px";

  const editBtn = document.createElement("button");
  editBtn.classList.add("btn-action", "btn-success", "btn-edit");
  editBtn.type = "button";
  const pencilIcon = document.createElement("i");
  pencilIcon.classList.add("fa-solid", "fa-pencil");
  editBtn.appendChild(pencilIcon);
  editBtn.addEventListener("click", function () {
    openEditModalWindow(editBtn);
  });
  editBtn.setAttribute(
    "aria-label",
    "Edit student " + `${studentData.firstName} ${studentData.lastName}`
  );

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("btn-action", "btn-danger", "btn-delete");
  deleteBtn.type = "button";
  const xMarkIcon = document.createElement("i");
  xMarkIcon.classList.add("fa-solid", "fa-xmark");
  deleteBtn.appendChild(xMarkIcon);
  deleteBtn.addEventListener("click", function () {
    openDeleteModalWindow(deleteBtn);
  });
  deleteBtn.setAttribute(
    "aria-label",
    "Delete student " + `${studentData.firstName} ${studentData.lastName}`
  );

  actionsTd.appendChild(editBtn);
  actionsTd.appendChild(deleteBtn);
  newRow.appendChild(actionsTd);
  tbody.appendChild(newRow);

  updateOptionsStatus();
  studentId++;
}

function deleteStudents() {
  if (studentRowsToDelete !== null) {
    if (studentRowsToDelete.length > 1) {
      deleteSelectedBtn.style.display = "none";
    }

    studentRowsToDelete.forEach((row) => {
      if (row) {
        let checkbox = row.querySelector("input[type='checkbox']");
        let index = checkedBoxes.indexOf(checkbox);
        if (index !== -1) {
          checkedBoxes.splice(index, 1);
        }
        row.remove();
      }
    });
  }

  if (studentRowsToDelete.length <= 1) {
    deleteSelectedBtn.style.display = "none";
  }
  studentRowsToDelete = [];
}

function editStudent(studentData, rowId) {
  let row = document.getElementById(rowId);
  let group = row.querySelector("td:nth-child(2)");
  group.textContent = studentData["group"];
  let fullName = row.querySelector("td:nth-child(3)");
  fullName.textContent = `${studentData["firstName"]} ${studentData["lastName"]}`;
  let gender = row.querySelector("td:nth-child(4)");
  gender.textContent = studentData["gender"];
  let birthDate = row.querySelector("td:nth-child(5)");
  birthDate.textContent = studentData["birthDate"];
}

function updateOptionsStatus() {
  disableButtons(editButtons);
  disableButtons(deleteButtons);

  if (selectAllCheckbox.checked) {
    checkedBoxes = Array.from(rowCheckboxes);
  }
  if (checkedBoxes.length === 0) {
    disableButtons(editButtons);
    disableButtons(deleteButtons);
  } else if (checkedBoxes.length === 1) {
    let checkbox = checkedBoxes[0];

    const studentId = checkbox.id.replace("checkboxStudent", "student");
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

  deleteSelectedBtn.style.display = "none";
}

function addCheckboxToCheckedList(checkbox) {
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
}

function openEditModalWindow(btn) {
  modalHeader.innerText = "Edit Student";
  submitStudentDataBtn.innerText = "Confirm";

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

  if (!studentRowsToDelete.includes(row)) {
    studentRowsToDelete.push(row);
  }

  openModalWindow("modal-delete-student");
  closeModalDeleteBtnX.focus();
}
