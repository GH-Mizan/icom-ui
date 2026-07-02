import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { CollectionServiceProxy, SalesAndServiceCollectionDto } from '@shared/service-proxies/service-proxies';
import moment from 'moment';

@Component({
  selector: 'app-collections',
  standalone: false,
  templateUrl: './collections.component.html',
  animations: [appModuleAnimation()],
})

export class CollectionsComponent extends PagedListingComponentBase<SalesAndServiceCollectionDto> {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  startDate = new Date();
  endDate = new Date();


  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _collectionsService: CollectionServiceProxy,
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
    this._collectionsService.getPaginatedCollections(
      moment(this.startDate), moment(this.endDate), undefined,
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


}
