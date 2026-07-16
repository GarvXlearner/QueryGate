package com.garv.InternProject2.Controller;

import com.garv.InternProject2.Entity.Database;
import com.garv.InternProject2.Entity.QueryLog;
import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.Entity.UserDbAccess;
import com.garv.InternProject2.Repository.QueryLogRepository;
import com.garv.InternProject2.Service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data")
public class DataController {

    @Autowired
    private DataService dataService;

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

    @Autowired
    private QueryLogRepository queryLogRepository;

    @GetMapping("/logs")
    public ResponseEntity<List<QueryLog>> getAllLogs() {
        return ResponseEntity.ok(queryLogRepository.findAll());
    }
}