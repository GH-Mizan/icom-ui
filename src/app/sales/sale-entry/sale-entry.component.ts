import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { AppComponentBase } from "../../../shared/app-component-base";
import { ClientServiceProxy, ComboboxItemDto, DueReceivedHistoryDto, PaymentStatus, PricelistServiceProxy, ProductServiceProxy, SalesDetailsEntryDto, SalesEntryDto, SalesEntryInputDto, SalesServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from "ngx-bootstrap/modal";
import moment from "moment";
import { debounceTime, distinctUntilChanged, firstValueFrom, map, Observable } from "rxjs";

@Component({
    selector: 'app-sale-entry',
    templateUrl: './sale-entry.component.html',
    standalone: false,
    styles: [
        `
            /* Chrome, Safari, Edge, Opera */
            input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            /* Firefox */
            input[type=number] {
                -moz-appearance: textfield;
            }
                       
        `
    ]
})

export class SaleEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();
    model: SalesEntryDto;

    products: ComboboxItemDto[];
    hasSerial: boolean;
    clients: ComboboxItemDto[];
    selectedClient: any;
    serials: ComboboxItemDto[];
    productId: string = "";
    productObj: any;
    date = new Date();
    // invoiceNumber: string;
    serialNo: string;
    availableQuantity: number = 0;
    quantity: number = 0;
    unitPrice: number = 0;
    totalPrice: number = 0;
    //discount: number = 0;
    //netAmount: number = 0;
    //paidAmount: number = 0;
    //dueAmount: number = 0;
    remarks: string;
    saleDetails: SalesDetailsEntryDto[] = [];

    saving = false;
    loading = true;

    totalValues: any;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _pricelistService: PricelistServiceProxy,
        private readonly _productService: ProductServiceProxy,
        private readonly _salesService: SalesServiceProxy,
        private readonly _clientService: ClientServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);

    }

    async ngOnInit() {
        await Promise.all([
            this.loadProducts(),
            this.loadClients()
        ]);
        this.loading = false;
        this.cd.detectChanges();
    }

    // search = (text$: Observable<string>) =>
    //     text$.pipe(
    //         debounceTime(200),
    //         distinctUntilChanged(),
    //         map(term => term === '' ? [] : this.products.filter(v => v.displayText.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    //     );

    onProductChanged() {
        this.saving = true;
        this.availableQuantity = 0;
        this.serials = [];
        this.cd.detectChanges();
        this.productId = this.productObj.value;
        this._pricelistService.getProductSerials(parseInt(this.productId)).subscribe(res => {
            this.hasSerial = res.hasSerial;
            this.availableQuantity = res.availableQuantity;
            if (res.serials) {
                res.serials.forEach((s) => {
                    this.serials.push({ value: s, displayText: s } as ComboboxItemDto);
                })
            }
            this.saving = false;
            this.cd.detectChanges();
        })
    }

    onSerialChanged() {
        this.saving = true;
        this.availableQuantity = 0;
        this.cd.detectChanges();
        this._pricelistService.getQuantity(parseInt(this.productId), this.serialNo).subscribe(res => {
            this.availableQuantity = res;
            this.saving = false;
            this.cd.detectChanges();
        })
    }

    async loadProducts() {
        this.products = await firstValueFrom(this._pricelistService.getProductsSelectList());
        this.cd.detectChanges();
    }

    async loadClients() {
        this.clients = await firstValueFrom(this._clientService.getClientsSelectList());
        this.cd.detectChanges();
    }

    save() {
        this.saving = true;
        //this.model.sales.date = moment(this.date);
        //this.model.clientId = parseInt(this.selectedClient.value);
        //this.model.productsJson = JSON.stringify(this.saleProducts);

        

        const model = this.model;
        model.date = moment(this.date);
        model.clientId = parseInt(this.selectedClient.value);
        model.totalAmount = this.totalValues.totalAmount;
        model.paymentStatus = model.dueAmount == 0 ? PaymentStatus._1 : model.netAmount == model.dueAmount ? PaymentStatus._3 : PaymentStatus._2;

        const details: SalesDetailsEntryDto[] = [];
        this.saleDetails.filter(f => f.quantity > 0 && f.totalPrice > 0).forEach(x => {
            details.push({
                productId: x.productId,
                serialNo: x.serialNo,
                unitPrice: x.unitPrice,
                quantity: x.quantity,
                totalPrice: x.totalPrice,
                remarks: x.remarks
            } as SalesDetailsEntryDto);
        });

        const input = {
            sales: model,
            salesDetails: details
        } as SalesEntryInputDto;

        input.dueReceived = {
            salesId: model.id,
            clientId: model.clientId,
            creationTime: moment(new Date()),
            invoiceDate: model.date,
            receiveDate: model.date,
            invoiceNumber: model.invoiceNumber,
            paymentStatus: model.paymentStatus,
            grandTotal: model.totalAmount,
            discount: model.discount,
            netTotal: model.netAmount,
            totalPaid: model.paidAmount,
            due: model.dueAmount,
            default: true,
            remarks: this.remarks
        } as DueReceivedHistoryDto;


        this._salesService.createOrUpdate(input).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }

    chceckDisabled() {
        if (this.hasSerial && !this.serialNo) return true;
        else if (this.quantity < 1 || this.unitPrice < 1 || this.quantity > this.availableQuantity) return true;
        else if (!this.model.invoiceNumber) return true;
        else return false;
    }

    calculateIndividualTotalPrice() {
        this.totalPrice = this.unitPrice * this.quantity;
        this.cd.detectChanges();
    }

    calculateDueAmount() {
        this.model.netAmount = this.totalValues.totalPrice - this.model.discount;
        this.model.dueAmount = this.model.netAmount - this.model.paidAmount;
        this.cd.detectChanges();
    }

    clear() {
        this.productId = "";
        this.productObj = undefined;
        this.serialNo = "";
        this.availableQuantity = 0;
        this.quantity = 0;
        this.unitPrice = 0;
        this.totalPrice = 0;
        this.remarks = "";
        this.cd.detectChanges();
    }

    addToList() {
        const saleDetail = {
            id: undefined,
            salesId: 0,
            productId: parseInt(this.productId),
            productName: this.products.find(f => f.value === this.productId).displayText,
            serialNo: this.serialNo,
            unitPrice: this.unitPrice,
            quantity: this.quantity,
            totalPrice: this.totalPrice,
            remarks: this.remarks
        } as SalesDetailsEntryDto;
        this.saleDetails.push(saleDetail);

        this.totalValues = this.saleDetails.reduce((accumulator, item) => {
            accumulator.quantity += item.quantity;
            accumulator.unitPrice += item.unitPrice;
            accumulator.totalPrice += item.totalPrice;
            return accumulator;
        }, { quantity: 0, unitPrice: 0, totalPrice: 0, discount: 0, netPrice: 0 });

        this.products = this.products.filter(f=> f.value !== this.productId);

        this.clear();
    }



}