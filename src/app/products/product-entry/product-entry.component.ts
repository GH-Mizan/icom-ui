import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { AppComponentBase } from "@shared/app-component-base";
import { BrandServiceProxy, CategoryServiceProxy, ComboboxItemDto, ProductEntryDto, ProductServiceProxy, SupplierServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-product-entry',
    templateUrl: './product-entry.component.html',
    standalone: false
})

export class ProductEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();

    model: ProductEntryDto;

    brands: ComboboxItemDto[];
    categories: ComboboxItemDto[];
    suppliers: ComboboxItemDto[];

    saving = false;
    loading = true;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _brandService: BrandServiceProxy,
        private readonly _categoryService: CategoryServiceProxy,
        private readonly _supplierService: SupplierServiceProxy,
        private readonly _productService: ProductServiceProxy,
        private cd: ChangeDetectorRef
    ) {
         super(injector);
    }

    async ngOnInit() {
        await Promise.all(
            [
                this.loadBrands(),
                this.loadSuppliers(),
                this.loadCategories()
            ]
        ).then(() => {
            this.loading = false;
            this.cd.detectChanges();
        });
    }

    async loadBrands() {
        this.brands = await firstValueFrom(this._brandService.getBrandsSelectList());
        this.cd.detectChanges();
    }

    async loadCategories() {
        this.categories = await firstValueFrom(this._categoryService.getCategoriesSelectList());
        this.cd.detectChanges();
    }

    async loadSuppliers() {
        this.suppliers = await firstValueFrom(this._supplierService.getSuppliersSelectList());
        this.cd.detectChanges();
    }


    save() {
        this.saving = true;
        this._productService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }

}