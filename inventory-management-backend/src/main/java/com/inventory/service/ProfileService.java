package com.inventory.service;

import com.inventory.dto.request.ProfileUpdateRequest;
import com.inventory.entity.User;
import com.inventory.exception.BadRequestException;
import com.inventory.repository.UserRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository users;
    private final SecurityUtils securityUtils;

    @Transactional
    public User update(ProfileUpdateRequest req) {
        User me = securityUtils.getCurrentUser();

        // Check if email is being changed and if it is already taken
        if (!me.getEmail().equals(req.getEmail()) && users.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        me.setFirstName(req.getFirstName());
        me.setLastName(req.getLastName());
        me.setPhone(req.getPhone());
        me.setEmail(req.getEmail()); // Update User ID (Email)

        return users.save(me);
    }
}