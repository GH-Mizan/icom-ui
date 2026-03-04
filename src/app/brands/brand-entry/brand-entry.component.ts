import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { AppComponentBase } from "@shared/app-component-base";
import { BrandEntryDto, BrandServiceProxy, CategoryServiceProxy, ClientEntryDto, ClientServiceProxy, ComboboxItemDto, ProductEntryDto, ProductServiceProxy, SupplierServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';
import moment from "moment";

@Component({
    selector: 'app-brand-entry',
    templateUrl: './brand-entry.component.html',
    standalone: false
})

export class BrandEntryComponent extends AppComponentBase {
    @Output() onSave = new EventEmitter<any>();

    model: BrandEntryDto;

    saving = false;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _brandService: BrandServiceProxy,
        private cd: ChangeDetectorRef
    ) {
         super(injector);
    }

    save() {
        this.saving = true;
        this._brandService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }

}