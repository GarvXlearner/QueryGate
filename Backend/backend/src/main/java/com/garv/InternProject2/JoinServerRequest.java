package com.garv.InternProject2;

import jakarta.validation.constraints.NotBlank;

public class JoinServerRequest {
    @NotBlank(message = "Join code is required")
    private String joinCode;

    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }
}
