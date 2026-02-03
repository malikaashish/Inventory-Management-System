package com.inventory.config;

import com.inventory.entity.Role;
import com.inventory.entity.User;
import com.inventory.repository.RoleRepository;
import com.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    @Bean
    @Profile("!test") // Runs only when active profile is NOT 'test'
    public CommandLineRunner seed() {
        return args -> {
            // Seed Roles
            if (roleRepository.count() == 0) {
                roleRepository.save(Role.builder().name("ADMIN").description("Admin").build());
                roleRepository.save(Role.builder().name("INVENTORY_STAFF").description("Inventory Staff").build());
                roleRepository.save(Role.builder().name("SALES_EXECUTIVE").description("Sales Executive").build());
                log.info("Default roles created.");
            }

            // Seed Admin User
            if (!userRepository.existsByEmail("admin@inventory.com")) {
                Role adminRole = roleRepository.findByName("ADMIN")
                        .orElseThrow(() -> new IllegalStateException("ADMIN role missing"));

                userRepository.save(User.builder()
                        .email("admin@inventory.com")
                        .passwordHash(encoder.encode("Admin@123"))
                        .firstName("System")
                        .lastName("Administrator")
                        .role(adminRole)
                        .isActive(true)
                        .emailVerified(true)
                        .build());
                log.info("Default admin user created: admin@inventory.com / Admin@123");
            }
        };
    }
}