import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { AppComponentBase } from "@shared/app-component-base";
import { AssetEntryDto, AssetServiceProxy, AssetType, ComboboxItemDto } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';
import moment from "moment";

@Component({
    selector: 'app-asset-entry',
    templateUrl: './asset-entry.component.html',
    standalone: false,
})

export class AssetEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();
    model: AssetEntryDto;
    date = new Date();
    usedConditions: ComboboxItemDto[];
    saving = false;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _assetService: AssetServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this._assetService.getUsedConditionSelectList().subscribe(res => {
            this.usedConditions = res;
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
        this.model.type = AssetType._1;

        this._assetService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }
}