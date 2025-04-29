<div class="btn-position-right">
        <button
          class="btn-action btn-danger"
          id="deleteSelectedBtn"
          type="button"
          authRequired="true"
        >
          Delete Selected
        </button>
        <button
          class="btn-action btn-success"
          id="btn-add"
          type="button"
          title="Add new student"
          authRequired="true"
        >
          <i class="fa-solid fa-user-plus"></i>
        </button>
      </div>
      <div id="modal-input-student" class="modal-student-data">
        <div class="modal-content-student-data">
          <div class="modal-student-data-header">
            <div class="btn-position-right">
              <button
                class="btn-action btn-danger"
                id="btn-modal-input-x"
                aria-label="Close modal window"
                type="button"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <h1 id="modalStudentsDataHeader" class="page-header">
              Modal Window Header
            </h1>
          </div>
          <hr />
          <form id="studentForm"  method="POST" action="index.php">
           <div class="modal-student-data-body">  
            <input type="hidden" name="controller" value="students">
            <input type="hidden" id="inputFormActionType" name="action">
            <input type="hidden" id="editedUserId" name="editedUserId">

            <div class="input-student-data-container">
              <label for="group_name_input">Group</label>
              <select
                id="group_name_input"
                class="input-student-data-field"
                title="Select group"
                name="group_name"
              >
                <option value="" disabled selected>Select Group</option>
                <option value="PZ-21">PZ-21</option>
                <option value="PZ-22">PZ-22</option>
                <option value="PZ-23">PZ-23</option>
              </select>
              <span id="group_name_error_message" class="validation-error-output"
                >Error</span
              >
              </div>
              <div class="input-student-data-container">
                <label for="first_name_input">First name</label>
                <input
                  type="text"
                  id="first_name_input"
                  class="input-student-data-field"
                  title="Must start with a capital letter and only contain letters, spaces, ' and -"
                  name="first_name"
                />
                <span id="first_name_error_message" class="validation-error-output"
                  >Error</span
                >
              </div>
              <div class="input-student-data-container">
                <label for="last_name_input">Last name</label>
                <input
                  type="text"
                  id="last_name_input"
                  class="input-student-data-field"
                  title="Must start with a capital letter and only contain letters, spaces, ' and -"
                  name="last_name"
                />
                <span id="last_name_error_message" class="validation-error-output"
                  >Error</span
                >
              </div>
              <div class="input-student-data-container">
                <label for="gender_input">Gender</label>
                <select
                  id="gender_input"
                  class="input-student-data-field"
                  title="Select gender"
                  name="gender"
                >
                  <option value="" disabled selected>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <span id="gender_error_message" class="validation-error-output"
                  >Error</span
                >
              </div>
              <div class="input-student-data-container">
                <label for="birthday_input">Birthday</label>
                <input
                  type="date"
                  id="birthday_input"
                  class="input-student-data-field"
                  title="Birthdate cannot be in the future"
                  name="birthday"
                />
                <span id="birthday_error_message" class="validation-error-output"
                  >Error</span
                >
              </div>
            </div>
            <hr />
            <div class="modal-student-data-footer">
              <div>
                <button
                  class="btn-action btn-neutral"
                  id="btn-modal-input-ok"
                  type="submit"
                >
                  OK
                </button>
              </div>
              <div>
                <button
                  class="btn-action btn-success"
                  id="submitStudentDataBtn"
                  type="button"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div id="modal-delete-student" class="modal-student-remove">
        <div class="modal-content-student-remove">
          <div class="modal-student-remove-header">
            <div class="btn-position-right">
              <button
                class="btn-action btn-neutral"
                id="closeModalDeleteBtnX"
                type="button"
                aria-label="Close modal window"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <h1 class="page-header">Warning</h1>
          </div>
          <hr />
          <div class="modal-student-remove-body">
            <div id="warningTextMsg">Some warning text</div>
          </div>
          <hr />
          <div class="modal-student-remove-footer">
            <button
              class="btn-action btn-neutral"
              id="closeModalDeleteBtnCancel"
              type="button"
            >
              Cancel
            </button>
            <button
              id="confirmDeleteStudent"
              class="btn-action btn-danger"
              type="button"
            >
              OK
            </button>
          </div>
        </div>
      </div>
      <div class="table-students-container">
          <template id="studentRowTemplate">
          <tr id="">
            <td>
              <input type="checkbox" class="checkbox-row-element" />
            </td>
            <td class="group"></td>
            <td class="name"></td>
            <td class="gender"></td>
            <td class="birthday"></td>
            <td><span class="status-user"></span></td>
            <td style="display: flex; justify-content: center; gap: 5px;">
              <button type="button" class="btn-action btn-success btn-edit" aria-label="">
                <i class="fa-solid fa-pencil"></i>
              </button>
              <button type="button" class="btn-action btn-danger btn-delete" aria-label="">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </td>
          </tr>
          </template>
        <table id="studentsTable">
          <thead>
          <tr>
              <td id="selectAllCheckboxCell">
                <input
                  type="checkbox"
                  id="selectAllCheckbox"
                  aria-label="Select all items"
                />
              </td>
              <th>Group</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Birthday</th>
              <th>Status</th>
              <th>Options</th>
            </tr>
          </thead>  
          <tbody></tbody>
        </table>
      </div>