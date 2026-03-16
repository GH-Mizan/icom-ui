import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { BrandServiceProxy, CategoryServiceProxy, ComboboxItemDto, PricelistEntryDto, PricelistOutputDto, PricelistServiceProxy } from '@shared/service-proxies/service-proxies';
import { PricelistEntryComponent } from './pricelist-entry/pricelist-entry.component';
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'app-pricelists',
  standalone: false,
  templateUrl: './pricelists.component.html',
  animations: [appModuleAnimation()],
})

export class PricelistsComponent extends PagedListingComponentBase<PricelistOutputDto> implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  brands: ComboboxItemDto[];
  categories: ComboboxItemDto[];
  categoryId: number;
  brandId: number;

  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _pricelistService: PricelistServiceProxy,
    private readonly _brandService: BrandServiceProxy,
    private readonly _categoryService: CategoryServiceProxy,
    private readonly _modalService: BsModalService,
  ) {
    super(injector, cd);
  }

  async ngOnInit() {
    await Promise.all(
      [
        this.loadBrands(),
        this.loadCategories()
      ]
    );
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
    this._pricelistService.getPaginated(
      this.categoryId, 
      this.brandId,
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

  async loadBrands() {
    this.brands = await firstValueFrom(this._brandService.getBrandsSelectList());
    this.cd.detectChanges();
  }

  async loadCategories() {
    this.categories = await firstValueFrom(this._categoryService.getCategoriesSelectList());
    this.cd.detectChanges();
  }

  create() {
    const pricelist = new PricelistEntryDto();
    this.showPricelistEntryDialog(pricelist);
  }

  private showPricelistEntryDialog(pricelist: PricelistEntryDto): void {
    let pricelistEntryDialog: BsModalRef;
    pricelistEntryDialog = this._modalService.show(
      PricelistEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          model: pricelist,
        },
      }
    );
    pricelistEntryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }

}
