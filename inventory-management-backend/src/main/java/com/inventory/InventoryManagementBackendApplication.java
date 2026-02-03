package com.inventory;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class InventoryManagementBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(InventoryManagementBackendApplication.class, args);
	}
	 @PostConstruct
	    public void init() {
	        // Set JVM timezone to UTC (or change to "Asia/Kolkata" if your DB is local IST)
	        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
	    }
}
