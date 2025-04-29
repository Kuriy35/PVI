<?php
require_once "./config.php";

class Students {
    public static function getAllStudents() {
        global $conn;
        $sql = "SELECT * FROM students";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $students = [];
            while($row = $result->fetch_assoc()) {
                $students[] = $row;
            }
            return $students;
        } else {
            return [];
        }
    }

    public static function getStudentsPaginated($page = 1, $pageSize = 10)
    {
        global $conn;

        $offset = ($page - 1) * $pageSize;

        $pageSize = mysqli_real_escape_string($conn, $pageSize);
        $offset = mysqli_real_escape_string($conn, $offset);

        $sql = "SELECT * FROM students LIMIT $pageSize OFFSET $offset";
        $result = mysqli_query($conn, $sql);

        $students = [];
        if (mysqli_num_rows($result) > 0) {
            while($row = mysqli_fetch_assoc($result)) {
                $students[] = $row;
            }
        }

        $countSql = "SELECT COUNT(*) as total FROM students";
        $countResult = mysqli_query($conn, $countSql);
        $totalRow = mysqli_fetch_assoc($countResult);
        $total = (int)($totalRow['total'] ?? 0);

        return [
            'students' => $students,
            'total' => $total,
            'page' => (int)$page,
            'pageSize' => (int)$pageSize
        ];
    }


    public static function addStudent($data) {
        $errorMsgs = self::validateInput($data);

        $status = empty($errorMsgs);
        $studentData = "No such student in DB!";

        if ($status) {
            global $conn;
            $firstName = mysqli_real_escape_string($conn, $data['first_name']);
            $lastName = mysqli_real_escape_string($conn, $data['last_name']);
            $groupName = mysqli_real_escape_string($conn, $data['group_name']);
            $gender = mysqli_real_escape_string($conn, $data['gender']);
            $birthday = mysqli_real_escape_string($conn, $data['birthday']);

            $sql = "SELECT * FROM students WHERE first_name = '$firstName' AND last_name = '$lastName'
            AND group_name = '$groupName' AND gender = '$gender' AND birthday = '$birthday'";
            $result = mysqli_query($conn, $sql);

            if ($result->num_rows > 0)
            {
                $errorMsgs['duplicate'] = "Such student already exists";
            }
            else {
                $sql = "INSERT INTO students (first_name, last_name, group_name, gender, birthday) VALUES ('$firstName', '$lastName', '$groupName', '$gender', '$birthday')";
                $result = mysqli_query($conn, $sql);
                if (!$result) $errorMsgs['insert'] = 'Failed to add student!';
                
                $sql = "SELECT * FROM students WHERE first_name = '$firstName' AND last_name = '$lastName'
                AND group_name = '$groupName' AND gender = '$gender' AND birthday = '$birthday'";
                $result = mysqli_query($conn, $sql);
                
                if ($result->num_rows > 0)
                {
                    $studentData = mysqli_fetch_assoc($result);
                }
                else $errorMsgs['insert'] = "Failed to find student after insertion!";
            }
        }
        $status = empty($errorMsgs);

        return ['status' => $status, 'student' => $studentData, 'errors' => $errorMsgs, 'action' => "addStudent"];
    }

    public static function editStudent($data) {
        $errorMsgs = self::validateInput($data);

        $status = empty($errorMsgs);

        if ($status) {
            global $conn;
            $id = mysqli_real_escape_string($conn, $data['editedUserId']);
            $first_name = mysqli_real_escape_string($conn, $data['first_name']);
            $last_name = mysqli_real_escape_string($conn, $data['last_name']);
            $group_name = mysqli_real_escape_string($conn, $data['group_name']);
            $gender = mysqli_real_escape_string($conn, $data['gender']);
            $birthday = mysqli_real_escape_string($conn, $data['birthday']);

            $sql = "
            UPDATE students SET 
                first_name = '$first_name', 
                last_name = '$last_name', 
                group_name = '$group_name', 
                gender = '$gender', 
                birthday = '$birthday' 
            WHERE id = '$id'";
            $result = mysqli_query($conn, $sql);

            if (!$result) {
                $errorMsgs['update'] = 'Failed to update student!';
            } else {
                if (mysqli_affected_rows($conn) === 0) {
                    $errorMsgs['update'] = 'No changes were made!';
                }
                else {
                    if ($id == $_SESSION['user']['id']) {
                        $fields = ['first_name', 'last_name', 'group_name', 'gender', 'birthday'];
                        foreach ($fields as $field) {
                            $_SESSION['user'][$field] = $$field;
                        }
                    }                    
                }
            }
        }
        $status = empty($errorMsgs);

        return ['status' => $status, 'errors' => $errorMsgs, 'action' => "editStudent", 'redirect' => "index.php?page=students"];
    }

    public static function deleteStudents($data) {
        global $conn;

        $errorMsgs = [];

        if (!isset($data['idArray']) || !is_array($data['idArray']) || empty($data['idArray'])) {
            $errorMsgs['idArray'] = 'No student IDs provided for deletion';
            return ['status' => false, 'errors' => $errorMsgs];
        }

        $idArray = array_map('intval', $data['idArray']);

        if (empty($idArray)) {
            $errorMsgs['idArray'] = 'Invalid student IDs provided';
            return ['status' => false, 'errors' => $errorMsgs];
        }

        if (isset($_SESSION['user']['id']) && in_array($_SESSION['user']['id'], $idArray))
        {
            return [
                'status' => false,
                'errors' => ['You cannot delete authorized user!']
            ];
        }

        $idList = implode(',', $idArray);

        $sql = "DELETE FROM students WHERE id IN ($idList)";
        $result = mysqli_query($conn, $sql);

        if (!$result) {
            $errorMsgs['delete'] = 'Failed to delete students';
            return ['status' => false, 'errors' => $errorMsgs];
        }

        return ['status' => true];
    }

    private static function validateInput($data) {
        $errorMsgs = [];
        
        if (empty($data['group_name'])) {
            $errorMsgs['group_name'] = 'Group name can\'t be empty';
        }
    
        if (empty($data['first_name'])) {
            $errorMsgs['first_name'] = 'First name can\'t be empty';
        } elseif (!preg_match('/^[A-Z][a-zA-Z\s`\'\-]*$/', $data['first_name'])) {
            $errorMsgs['first_name'] = 'Must start with a capital letter and only contain letters, spaces, ` and -';
        }
    
        if (empty($data['last_name'])) {
            $errorMsgs['last_name'] = 'Last name can\'t be empty';
        } elseif (!preg_match('/^[A-Z][a-zA-Z\s`\'\-]*$/', $data['last_name'])) {
            $errorMsgs['last_name'] = 'Must start with a capital letter and only contain letters, spaces, ` and -';
        }
    
        if (empty($data['gender'])) {
            $errorMsgs['gender'] = 'Gender can\'t be empty';
        }
    
        if (empty($data['birthday'])) {
            $errorMsgs['birthday'] = 'Birthday can\'t be empty';
        } 
        else {
            $birthday = $data['birthday'];
            $dateNow = new DateTime();
    
            $selectedDate = DateTime::createFromFormat('Y-m-d', $birthday);
            if ($selectedDate > $dateNow) {
                $errorMsgs['birthday'] = 'Birthdate cannot be in the future';
            }
        }

        return $errorMsgs;
    }
}
?>

