import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { ServiceExpenseEntryDto, ServiceExpenseOutputDto, ServiceExpenseServiceProxy } from '@shared/service-proxies/service-proxies';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ServiceExpenseEntryComponent } from './service-expense-entry/service-expense-entry.component';

@Component({
  selector: 'app-service-expenses',
  standalone: false,
  templateUrl: './service-expenses.component.html',
  animations: [appModuleAnimation()],
})

export class ServiceExpensesComponent extends PagedListingComponentBase<ServiceExpenseOutputDto> {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";

  constructor(
    injector: Injector,
    private readonly _expenseService: ServiceExpenseServiceProxy,
    private readonly _modalService: BsModalService,
    cd: ChangeDetectorRef
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
    this._expenseService.getPaginatedServiceExpenses(
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
    const se = new ServiceExpenseEntryDto();
    this.showentryDialog(se);
  }

  edit(id: number) {
    this._expenseService.get(id).subscribe(res => {
      this.showentryDialog(res);
    });
  }

  delete(record: ServiceExpenseOutputDto) {
    abp.message.confirm(`You want to delete this. record`, 'Are you sure?', (Ok) => {
      if (Ok) {
        this._expenseService.serviceExpenseRemove(record.id).subscribe(() => {
          abp.notify.success("Successfully Removed");
        })
      }
    })
  }


  private showentryDialog(se: ServiceExpenseEntryDto): void {
    let entryDialog: BsModalRef;
    entryDialog = this._modalService.show(
      ServiceExpenseEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          model: se,
        },
      }
    );
    entryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }
}
