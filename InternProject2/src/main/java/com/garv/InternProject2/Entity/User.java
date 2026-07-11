package com.garv.InternProject2.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;

    private int failedAttempts = 0;
    private boolean locked = false;
    private LocalDateTime createdAt;
    @Enumerated
    private Status status= Status.ACTIVE;

    public enum Status{
        ACTIVE, INACTIVE
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }

    public boolean isLocked() { return locked; }
    public void setLocked(boolean locked) { this.locked = locked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public Status getStatus(){return status;}
    public void setStatus(Status status){this.status=status;}
}