package com.garv.InternProject2.Service;

import com.garv.InternProject2.Entity.Server;
import com.garv.InternProject2.Entity.ServerMember;
import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.Repository.ServerMemberRepository;
import com.garv.InternProject2.Repository.ServerRepository;
import com.garv.InternProject2.Repository.userRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ServerService {

    @Autowired
    private ServerRepository serverRepository;

    @Autowired
    private ServerMemberRepository serverMemberRepository;

    @Autowired
    private userRepo userRepository;

    public Server createServer(Long userId, String serverName) {
        User owner = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Server server = new Server();
        server.setName(serverName);
        server.setOwner(owner);
        server.setJoinCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase()); // Generate an 8-char join code

        server = serverRepository.save(server);

        // Add owner to members table
        ServerMember member = new ServerMember();
        member.setServer(server);
        member.setUser(owner);
        member.setRole(ServerMember.ServerRole.OWNER);
        serverMemberRepository.save(member);

        return server;
    }

    public Server joinServer(Long userId, String joinCode) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Server server = serverRepository.findByJoinCode(joinCode).orElseThrow(() -> new RuntimeException("Invalid join code"));

        // Check if already a member
        if (serverMemberRepository.existsByServerAndUser(server, user)) {
            throw new RuntimeException("You are already a member of this server.");
        }

        ServerMember member = new ServerMember();
        member.setServer(server);
        member.setUser(user);
        member.setRole(ServerMember.ServerRole.MEMBER);
        serverMemberRepository.save(member);

        return server;
    }
}
