package com.inventory.scheduler;

import com.inventory.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokens;

    @Scheduled(cron = "0 0 0 * * *") // daily at midnight
    @Transactional
    public void cleanupExpired() {
        log.info("Cleaning expired refresh tokens...");
        refreshTokens.deleteExpiredTokens(LocalDateTime.now());
    }
}