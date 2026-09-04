package com.garv.InternProject2.Entity;

import jakarta.persistence.*;

import java.security.Permission;
import java.time.LocalDateTime;

@Entity
@Table(name="user_mapped_dbs")
public class UserDbAccess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="db_id")
    private Database db;


    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    @Enumerated(EnumType.STRING)
    @Column(name="Rights")
    private Permission right=Permission.READ;
    public enum Permission {
        READ, WRITE, ADMIN
    }
    
    @Column(name = "createdAt")
    private LocalDateTime createdAt;

    @PrePersist
    public void PrePersist()
    {
        createdAt=LocalDateTime.now();
    }
    public Long getId() { return id; }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Database getDb() {
        return db;
    }

    public void setDb(Database db) {
        this.db = db;
    }

    public Permission getRight() {
        return right;
    }

    public void setRight(Permission right) {
        this.right = right;
    }
    public LocalDateTime getCreatedAt()
    { return createdAt;
    }

}
