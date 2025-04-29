          <div class="dropdown">
            <div id="bellContainer" tabindex="0" aria-label="Notifications">
              <i class="fa-regular fa-bell"></i>
              <span id="notificationIndicator" class="bell-indicator">0</span>
            </div>
            <ul class="dropdown-content-messages">
              <li class="dropdown-content-messages-element">
                <div class="sender-profile">
                  <i class="fa-solid fa-circle-user sender-avatar"></i>
                  <div class="sender-name">Yurii Kozenko</div>
                </div>
                <div class="received-message-content">Some text</div>
              </li>
              <li class="dropdown-content-messages-element">
                <div class="sender-profile">
                  <i class="fa-solid fa-circle-user sender-avatar"></i>
                  <div class="sender-name">Yurii Kozenko</div>
                </div>
                <div class="received-message-content">Some text</div>
              </li>
              <li class="dropdown-content-messages-element">
                <div class="sender-profile">
                  <i class="fa-solid fa-circle-user sender-avatar"></i>
                  <div class="sender-name">Yurii Kozenko</div>
                </div>
                <div class="received-message-content">Some text</div>
              </li>
            </ul>
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