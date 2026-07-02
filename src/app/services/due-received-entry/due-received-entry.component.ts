import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from "@shared/app-component-base";
import { PaymentStatus, ServiceDueReceivedEntryDto, ServiceDueReceivedHistoryDto, ServiceServiceProxy } from "@shared/service-proxies/service-proxies";
import moment from "moment";

@Component({
    selector: 'app-service-due-received-entry',
    standalone: false,
    templateUrl: './due-received-entry.component.html',
    styles: [
        `
            /* Chrome, Safari, Edge, Opera */
            input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            /* Firefox */
            input[type=number] {
                -moz-appearance: textfield;
            }

            .invalid_cell {
                background-color: red !important;
            }
        `
    ]
})

export class ServiceDueReceivedEntryComponent extends AppComponentBase implements OnInit {

    @Output() onSave = new EventEmitter<any>();

    dueReceived: ServiceDueReceivedEntryDto;
    clientId: number;
    saving = false;

    serviceDate = new Date();
    receiveDate = new Date();

    discountEditMode: boolean = false;
    paidEditMode: boolean = false;
    invalid: boolean = false;
    currentDue: number;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _servicesService: ServiceServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.serviceDate = (this.dueReceived.dueReceived.serviceDate).toDate();
        this.currentDue = this.dueReceived.due;
        this.cd.detectChanges();
    }

    totalPaidChanged() {
        this.invalid = true;
        const dueReceived = this.dueReceived;
        if (!dueReceived.totalPaid) dueReceived.totalPaid = 0;
        if (dueReceived.totalPaid < 0) {
            abp.message.info("Paid amount can't be less than 0", "Invalid Paid!");
            dueReceived.totalPaid = 0;
        } else if (dueReceived.grandTotal < dueReceived.prevTotalPaid + dueReceived.totalPaid) {
            abp.message.info("Paid amount can't be greater than the net total", "Invalid Paid!");
            dueReceived.totalPaid = 0;
        } else {
            this.dueReceived.due = this.currentDue - this.dueReceived.totalPaid;
            this.paidEditMode = false;
        }

        setTimeout(() => {
            this.invalid = false;
            this.cd.detectChanges();
        }, 200);
    }

    save() {
        this.saving = true;
        const dueReceived = this.dueReceived;
        const input = {
            serviceId: dueReceived.serviceId,
            totalPaid: dueReceived.totalPaid,
            due: dueReceived.due,
            grandTotal: dueReceived.grandTotal,
            prevTotalPaid: dueReceived.prevTotalPaid,
            dueReceived: {
                serviceId: dueReceived.serviceId,
                clientId: this.clientId,
                serviceDate: moment(this.serviceDate),
                receiveDate: moment(this.receiveDate),
                paymentStatus: dueReceived.due == 0 ? PaymentStatus._1 : dueReceived.grandTotal > dueReceived.due ? PaymentStatus._2 : PaymentStatus._3,
                grandTotal: dueReceived.grandTotal,
                totalPaid: dueReceived.totalPaid,
                due: dueReceived.due
             } as ServiceDueReceivedHistoryDto
        } as ServiceDueReceivedEntryDto;

        this._servicesService.dueReceivedEntry(input).subscribe(() => {
            this.notify.info("Successfully Updated");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }
}