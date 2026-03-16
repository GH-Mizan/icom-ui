import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import moment, { isMoment } from 'moment';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { ClientServiceProxy, ComboboxItemDto, ServiceDueReceivedEntryDto, ServiceDueReceivedHistoryDto, ServiceEntryDto, ServiceOutputDto, ServiceServiceProxy } from '@shared/service-proxies/service-proxies';
import { ServiceEntryComponent } from './service-entry/service-entry.component';
import { ServiceDueReceivedEntryComponent } from './due-received-entry/due-received-entry.component';
import { ServiceDueReceivedHistoryComponent } from './due-received-histories/due-received-histories.component';
import { Utils } from '@shared/helpers/Utils';

@Component({
  selector: 'app-services',
  standalone: false,
  templateUrl: './services.component.html',
  animations: [appModuleAnimation()],
})

export class ServicesComponent extends PagedListingComponentBase<ServiceOutputDto> implements OnInit {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  clients: ComboboxItemDto[];
  selectedClient: any;
  dueOnly: boolean = false;
  startDate = new Date();
  endDate = new Date();
  months: ComboboxItemDto[];
  years: ComboboxItemDto[];
  month: number;
  year: number;
  dateRangeSearch: boolean = false;
  monthlySearch: boolean = true;
  lifeTimeDue: boolean = false;
  serviceTypes: ComboboxItemDto[];
  serviceType;


  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _serviceProxy: ServiceServiceProxy,
    private readonly _modalService: BsModalService,
    private readonly _clientService: ClientServiceProxy,
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this._clientService.getClientsSelectList().subscribe(res => {
      this.clients = res;
      this.cd.detectChanges();
    });
    this._serviceProxy.getServiceTypesSelectList().subscribe(res=> {
      this.serviceTypes = res;
    })
    const now = new Date();
    this.month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
    this.year = now.getFullYear();
    this.months = Utils.getMonths();
    this.years = Utils.getYears(this.year);
    this.cd.detectChanges();
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

    this.primengTableHelper.isLoading = true;
    this._serviceProxy.getPaginatedServices(
      this.selectedClient ? parseInt(this.selectedClient.value) : undefined,
      this.dueOnly,
      this.monthlySearch ? undefined : moment(this.startDate),
      this.monthlySearch ? undefined : moment(this.endDate),
      this.monthlySearch ? this.month : undefined,
      this.monthlySearch ? this.year : undefined,
      !this.monthlySearch,
      this.monthlySearch,
      this.lifeTimeDue,
      this.serviceType,
      this.searchText,
      this.primengTableHelper.getSkipCount(this.paginator, event),
      this.primengTableHelper.getMaxResultCount(this.paginator, event)
    ).pipe(
      finalize(() => {
        this.primengTableHelper.isLoading = false;
      })
    )
      .subscribe((result) => {
        this.primengTableHelper.records = result.items;
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.isLoading = false;
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
      dueReceived: { serviceDate: record.date } as ServiceDueReceivedHistoryDto
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

  onMonthlySearchChange(event) {
    if (event.target.checked) {
      this.dateRangeSearch = false;
      this.monthlySearch = true;
    }
    else {
      this.dateRangeSearch = true;
      this.monthlySearch = false;
    }

    this.list();
  }

  clearFilters() {
    this.searchText = "";
    this.selectedClient = undefined;
    this.dueOnly = false;
    this.startDate = undefined;
    this.endDate = undefined;
    const now = new Date();
    this.month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
    this.year = now.getFullYear();
    this.dateRangeSearch = false;
    this.monthlySearch = true;
    this.lifeTimeDue = false;
    this.serviceType = undefined;
    this.cd.detectChanges();
    this.list();
  }

}
