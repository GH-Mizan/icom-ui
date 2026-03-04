import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { BtebSessionEntryInputDto, BtebSessionOutputDto, BtebSessionServiceProxy } from '@shared/service-proxies/service-proxies';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { BtebSessionEntryComponent } from './bteb-session-entry/bteb-session-entry.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
  selector: 'app-bteb-sessions',
  standalone: false,
  templateUrl: './bteb-sessions.component.html',
  animations: [appModuleAnimation()],
})

export class BtebSessionsComponent extends PagedListingComponentBase<BtebSessionOutputDto> {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";

  constructor(
    injector: Injector,
    private readonly _sessionService: BtebSessionServiceProxy,
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
    this._sessionService.getPaginatedBtebSessions(
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
    const session = new BtebSessionEntryInputDto();
    this.showentryDialog(session);
  }

  edit(id: number) {
    this._sessionService.get(id).subscribe(res => {
      this.showentryDialog(res);
    });
  }

  
  private showentryDialog(session: BtebSessionEntryInputDto): void {
    let entryDialog: BsModalRef;
    entryDialog = this._modalService.show(
      BtebSessionEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          model: session,
        },
      }
    );
    entryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }

}
