package com.garv.InternProject2.Repository;

import com.garv.InternProject2.Entity.Server;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ServerRepository extends JpaRepository<Server, Long> {
    Optional<Server> findByJoinCode(String joinCode);
}
