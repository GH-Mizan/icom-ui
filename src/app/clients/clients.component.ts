import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { ClientEntryDto, ClientOutputDto, ClientServiceProxy } from '@shared/service-proxies/service-proxies';
import { ClientEntryComponent } from './client-entry/client-entry.component';

@Component({
  selector: 'app-clients',
  standalone: false,
  templateUrl: './clients.component.html',
  animations: [appModuleAnimation()],
})

export class ClientsComponent extends PagedListingComponentBase<ClientOutputDto> {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";

  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _clientService: ClientServiceProxy,
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
    this._clientService.getPaginatedClients(
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
    const client = new ClientEntryDto();
    this.showProductEntryDialog(client);
  }

  private showProductEntryDialog(client: ClientEntryDto): void {
    let clientEntryDialog: BsModalRef;
    clientEntryDialog = this._modalService.show(
      ClientEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          model: client,
        },
      }
    );
    clientEntryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }
}
