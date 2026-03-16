import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { AssetEntryDto, AssetOutputDto, AssetServiceProxy } from '@shared/service-proxies/service-proxies';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AssetEntryComponent } from './asset-entry/asset-entry.component';

@Component({
  selector: 'app-assets',
  standalone: false,
  templateUrl: './assets.component.html',
  animations: [appModuleAnimation()],
})
export class AssetsComponent extends PagedListingComponentBase<AssetOutputDto>  {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";

  constructor(
    injector: Injector,
    private readonly _assetService: AssetServiceProxy,
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
    this._assetService.getPaginatedAssets(
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
    const asset = new AssetEntryDto();
    this.showentryDialog(asset);
  }

  edit(id: number) {
    this._assetService.get(id).subscribe(res => {
      this.showentryDialog(res);
    });
  }

  delete(record: AssetOutputDto) {
    abp.message.confirm(`You want to delete ${record.name}`, 'Are you sure?', (Ok)=> {
      if(Ok) {
        this._assetService.assetRemove(record.id).subscribe(()=> {
          abp.notify.success("Successfully Removed");
        })
      }
    })
  }


  private showentryDialog(asset: AssetEntryDto): void {
    let entryDialog: BsModalRef;
    entryDialog = this._modalService.show(
      AssetEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          model: asset,
        },
      }
    );
    entryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }
}
