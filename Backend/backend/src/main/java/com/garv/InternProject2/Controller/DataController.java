package com.garv.InternProject2.Controller;

import com.garv.InternProject2.Entity.Database;
import com.garv.InternProject2.Entity.QueryLog;
import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.Entity.UserDbAccess;
import com.garv.InternProject2.Repository.QueryLogRepository;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Service.DataService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data")
public class DataController {

    @Autowired
    private DataService dataService;

    @Autowired
    private QueryLogRepository queryLogRepository;

    @Autowired
    private userRepo userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(dataService.getAllUsers());
    }

    @GetMapping("/databases")
    public ResponseEntity<List<Database>> getAllDatabases() {
        return ResponseEntity.ok(dataService.getAllDBS());
    }

    @GetMapping("/access/{userId}")
    public ResponseEntity<List<UserDbAccess>> getUserAccess(@PathVariable Long userId) {
        return ResponseEntity.ok(dataService.getmappingbyuser(userId));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<QueryLog>> getAllLogs() {
        return ResponseEntity.ok(queryLogRepository.findAll());
    }

    @GetMapping("/my-access")
    public ResponseEntity<List<UserDbAccess>> getMyAccess(HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(null);
        }

        return ResponseEntity.ok(dataService.getmappingbyuser(user.getId()));
    }
}