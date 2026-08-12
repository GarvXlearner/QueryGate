package com.garv.InternProject2;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class QueryRequest {

    @NotNull(message="db id is required")
    private Long dbId;
    @NotBlank(message="query is required")
    private String query;



    public Long getDbId() {
        return dbId;
    }

    public void setDbId(Long dbId) {
        this.dbId = dbId;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
