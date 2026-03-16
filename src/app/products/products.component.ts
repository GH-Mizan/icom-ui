import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { BrandServiceProxy, CategoryServiceProxy, ComboboxItemDto, ProductEntryDto, ProductOutputDto, ProductServiceProxy, SupplierOutputDto, SupplierServiceProxy } from '@shared/service-proxies/service-proxies';
import { ProductEntryComponent } from './product-entry/product-entry.component';
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  animations: [appModuleAnimation()],
})

export class ProductsComponent extends PagedListingComponentBase<ProductOutputDto> implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  brands: ComboboxItemDto[];
  categories: ComboboxItemDto[];
  categoryId: number = 0;
  brandId: number = 0;

  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _productsService: ProductServiceProxy,
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
    this._productsService.getPaginated(
      this.categoryId == 0 ? undefined : this.categoryId,
      this.brandId == 0 ? undefined: this.brandId,
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
    const product = new ProductEntryDto();
    this.showProductEntryDialog(product);
  }

  private showProductEntryDialog(product: ProductEntryDto): void {
    let productEntryDialog: BsModalRef;
    productEntryDialog = this._modalService.show(
      ProductEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          model: product,
        },
      }
    );
    productEntryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }
}
