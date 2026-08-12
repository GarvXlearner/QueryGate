package com.garv.InternProject2.Repository;

import com.garv.InternProject2.Entity.Server;
import com.garv.InternProject2.Entity.ServerMember;
import com.garv.InternProject2.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServerMemberRepository extends JpaRepository<ServerMember, Long> {
    boolean existsByServerAndUser(Server server, User user);
}
