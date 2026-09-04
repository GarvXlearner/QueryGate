package com.garv.InternProject2;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NlQueryRequest {

    @NotNull(message = "dbId is required")
    private Long dbId;

    @NotBlank(message = "question is required")
    private String question;

    public Long getDbId() { return dbId; }
    public void setDbId(Long dbId) { this.dbId = dbId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}