import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {
  }

  addToCart(theCartItem: CartItem) {
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;

    if(this.cartItems.length > 0) {

      existingCartItem = this.cartItems.find(tempCArtItem => tempCArtItem.id === theCartItem.id);

      alreadyExistsInCart = (existingCartItem != undefined);

    }

    if(alreadyExistsInCart) existingCartItem!.quantity++;
    else this.cartItems.push(theCartItem);

    this.computeCartTotals();
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if(theCartItem.quantity === 0) this.remove(theCartItem);
    else this.computeCartTotals();

  }

  remove(theCartItem: CartItem) {
    const theIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id == theCartItem.id);

    if(theIndex > -1) {
      this.cartItems.splice(theIndex, 1);
      this.computeCartTotals();
    }

  }


  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += (currentCartItem.unitPrice * currentCartItem.quantity);
      totalQuantityValue += currentCartItem.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart:');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity}, unitPrice: ${tempCartItem.unitPrice}, subTotalPrice: ${subTotalPrice.toFixed(2)}`);
    }
    console.log(`Total price: ${totalPriceValue.toFixed(2)}, Total quantity: ${totalQuantityValue}`);
  }

}
