package com.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.config.JacksonTestConfig;
import com.inventory.entity.Category;
import com.inventory.entity.Role;
import com.inventory.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(JacksonTestConfig.class)
class InventoryControllerIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Autowired RoleRepository roleRepository;
    @Autowired UserRepository userRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired ProductRepository productRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired StockAdjustmentRepository stockAdjustmentRepository;
    @Autowired SalesOrderRepository salesOrderRepository;       // Add this
    @Autowired PurchaseOrderRepository purchaseOrderRepository; // Add this
    @Autowired SupplierRepository supplierRepository;           // Add this
    @Autowired NotificationRepository notificationRepository;
    @Autowired TestAuthHelper auth;

    private String adminToken;
    private Long productId;

    @BeforeEach
    void setup() throws Exception {
    	 notificationRepository.deleteAll();
        stockAdjustmentRepository.deleteAll();
        salesOrderRepository.deleteAll();
        purchaseOrderRepository.deleteAll();
        
        refreshTokenRepository.deleteAll();
        
        productRepository.deleteAll();
        supplierRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        Role adminRole = auth.ensureRole("ADMIN");
        auth.ensureRole("INVENTORY_STAFF");
        auth.ensureRole("SALES_EXECUTIVE");

        auth.ensureUser("admin@x.com", "Admin@123", adminRole);
        adminToken = auth.loginAndGetAccessToken(mvc, "admin@x.com", "Admin@123");

        Category cat = categoryRepository.save(Category.builder().name("Cat").isActive(true).build());

        String createProduct = """
          {
            "sku":"INV-001",
            "name":"Inv Product",
            "categoryId": %d,
            "unitPrice": 10.00,
            "costPrice": 5.00,
            "quantityOnHand": 100,
            "reorderPoint": 10,
            "reorderQuantity": 50,
            "unitOfMeasure":"UNIT"
          }
        """.formatted(cat.getId());

        String resp = mvc.perform(post("/products")
                        .header("Authorization","Bearer "+adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createProduct))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        productId = objectMapper.readTree(resp).get("data").get("id").asLong();
    }

    @Test
    void adjust_stock_increase() throws Exception {
        String adjust = """
          {
            "productId": %d,
            "adjustmentType": "INCREASE",
            "quantity": 25,
            "reason":"Received"
          }
        """.formatted(productId);

        mvc.perform(post("/inventory/adjust")
                        .header("Authorization","Bearer "+adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(adjust))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.quantityBefore").value(100))
                .andExpect(jsonPath("$.data.quantityAfter").value(125));
    }
}