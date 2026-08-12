package com.garv.InternProject2.Util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;

import javax.crypto.SecretKey;
import java.util.Date;

public class JwtUtil {

    // Secret key used to sign and verify tokens
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(
            "GarvSecretKeyForJwtTokenGenerationMustBe32Bytes+".getBytes()
    );

    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour

    // Generate token
    public static String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    // Extract username from token
    public static String extractUsername(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    // Validate token (checks signature + expiry)
    public static boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}