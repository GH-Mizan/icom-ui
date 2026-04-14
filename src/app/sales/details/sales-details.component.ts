import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { SalesServiceProxy, ComboboxItemDto, ClientServiceProxy, ProductServiceProxy, CategoryServiceProxy, SalesDetailsOutputDto } from '@shared/service-proxies/service-proxies';


@Component({
  selector: 'app-sales-details',
  standalone: false,
  templateUrl: './sales-details.component.html',
  animations: [appModuleAnimation()],
})
export class SalesDetailsComponent extends PagedListingComponentBase<SalesDetailsOutputDto> implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  clients: ComboboxItemDto[];
  selectedClient: any;
  products: ComboboxItemDto[];
  selectedProduct: any;
  categories: ComboboxItemDto[];
  selectedCategory: any;
  /**
   *
   */
  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _productService: ProductServiceProxy,
    private readonly _salesService: SalesServiceProxy,
    private readonly _modalService: BsModalService,
    private readonly _clientService: ClientServiceProxy,
    private readonly _categoryService: CategoryServiceProxy,
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this._clientService.getClientsSelectList(null).subscribe(res => {
      this.clients = res;
      this.cd.detectChanges();
    });
    this._productService.getProductsSelectList().subscribe(res => {
      this.products = res;
      this.cd.detectChanges();
    });
    this._categoryService.getCategoriesSelectList().subscribe(res => {
      this.categories = res;
      this.cd.detectChanges();
    });
  }

  list(event?: LazyLoadEvent): void {
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.changePage(0);

      if (
        this.primengTableHelper.records &&
        this.primengTableHelper.records.length > 0
      ) { return; }
    }
    this.primengTableHelper.isLoading = true;
    //this.primengTableHelper.showLoadingIndicator();
    this._salesService.getPaginatedSalesDetails(
      this.selectedClient ? parseInt(this.selectedClient.value) : undefined,
      this.selectedCategory ? parseInt(this.selectedCategory.value) : undefined,
      this.selectedProduct ? parseInt(this.selectedProduct.value) : undefined,
      this.searchText,
      this.primengTableHelper.getSkipCount(this.paginator, event),
      this.primengTableHelper.getMaxResultCount(this.paginator, event)
    ).pipe(
      finalize(() => {
        //this.primengTableHelper.hideLoadingIndicator();
        this.primengTableHelper.isLoading = false;
      })
    )
      .subscribe((result) => {
        this.primengTableHelper.records = result.items;
        this.primengTableHelper.totalRecordsCount = result.totalCount;
        this.primengTableHelper.isLoading = false;
        this.cd.detectChanges();
      });
  }

  clearFilters() {
    this.searchText = "";
    this.selectedClient = undefined;
    this.selectedCategory = undefined;
    this.selectedProduct = undefined;
    this.cd.detectChanges();
    this.list();
  }

}
