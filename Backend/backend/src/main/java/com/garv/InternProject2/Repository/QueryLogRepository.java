package com.garv.InternProject2.Repository;

import com.garv.InternProject2.Entity.QueryLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QueryLogRepository extends JpaRepository<QueryLog, Long> {
    List<QueryLog> findByUseridOrderByCreatedAtDesc(Long userid);
}
