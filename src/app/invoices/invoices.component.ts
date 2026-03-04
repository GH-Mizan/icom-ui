import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ComboboxItemDto, InvoiceEntryDto, InvoiceEntryInputDto, InvoiceOutputDto, InvoiceServiceProxy } from '@shared/service-proxies/service-proxies';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { InvoiceEntryComponent } from './invoice-entry/invoice-entry.component';

@Component({
  selector: 'app-invoices',
  standalone: false,
  templateUrl: './invoices.component.html',
  animations: [appModuleAnimation()],
})

export class InvoicesComponent extends PagedListingComponentBase<InvoiceOutputDto> {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  clients: ComboboxItemDto[];
  clientId: number;

  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _invoiceService: InvoiceServiceProxy,
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
    this._invoiceService.getPaginatedInvoices(
      null,
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
    const invoice = new InvoiceEntryInputDto();
    invoice.invoice = new InvoiceEntryDto();
    invoice.invoiceDetails = [];
    this.showEntryDialog(invoice);
  }

  edit(id: number) {
      this._invoiceService.get(id).subscribe(res=> {
          this.showEntryDialog(res);
      })
  }

  private showEntryDialog(input: InvoiceEntryInputDto): void {
      let entryDialog: BsModalRef;
      entryDialog = this._modalService.show(
        InvoiceEntryComponent,
        {
          class: "modal-xl",
          initialState: {
            model: input.invoice,
            invoiceDetails: input.invoiceDetails
          },
        }
      );
      entryDialog.content.onSave.subscribe(() => {
        this.refresh();
      });
    }
}
