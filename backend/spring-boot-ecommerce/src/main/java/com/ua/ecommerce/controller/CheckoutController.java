package com.ua.ecommerce.controller;

import com.ua.ecommerce.dto.Purchase;
import com.ua.ecommerce.dto.PurchaseResponse;
import com.ua.ecommerce.service.CheckoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("http://localhost:4200")
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    @Autowired
    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/purchase")
    public PurchaseResponse placePurchase(@RequestBody Purchase purchase) {

        return checkoutService.placeOrder(purchase);
    }



}
