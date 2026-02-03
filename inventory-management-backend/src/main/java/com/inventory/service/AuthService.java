package com.inventory.service;

import com.inventory.dto.request.LoginRequest;
import com.inventory.dto.request.RegisterRequest;
import com.inventory.dto.response.JwtResponse;
import com.inventory.entity.RefreshToken;
import com.inventory.entity.Role;
import com.inventory.entity.User;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.UnauthorizedException;
import com.inventory.repository.RefreshTokenRepository;
import com.inventory.repository.RoleRepository;
import com.inventory.repository.UserRepository;
import com.inventory.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final RoleRepository roles;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;

    @Value("${jwt.expiration}")
    private long accessTtlMs;

    @Value("${jwt.refresh-expiration}")
    private long refreshTtlMs;

    @Transactional
    public JwtResponse login(LoginRequest req) {
        // 1. Check user exists
        User user = users.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // 2. Strict Role Validation
        if (req.getRole() != null && !req.getRole().isEmpty()) {
            String actualRole = user.getRole().getName();
            String requestedRole = req.getRole();
            
            if (!actualRole.equals(requestedRole)) {
                // Clear, human-readable error message
                throw new UnauthorizedException(
                    String.format("Role mismatch: You tried to login as %s, but this account is %s.", 
                    requestedRole.replace('_', ' '), actualRole.replace('_', ' '))
                );
            }
        }

        // 3. Status checks
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UnauthorizedException("User account is deactivated");
        }
        if (user.isAccountLocked()) {
            throw new UnauthorizedException("Account is locked due to too many failed attempts");
        }

        // 4. Authenticate
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );

            UserDetails principal = (UserDetails) auth.getPrincipal();
            String access = jwt.generateAccessToken(principal);
            String refresh = jwt.generateRefreshToken(principal);

            // 5. Manage tokens
            refreshTokens.revokeAllForUser(user.getId());

            RefreshToken rt = RefreshToken.builder()
                    .user(user)
                    .token(refresh)
                    .expiresAt(LocalDateTime.now().plusNanos(refreshTtlMs * 1_000_000L))
                    .revoked(false)
                    .build();
            refreshTokens.save(rt);

            user.setLastLogin(LocalDateTime.now());
            users.save(user);

            return buildJwtResponse(user, access, refresh);

        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Transactional
    public JwtResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role role = roles.findById(req.getRoleId())
                .orElseThrow(() -> new BadRequestException("Invalid roleId"));

        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(encoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .role(role)
                .isActive(true)
                .emailVerified(false)
                .build();

        user = users.save(user);

        UserDetails details = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + role.getName())
                .build();

        String access = jwt.generateAccessToken(details);
        String refresh = jwt.generateRefreshToken(details);

        refreshTokens.revokeAllForUser(user.getId());
        refreshTokens.save(RefreshToken.builder()
                .user(user)
                .token(refresh)
                .expiresAt(LocalDateTime.now().plusNanos(refreshTtlMs * 1_000_000L))
                .revoked(false)
                .build());

        return buildJwtResponse(user, access, refresh);
    }

    @Transactional
    public JwtResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }

        if (!jwt.validate(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        RefreshToken stored = refreshTokens.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        if (!stored.isValid()) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        String email = jwt.extractUsername(refreshToken);
        User user = users.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        stored.setRevoked(true);
        refreshTokens.save(stored);

        UserDetails details = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().getName())
                .build();

        String newAccess = jwt.generateAccessToken(details);
        String newRefresh = jwt.generateRefreshToken(details);

        refreshTokens.save(RefreshToken.builder()
                .user(user)
                .token(newRefresh)
                .expiresAt(LocalDateTime.now().plusNanos(refreshTtlMs * 1_000_000L))
                .revoked(false)
                .build());

        return buildJwtResponse(user, newAccess, newRefresh);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        refreshTokens.findByToken(refreshToken).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokens.save(rt);
        });
    }

    private JwtResponse buildJwtResponse(User user, String access, String refresh) {
        return JwtResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .expiresIn(accessTtlMs / 1000)
                .user(JwtResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole() != null ? user.getRole().getName() : null)
                        .build())
                .build();
    }
}