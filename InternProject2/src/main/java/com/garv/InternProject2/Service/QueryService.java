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
    private UserDbAccessRepository userdbrepo;

    @Autowired
    private DatabaseRepo dbrepo;
     public String executeQuery(Long userId,QueryRequest request)
     {
         try {

             if (request.getDbId() == null) return "Database ID is missing";

             List <UserDbAccess> accesslist = userdbrepo.findByUserId(userId);
             UserDbAccess access = null;
             if (accesslist != null) {
                 access = accesslist.stream()
                         .filter(a -> a.getDb() != null && a.getDb().getId().equals(request.getDbId()))
                         .findFirst()
                         .orElse(null);
             }

             UserDbAccess.Permission permission;
             if(access == null) {
                 permission = UserDbAccess.Permission.ADMIN;
             } else {
                 permission = access.getRight();
             }

         String query = request.getQuery().trim();
         String queryUpper = query.toUpperCase();

         if(permission== UserDbAccess.Permission.READ)
         {
             if(!queryUpper.startsWith("SELECT")&&!queryUpper.startsWith("SHOW"))
             {
                 return "Access Denied , you have only read permisson, use only SELECT queries";

             }
         }

         if(permission==UserDbAccess.Permission.WRITE)
         {
             if(queryUpper.startsWith("DROP")||queryUpper.startsWith("CREATE")||queryUpper.startsWith("ALTER"))
             {
                 return "Access denied. WRITE access does not allow DDL queries.";
             }
             if(queryUpper.startsWith("DELETE")||queryUpper.startsWith("TRUNCATE")||queryUpper.startsWith("UPDATE"))
             {
                 if(!queryUpper.contains("WHERE"))
                 {
                     return "Access denied. DELETE, UPDATE, TRUNCATE require a WHERE clause for WRITE access.";
                 }
             }
         }

         Database db= dbrepo.findById(request.getDbId()).orElse(null);

             if(db==null)
             {
                 return "Database not found";
             }
             String url = "jdbc:mysql://" + db.getDbHost() + ":3307/" + db.getDbName();
             String username = "root";
             String password = db.getPassword();

         try (Connection conn=DriverManager.getConnection(url, username, password))
         {
             Statement stmt=conn.createStatement();
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


         }

      catch (SQLException e) {
             return "Query execution faieled"+ e.getMessage();
         }
         } catch (Exception e) {
             e.printStackTrace();
             return "Server Error: " + e.getMessage();
         }
     }
}
