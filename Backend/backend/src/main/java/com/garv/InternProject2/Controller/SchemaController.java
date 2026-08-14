package com.garv.InternProject2.Controller;

import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Service.SchemaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schema")
public class SchemaController {

    @Autowired
    private SchemaService schemaService;

    @Autowired
    private userRepo userRepository;

    @GetMapping("/{dbId}/tables")
    public ResponseEntity<List<String>> getTables(@PathVariable Long dbId, HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(List.of("User not found from token."));
        }

        return ResponseEntity.ok(schemaService.getTables(user.getId(), dbId));
    }

    @GetMapping("/{dbId}/tables/{tableName}/columns")
    public ResponseEntity<List<String>> getColumns(@PathVariable Long dbId, @PathVariable String tableName,
                                                   HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(List.of("User not found from token."));
        }

        return ResponseEntity.ok(schemaService.getColumns(user.getId(), dbId, tableName));
    }
    @GetMapping("/{dbId}/views")
    public ResponseEntity<List<String>> getViews(@PathVariable Long dbId, HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(List.of("User not found from token."));
        }

        return ResponseEntity.ok(schemaService.getViews(user.getId(), dbId));
    }

    @GetMapping("/{dbId}/procedures")
    public ResponseEntity<List<String>> getProcedures(@PathVariable Long dbId, HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(List.of("User not found from token."));
        }

        return ResponseEntity.ok(schemaService.getProcedures(user.getId(), dbId));
    }

    @GetMapping("/{dbId}/procedures/{procName}")
    public ResponseEntity<String> getProcedureDefinition(@PathVariable Long dbId, @PathVariable String procName, HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body("User not found from token.");
        }

        return ResponseEntity.ok(schemaService.getProcedureDefinition(user.getId(), dbId, procName));
    }

    @GetMapping("/{dbId}/erd")
    public ResponseEntity<java.util.Map<String, Object>> getErdData(@PathVariable Long dbId, HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body(java.util.Collections.singletonMap("error", "User not found from token."));
        }

        return ResponseEntity.ok(schemaService.getErdData(user.getId(), dbId));
    }
}