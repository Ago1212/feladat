<?php
require 'db.php';
require 'FileHandler.php';

class ApiHandler {
    protected string $auth_hash;
    protected array $actions = [];
    protected $db;
    private $fileHandler;

    public function __construct(string $auth_hash) {
        $this->auth_hash = $auth_hash;
        $this->actions = $this->getActions();
        $database = new Database();
        $this->db = $database->connect();
        $this->fileHandler = new FileHandler(__DIR__ . '/users.json');
    }

    private function getActions(): array {
        return [
            'loginUser' => ['email', 'password'],
            'registerUser' => ['email', 'nickname', 'birthdate', 'password'],
            'updateUser' => ['id', 'nickname', 'birthdate'],
            'logoutUser' => ['id']
        ];
    }

    private function validation(?array $request) {
        if (empty($request)) {
            throw new Exception('Request body is empty.');
        }

        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? '';
        $authHash = str_replace('Bearer ', '', $authHeader);

        if ($this->auth_hash !== $authHash) {
            throw new Exception('Authorization failed.');
        }

        if (!isset($request['action']) || !array_key_exists($request['action'], $this->actions)) {
            $action = $request['action'] ?? "";
            throw new Exception("Invalid action: $action.");
        }

        foreach ($this->actions[$request['action']] as $key) {
            if (!array_key_exists($key, $request)) {
                throw new Exception("Missing parameter: $key.");
            }
        }
        if(isset($request['email']) && !filter_var($request['email'], FILTER_VALIDATE_EMAIL)){
            throw new Exception('Invalid email format.');
        }
        if (isset($request['birthdate'])) {
            $this->validateBirthdate($request['birthdate']);
        }
    }

    public function process(?array $request) {
        try {
            $this->validation($request);
            $action = $request['action'];

            switch ($action) {
                case 'loginUser':
                    echo json_encode($this->loginUser($request['email'], $request['password']));
                    return;
                case 'registerUser':
                    echo json_encode($this->registerUser($request['email'], $request['nickname'], $request['birthdate'], $request['password']));
                    return;
                case 'updateUser':
                    echo json_encode($this->updateUser($request['id'], $request['nickname'], $request['birthdate'], $request['password']));
                    return;
                case 'logoutUser':
                    echo json_encode($this->logoutUser($request['id']));
                    return;
            }             
        } catch (Exception $e) {
            $message = ["error" => true, "message" => $e->getMessage()];
            echo json_encode($message);
        } 
    }

    private function registerUser($email, $nickname, $birthdate, $password) {
        try {    
            $query = "SELECT * FROM users WHERE email = :email";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
    
            if ($stmt->rowCount() > 0) {
                throw new Exception('Email is already registered.');
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
            $query = "INSERT INTO users (email, nickname, birthdate, password) VALUES (:email, :nickname, :birthdate, :password)";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':nickname', $nickname);
            $stmt->bindParam(':birthdate', $birthdate);
            $stmt->bindParam(':password', $hashedPassword);
            $stmt->execute();

            $query = "SELECT * FROM users WHERE email = :email";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            $this->fileHandler->addUserToFile($stmt->fetch(PDO::FETCH_ASSOC));
            
            return ['success' => true, 'message' => 'Registration successful!'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    private function loginUser($email, $password) {
        $randomSource = rand(0, 1); 
        if($randomSource == 0){
            $type="database";
            $user = $this->getUser($email);
        }else{
            $type="file";
            $user = $this->fileHandler->getUserFromFile($email);
        }

        if (!empty($user) && password_verify($password, $user['password'])) {
            return ['success' => true, 'user' => $user,'type'=>$type];
        }
        return ['success' => false, 'message' => 'Login failed. Incorrect email or password.'];
    }

    private function logoutUser() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_unset();
        session_destroy();
        return ['success' => true, 'message' => 'Successfully logged out.'];
    }

    private function updateUser($id, $nickname, $birthdate,$password=null) {
        try {
            $query = "UPDATE users SET nickname = :nickname, birthdate = :birthdate";
            $hashedPassword = null;
            if ($password) {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $query .= ", password = :password";
            }
            $query .= " WHERE id = :id";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nickname', $nickname);
            $stmt->bindParam(':birthdate', $birthdate);
            if ($password) {
                $stmt->bindParam(':password', $hashedPassword);
            }
            $stmt->execute();

            $this->fileHandler->updateUserInFile($id, $nickname, $birthdate,$hashedPassword);

            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private function getUser($email) {
        $query = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function validateBirthdate($birthdate) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthdate)) {
            throw new Exception('Invalid birthdate format. Correct format: YYYY-MM-DD.');
        }
        $dateParts = explode("-", $birthdate);
        if (!checkdate($dateParts[1], $dateParts[2], $dateParts[0])) {
            throw new Exception('Invalid birthdate.');
        }
    }
}
