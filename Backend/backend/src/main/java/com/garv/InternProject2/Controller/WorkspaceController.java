package com.garv.InternProject2.Controller;

import com.garv.InternProject2.Entity.Database;
import com.garv.InternProject2.Entity.Server;
import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.Entity.UserDbAccess;
import com.garv.InternProject2.Repository.DatabaseRepo;
import com.garv.InternProject2.Repository.ServerRepository;
import com.garv.InternProject2.Repository.UserDbAccessRepository;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Repository.ServerMemberRepository;
import com.garv.InternProject2.Service.ServerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {

    @Autowired
    private ServerRepository serverRepository;

    @Autowired
    private DatabaseRepo databaseRepository;

    @Autowired
    private UserDbAccessRepository userDbAccessRepository;

    @Autowired
    private userRepo userRepository;

    @Autowired
    private ServerMemberRepository serverMemberRepository;

    @Autowired
    private ServerService serverService;

    @PostMapping("/create")
    public ResponseEntity<?> createServer(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String authUsername = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(authUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String serverName = request.get("serverName");
        if (serverName == null || serverName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Server name is required"));
        }

        try {
            Server server = serverService.createServer(user.getId(), serverName);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Workspace created successfully",
                    "serverId", server.getId(),
                    "serverName", server.getName(),
                    "joinCode", server.getJoinCode()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{serverId}/database")
    public ResponseEntity<?> addDatabase(@PathVariable Long serverId, @RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String authUsername = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(authUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Server server = serverRepository.findById(serverId).orElse(null);
        if (server == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Workspace not found"));
        }

        // Only owner can add databases for now
        if (!server.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the workspace owner can add databases"));
        }

        String dbName = request.get("dbName");
        String host = request.get("host");
        String port = request.get("port");
        String username = request.get("username");
        String password = request.get("password");

        if (dbName == null || host == null || port == null || username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All connection details are required"));
        }

        // Test the database connection before saving
        String url = "jdbc:mysql://" + host + ":" + port + "/";
        try (java.sql.Connection conn = java.sql.DriverManager.getConnection(url, username, password)) {
            // Connection to the server was successful. Now check if the database exists.
            boolean exists = false;
            try (java.sql.ResultSet rs = conn.createStatement().executeQuery("SHOW DATABASES LIKE '" + dbName + "'")) {
                if (rs.next()) {
                    exists = true;
                }
            }
            if (!exists) {
                return ResponseEntity.badRequest().body(Map.of("error", "Database '" + dbName + "' does not exist on this server."));
            }
        } catch (java.sql.SQLException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Database connection failed. Please check your credentials: " + e.getMessage()));
        }

        Database db = new Database();
        db.setDbName(dbName);
        db.setDbHost(host);
        db.setPort(port);
        db.setUsername(username);
        db.setPassword(password);
        db.setServerWorkspace(server);
        db.setServerName(server.getName());
        db = databaseRepository.save(db);

        // Grant ADMIN access to the owner
        UserDbAccess access = new UserDbAccess();
        access.setUser(user);
        access.setDb(db);
        access.setRight(UserDbAccess.Permission.ADMIN);
        userDbAccessRepository.save(access);

        return ResponseEntity.ok(Map.of(
                "message", "Database connected successfully",
                "databaseId", db.getId()
        ));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getUserWorkspaces(HttpServletRequest httpRequest) {
        String authUsername = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(authUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        java.util.List<Server> servers = serverRepository.findByOwner(user);
        
        java.util.List<Map<String, Object>> response = servers.stream().map(server -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", server.getId());
            map.put("name", server.getName());
            map.put("joinCode", server.getJoinCode() != null ? server.getJoinCode() : "");
            map.put("createdAt", server.getCreatedAt() != null ? server.getCreatedAt().toString() : "");
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{serverId}/members")
    public ResponseEntity<?> getServerMembers(@PathVariable Long serverId, HttpServletRequest httpRequest) {
        String authUsername = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(authUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Server server = serverRepository.findById(serverId).orElse(null);
        if (server == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Workspace not found"));
        }

        if (!server.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only owner can view members"));
        }

        java.util.List<com.garv.InternProject2.Entity.ServerMember> members = serverMemberRepository.findByServer(server);
        java.util.List<Map<String, Object>> response = members.stream().map(m -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("userId", m.getUser().getId());
            map.put("username", m.getUser().getUsername());
            map.put("role", m.getRole().name());
            map.put("joinedAt", m.getJoinedAt() != null ? m.getJoinedAt().toString() : "");
            
            java.util.List<com.garv.InternProject2.Entity.UserDbAccess> accessList = userDbAccessRepository.findByUserId(m.getUser().getId());
            Map<Long, String> dbAccessMap = new java.util.HashMap<>();
            for (com.garv.InternProject2.Entity.UserDbAccess acc : accessList) {
                if (acc.getDb().getServerWorkspace().getId().equals(serverId)) {
                    dbAccessMap.put(acc.getDb().getId(), acc.getRight().name());
                }
            }
            map.put("dbAccess", dbAccessMap);
            
            return map;
        }).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{serverId}/databases")
    public ResponseEntity<?> getServerDatabases(@PathVariable Long serverId, HttpServletRequest httpRequest) {
        String authUsername = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(authUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Server server = serverRepository.findById(serverId).orElse(null);
        if (server == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Workspace not found"));
        }

        boolean isOwner = server.getOwner().getId().equals(user.getId());
        boolean isMember = serverMemberRepository.existsByServerAndUser(server, user);
        
        if (!isOwner && !isMember) {
            return ResponseEntity.status(403).body(Map.of("error", "You do not have access to this workspace"));
        }

        java.util.List<Database> databases = databaseRepository.findByServerWorkspace(server);
        java.util.List<Map<String, Object>> response = databases.stream().map(db -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", db.getId());
            map.put("name", db.getDbName());
            return map;
        }).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent-connections")
    public ResponseEntity<?> getRecentConnections(HttpServletRequest httpRequest) {
        String authUsername = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(authUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        java.util.List<Server> servers = serverRepository.findByOwner(user);
        java.util.List<Map<String, Object>> recentConnections = new java.util.ArrayList<>();
        java.util.Set<String> seen = new java.util.HashSet<>();

        for (Server server : servers) {
            java.util.List<Database> databases = databaseRepository.findByServerWorkspace(server);
            for (Database db : databases) {
                String uniqueKey = db.getDbHost() + ":" + db.getPort() + "/" + db.getDbName() + "@" + db.getUsername();
                if (!seen.contains(uniqueKey)) {
                    seen.add(uniqueKey);
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("dbName", db.getDbName());
                    map.put("host", db.getDbHost());
                    map.put("port", db.getPort());
                    map.put("username", db.getUsername());
                    map.put("password", db.getPassword()); // Needed to auto-fill
                    recentConnections.add(map);
                }
            }
        }
        return ResponseEntity.ok(recentConnections);
    }

    @PostMapping("/{serverId}/database/{dbId}/access")
    public ResponseEntity<?> grantAccess(@PathVariable Long serverId, @PathVariable Long dbId, @RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String authUsername = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(authUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Server server = serverRepository.findById(serverId).orElse(null);
        if (server == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Workspace not found"));
        }

        if (!server.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only owner can grant access"));
        }

        Long targetUserId = Long.parseLong(request.get("userId"));
        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (targetUser == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Target user not found"));
        }

        Database db = databaseRepository.findById(dbId).orElse(null);
        if (db == null || !db.getServerWorkspace().getId().equals(serverId)) {
            return ResponseEntity.status(404).body(Map.of("error", "Database not found in this workspace"));
        }

        String permissionStr = request.get("permission");
        if (permissionStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Permission is required"));
        }

        if (permissionStr.equals("NONE")) {
            // Remove access
            UserDbAccess access = userDbAccessRepository.findByUserAndDb(targetUser, db).orElse(null);
            if (access != null) {
                userDbAccessRepository.delete(access);
            }
            return ResponseEntity.ok(Map.of("message", "Access removed"));
        }

        UserDbAccess.Permission permission;
        try {
            permission = UserDbAccess.Permission.valueOf(permissionStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid permission"));
        }

        UserDbAccess access = userDbAccessRepository.findByUserAndDb(targetUser, db).orElse(new UserDbAccess());
        access.setUser(targetUser);
        access.setDb(db);
        access.setRight(permission);
        userDbAccessRepository.save(access);

        return ResponseEntity.ok(Map.of("message", "Access granted successfully"));
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinServer(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String authUsername = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(authUsername).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String joinCode = request.get("joinCode");
        if (joinCode == null || joinCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Join code is required"));
        }

        try {
            Server server = serverService.joinServer(user.getId(), joinCode);
            return ResponseEntity.ok(Map.of(
                    "message", "Joined workspace successfully",
                    "serverId", server.getId(),
                    "serverName", server.getName(),
                    "joinCode", server.getJoinCode()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
