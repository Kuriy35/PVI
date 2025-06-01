          <template id="lastMessagesMenuItemTemplate">
            <li class="dropdown-content-messages-element" data-chat-id="">
              <div class="sender-profile">
                <div class="avatar-circle"></div>
                <div class="chat-name-preview"></div>
                <div class="message-time-menu"></div>
              </div>
              <div class="received-preview-container">
                <div class="received-message-preview">
                  <span class="message-author-preview"></span>
                  <span class="message-text-preview"></span>
                </div>
                <div class="chat-notifications-number"></div>
              </div>
            </li>
          </template>
          <div class="dropdown">
            <div id="bellContainer" tabindex="0" aria-label="Notifications">
              <i class="fa-regular fa-bell"></i>
              <span id="notificationIndicator" class="bell-indicator">0</span>
            </div>
            <ul class="dropdown-content-messages"></ul>
          </div>
          <div class="dropdown">
            <div class="user-profile-bar">
              <i class="fa-solid fa-circle-user"></i>
              <div id="logged-in-username"><?= $authUsername?></div>
            </div>
            <ul class="dropdown-content-user">
              <li class="dropdown-content-user-element">Profile</li>
              <li class="dropdown-content-user-element" id="logoutButton">Log Out</li>
            </ul>
          </div>