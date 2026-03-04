import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { AppComponentBase } from "@shared/app-component-base";
import { BrandServiceProxy, CategoryServiceProxy, ClientEntryDto, ClientServiceProxy, ComboboxItemDto, ProductEntryDto, ProductServiceProxy, SupplierServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';
import moment from "moment";

@Component({
    selector: 'app-client-entry',
    templateUrl: './client-entry.component.html',
    standalone: false
})

export class ClientEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();

    model: ClientEntryDto;
    clientTypes: ComboboxItemDto[];
    date = new Date();

    saving = false;
    loading = true;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _clientService: ClientServiceProxy,
        private cd: ChangeDetectorRef
    ) {
         super(injector);
    }

    ngOnInit() {
        this._clientService.getClientTypesSelectList().subscribe(res=> {
            this.clientTypes = res;
            this.loading = false;
            this.cd.detectChanges();
        })
    }


    save() {
        this.saving = true;
        this.model.entryDate = moment(this.date);
        this._clientService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }

}