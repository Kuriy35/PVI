<?php
require_once "./config.php";

class Authentication {
    public static function login($data) {
        global $conn;
        $status = false;
        $errors = [];
    
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
    
        $username = mysqli_real_escape_string($conn, $username);
        $password = mysqli_real_escape_string($conn, $password);
    
        $userSql = "SELECT * FROM students WHERE CONCAT(first_name, ' ', last_name) = '$username'";
        $userResult = mysqli_query($conn, $userSql);
    
        if ($userResult && mysqli_num_rows($userResult) == 1) {
            $user = mysqli_fetch_assoc($userResult);
    
            if ($user['birthday'] === $password) {
                $_SESSION['user'] = [
                    'id' => $user['id'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'group_name' => $user['group_name'],
                    'gender' => $user['gender'],
                    'birthday' => $user['birthday']
                ];
                $status = true;
            } else {
                $errors['password'] = 'Wrong password';
            }
        } else {
            $errors['username'] = 'Unable to find user with entered username';
            $errors['password'] = 'Wrong password';
        }
    
        if ($status) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'errors' => $errors]);
        }
        exit;
    }
    
    

    public static function logout()
    {
        return session_destroy();
    }
}
?>
