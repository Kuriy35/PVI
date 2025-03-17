let errorMsgs, inputFields;
let studentId = 2;

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
  const keys = Object.keys(student);
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
  const newRow = document.createElement("tr");

  newRow.id = `student-${studentId}`;
  newRow.innerHTML = `<td>
              <input id="checkboxStudent-${studentId}" type="checkbox" />
            </td>
            <td>${student.group}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.gender}</td>
            <td>${student.birthDate}</td>
            <td>
              <span class="status-user offline"></span>
            </td>
            <td>
              <button
                class="btn-action btn-success"
                type="button"
                onclick="openModalWindow('modal-edit-student')"
              >
                <i class="fa-solid fa-pencil"></i>
              </button>
              <button
                class="btn-action btn-danger"
                type="button"
                onclick="openModalWindow('modal-delete-student')"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </td>`;

  table.appendChild(newRow);

  studentId++;
}

function refreshEventListeners() {
  const addBtn = document.getElementById("btn-add");
  const closeModalWindowBtnX = document.getElementById("btn-modal-close-x");
  const closeModalWindowBtnOk = document.getElementById("btn-modal-close-ok");
  const submitStudentDataBtn = document.getElementById("submitStudentDataBtn");
  const modalHeader = document.getElementById("modalStudentsDataHeader");
  inputFields = document.querySelectorAll(".input-student-data-field");
  errorMsgs = document.querySelectorAll(".validation-error-output");

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      modalHeader.innerText = "Add Student";
      closeModalWindowBtnOk.innerText = "OK";
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
      closeModalWindow("modal-input-student");
    });
  }

  if (submitStudentDataBtn) {
    submitStudentDataBtn.addEventListener("click", function () {
      const student = {
        group: inputFields[0].value,
        firstName: inputFields[1].value,
        lastName: inputFields[2].value,
        gender:
          inputFields[3].value === "Male"
            ? "M"
            : inputFields[3].value === "Female"
            ? "F"
            : "",
        birthDate: inputFields[4].value,
      };

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
}
