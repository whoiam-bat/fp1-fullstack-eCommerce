import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';

@Injectable({
  providedIn: 'root'
})
export class PaymentFromService {

  private countriesUrl = "http://localhost:8080/api/countries"
  private statesUrl = "http://localhost:8080/api/states"

  constructor(private httpClient: HttpClient) { }


  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    )
  }


  getStates(theCountryCode: string): Observable<State[]> {
    const searchStatesUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`

    return this.httpClient.get<GetResponseStates>(searchStatesUrl).pipe(
      map(response => response._embedded.states)
    )
  }




  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    for (let i = startMonth; i <= 12; i++) {
      data.push(i);
    }

    return of(data)
  }

  getCreditCardYears(): Observable<number[]> {
    let years: number[] = [];

    let currentYear: number = new Date().getFullYear();

    for (let i = currentYear; i < currentYear + 11; i++) {
      years.push(i);
    }

    return of(years)
  }
}


interface GetResponseCountries {
  _embedded: {
    countries: Country[]
  }
}

interface GetResponseStates {
  _embedded: {
    states: State[]
  }
}

