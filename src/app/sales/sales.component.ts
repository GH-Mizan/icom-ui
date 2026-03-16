import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { PricelistServiceProxy, SaleOutputDto, SalesEntryDto, SalesServiceProxy, DueReceivedEntryDto, ComboboxItemDto, ClientServiceProxy } from '@shared/service-proxies/service-proxies';
import { SaleEntryComponent } from './sale-entry/sale-entry.component';
import { DueReceivedHistoryComponent } from './due-received-histories/due-received-histories.component';
import { DueReceivedEntryComponent } from './due-received-entry/due-received-entry.component';
import moment from 'moment';
import { Utils } from '@shared/helpers/Utils';

@Component({
  selector: 'app-sales',
  standalone: false,
  templateUrl: './sales.component.html',
  animations: [appModuleAnimation()],
})
export class SalesComponent extends PagedListingComponentBase<SaleOutputDto> implements OnInit {
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
  /**
   *
   */
  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _pricelistService: PricelistServiceProxy,
    private readonly _salesService: SalesServiceProxy,
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
    //this.primengTableHelper.showLoadingIndicator();
    this._salesService.getPaginated(
      this.selectedClient ? parseInt(this.selectedClient.value) : undefined,
      this.dueOnly,
      this.monthlySearch ? undefined : moment(this.startDate),
      this.monthlySearch ? undefined : moment(this.endDate),
      this.monthlySearch ? this.month : undefined,
      this.monthlySearch ? this.year : undefined,
      !this.monthlySearch,
      this.monthlySearch,
      this.lifeTimeDue,
      this.searchText,
      this.primengTableHelper.getSkipCount(this.paginator, event),
      this.primengTableHelper.getMaxResultCount(this.paginator, event)
    ).pipe(
      finalize(() => {
        //this.primengTableHelper.hideLoadingIndicator();
        this.primengTableHelper.isLoading = false;
      })
    )
      .subscribe((result) => {
        this.primengTableHelper.records = result.items;
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        //this.primengTableHelper.hideLoadingIndicator();
        this.primengTableHelper.isLoading = false;
        this.cd.detectChanges();
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
    this.cd.detectChanges();
    this.list();
  }

  create() {
    const sale = new SalesEntryDto();
    this.showSaleEntryDialog(sale);
  }

  edit(id: number) {

  }

  showPaymentHistory(id: number) {
    let dueReceivedHistoryDialog: BsModalRef;
    dueReceivedHistoryDialog = this._modalService.show(
      DueReceivedHistoryComponent,
      {
        class: "modal-lg",
        initialState: {
          salesId: id,
        },
      }
    );
    dueReceivedHistoryDialog.content.onDelete.subscribe(() => {
      this.refresh();
    });
  }

  makePaymentReceive(record: SaleOutputDto) {
    const dueReceived = {
      salesId: record.id,
      invoiceDate: record.date,
      receiveDate: moment(new Date()),
      invoiceNumber: record.invoiceNumber,
      paymentStatus: record.paymentStatus,
      paymentStatusText: record.paymentStatusText,
      customerId: record.clientId,
      customerName: record.clientName,
      grandTotal: record.totalAmount,
      prevDiscount: record.discount,
      discount: 0,
      netTotal: record.netAmount,
      prevTotalPaid: record.paidAmount,
      totalPaid: 0,
      due: record.dueAmount
    } as DueReceivedEntryDto;

    let paymentReceiveEntryDialog: BsModalRef;
    paymentReceiveEntryDialog = this._modalService.show(
      DueReceivedEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          dueReceived: dueReceived,
        },
      }
    );
    paymentReceiveEntryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }

  delete(record: SaleOutputDto) {

  }

  private showSaleEntryDialog(sale: SalesEntryDto): void {
    let saleEntryDialog: BsModalRef;
    saleEntryDialog = this._modalService.show(
      SaleEntryComponent,
      {
        class: "modal-xl",
        initialState: {
          model: sale,
        },
      }
    );
    saleEntryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }

}
