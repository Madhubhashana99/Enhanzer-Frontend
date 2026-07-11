import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { LocationService, Location } from '../../core/services/location.service';
import { PurchaseBillService } from '../../core/services/purchase-bill.service';

interface PurchaseBillItem {
  item: string;
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

@Component({
  selector: 'app-purchase-bill',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchase-bill.html',
  styleUrl: './purchase-bill.scss',
})
export class PurchaseBill implements OnInit {
  itemForm: FormGroup;
  locations: Location[] = [];
  addedItems: PurchaseBillItem[] = [];
  availableItems: string[] = ['Mango', 'Apple', 'Banana', 'Orange', 'Grapes', 'Kiwi', 'Strawberry'];
  filteredItems: string[] = [];
  selectedLocationCode: string = '';
  saveSuccess: string = '';
  saveError: string = '';

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private purchaseBillService: PurchaseBillService,
    private cdr: ChangeDetectorRef
  ) {
    this.itemForm = this.fb.group({
      item: ['', Validators.required],
      batch: [''],
      standardCost: [0, [Validators.required, Validators.min(0)]],
      standardPrice: [0, [Validators.required, Validators.min(0)]],
      margin: [0],
      qty: [1, [Validators.required, Validators.min(1)]],
      freeQty: [0, Validators.min(0)],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      totalCost: [{ value: 0, disabled: true }],
      totalSelling: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.locationService.getLocations().subscribe({
      next: (locs) => { this.locations = locs; },
      error: (err) => { console.error('Failed to load locations', err); }
    });

    this.loadAllItems();

    // Recalculate totals whenever input changes
    this.itemForm.valueChanges.subscribe(values => {
      this.calculateTotals(values);
    });

    // Autocomplete filtering
    this.itemForm.get('item')?.valueChanges.subscribe(val => {
      this.filteredItems = val
        ? this.availableItems.filter(i => i.toLowerCase().includes(val.toLowerCase()))
        : [];
    });
  }

  loadAllItems(): void {
    this.purchaseBillService.getAllItems().subscribe({
      next: (items) => {
        if (items && items.length > 0) {
          this.addedItems = items.map(item => ({
            item: item.itemName,
            batch: item.batch,
            standardCost: item.standardCost,
            standardPrice: item.standardPrice,
            margin: item.margin,
            qty: item.qty,
            freeQty: item.freeQty,
            discount: item.discount,
            totalCost: item.totalCost,
            totalSelling: item.totalSelling
          }));
        } else {
          this.addedItems = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => { console.error('Failed to load purchase bill items', err); }
    });
  }

  calculateTotals(values: any): void {
    const cost = parseFloat(values.standardCost) || 0;
    const price = parseFloat(values.standardPrice) || 0;
    const qty = parseFloat(values.qty) || 0;
    const discount = parseFloat(values.discount) || 0;

    const totalCost = (cost * qty) - ((cost * qty * discount) / 100);
    const totalSelling = price * qty;

    this.itemForm.patchValue({
      totalCost: +totalCost.toFixed(2),
      totalSelling: +totalSelling.toFixed(2)
    }, { emitEvent: false });
  }

  selectItem(itemName: string) {
    this.itemForm.patchValue({ item: itemName });
    this.filteredItems = [];
  }

  addItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const rawValues = this.itemForm.getRawValue();
    this.addedItems = [...this.addedItems, rawValues]; // trigger change detection
    this.itemForm.reset({
      item: '', batch: '', standardCost: 0, standardPrice: 0,
      margin: 0, qty: 1, freeQty: 0, discount: 0, totalCost: 0, totalSelling: 0
    });
    this.filteredItems = [];
  }

  removeItem(index: number): void {
    this.addedItems = this.addedItems.filter((_, i) => i !== index);
  }

  // ---- Computed summary ----

  get totalItemsCount(): number {
    return this.addedItems.length;
  }

  get totalQuantity(): number {
    return this.addedItems.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  }

  get grossTotal(): number {
    return this.addedItems.reduce((sum, i) => sum + ((Number(i.standardCost) || 0) * (Number(i.qty) || 0)), 0);
  }

  get itemDiscount(): number {
    return this.addedItems.reduce((sum, i) => {
      return sum + ((Number(i.standardCost) || 0) * (Number(i.qty) || 0) * (Number(i.discount) || 0)) / 100;
    }, 0);
  }

  get overallDiscount(): number { return 0; }

  get totalDiscounts(): number {
    return this.itemDiscount + this.overallDiscount;
  }

  get totalBeforeTax(): number {
    return this.grossTotal - this.totalDiscounts;
  }

  // ---- Save Bill ----

  saveBill(): void {
    this.saveSuccess = '';
    this.saveError = '';

    if (this.addedItems.length === 0) {
      this.saveError = 'Cannot save an empty bill. Please add at least one item.';
      return;
    }

    const billPayload = {
      locationCode: this.selectedLocationCode || 'N/A',
      totalItems: this.totalItemsCount,
      totalQuantity: this.totalQuantity,
      grossTotal: this.grossTotal,
      totalDiscounts: this.totalDiscounts,
      totalBeforeTax: this.totalBeforeTax,
      netTotal: this.totalBeforeTax,
      items: this.addedItems.map(i => ({
        itemName: i.item,
        batch: i.batch || '',
        standardCost: Number(i.standardCost) || 0,
        standardPrice: Number(i.standardPrice) || 0,
        margin: Number(i.margin) || 0,
        qty: Number(i.qty) || 0,
        freeQty: Number(i.freeQty) || 0,
        discount: Number(i.discount) || 0,
        totalCost: Number(i.totalCost) || 0,
        totalSelling: Number(i.totalSelling) || 0
      }))
    };

    this.purchaseBillService.saveBill(billPayload).subscribe({
      next: (res) => {
        if (res.success) {
          this.saveSuccess = `Purchase Bill #${res.billId} saved successfully!`;
          this.selectedLocationCode = '';
          this.itemForm.reset({
            item: '', batch: '', standardCost: 0, standardPrice: 0,
            margin: 0, qty: 1, freeQty: 0, discount: 0, totalCost: 0, totalSelling: 0
          });
          // Reload all items from the database to keep showing existing data
          this.loadAllItems();
        } else {
          this.saveError = `Failed to save: ${res.message}`;
        }
      },
      error: (err) => {
        console.error('Save error', err);
        this.saveError = 'An error occurred while saving the bill. Check that the backend is running.';
      }
    });
  }
}
