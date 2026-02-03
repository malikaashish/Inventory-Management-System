package com.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.config.JacksonTestConfig;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.Role;
import com.inventory.entity.Supplier;
import com.inventory.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.HashSet;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(JacksonTestConfig.class)
class BotIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Autowired RoleRepository roleRepository;
    @Autowired UserRepository userRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired SupplierRepository supplierRepository;
    @Autowired ProductRepository productRepository;
    @Autowired ProductSupplierRepository productSupplierRepository;
    @Autowired PurchaseOrderRepository purchaseOrderRepository;
    @Autowired StockAdjustmentRepository stockAdjustmentRepository;
    @Autowired SalesOrderRepository salesOrderRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired NotificationRepository notificationRepository;
    @Autowired TestAuthHelper auth;

    private String adminToken;

    @BeforeEach
    void setup() throws Exception {
        // Cleanup (Children first)
    	notificationRepository.deleteAll();
        stockAdjustmentRepository.deleteAll();
        productSupplierRepository.deleteAll();
        salesOrderRepository.deleteAll();
        purchaseOrderRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        productRepository.deleteAll();
        supplierRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        // Auth Setup
        Role adminRole = auth.ensureRole("ADMIN");
        auth.ensureRole("INVENTORY_STAFF");
        
        auth.ensureUser("admin@x.com", "Admin@123", adminRole);
        adminToken = auth.loginAndGetAccessToken(mvc, "admin@x.com", "Admin@123");
    }

    @Test
    void triggerBot_shouldCreatePurchaseOrder_whenStockIsLow() throws Exception {
        // 1. Setup Data
        Category cat = categoryRepository.save(Category.builder().name("AutoCat").isActive(true).build());
        Supplier sup = supplierRepository.save(Supplier.builder().name("AutoSupplier").isActive(true).build());

        // Create Product with Low Stock & Auto-Reorder Enabled via API (to ensure all links work)
        String createProductJson = """
          {
            "sku": "AUTO-001",
            "name": "Auto Reorder Product",
            "categoryId": %d,
            "unitPrice": 50.00,
            "costPrice": 25.00,
            "quantityOnHand": 5,
            "reorderPoint": 10,
            "reorderQuantity": 100,
            "autoReorderEnabled": true,
            "supplierIds": [%d]
          }
        """.formatted(cat.getId(), sup.getId());

        mvc.perform(post("/products")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createProductJson))
                .andExpect(status().isCreated());

        // 2. Trigger Bot Manually
        mvc.perform(post("/inventory/bot/trigger")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 3. Verify Purchase Order Created
        // We expect 1 PO in ORDERED status with 100 quantity
        mvc.perform(get("/purchases/orders")
                .header("Authorization", "Bearer " + adminToken)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].status").value("ORDERED"))
                .andExpect(jsonPath("$.data.content[0].items[0].quantityOrdered").value(100));
    }
}