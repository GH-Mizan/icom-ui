import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { debounceTime, distinctUntilChanged, firstValueFrom, map, Observable } from "rxjs";
import { AppComponentBase } from "@shared/app-component-base";
import { ComboboxItemDto, PricelistEntryDto, PricelistServiceProxy, ProductServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';
import moment from "moment";

@Component({
    selector: 'app-pricelist-entry',
    templateUrl: './pricelist-entry.component.html',
    standalone: false
})

export class PricelistEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();

    model: PricelistEntryDto;

    products: ComboboxItemDto[];
    productId: string = "";
    productObj: any;
    date = new Date();

    saving = false;
    loading = true;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _pricelistService: PricelistServiceProxy,
        private readonly _productService: ProductServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    async ngOnInit() {
        await this.loadProducts();
        this.loading = false;
        this.cd.detectChanges();
    }

    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term === '' ? [] : this.products.filter(v => v.displayText.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
        );

    onProductChanged() {
        this.productId = this.productObj.value;
    }

    async loadProducts() {
        this.products = await firstValueFrom(this._productService.getProductsSelectList());
        this.cd.detectChanges();
    }

    save() {
        this.saving = true;
        this.model.purchaseDate = moment(this.date);
        this.model.productId = parseInt(this.productId);
        this._pricelistService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }

}