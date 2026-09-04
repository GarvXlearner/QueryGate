package com.garv.InternProject2;

import jakarta.validation.constraints.NotBlank;

public class CreateServerRequest {
    @NotBlank(message = "Server name is required")
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
