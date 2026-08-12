package com.garv.InternProject2.Controller;

import com.garv.InternProject2.CreateServerRequest;
import com.garv.InternProject2.Entity.Server;
import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.JoinServerRequest;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Service.ServerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/servers")
public class ServerController {

    @Autowired
    private ServerService serverService;

    @Autowired
    private userRepo userRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createServer(@Valid @RequestBody CreateServerRequest request, HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            Server server = serverService.createServer(user.getId(), request.getName());
            return ResponseEntity.ok(server);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinServer(@Valid @RequestBody JoinServerRequest request, HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            Server server = serverService.joinServer(user.getId(), request.getJoinCode());
            return ResponseEntity.ok(server);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
