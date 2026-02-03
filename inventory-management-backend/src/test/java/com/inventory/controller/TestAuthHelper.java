package com.inventory.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.inventory.entity.Role;
import com.inventory.entity.User;
import com.inventory.repository.RoleRepository;
import com.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@Component
@RequiredArgsConstructor
public class TestAuthHelper {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Transactional
    public Role ensureRole(String name) {
        return roleRepository.findByName(name).orElseGet(() ->
                roleRepository.saveAndFlush(Role.builder().name(name).description(name).build())
        );
    }

    @Transactional
    public User ensureUser(String email, String rawPassword, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            return userRepository.findByEmail(email).get();
        }
        return userRepository.saveAndFlush(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .firstName("Test")
                .lastName("User")
                .role(role)
                .department("General") // <-- Added default department
                .isActive(true)
                .emailVerified(true)
                .build());
    }

    public String loginAndGetAccessToken(MockMvc mvc, String email, String password) throws Exception {
        String body = """
            { "email": "%s", "password": "%s" }
        """.formatted(email, password);

        String json = mvc.perform(post("/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(body))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode node = objectMapper.readTree(json);
        if (node.has("data") && node.get("data").has("accessToken")) {
            return node.get("data").get("accessToken").asText();
        }
        throw new RuntimeException("Login failed or token missing: " + json);
    }
}