package com.garv.InternProject2.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "server_members")
public class ServerMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "server_id", nullable = false)
    private Server server;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServerRole role = ServerRole.MEMBER;

    public enum ServerRole {
        OWNER, ADMIN, MEMBER
    }

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @PrePersist
    public void prePersist() {
        joinedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    
    public Server getServer() { return server; }
    public void setServer(Server server) { this.server = server; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public ServerRole getRole() { return role; }
    public void setRole(ServerRole role) { this.role = role; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
}
