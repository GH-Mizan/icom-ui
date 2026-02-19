import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from "@angular/core";
import { DueReceivedHistoryDto, SalesServiceProxy, ServiceDueReceivedHistoryDto, ServiceServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-service-due-receive-history',
    standalone: false,
    templateUrl: './due-received-histories.component.html',
})

export class ServiceDueReceivedHistoryComponent implements OnInit {
    @Output() onDelete = new EventEmitter<any>();

    serviceId: number;
    histories: ServiceDueReceivedHistoryDto[] = [];

    constructor(
        public bsModalRef: BsModalRef,
        private readonly _servicesService: ServiceServiceProxy,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this._servicesService.getServiceDueReceivedHistories(this.serviceId).subscribe(res => {
            this.histories = res;
            this.cd.detectChanges();
        });
    }

    delete(item: DueReceivedHistoryDto): void {
        abp.message.confirm(`Amount ${item.totalPaid} will be removed`,
            undefined,
            (result: boolean) => {
                if (result) {
                    this._servicesService.dueReceivedRemove(item.id).subscribe(() => {
                        abp.notify.success("Successfully Deleted");
                        this.histories = this.histories.filter(f => f.id != item.id);
                        this.onDelete.emit();
                        this.cd.detectChanges();
                    });
                }
            }
        );
    }

}