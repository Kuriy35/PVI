<?php
require_once "./models/authmodel.php";

class AuthController {
    public function login($data) {
        $status = Authentication::login($data);
        if(!$status)
        {
            $_SESSION['authError'] = "Incorrect login or password!";
        }
        header('Location: index.php?page=students');
        exit;
    }

    public function logout()
    {
        $status = Authentication::logout();
        
        header('Content-type: application/json');
        if(!$status)
        {
            $_SESSION['authError'] = "Failed to logout!";
            http_response_code(500);
            echo json_encode(['error' => 'Failed to logout!']);
        }
        else
        {
            echo json_encode(['redirect' => 'index.php?page=students']);
        }
        exit;
    }
}

?>