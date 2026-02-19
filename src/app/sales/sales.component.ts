import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { PricelistServiceProxy, SaleOutputDto, SalesEntryDto, SalesServiceProxy , DueReceivedEntryDto} from '@shared/service-proxies/service-proxies';
import { SaleEntryComponent } from './sale-entry/sale-entry.component';
import { DueReceivedHistoryComponent } from './due-received-histories/due-received-histories.component';
import { DueReceivedEntryComponent } from './due-received-entry/due-received-entry.component';
import moment from 'moment';

@Component({
  selector: 'app-sales',
  standalone: false,
  templateUrl: './sales.component.html',
  animations: [appModuleAnimation()],
})
export class SalesComponent extends PagedListingComponentBase<SaleOutputDto> {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  /**
   *
   */
  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _pricelistService: PricelistServiceProxy,
    private readonly _salesService: SalesServiceProxy,
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
    this._salesService.getPaginated(
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
