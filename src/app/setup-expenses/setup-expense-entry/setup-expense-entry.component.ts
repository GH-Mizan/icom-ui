import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { AppComponentBase } from "@shared/app-component-base";
import { ComboboxItemDto, SetupExpenseEntryDto, SetupExpenseServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';
import moment from "moment";

@Component({
    selector: 'app-setup-expense-entry',
    templateUrl: './setup-expense-entry.component.html',
    standalone: false,
})

export class SetupExpenseEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();
    model: SetupExpenseEntryDto;

    date = new Date();
    serviceExpenses: ComboboxItemDto[];
    saving = false;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _setupExpenseService: SetupExpenseServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnInit(): void {
        if(this.model?.id) {
            this.date = this.model.date.toDate();
            this.cd.detectChanges();
        }
    }

    save() {
        this.saving = true;
        this.model.date = moment(this.date);

        this._setupExpenseService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }
}