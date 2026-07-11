package com.garv.InternProject2.Service;

import com.garv.InternProject2.Entity.Database;
import com.garv.InternProject2.Entity.UserDbAccess;
import com.garv.InternProject2.QueryRequest;
import com.garv.InternProject2.Repository.DatabaseRepo;
import com.garv.InternProject2.Repository.UserDbAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class QueryService {

    @Autowired
    private UserDbAccessRepository userDbAccessRepository;

    @Autowired
    private DatabaseRepo databaseRepository;

    public String executeQuery(Long userId, QueryRequest request) {

        List<UserDbAccess> accessList = userDbAccessRepository.findByUserId(userId);
        UserDbAccess access = accessList.stream()
                .filter(a -> a.getDb().getId().equals(request.getDbId()))
                .findFirst()
                .orElse(null);

        if (access == null) {
            return "Access denied. You do not have access to this database.";
        }

        String query = request.getQuery().trim();
        String queryUpper = query.toUpperCase();
        UserDbAccess.Permission permission = access.getRight();

        if (permission == UserDbAccess.Permission.READ) {
            if (!queryUpper.startsWith("SELECT") && !queryUpper.startsWith("SHOW")) {
                return "Access denied. You only have READ access — only SELECT and SHOW queries allowed.";
            }
        }

        if (permission == UserDbAccess.Permission.WRITE) {
            if (queryUpper.startsWith("DROP") || queryUpper.startsWith("CREATE") || queryUpper.startsWith("ALTER")) {
                return "Access denied. WRITE access does not allow DDL queries.";
            }
            if (queryUpper.startsWith("DELETE") || queryUpper.startsWith("TRUNCATE") ||
                    queryUpper.startsWith("UPDATE")) {
                if (!queryUpper.contains("WHERE")) {
                    return "Access denied. DELETE, UPDATE, TRUNCATE require a WHERE clause for WRITE access.";
                }
            }
        }

        Database db = databaseRepository.findById(request.getDbId()).orElse(null);
        if (db == null) {
            return "Database not found.";
        }

        String url = "jdbc:mysql://" + db.getDbHost() + ":3306/" + db.getDbName();
        String username = "root";
        String password = db.getPassword();

        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            Statement stmt = conn.createStatement();

            if (queryUpper.startsWith("SELECT") || queryUpper.startsWith("SHOW")) {
                ResultSet rs = stmt.executeQuery(query);
                ResultSetMetaData meta = rs.getMetaData();
                int colCount = meta.getColumnCount();

                List<String> rows = new ArrayList<>();
                StringBuilder header = new StringBuilder();
                for (int i = 1; i <= colCount; i++) {
                    header.append(meta.getColumnName(i)).append("\t");
                }
                rows.add(header.toString());

                while (rs.next()) {
                    StringBuilder row = new StringBuilder();
                    for (int i = 1; i <= colCount; i++) {
                        row.append(rs.getString(i)).append("\t");
                    }
                    rows.add(row.toString());
                }
                return String.join("\n", rows);
            } else {
                int affected = stmt.executeUpdate(query);
                return "Query executed successfully. Rows affected: " + affected;
            }

        } catch (SQLException e) {
            return "Query execution failed: " + e.getMessage();
        }
    }

    public String createProcedure(Long userId, QueryRequest request) {

        List<UserDbAccess> accessList = userDbAccessRepository.findByUserId(userId);
        UserDbAccess access = accessList.stream()
                .filter(a -> a.getDb().getId().equals(request.getDbId()))
                .findFirst()
                .orElse(null);

        if (access == null) return "Access denied. You do not have access to this database.";

        if (access.getRight() != UserDbAccess.Permission.ADMIN) {
            return "Access denied. Only ADMIN users can create stored procedures.";
        }

        Database db = databaseRepository.findById(request.getDbId()).orElse(null);
        if (db == null) return "Database not found.";

        String url = "jdbc:mysql://" + db.getDbHost() + ":3306/" + db.getDbName();

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword())) {
            Statement stmt = conn.createStatement();
            stmt.execute(request.getQuery());
            return "Stored procedure created successfully.";
        } catch (SQLException e) {
            return "Failed to create procedure: " + e.getMessage();
        }
    }

    public String callProcedure(Long userId, QueryRequest request) {

        List<UserDbAccess> accessList = userDbAccessRepository.findByUserId(userId);
        UserDbAccess access = accessList.stream()
                .filter(a -> a.getDb().getId().equals(request.getDbId()))
                .findFirst()
                .orElse(null);

        if (access == null) return "Access denied. You do not have access to this database.";

        Database db = databaseRepository.findById(request.getDbId()).orElse(null);
        if (db == null) return "Database not found.";

        String url = "jdbc:mysql://" + db.getDbHost() + ":3306/" + db.getDbName();

        try (Connection conn = DriverManager.getConnection(url, "root", db.getPassword())) {
            Statement stmt = conn.createStatement();
            String query = request.getQuery().trim().toUpperCase();

            if (query.startsWith("CALL")) {
                ResultSet rs = stmt.executeQuery(request.getQuery());
                ResultSetMetaData meta = rs.getMetaData();
                int colCount = meta.getColumnCount();

                List<String> rows = new ArrayList<>();
                StringBuilder header = new StringBuilder();
                for (int i = 1; i <= colCount; i++) {
                    header.append(meta.getColumnName(i)).append("\t");
                }
                rows.add(header.toString());

                while (rs.next()) {
                    StringBuilder row = new StringBuilder();
                    for (int i = 1; i <= colCount; i++) {
                        row.append(rs.getString(i)).append("\t");
                    }
                    rows.add(row.toString());
                }
                return String.join("\n", rows);
            } else {
                return "Invalid. Use CALL procedure_name() syntax.";
            }

        } catch (SQLException e) {
            return "Failed to call procedure: " + e.getMessage();
        }
    }
}