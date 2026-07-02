import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AttendanceEntryOutputDto, AttendanceOutputDto, AttendanceServiceProxy, ComboboxItemDto, StudentServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import moment from 'moment';
import { AttendanceEntryComponent } from './attendance-entry/attendance-entry.component';

@Component({
  selector: 'app-attendances',
  standalone: false,
  templateUrl: './attendances.component.html',
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

export class AttendancesComponent extends PagedListingComponentBase<AttendanceOutputDto> implements OnInit {
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  date = new Date();
  isBteb?: string = undefined;
  activeOnly: string = "true";
  present?: string = undefined;

  students: ComboboxItemDto[];
  selectedStudent: any;

  constructor(
    injector: Injector,
    cd: ChangeDetectorRef,
    private readonly _attendanceService: AttendanceServiceProxy,
    private readonly _studentService: StudentServiceProxy,
    private readonly _modalService: BsModalService
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this._studentService.getStudentSelectList(true, true).subscribe(res => {
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

    this.primengTableHelper.showLoadingIndicator();
    const isBteb = this.isBteb?.toString() == "true" ? true : this.isBteb?.toString() == "false" ? false : undefined;
    const activeOnly = this.activeOnly == "true" ? true :  false;
    const present = this.present?.toString() == "true" ? true : this.present?.toString() == "false" ? false : undefined;
    debugger;
    this._attendanceService.getPaginatedAttendances(
      this.date ? moment(this.date) : undefined,
      this.selectedStudent ? parseInt(this.selectedStudent.value) : undefined,
      isBteb,
      activeOnly,
      present,
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
    this.showEntryDialog();
  }

  edit() {
    this.showEntryDialog(new Date());
  }

  private showEntryDialog(date?: Date): void {
    let entryDialog: BsModalRef;
    entryDialog = this._modalService.show(
      AttendanceEntryComponent,
      {
        class: "modal-lg",
        initialState: {
          date: date,
        },
      }
    );
    entryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }

}
