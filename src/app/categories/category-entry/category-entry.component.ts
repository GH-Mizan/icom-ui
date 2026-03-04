import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { AppComponentBase } from "@shared/app-component-base";
import { BrandEntryDto, BrandServiceProxy, CategoryEntryDto, CategoryServiceProxy, ClientEntryDto, ClientServiceProxy, ComboboxItemDto, ProductEntryDto, ProductServiceProxy, SupplierServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';
import moment from "moment";

@Component({
    selector: 'app-category-entry',
    templateUrl: './category-entry.component.html',
    standalone: false
})

export class CategoryEntryComponent extends AppComponentBase {
    @Output() onSave = new EventEmitter<any>();

    model: CategoryEntryDto;

    saving = false;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _categoryService: CategoryServiceProxy,
        private cd: ChangeDetectorRef
    ) {
         super(injector);
    }

    save() {
        this.saving = true;
        this._categoryService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }

}