import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PurchaseBillRequest {
  locationCode: string;
  totalItems: number;
  totalQuantity: number;
  grossTotal: number;
  totalDiscounts: number;
  totalBeforeTax: number;
  netTotal: number;
  items: PurchaseBillItemDto[];
}

export interface PurchaseBillItemDto {
  itemName: string;
  batch: string;
  standardCost: number;
  standardPrice: number;
  margin: number;
  qty: number;
  freeQty: number;
  discount: number;
  totalCost: number;
  totalSelling: number;
}

export interface PurchaseBillResponse {
  success: boolean;
  message: string;
  billId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseBillService {
  private apiUrl = 'https://localhost:7105/api/PurchaseBill';

  constructor(private http: HttpClient) {}

  saveBill(bill: PurchaseBillRequest): Observable<PurchaseBillResponse> {
    return this.http.post<PurchaseBillResponse>(this.apiUrl, bill);
  }

  getAllItems(): Observable<PurchaseBillItemDto[]> {
    return this.http.get<PurchaseBillItemDto[]>(`${this.apiUrl}/items`);
  }
}
