package com.ua.ecommerce.dto;

import com.ua.ecommerce.entity.Address;
import com.ua.ecommerce.entity.Customer;
import com.ua.ecommerce.entity.Order;
import com.ua.ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {

    private Customer customer;

    private Address shippingAddress;

    private Address billingAddress;

    private Order order;

    private Set<OrderItem> orderItems;

}
