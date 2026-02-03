package com.inventory.service;

import com.inventory.entity.Product;
import com.inventory.entity.SalesOrder;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.SalesOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ProductRepository products;
    private final SalesOrderRepository salesOrders;

    public byte[] exportProductsToCsv() {
        List<Product> list = products.findByIsActiveTrue();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter w = new PrintWriter(out);

        w.println("SKU,Name,Category,Quantity,ReorderPoint,CostPrice,UnitPrice,TotalValue");
        for (Product p : list) {
            w.printf("%s,%s,%s,%d,%d,%s,%s,%s%n",
                    esc(p.getSku()),
                    esc(p.getName()),
                    esc(p.getCategory() != null ? p.getCategory().getName() : ""),
                    p.getQuantityOnHand() == null ? 0 : p.getQuantityOnHand(),
                    p.getReorderPoint() == null ? 0 : p.getReorderPoint(),
                    nvl(p.getCostPrice()),
                    nvl(p.getUnitPrice()),
                    nvl(p.getTotalValue())
            );
        }

        w.flush();
        return out.toByteArray();
    }

    public byte[] exportSalesOrdersToCsv(LocalDateTime start, LocalDateTime end) {
        List<SalesOrder> list = salesOrders.findByOrderDateBetween(start, end);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter w = new PrintWriter(out);

        w.println("OrderNumber,Customer,OrderDate,Status,Subtotal,Tax,Discount,Total");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (SalesOrder o : list) {
            w.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
                    esc(o.getOrderNumber()),
                    esc(o.getCustomer() != null ? o.getCustomer().getName() : "Walk-in"),
                    o.getOrderDate() != null ? esc(o.getOrderDate().format(fmt)) : "",
                    o.getStatus() != null ? esc(o.getStatus().name()) : "", // Fix: check null status
                    nvl(o.getSubtotal()),
                    nvl(o.getTaxAmount()),
                    nvl(o.getDiscountAmount()),
                    nvl(o.getTotalAmount())
            );
        }

        w.flush();
        return out.toByteArray();
    }

    private String nvl(Object v) {
        return v == null ? "" : v.toString();
    }

    private String esc(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}