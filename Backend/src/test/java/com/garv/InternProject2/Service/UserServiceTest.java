package com.garv.InternProject2.Service;

import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.LoginRequest;
import com.garv.InternProject2.RegisterRequest;
import com.garv.InternProject2.Repository.userRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class UserServiceTest {

    @Mock
    private userRepo userRepository;

    @InjectMocks
    private UserService userService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterNewUser() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);

        String result = userService.register(request);

        assertEquals("User registered successfully.", result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterExistingUser() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        String result = userService.register(request);

        assertEquals("Username already taken.", result);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        User user = new User();
        user.setUsername("testuser");
        user.setPassword(passwordEncoder.encode("password123"));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        String result = userService.login(request);

        assertNotNull(result);
        assertNotEquals("User not found.", result);
        assertNotEquals("Invalid password. Attempts remaining: 2", result);
        assertTrue(result.length() > 50); // It's a JWT token
    }

    @Test
    void testLoginInvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");

        User user = new User();
        user.setUsername("testuser");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFailedAttempts(0);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        String result = userService.login(request);

        assertEquals("Invalid password. Attempts remaining: 2", result);
        verify(userRepository, times(1)).save(user);
    }
}
