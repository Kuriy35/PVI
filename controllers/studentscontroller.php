<?php
require_once "./models/studentsmodel.php";

class StudentsController {
    public function getAllStudents() {
        $students = Students::getAllStudents();
        return $students;
    }

    public function getAllStudentsGeneralData() {
        $students = Students::getAllStudentsGeneralData();
        return $students;
    }

    public function getFullNameById($idArray) {
        $students = Students::getFullNameById($idArray);
        return $students;
    }

    public function getPaginatedStudentsPage($pageNumber, $pageSize)
    {
        $students = Students::getStudentsPaginated($pageNumber, $pageSize);
        return $students;
    }
    
    public function addStudent($data)
    {
        $response = Students::addStudent($data);
        return $response;
    }

    public function editStudent($data)
    {
        $response = Students::editStudent($data);
        return $response;
    }

    public function deleteStudents($data)
    {
        $response = Students::deleteStudents($data);
        return $response;
    }
}

?>