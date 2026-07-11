package com.garv.InternProject2.Repository;

import com.garv.InternProject2.Entity.Database;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DatabaseRepo extends JpaRepository<Database, Long> {
}