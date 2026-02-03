package com.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.config.JacksonTestConfig;
import com.inventory.entity.Category;
import com.inventory.entity.Role;
import com.inventory.entity.Supplier;
import com.inventory.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print; // <--- ADD THIS

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(JacksonTestConfig.class)
class OrdersIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Autowired RoleRepository roleRepository;
    @Autowired UserRepository userRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired SupplierRepository supplierRepository;
    @Autowired ProductRepository productRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired StockAdjustmentRepository stockAdjustmentRepository;
    @Autowired SalesOrderRepository salesOrderRepository;
    @Autowired PurchaseOrderRepository purchaseOrderRepository;
    @Autowired NotificationRepository notificationRepository;
    @Autowired TestAuthHelper auth;

    private String adminToken;
    private String salesToken;
    private String staffToken;

    private Long productId;
    private Long supplierId;

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
        Role salesRole = auth.ensureRole("SALES_EXECUTIVE");
        Role staffRole = auth.ensureRole("INVENTORY_STAFF");

        auth.ensureUser("admin@x.com","Admin@123", adminRole);
        auth.ensureUser("sales@x.com","Sales@123", salesRole);
        auth.ensureUser("staff@x.com","Staff@123", staffRole);

        adminToken = auth.loginAndGetAccessToken(mvc,"admin@x.com","Admin@123");
        salesToken = auth.loginAndGetAccessToken(mvc,"sales@x.com","Sales@123");
        staffToken = auth.loginAndGetAccessToken(mvc,"staff@x.com","Staff@123");

        Category cat = categoryRepository.save(Category.builder().name("Cat").isActive(true).build());
        Supplier sup = supplierRepository.save(Supplier.builder().name("Sup").isActive(true).build());
        supplierId = sup.getId();

        String createProduct = """
          {
            "sku":"ORD-001",
            "name":"Order Product",
            "categoryId": %d,
            "unitPrice": 20.00,
            "costPrice": 10.00,
            "quantityOnHand": 50,
            "reorderPoint": 5,
            "reorderQuantity": 20,
            "unitOfMeasure":"UNIT"
          }
        """.formatted(cat.getId());

        String created = mvc.perform(post("/products")
                        .header("Authorization","Bearer "+adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createProduct))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        productId = objectMapper.readTree(created).get("data").get("id").asLong();
    }

    @Test
    void salesOrder_create_then_cancel_restores_stock() throws Exception {
        String createSO = """
          {
            "customerId": null,
            "items": [{"productId": %d, "quantity": 5, "unitPrice": null, "discountPercent": 0}],
            "taxAmount": 0,
            "discountAmount": 0,
            "shippingAddress": "X",
            "notes": "N"
          }
        """.formatted(productId);

        String soJson = mvc.perform(post("/sales/orders")
                        .header("Authorization","Bearer "+salesToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createSO))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long soId = objectMapper.readTree(soJson).get("data").get("id").asLong();

        // Print error details on failure
        mvc.perform(patch("/sales/orders/" + soId + "/status")
                        .header("Authorization","Bearer "+salesToken)
                        .param("status","CANCELLED"))
                .andDo(print()) // <--- THIS WILL SHOW THE ERROR
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        mvc.perform(get("/products/" + productId)
                        .header("Authorization","Bearer "+adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.quantityOnHand").value(50));
    }

    @Test
    void purchaseOrder_create_then_receive_increases_stock() throws Exception {
        String createPO = """
          {
            "supplierId": %d,
            "expectedDate": null,
            "items": [{"productId": %d, "quantity": 10, "unitCost": 9.50}],
            "taxAmount": 0,
            "shippingCost": 0,
            "notes": "PO"
          }
        """.formatted(supplierId, productId);

        String poJson = mvc.perform(post("/purchases/orders")
                        .header("Authorization","Bearer "+staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPO))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long poId = objectMapper.readTree(poJson).get("data").get("id").asLong();
        long itemId = objectMapper.readTree(poJson).get("data").get("items").get(0).get("id").asLong();

        mvc.perform(patch("/purchases/orders/" + poId + "/status")
                        .header("Authorization","Bearer "+staffToken)
                        .param("status","ORDERED"))
                .andExpect(status().isOk());

        String receive = """
          [{"itemId": %d, "quantity": 10}]
        """.formatted(itemId);

        // Print error details on failure
        mvc.perform(post("/purchases/orders/" + poId + "/receive")
                        .header("Authorization","Bearer "+staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(receive))
                .andDo(print()) // <--- THIS WILL SHOW THE ERROR
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", anyOf(is("RECEIVED"), is("PARTIALLY_RECEIVED"))));

        mvc.perform(get("/products/" + productId)
                        .header("Authorization","Bearer "+adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.quantityOnHand").value(60));
    }

    // ... (rest of the file remains same) ...
    @Test
    void export_dashboard_reports_work_for_admin() throws Exception {
        // ... (unchanged) ...
        mvc.perform(get("/dashboard").header("Authorization","Bearer "+adminToken)).andExpect(status().isOk());
        // ...
    }
}