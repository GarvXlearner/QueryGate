-- Create the Database (You may not need this if TiDB creates 'test' by default)
CREATE DATABASE IF NOT EXISTS querygate_demo;
USE querygate_demo;

-- 1. Create Employees Table
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(10, 2),
    hire_date DATE
);

-- 2. Create Projects Table
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    budget DECIMAL(12, 2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 3. Create Employee_Projects (Many-to-Many relationship)
CREATE TABLE employee_projects (
    employee_id INT,
    project_id INT,
    role VARCHAR(50),
    hours_allocated INT,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 4. Create Server Logs Table (Great for testing AI generation)
CREATE TABLE server_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    server_name VARCHAR(50),
    error_level VARCHAR(20),
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INSERT DUMMY DATA
-- ==========================================

-- Insert Employees
INSERT INTO employees (first_name, last_name, email, department, salary, hire_date) VALUES
('Alice', 'Smith', 'alice.smith@example.com', 'Engineering', 95000.00, '2023-01-15'),
('Bob', 'Johnson', 'bob.j@example.com', 'Marketing', 75000.00, '2023-03-22'),
('Charlie', 'Williams', 'charlie.w@example.com', 'Engineering', 105000.00, '2022-11-01'),
('Diana', 'Brown', 'diana.b@example.com', 'HR', 82000.00, '2023-05-10'),
('Evan', 'Davis', 'evan.d@example.com', 'Sales', 68000.00, '2024-01-05');

-- Insert Projects
INSERT INTO projects (project_name, budget, start_date, end_date, status) VALUES
('Project Apollo', 500000.00, '2024-01-01', '2024-12-31', 'ACTIVE'),
('Website Redesign', 75000.00, '2024-03-15', '2024-06-30', 'COMPLETED'),
('AI Integration', 1200000.00, '2024-05-01', '2025-05-01', 'ACTIVE');

-- Insert Employee_Projects
INSERT INTO employee_projects (employee_id, project_id, role, hours_allocated) VALUES
(1, 1, 'Lead Developer', 40),
(1, 3, 'AI Specialist', 20),
(2, 2, 'Marketing Lead', 15),
(3, 1, 'Backend Developer', 35),
(4, 2, 'HR Coordinator', 5);

-- Insert Server Logs
INSERT INTO server_logs (server_name, error_level, message, timestamp) VALUES
('web-server-01', 'INFO', 'Server started successfully.', '2024-08-30 08:00:00'),
('web-server-02', 'WARNING', 'High memory usage detected.', '2024-08-30 08:15:22'),
('db-server-01', 'ERROR', 'Connection timeout on port 3306.', '2024-08-30 08:45:10'),
('web-server-01', 'INFO', 'User login successful.', '2024-08-30 09:05:01');
