package com.garv.InternProject2.Service;

import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.LoginRequest;
import com.garv.InternProject2.RegisterRequest;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private userRepo userRepository;
    private final BCryptPasswordEncoder passwordEncoder=new BCryptPasswordEncoder();

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return "Username already taken.";
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return "User registered successfully.";
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElse(null);

        if (user == null) return "User not found.";

        if (user.isLocked()) return "Account lock hogya";

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= 3) {
                user.setLocked(true);
                userRepository.save(user);
                return "Account lock krdia becuase too many unsuccesfull login attempt .";
            }
            userRepository.save(user);
            return "Invalid password. Attempts remaining: " + (3 - user.getFailedAttempts());
        }

        user.setFailedAttempts(0);
        userRepository.save(user);
        return JwtUtil.generateToken(user.getUsername());
    }
}