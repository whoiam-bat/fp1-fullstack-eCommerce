package com.ua.ecommerce.service;

import com.ua.ecommerce.dto.Purchase;
import com.ua.ecommerce.dto.PurchaseResponse;
import com.ua.ecommerce.entity.Customer;
import com.ua.ecommerce.entity.Order;
import com.ua.ecommerce.entity.OrderItem;
import com.ua.ecommerce.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.beans.Transient;
import java.util.Set;
import java.util.UUID;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    private final CustomerRepository customerRepository;


    @Autowired
    public CheckoutServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }


    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {

        Order order = purchase.getOrder();

        String trackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(trackingNumber);

        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(order::addOrderItem);

        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        Customer customer = purchase.getCustomer();
        customer.addOrder(order);

        customerRepository.save(customer);

        return new PurchaseResponse(trackingNumber);
    }

    private String generateOrderTrackingNumber() {
        return UUID.randomUUID().toString();
    }
}
