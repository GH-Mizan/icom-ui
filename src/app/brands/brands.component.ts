import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { BrandEntryDto, BrandOutputDto, BrandServiceProxy } from '@shared/service-proxies/service-proxies';
import { BrandEntryComponent } from './brand-entry/brand-entry.component';

@Component({
  selector: 'app-brands',
  standalone: false,
  templateUrl: './brands.component.html',
  animations: [appModuleAnimation()],
})

export class BrandsComponent extends PagedListingComponentBase<BrandOutputDto> {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";


  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _brandsService: BrandServiceProxy,
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
    this._brandsService.getPaginatedBrands(
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
    const brand = new BrandEntryDto();
    this.showEntryDialog(brand);
  }

  edit(id: number) {
    this._brandsService.get(id).subscribe(res => {
      this.showEntryDialog(res);
    });
  }

  private showEntryDialog(brand: BrandEntryDto): void {
    let entryDialog: BsModalRef;
    entryDialog = this._modalService.show(
      BrandEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          model: brand,
        },
      }
    );
    entryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }


}
