import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { ClassSheetDistributionInputDto, ClassSheetDistributionOutputDto, ClassSheetsServiceProxy, ComboboxItemDto, StudentServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-class-sheet-distribution',
    standalone: false,
    templateUrl: './class-sheet-distribution.component.html',
    animations: [appModuleAnimation()],
    styles: [
        `
            .chkBig {
                width: 25px;
                height: 25px;
                cursor: pointer;
            }
        `
    ],
})

export class ClassSheetDistributionComponent extends PagedListingComponentBase<ClassSheetDistributionOutputDto> implements OnInit {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    searchText: string = "";
    students: ComboboxItemDto[];
    selectedStudent: any;

    constructor(
        injector: Injector,
        cd: ChangeDetectorRef,
        private readonly _classSheetsService: ClassSheetsServiceProxy,
        private readonly _studentServeice: StudentServiceProxy
    ) {
        super(injector, cd);
    }

    ngOnInit(): void {
        this._studentServeice.getStudentSelectList(true, true).subscribe(res => {
            this.students = res;
            this.cd.detectChanges();
        });
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
        this.primengTableHelper.isLoading = true;
        this.primengTableHelper.showLoadingIndicator();
        this._classSheetsService.getPaginatedClassSheetDistribution(
            this.selectedStudent ? parseInt(this.selectedStudent.value) : undefined,
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
                this.primengTableHelper.isLoading = false;
                this.cd.detectChanges();
            });
    }

    save(record: ClassSheetDistributionOutputDto) {
        this.primengTableHelper.isLoading = true;
        const input = {
            studentId: record.studentId,
            date: record.date,
            type: record.type,
            distributed: record.distributed
        } as ClassSheetDistributionInputDto;
        this._classSheetsService.distributeClassSheet(input).subscribe(res => {
            this.notify.success("Successfully Updated");
            this.primengTableHelper.isLoading = false;
            this.cd.detectChanges();
        });
    }



}
