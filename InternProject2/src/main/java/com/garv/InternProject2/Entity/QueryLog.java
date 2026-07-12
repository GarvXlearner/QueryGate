package com.garv.InternProject2.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="query_logs")
public class QueryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id")
    private Long userid;
    @Column(name = "db_id")
    private Long dbid;
    @Column(name = "db_name")
    private String dbname;
    @Column(name = "action_type")
    private String actiontype;
    @Column(name = "query_text")
    private String querytext;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.FAILED;

    public enum Status {
        SUCCESS, FAILED
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @PrePersist
    public void PrePersist()
    {
        createdAt= LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserid() {
        return userid;
    }
    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
    public void setUserid(Long userid) {
        this.userid = userid;
    }

    public Long getDbid() {
        return dbid;
    }

    public void setDbid(Long dbid) {
        this.dbid = dbid;
    }

    public String getDbname() {
        return dbname;
    }

    public void setDbname(String dbname) {
        this.dbname = dbname;
    }

    public String getActiontype() {
        return actiontype;
    }

    public void setActiontype(String actiontype) {
        this.actiontype = actiontype;
    }

    public String getQuerytext() {
        return querytext;
    }

    public void setQuerytext(String querytext) {
        this.querytext = querytext;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


}
