<?php
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_GET) && empty($_POST) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Location: index.php?page=students');
    exit;
}

$controllerName = getRequestParam('controller');
$action = getRequestParam('action');

// Обробка API-запитів
if ($controllerName && $action) {
    require_once "./controllers/{$controllerName}controller.php";
    handleApiRequest($controllerName, $action);
    exit;
}

// Обробка відображення сторінок
$page = getRequestParam('page') ?? 'students';

if ($page) {
    handlePageRequest($page);
    exit;
}

function getRequestParam($name)
{
    parse_str(file_get_contents("php://input"), $input);
    return $_GET[$name] ?? $_POST[$name] ?? $input[$name] ?? null;
}

function getRequestData()
{
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            return $_GET;
        case 'POST':
            return $_POST;
        case 'PUT':
        case 'DELETE':
            parse_str(file_get_contents("php://input"), $input);
            return $input;
        default:
            return [];
    }
}

function handleApiRequest($controllerName, $action)
{
    $requestData = getRequestData();

    switch ($controllerName) {
        case 'students':
            $controller = new StudentsController();
            header('Content-Type: application/json');

            switch ($action) {
                case 'getAll':
                    echo json_encode($controller->getAllStudents());
                    break;

                case 'getPaginated':
                    $page = isset($requestData['tablePageNumber']) ? (int)$requestData['tablePageNumber'] : 1;
                    $pageSize = isset($requestData['tablePageSize']) ? (int)$requestData['tablePageSize'] : 7;
                    echo json_encode($controller->getPaginatedStudentsPage($page, $pageSize));
                    break;

                case 'addStudent':
                    $result = $controller->addStudent($requestData);

                    if (isAjaxRequest()) {
                        echo json_encode($result);
                        break;
                    }
                    else {

                        header("Location: index.php?page=students");
                        exit;
                    }

                case 'editStudent':
                    $result = $controller->editStudent($requestData);

                    if (isAjaxRequest()) {
                        echo json_encode($result);
                        break;
                    }
                    else {
                        header("Location: index.php?page=students");
                        exit;
                    }

                case 'deleteStudents':
                    echo json_encode($controller->deleteStudents($requestData));
                    break;

                default:
                    http_response_code(404);
                    echo json_encode(['error' => 'Unknown action']);
            }
            break;

        case 'auth':
            $controller = new AuthController();

            if ($action === 'login') {
                $controller->login($requestData);
            } else if ($action === 'logout') {
                $controller->logout();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Unknown action']);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Unknown controller']);
    }
}


function handlePageRequest($page)
{
    $availablePages = ['dashboard', 'students', 'tasks', 'messages'];

    if (!in_array($page, $availablePages)) {
        $page = '404';
    }

    if ($page === '404') {
        echo "<h2>404 - Page not found</h2>";
        return;
    }

    $variables = [];

    $variables['authUsername'] = isset($_SESSION['user']['first_name'], $_SESSION['user']['last_name'])
        ? $_SESSION['user']['first_name'] . ' ' . $_SESSION['user']['last_name']
        : null;

    $headerComponents = isAuthorized()
        ? renderPartial('./views/partials/headerAuthComponents.php', $variables)
        : renderPartial('./views/partials/headerGuestComponents.php', $variables);

    if ($page === 'students') {
        $variables['studentsPageComponents'] = isAuthorized()
            ? renderPartial('./views/partials/studentsPageAuthComponents.php', $variables)
            : renderPartial('./views/partials/studentsPageGuestComponents.php', $variables);
    }

    $content = renderPartial("./views/{$page}.php", $variables);

    if (isAjaxRequest()) {
        echo $content;
    } else {
        include './views/layout.php';
    }
}

function isAuthorized()
{
    return isset($_SESSION['user']);
}

function renderPartial($path, $variables)
{
    ob_start();
    extract($variables);
    $path ? include $path : '';
    return ob_get_clean();
}

function isAjaxRequest()
{
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}
