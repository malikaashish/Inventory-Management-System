package com.inventory.service;

import com.inventory.dto.request.PasswordChangeRequest;
import com.inventory.exception.BadRequestException;
import com.inventory.repository.UserRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final SecurityUtils securityUtils;

    @Transactional
    public void change(PasswordChangeRequest req) {
        var me = securityUtils.getCurrentUser();

        if (!encoder.matches(req.getCurrentPassword(), me.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }

        if (encoder.matches(req.getNewPassword(), me.getPasswordHash())) {
            throw new BadRequestException("New password must be different from current password");
        }

        me.setPasswordHash(encoder.encode(req.getNewPassword()));
        users.save(me);
    }

    /**
     * For real production: generate token + email.
     * Here: do nothing observable to prevent email enumeration.
     */
    @Transactional
    public void forgot(String email) {
        users.findByEmail(email).ifPresent(u -> {
            // no-op placeholder
        });
    }
}