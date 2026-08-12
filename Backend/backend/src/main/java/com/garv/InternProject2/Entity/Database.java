package com.garv.InternProject2.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="db_table")
public class Database {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;
    private String dbName;
    @Column(name = "host_name")
    private String dbHost;
    private String serverName;
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "server_workspace_id")
    private Server serverWorkspace;

    @PrePersist
    public void PrePersist()
    {
        createdAt=LocalDateTime.now();
    }

    public Long getId() {
        return Id;
    }

    public String getDbName() {
        return dbName;
    }

    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    public String getDbHost() {
        return dbHost;
    }

    public void setDbHost(String dbHost) {
        this.dbHost = dbHost;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getServerName() { return serverName; }
    public void setServerName(String serverName) { this.serverName = serverName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Server getServerWorkspace() { return serverWorkspace; }
    public void setServerWorkspace(Server serverWorkspace) { this.serverWorkspace = serverWorkspace; }
}
