import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from "@shared/app-component-base";
import { BtebSessionEntryInputDto, BtebSessionServiceProxy } from "@shared/service-proxies/service-proxies";
import moment from "moment";

@Component({
    selector: 'app-bteb-session-entry',
    standalone: false,
    templateUrl: './bteb-session-entry.component.html'
})

export class BtebSessionEntryComponent extends AppComponentBase implements OnInit {

    @Output() onSave = new EventEmitter<any>();

    model: BtebSessionEntryInputDto;
    examinationDate? = undefined;
    resultPublishedDate? = undefined;
    certificateDate? = undefined;
    saving = false;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _sessionService: BtebSessionServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnInit(): void {
        if (this.model?.id) {
            if (this.model.examinationDate)
                this.examinationDate = this.model.examinationDate.toDate();
            if (this.model.resultPublishedDate)
                this.resultPublishedDate = this.model.resultPublishedDate.toDate();
            if (this.model.certificateDate)
                this.certificateDate = this.model.certificateDate.toDate();
        }
    }

    save() {
        this.saving = true;
        if (this.examinationDate)
            this.model.examinationDate = moment(this.examinationDate);
        else
            this.model.examinationDate = undefined;

        if (this.resultPublishedDate)
            this.model.resultPublishedDate = moment(this.resultPublishedDate);
        else
            this.model.resultPublishedDate = undefined;

        if (this.certificateDate)
            this.model.certificateDate = moment(this.certificateDate);
        else
            this.model.certificateDate = undefined;

        this._sessionService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }
}