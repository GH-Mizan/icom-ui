import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { AppComponentBase } from "@shared/app-component-base";
import { ComboboxItemDto, ServiceExpenseEntryDto, ServiceExpenseServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';
import moment from "moment";

@Component({
    selector: 'app-service-expense-entry',
    templateUrl: './service-expense-entry.component.html',
    standalone: false,
})

export class ServiceExpenseEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();
    model: ServiceExpenseEntryDto;

    date = new Date();
    serviceExpenseTypes: ComboboxItemDto[];
    saving = false;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _serviceExpenseService: ServiceExpenseServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this._serviceExpenseService.getServiceExpenseTypeSelectList().subscribe(res => {
            this.serviceExpenseTypes = res;
            this.cd.detectChanges();
        });
        if(this.model?.id) {
            this.date = this.model.date.toDate();
            this.cd.detectChanges();
        }
    }

    save() {
        this.saving = true;
        this.model.date = moment(this.date);

        this._serviceExpenseService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }
}