import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { StudentEntryInputDto, StudentOutputDto, StudentServiceProxy } from '@shared/service-proxies/service-proxies';
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
})

export class StudentsComponent extends PagedListingComponentBase<StudentOutputDto> {

  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  searchText: string = "";

  constructor(
    injector: Injector,
    private readonly _studentService: StudentServiceProxy,
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
    this._studentService.getPaginatedStudents(
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
    const student = new StudentEntryInputDto();
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
