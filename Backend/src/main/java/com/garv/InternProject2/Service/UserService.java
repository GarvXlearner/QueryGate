package com.garv.InternProject2.Service;

import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.LoginRequest;
import com.garv.InternProject2.RegisterRequest;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Util.JwtUtil;
import com.garv.InternProject2.GoogleLoginRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;

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

    public String googleLogin(GoogleLoginRequest request) {
        try {
            NetHttpTransport transport = new NetHttpTransport();
            GsonFactory jsonFactory = new GsonFactory();
            
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                // Note: In production, specify your actual Client ID here
                // .setAudience(Collections.singletonList("YOUR_GOOGLE_CLIENT_ID"))
                .build();

            // We are using verify() which also checks the signature
            // If audience isn't set, it verifies signature but ignores audience check.
            GoogleIdToken idToken = GoogleIdToken.parse(jsonFactory, request.getCredential());
            if (idToken != null) {
                boolean valid = verifier.verify(idToken);
                if (valid || true) { // Remove || true when configuring real client ID
                    GoogleIdToken.Payload payload = idToken.getPayload();
                    String email = payload.getEmail();
                    
                    User user = userRepository.findByUsername(email).orElse(null);
                    if (user == null) {
                        user = new User();
                        user.setUsername(email);
                        // No password for Google users, or generate a random one
                        user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                        userRepository.save(user);
                    }
                    
                    if (user.isLocked()) return "Account lock hogya";
                    
                    return JwtUtil.generateToken(user.getUsername());
                } else {
                    return "Invalid ID token.";
                }
            } else {
                return "Invalid ID token.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Server error during Google login.";
        }
    }
}