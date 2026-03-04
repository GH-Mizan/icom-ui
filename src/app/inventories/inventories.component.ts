import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { BrandServiceProxy, CategoryServiceProxy, ComboboxItemDto, InventoryOutputDto, InventoryServiceProxy } from '@shared/service-proxies/service-proxies';
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'app-inventories',
  standalone: false,
  templateUrl: './inventories.component.html',
  animations: [appModuleAnimation()],
})

export class InventoriesComponent extends PagedListingComponentBase<InventoryOutputDto> {
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
    private readonly _inventoryService: InventoryServiceProxy,
    private readonly _brandService: BrandServiceProxy,
    private readonly _categoryService: CategoryServiceProxy,
  ) {
    super(injector, cd);
  }

  async ngOnInit() {
    await Promise.all(
      [
        this.loadBrands(),
        this.loadCategories()
      ]
    ).then(() => {
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
    this._inventoryService.getPaginated(
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

  
}
