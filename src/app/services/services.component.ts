import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import moment from 'moment';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { ServiceDueReceivedEntryDto, ServiceDueReceivedHistoryDto, ServiceEntryDto, ServiceOutputDto, ServiceServiceProxy } from '@shared/service-proxies/service-proxies';
import { ServiceEntryComponent } from './service-entry/service-entry.component';
import { ServiceDueReceivedEntryComponent } from './due-received-entry/due-received-entry.component';
import { ServiceDueReceivedHistoryComponent } from './due-received-histories/due-received-histories.component';

@Component({
  selector: 'app-services',
  standalone: false,
  templateUrl: './services.component.html',
  animations: [appModuleAnimation()],
})

export class ServicesComponent extends PagedListingComponentBase<ServiceOutputDto> {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";

  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _serviceProxy: ServiceServiceProxy,
    private readonly _modalService: BsModalService,
  ) {
    super(injector, cd);
  }

  list(event?: LazyLoadEvent): void {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);

      if (
        this.primengTableHelper.records &&
        this.primengTableHelper.records.length > 0
      ) {
        return;
      }
    }

    this.primengTableHelper.showLoadingIndicator();
    this._serviceProxy.getPaginatedServices(
      this.searchText,
      this.primengTableHelper.getSkipCount(this.paginator, event),
      this.primengTableHelper.getMaxResultCount(this.paginator, event)
    ).pipe(
      finalize(() => {
        this.primengTableHelper.hideLoadingIndicator();
      })
    )
      .subscribe((result) => {
        this.primengTableHelper.records = result.items;
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.hideLoadingIndicator();
        this.cd.detectChanges();
      });
  }

  create() {
      const service = new ServiceEntryDto();
      this.showServiceEntryDialog(service);
    }
  
    edit(id: number) {
    this._serviceProxy.get(id).subscribe(res => {
      this.showServiceEntryDialog(res);
    });
  }
  
    showPaymentHistory(id: number) {
      let dueReceivedHistoryDialog: BsModalRef;
      dueReceivedHistoryDialog = this._modalService.show(
        ServiceDueReceivedHistoryComponent,
        {
          class: "modal-lg",
          initialState: {
            serviceId: id,
          },
        }
      );
      dueReceivedHistoryDialog.content.onDelete.subscribe(() => {
        this.refresh();
      });
    }
  
    makeDuePayment(record: ServiceOutputDto) {
      const dueReceived = {
        serviceId: record.id,
        grandTotal: record.serviceCharge,
        prevTotalPaid: record.totalPaid,
        totalPaid: 0,
        due: record.due,
        dueReceived: {serviceDate: record.date} as ServiceDueReceivedHistoryDto
      } as ServiceDueReceivedEntryDto;
  
      let dueReceiveEntryDialog: BsModalRef;
      dueReceiveEntryDialog = this._modalService.show(
        ServiceDueReceivedEntryComponent,
        {
          class: "modal-lg",
          initialState: {
            dueReceived: dueReceived,
            clientId: record.clientId
          },
        }
      );
      dueReceiveEntryDialog.content.onSave.subscribe(() => {
        this.refresh();
      });
    }
  
    delete(record: ServiceOutputDto) {
  
    }
  
    private showServiceEntryDialog(service: ServiceEntryDto): void {
      let saleEntryDialog: BsModalRef;
      saleEntryDialog = this._modalService.show(
        ServiceEntryComponent,
        {
          class: "modal-xl",
          initialState: {
            model: service,
          },
        }
      );
      saleEntryDialog.content.onSave.subscribe(() => {
        this.refresh();
      });
    }

}
