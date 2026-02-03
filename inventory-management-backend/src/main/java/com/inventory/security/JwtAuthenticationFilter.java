package com.inventory.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwt;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {

        try {
            String header = request.getHeader("Authorization");
            if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
                chain.doFilter(request, response);
                return;
            }

            String token = header.substring(7);
            if (!jwt.validate(token)) {
                System.err.println("TEST DEBUG: JWT Validation Failed");
                chain.doFilter(request, response);
                return;
            }

            String email = jwt.extractUsername(token);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails user = userDetailsService.loadUserByUsername(email);
                    if (jwt.isTokenValid(token, user)) {
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } else {
                        System.err.println("TEST DEBUG: Token invalid for user " + email);
                    }
                } catch (UsernameNotFoundException e) {
                    System.err.println("TEST DEBUG: User not found: " + email);
                }
            }
        } catch (Exception e) {
            System.err.println("TEST DEBUG: Filter Exception: " + e.getMessage());
            e.printStackTrace();
        }

        chain.doFilter(request, response);
    }
}