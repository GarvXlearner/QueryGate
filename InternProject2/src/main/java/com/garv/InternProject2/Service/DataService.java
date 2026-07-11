package com.garv.InternProject2.Service;

import com.garv.InternProject2.Entity.Database;
import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.Entity.UserDbAccess;
import com.garv.InternProject2.Repository.DatabaseRepo;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Repository.UserDbAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DataService {

    @Autowired
    private UserDbAccessRepository dbaccessrepo;

    @Autowired
    private userRepo userrepo;

    @Autowired
    private DatabaseRepo dbrepo;

    public List<User> getAllUsers() {
        return userrepo.findAll();
    }

    public List<Database> getAllDBS() {
        return dbrepo.findAll();
    }

    public List<UserDbAccess> getmappingbyuser(Long userId) {
        return dbaccessrepo.findByUserId(userId);
    }
}
