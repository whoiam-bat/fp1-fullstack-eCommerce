import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Country} from 'src/app/common/country';
import {State} from 'src/app/common/state';
import {PaymentFromService} from 'src/app/services/payment-form.service';
import {CheckoutFormValidator} from 'src/app/validators/checkout-form-validator';
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup

  totalPrice: number = 0
  totalQuantity: number = 0

  creditCardYears: number[] = []
  creditCardMonths: number[] = []

  countries: Country[] = []
  shippingStates: State[] = []
  billingStates: State[] = []


  constructor(private formBuilder: FormBuilder,
              private paymentFormService: PaymentFromService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) {
  }

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), CheckoutFormValidator.notOnlyWhiteSpaces]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(3), CheckoutFormValidator.notOnlyWhiteSpaces]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
        ])
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [Validators.required, CheckoutFormValidator.notOnlyWhiteSpaces]),
        city: new FormControl('', [Validators.required]),
        state: new FormControl('', [Validators.required, CheckoutFormValidator.notOnlyWhiteSpaces]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(3), CheckoutFormValidator.notOnlyWhiteSpaces])
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [Validators.required, CheckoutFormValidator.notOnlyWhiteSpaces]),
        city: new FormControl('', [Validators.required]),
        state: new FormControl('', [Validators.required, CheckoutFormValidator.notOnlyWhiteSpaces]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(3), CheckoutFormValidator.notOnlyWhiteSpaces])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), CheckoutFormValidator.notOnlyWhiteSpaces]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: [''],
      })
    })

    const startMonth: number = new Date().getMonth() + 1

    this.paymentFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data
      }
    )

    this.paymentFormService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data
      }
    )

    this.paymentFormService.getCountries().subscribe(
      data => {
        this.countries = data
      }
    )
  }

  onSubmit(): void {

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order: Order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;
    let orderItems = cartItems.map(it => new OrderItem(it));

    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;

    const shippingState = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry = JSON.parse(JSON.stringify(purchase.shippingAddress.country));

    purchase.shippingAddress.state = shippingState;
    purchase.shippingAddress.country = shippingCountry;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;

    const billingState = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry = JSON.parse(JSON.stringify(purchase.billingAddress.country));

    purchase.billingAddress.state = billingState;
    purchase.billingAddress.country = billingCountry;


    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order tracking number has been received!
                \nOrder tracking number: ${response.orderTrackingNumber}`);

        this.resetCart();
        },
      error: err => {
        alert(`There was an error: ${err.message}`);
      }
    });
  }

  copyShippingToBillingAddress(event: any): void {
    if (event.target.checked) {

      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value)

      this.billingStates = this.shippingStates
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset()

      this.billingStates = []
    }
  }

  handleMonthsAndYears(): void {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard')

    const currentYear: number = new Date().getFullYear()
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear)

    let startMonth: number

    if (selectedYear === currentYear) startMonth = new Date().getMonth() + 1
    else startMonth = 1


    this.paymentFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data
      })
  }

  getStates(formGroupName: string): void {
    const formGroup = this.checkoutFormGroup.get(formGroupName)

    const countryCode = formGroup?.value.country.code
    const countryName = formGroup?.value.country.name

    this.paymentFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') this.shippingStates = data;
        else this.billingStates = data;

        formGroup?.get('state')?.setValue(data[0])
      }
    )
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }


  get shippingStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }

  get shippingState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }

  get shippingZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get shippingCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }

  get shippingCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }


  get billingStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }

  get billingState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }

  get billingZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get billingCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }

  get billingCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }


  get cardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }

  get nameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }

  get cardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }

  get securityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  private reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  private resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl("/products");
  }
}
