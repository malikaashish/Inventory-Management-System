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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(JacksonTestConfig.class)
class ProductControllerIntegrationTest {

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
    private Category category;

    @BeforeEach
    void setup() throws Exception {
        // DELETE CHILDREN FIRST
    	notificationRepository.deleteAll();
        stockAdjustmentRepository.deleteAll();
        salesOrderRepository.deleteAll();      // Delete orders first (cascade items)
        purchaseOrderRepository.deleteAll();   // Delete orders first (cascade items)
        
        refreshTokenRepository.deleteAll();
        
        productRepository.deleteAll();
        //supplierRepository.deleteAll();        // Delete suppliers before users? (usually optional unless constrained)
        categoryRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        // SETUP
        Role adminRole = auth.ensureRole("ADMIN");
        auth.ensureRole("INVENTORY_STAFF");
        auth.ensureRole("SALES_EXECUTIVE");

        auth.ensureUser("admin@x.com", "Admin@123", adminRole);
        adminToken = auth.loginAndGetAccessToken(mvc, "admin@x.com", "Admin@123");

        category = categoryRepository.save(Category.builder().name("Cat1").isActive(true).build());
    }

    @Test
    void create_and_list_products() throws Exception {
        String create = """
          {
            "sku":"SKU-001",
            "name":"Product 1",
            "description":"D",
            "categoryId": %d,
            "unitPrice": 99.99,
            "costPrice": 50.00,
            "quantityOnHand": 100,
            "reorderPoint": 10,
            "reorderQuantity": 50,
            "unitOfMeasure":"UNIT"
          }
        """.formatted(category.getId());

        mvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(create))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sku").value("SKU-001"));

        mvc.perform(get("/products")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }
}