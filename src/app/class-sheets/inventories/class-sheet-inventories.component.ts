import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { ClassSheetInventoryDto, ClassSheetsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-class-sheets',
    standalone: false,
    templateUrl: './class-sheet-inventories.component.html',
    animations: [appModuleAnimation()],
})

export class ClassSheetsInventoryComponent extends PagedListingComponentBase<ClassSheetInventoryDto> {
    @ViewChild('dataTable', { static: true }) dataTable: Table;

    constructor(
        injector: Injector,
        cd: ChangeDetectorRef,
        private readonly _classSheetsService: ClassSheetsServiceProxy,
        private readonly _modalService: BsModalService,
    ) {
        super(injector, cd);
    }

    list(event?: LazyLoadEvent): void {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            if (
                this.primengTableHelper.records &&
                this.primengTableHelper.records.length > 0
            ) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();
        this._classSheetsService.getClassSheetInventories().pipe(
            finalize(() => {
                this.primengTableHelper.hideLoadingIndicator();
            })
        )
            .subscribe((result) => {
                this.primengTableHelper.records = result;
                this.primengTableHelper.hideLoadingIndicator();
                this.cd.detectChanges();
            });
    }

    save(record: ClassSheetInventoryDto) {
        this._classSheetsService.createUpdateSheetInventories(record.quantity, record.type ).subscribe(res=> {
            this.notify.success("Successfully Updated");
        });
    }



}
