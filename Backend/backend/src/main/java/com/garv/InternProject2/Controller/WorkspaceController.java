package com.garv.InternProject2.Controller;

import com.garv.InternProject2.Entity.Database;
import com.garv.InternProject2.Entity.Server;
import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.Entity.UserDbAccess;
import com.garv.InternProject2.Repository.DatabaseRepo;
import com.garv.InternProject2.Repository.ServerRepository;
import com.garv.InternProject2.Repository.UserDbAccessRepository;
import com.garv.InternProject2.Repository.userRepo;
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

    @PostMapping("/create")
    public ResponseEntity<?> createServer(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        User user = (User) httpRequest.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String serverName = request.get("serverName");
        if (serverName == null || serverName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Server name is required"));
        }

        Server server = new Server();
        server.setName(serverName);
        server.setOwner(user);
        server = serverRepository.save(server);

        return ResponseEntity.ok(Map.of(
                "message", "Workspace created successfully",
                "serverId", server.getId(),
                "serverName", server.getName()
        ));
    }

    @PostMapping("/{serverId}/database")
    public ResponseEntity<?> addDatabase(@PathVariable Long serverId, @RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        User user = (User) httpRequest.getAttribute("user");
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
}
