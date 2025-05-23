<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./views/styles/header.css" />
    <link rel="stylesheet" href="./views/styles/navbar.css" />
    <link rel="stylesheet" href="./views/styles/studentspage.css" />
    <link rel="stylesheet" href="./views/styles/main.css" />
    <link rel="stylesheet" href="./views/styles/dropdown.css" />
    <link rel="stylesheet" href="./views/styles/modalwindows.css" />
    <!-- <link rel="manifest" href="./manifest.json" /> -->
    <script
      src="https://kit.fontawesome.com/12f39570aa.js"
      crossorigin="anonymous"
    ></script>
    <title>CMS</title>
  </head>
  <body>
    <div>
      <header class="header">
        <div id="logo" tabindex="0">CMS</div>
        <div class="header-right">
            <?= $headerComponents?>
        </div>
      </header>
      <div class="mainpage">
        <nav id="navbar" class="navbar">
          <div id="navbar-list" tabindex="0" aria-label="Navigation menu">
            <button 
            authRequired="true"
            type="button" id="navbar-element-dashboard">Dashboard</button>
            <button type="button" id="navbar-element-students">Students</button>
            <button
            authRequired="true"
            type="button" id="navbar-element-tasks">Tasks</button>
          </div>
        </nav>

        <div id="loginModal" class="modal-login">
          <div class="modal-content-login">
            <span class="close">&times;</span>

            <div class="modal-login-header">
              Login
            </div>

            <form id="loginForm" method="POST" action="index.php">
              <input type="hidden" name="controller" value="auth">
              <input type="hidden" name="action" value="login">

              <div class="modal-login-body">
                <div class="form-group">
                  <label for="username">Username</label>
                  <input type="text" id="username" name="username" class="input-student-data-field-login" required title="Введіть ім’я та прізвище" />
                  <span id="username_error_message" class="validation-error-output_login">Error</span>
                </div>

                <div class="form-group">
                  <label for="password">Password</label>
                  <input type="password" id="password" name="password" class="input-student-data-field-login" required />
                  <span id="password_error_message" class="validation-error-output_login">Error</span>
                </div>
              </div>

              <div class="modal-login-footer">
                <button id="submitLoginForm" type="button" class="btn btn-success">Login</button>
              </div>
            </form>
          </div>
        </div>

        <div id="toast-container"></div>

        <main class="content" role="main">
          <?= $content ?>
        </main>

      </div>
    </div>

    <script>window.isAuth = <?= isAuthorized() ? "true" : "false" ?></script>
    <!-- <script>window.authUserId = <?= isAuthorized() ? $_SESSION['user']['id'] : null ?></script> -->
    <script src="./scripts/studentspage.js"></script>
    <script type="module" src="./scripts/loadcontent.js"></script>
  </body>
</html>