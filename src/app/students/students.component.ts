import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { BtebSessionServiceProxy, ComboboxItemDto, StudentEntryInputDto, StudentOutputDto, StudentServiceProxy } from '@shared/service-proxies/service-proxies';
import { Table } from 'primeng/table';
import { Paginator } from "primeng/paginator";
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { StudentEntryComponent } from './student-entry/student-entry.component';

@Component({
  selector: 'app-students',
  standalone: false,
  templateUrl: './students.component.html',
  animations: [appModuleAnimation()],
  styles: [
    `
      .truncated-cell {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px; /* Adjust or use a percentage if column sizes are fixed */
      }
      .no-wrap {
        white-space: nowrap;
      }
    `
  ]
})

export class StudentsComponent extends PagedListingComponentBase<StudentOutputDto> implements OnInit {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";
  isBteb?: boolean = null;
  isBtebAdmitted: boolean = null;
  isBtebRegistered: boolean = null;
  courseCompleted: boolean = null;
  certificateDistributed: boolean = null;
  btebSessionId: number = null;
  courseId: number = null;
  btebSessions: ComboboxItemDto[] = [];
  courses: ComboboxItemDto[] = [];
  isActive?: string = undefined;

  constructor(
    injector: Injector,
    private readonly _studentService: StudentServiceProxy,
    private readonly _btebSession: BtebSessionServiceProxy,
    private readonly _modalService: BsModalService,
    cd: ChangeDetectorRef
  ) {
    super(injector, cd);
  }

  ngOnInit(): void {
    this._studentService.getIccCoursesSelectList().subscribe(res => {
      this.courses = res;
      this.cd.detectChanges();
    });
    this._btebSession.getBtebSessionsSelectList().subscribe(res => {
      this.btebSessions = res;
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
    const isBteb = this.isBteb?.toString() == "true" ? true : this.isBteb?.toString() == "false" ? false : undefined;
    const isBtebAdmitted = this.isBtebAdmitted?.toString() == "true" ? true : this.isBtebAdmitted?.toString() == "false" ? false : undefined;
    const isBtebRegistered = this.isBtebRegistered?.toString() == "true" ? true : this.isBtebRegistered?.toString() == "false" ? false : undefined;
    const courseCompleted = this.courseCompleted?.toString() == "true" ? true : this.courseCompleted?.toString() == "false" ? false : undefined;
    const certificateDistributed = this.certificateDistributed?.toString() == "true" ? true : this.certificateDistributed?.toString() == "false" ? false : undefined;
    const sessionId = (this.btebSessionId == null || this.btebSessionId.toString() == "null") ? undefined : this.btebSessionId;
    const courseId = (this.courseId == null || this.courseId.toString() == "null") ? undefined : this.courseId;
    const isActive = this.isActive?.toString() == "true" ? true : this.isActive?.toString() == "false" ? false : undefined;

    this._studentService.getPaginatedStudents(
      isBteb,
      isBtebAdmitted,
      isBtebRegistered,
      courseCompleted,
      certificateDistributed,
      sessionId,
      courseId,
      isActive,
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

  clearFilters() {
    this.searchText = "";
    this.isBteb = null;
    this.isBtebAdmitted = null;
    this.isBtebRegistered = null;
    this.courseCompleted = null;
    this.certificateDistributed = null;
    this.btebSessionId = null;
    this.courseId = null;
    this.list();
  }

  create() {
    const student = new StudentEntryInputDto();
    student.isActive = true; 
    this.showentryDialog(student);
  }

  edit(id: number) {
    this._studentService.get(id).subscribe(res => {
      this.showentryDialog(res);
    });
  }


  private showentryDialog(student: StudentEntryInputDto): void {
    let entryDialog: BsModalRef;
    entryDialog = this._modalService.show(
      StudentEntryComponent,
      {
        class: "modal-xl",
        initialState: {
          model: student,
        },
      }
    );
    entryDialog.content.onSave.subscribe(() => {
      this.refresh();
    });
  }
}
