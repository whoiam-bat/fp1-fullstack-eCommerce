package com.ua.ecommerce.service;

import com.ua.ecommerce.dto.Purchase;
import com.ua.ecommerce.dto.PurchaseResponse;


public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

}
