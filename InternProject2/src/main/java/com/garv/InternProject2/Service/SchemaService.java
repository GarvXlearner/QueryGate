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
        String url = "jdbc:mysql://" + db.getDbHost() + ":3306/INFORMATION_SCHEMA";

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
        String url = "jdbc:mysql://" + db.getDbHost() + ":3306/INFORMATION_SCHEMA";

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
}


