package com.garv.InternProject2.Repository;

import com.garv.InternProject2.Entity.UserDbAccess;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDbAccessRepository extends JpaRepository<UserDbAccess, Long> {
    List<UserDbAccess> findByUserId(Long userId);
}