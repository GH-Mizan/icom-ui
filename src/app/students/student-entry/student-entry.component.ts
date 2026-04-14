import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from "@shared/app-component-base";
import { BtebSessionServiceProxy, ClientServiceProxy, ClientType, ClientTypeNullable, ComboboxItemDto, StudentEntryInputDto, StudentServiceProxy } from "@shared/service-proxies/service-proxies";
import moment from "moment";
import { firstValueFrom } from "rxjs";

@Component({
    selector: 'app-bteb-session-entry',
    standalone: false,
    templateUrl: './student-entry.component.html'
})

export class StudentEntryComponent extends AppComponentBase implements OnInit {

    @Output() onSave = new EventEmitter<any>();

    model: StudentEntryInputDto;
    admisionDate = new Date();
    dateOfBirth? = undefined;
    certificateDate? = undefined;
    loading: boolean = false;
    saving = false;

    bloodGroups: ComboboxItemDto[];
    iccCourses: ComboboxItemDto[];
    durations: ComboboxItemDto[];
    resultStatuses: ComboboxItemDto[];
    officePrograms: ComboboxItemDto[];
    btebSessions: ComboboxItemDto[];
    clients: ComboboxItemDto[];


    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _sessionService: BtebSessionServiceProxy,
        private readonly _studentService: StudentServiceProxy,
        private readonly _clientService: ClientServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    async ngOnInit() {
        if (this.model?.id) {
            this.admisionDate = this.model.admisionDate.toDate();
            if (this.model.dateOfBirth)
                this.dateOfBirth = this.model.dateOfBirth.toDate();
        } else {
            //this.model.classRoll = await firstValueFrom()
        }

        Promise.all([
            await this.loadBloodGroups(),
            await this.loadIccCourses(),
            await this.loadCourseDurations(),
            await this.loadOfficePrograms(),
            await this.loadResultStatuses(),
            await this.loadBtebSessions(),
            await this.loadClients()
        ])
    }

    async loadClients() {
        this.clients = await firstValueFrom(this._clientService.getClientsSelectList(ClientTypeNullable._4));
        this.cd.detectChanges();
    }

    async loadBloodGroups() {
        this.bloodGroups = await firstValueFrom(this._studentService.getBloodGroupsSelectList());
        this.cd.detectChanges();
    }

    async loadIccCourses() {
        this.iccCourses = await firstValueFrom(this._studentService.getIccCoursesSelectList());
        this.cd.detectChanges();
    }

    async loadCourseDurations() {
        this.durations = await firstValueFrom(this._studentService.getCourseDurationsSelectList());
        this.cd.detectChanges();
    }

    async loadOfficePrograms() {
        this.officePrograms = await firstValueFrom(this._studentService.getOfficeProgramsSelectList());
        this.cd.detectChanges();
    }

    async loadResultStatuses() {
        this.resultStatuses = await firstValueFrom(this._studentService.getResultStatusesSelectList());
        this.cd.detectChanges();
    }

    async loadBtebSessions() {
        this.btebSessions = await firstValueFrom(this._sessionService.getBtebSessionsSelectList());
        this.cd.detectChanges();
    }

    save() {
        this.saving = true;
        this.model.admisionDate = moment(this.admisionDate);

        if (this.dateOfBirth)
            this.model.dateOfBirth = moment(this.dateOfBirth);
        else
            this.model.dateOfBirth = undefined;

        this._studentService.createOrUpdate(this.model).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }
}