package com.garv.InternProject2.Service;

import com.garv.InternProject2.Entity.Database;
import com.garv.InternProject2.Entity.UserDbAccess;
import com.garv.InternProject2.Repository.DatabaseRepo;
import com.garv.InternProject2.Repository.UserDbAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class SchemaService {
    @Autowired
    private UserDbAccessRepository userDbAccessRepository;
    @Autowired
    private DatabaseRepo databaseRepo;
    private boolean hasAccess(Long userId, Long dbId) {
        List<UserDbAccess> accessList = userDbAccessRepository.findByUserId(userId);
        return accessList.stream()
                .anyMatch(a -> a.getDb().getId().equals(dbId));
    }

    public List<String> getTables(Long userId, Long dbId){
        if (!hasAccess(userId, dbId)) {
            List<String> error = new ArrayList<>();
            error.add("Access denied. You do not have access to this database.");
            return error;
        }
        Database db = databaseRepo.findById(dbId).orElse(null);
        if (db == null) {
            List<String> error = new ArrayList<>();
            error.add("Database not found.");
            return error;
        }
        List<String> tables = new ArrayList<>();
        String url = "jdbc:mysql://" + db.getDbHost() + ":3307/INFORMATION_SCHEMA";

        String query = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?";

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword());
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, db.getDbName());
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                tables.add(rs.getString("TABLE_NAME"));
            }

        } catch (SQLException e) {
            tables.add("Error fetching tables: " + e.getMessage());
        }

        return tables;
    }

    public List<String> getColumns(Long userId, Long dbId, String tableName) {
        if (!hasAccess(userId, dbId)) {
            List<String> error = new ArrayList<>();
            error.add("Access denied. You do not have access to this database.");
            return error;
        }

        Database db = databaseRepo.findById(dbId).orElse(null);
        if (db == null) {
            List<String> error = new ArrayList<>();
            error.add("Database not found.");
            return error;
        }

        List<String> columns = new ArrayList<>();
        String url = "jdbc:mysql://" + db.getDbHost() + ":3307/INFORMATION_SCHEMA";

        String query = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?";

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword());
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, db.getDbName());
            stmt.setString(2, tableName);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                columns.add(rs.getString("COLUMN_NAME") + " (" + rs.getString("DATA_TYPE") + ")");
            }

        } catch (SQLException e) {
            columns.add("Error fetching columns: " + e.getMessage());
        }

        return columns;


    }
    public List<String> getViews(Long userId, Long dbId) {
        if (!hasAccess(userId, dbId)) {
            List<String> error = new ArrayList<>();
            error.add("Access denied. You do not have access to this database.");
            return error;
        }

        Database db = databaseRepo.findById(dbId).orElse(null);
        if (db == null) {
            List<String> error = new ArrayList<>();
            error.add("Database not found.");
            return error;
        }

        List<String> views = new ArrayList<>();
        String url = "jdbc:mysql://" + db.getDbHost() + ":3307/INFORMATION_SCHEMA";

        String query = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = ?";

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword());
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, db.getDbName());
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                views.add(rs.getString("TABLE_NAME"));
            }

        } catch (SQLException e) {
            views.add("Error fetching views: " + e.getMessage());
        }

        return views;
    }

    public List<String> getProcedures(Long userId, Long dbId) {
        if (!hasAccess(userId, dbId)) {
            List<String> error = new ArrayList<>();
            error.add("Access denied. You do not have access to this database.");
            return error;
        }

        Database db = databaseRepo.findById(dbId).orElse(null);
        if (db == null) {
            List<String> error = new ArrayList<>();
            error.add("Database not found.");
            return error;
        }

        List<String> procedures = new ArrayList<>();
        String url = "jdbc:mysql://" + db.getDbHost() + ":3307/INFORMATION_SCHEMA";

        String query = "SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'";

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword());
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, db.getDbName());
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                procedures.add(rs.getString("ROUTINE_NAME"));
            }

        } catch (SQLException e) {
            procedures.add("Error fetching procedures: " + e.getMessage());
        }

        return procedures;
    }

    public String getProcedureDefinition(Long userId, Long dbId, String procName) {
        if (!hasAccess(userId, dbId)) {
            return "Access denied.";
        }

        Database db = databaseRepo.findById(dbId).orElse(null);
        if (db == null) {
            return "Database not found.";
        }

        String url = "jdbc:mysql://" + db.getDbHost() + ":3307/" + db.getDbName();
        String query = "SHOW CREATE PROCEDURE " + procName;
        String definition = "";

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword());
             PreparedStatement stmt = conn.prepareStatement(query)) {

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                definition = rs.getString("Create Procedure");
            } else {
                definition = "Procedure definition not found.";
            }

        } catch (SQLException e) {
            definition = "-- Error fetching procedure definition: " + e.getMessage();
        }

        return definition;
    }

    public java.util.Map<String, Object> getErdData(Long userId, Long dbId) {
        if (!hasAccess(userId, dbId)) {
            return java.util.Collections.singletonMap("error", "Access denied.");
        }

        Database db = databaseRepo.findById(dbId).orElse(null);
        if (db == null) {
            return java.util.Collections.singletonMap("error", "Database not found.");
        }

        String url = "jdbc:mysql://" + db.getDbHost() + ":3307/INFORMATION_SCHEMA";
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        java.util.List<java.util.Map<String, Object>> tablesList = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, String>> edgesList = new java.util.ArrayList<>();

        // 1. Fetch tables and their columns
        String colQuery = "SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY " +
                          "FROM INFORMATION_SCHEMA.COLUMNS " +
                          "WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION";

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword());
             PreparedStatement stmt = conn.prepareStatement(colQuery)) {

            stmt.setString(1, db.getDbName());
            ResultSet rs = stmt.executeQuery();

            String currentTable = null;
            java.util.List<java.util.Map<String, Object>> currentColumns = new java.util.ArrayList<>();

            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                if (currentTable == null || !currentTable.equals(tableName)) {
                    if (currentTable != null) {
                        java.util.Map<String, Object> tableObj = new java.util.HashMap<>();
                        tableObj.put("name", currentTable);
                        tableObj.put("columns", currentColumns);
                        tablesList.add(tableObj);
                    }
                    currentTable = tableName;
                    currentColumns = new java.util.ArrayList<>();
                }

                java.util.Map<String, Object> colObj = new java.util.HashMap<>();
                colObj.put("name", rs.getString("COLUMN_NAME"));
                colObj.put("type", rs.getString("DATA_TYPE"));
                colObj.put("isPrimary", "PRI".equals(rs.getString("COLUMN_KEY")));
                currentColumns.add(colObj);
            }
            if (currentTable != null) {
                java.util.Map<String, Object> tableObj = new java.util.HashMap<>();
                tableObj.put("name", currentTable);
                tableObj.put("columns", currentColumns);
                tablesList.add(tableObj);
            }

        } catch (SQLException e) {
            return java.util.Collections.singletonMap("error", "Error fetching columns: " + e.getMessage());
        }

        // 2. Fetch Foreign Keys
        String fkQuery = "SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME " +
                         "FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                         "WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL";

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword());
             PreparedStatement stmt = conn.prepareStatement(fkQuery)) {

            stmt.setString(1, db.getDbName());
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                java.util.Map<String, String> edge = new java.util.HashMap<>();
                edge.put("source", rs.getString("TABLE_NAME"));
                edge.put("sourceHandle", rs.getString("COLUMN_NAME"));
                edge.put("target", rs.getString("REFERENCED_TABLE_NAME"));
                edge.put("targetHandle", rs.getString("REFERENCED_COLUMN_NAME"));
                edgesList.add(edge);
            }

        } catch (SQLException e) {
            return java.util.Collections.singletonMap("error", "Error fetching foreign keys: " + e.getMessage());
        }

        result.put("tables", tablesList);
        result.put("edges", edgesList);
        return result;
    }
}
