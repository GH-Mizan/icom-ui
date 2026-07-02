import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { AppComponentBase } from "@shared/app-component-base";
import { AttendanceEntryDto, AttendanceEntryInputDto, AttendanceOutputDto, AttendanceServiceProxy, IccCourses } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from 'ngx-bootstrap/modal';
import moment from "moment";
import { Utils } from "@shared/helpers/Utils";
import { style } from "@node_modules/@angular/animations";

@Component({
    selector: 'app-attendance-entry',
    templateUrl: './attendance-entry.component.html',
    styles: [
        `
            .chkBig {
                width: 25px;
                height: 25px;
                cursor: pointer;
            }
        `
    ],
    standalone: false
})

export class AttendanceEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();

    busy: boolean = false;
    date;
    editMode: boolean;
    declareOffDay: boolean;
    attendances: AttendanceOutputDto[] = [];
    pdfMake: any;
    offDayReason: string;

    /**
     *
     */
    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _attendanceService: AttendanceServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);

    }

    async ngOnInit() {
        this.busy = true;
        this._attendanceService.getAttendances(this.date ? moment(this.date) : undefined).subscribe(res => {
            this.editMode = res.editMode;
            this.attendances = res.attendances;
            this.date = res.date.toDate();
            this.cd.detectChanges();
        });
        this.pdfMake = await this.loadAndPrintPDF();
        this.cd.detectChanges();

    }

    async loadAndPrintPDF() {
        const { default: pdfMake } = await import('pdfmake/build/pdfmake');
        const { default: pdfFonts } = await import('../../../assets/vfs_fonts');
        pdfMake.addFonts({
            'TimesNewRoman': {
                normal: 'times-Regular.ttf',
                bold: 'Times New Roman Bold.ttf'
            },
            'CourierBold': {
                normal: 'Courier BOLD.ttf',
                bold: 'Courier BOLD.ttf'
            },
            'LucidaGrande': {
                bold: 'LucidaGrandeBold.ttf'
            }
        });

        pdfMake.addVirtualFileSystem(pdfFonts);
        return pdfMake;
    }

    save() {
        debugger;
        if (!this.declareOffDay) {
            const input = {
                editMode: false,
                date: moment(this.date),
                course: IccCourses._1
            } as AttendanceEntryInputDto;
            const attendances: AttendanceEntryDto[] = [];
            this.attendances.forEach(atn => {
                const start = atn.entryTime ? moment(atn.entryTime).format('hh:mm:ss a') : null;
                const end = atn.endTime ? moment(atn.endTime).format('hh:mm:ss a') : null;
                attendances.push({
                    studentId: atn.studentId,
                    day: atn.day,
                    present: atn.present,
                    entryTime: start,
                    endTime: end,
                    remarks: atn.remarks,
                    offDay: false
                } as AttendanceEntryDto);
            });
            input.attedances = attendances;
            this._attendanceService.createUpdateAttendance(input).subscribe(res => {
                this.notify.info(this.editMode ? "Successfully Updated" : "Successfully Saved");
                this.bsModalRef.hide();
                this.onSave.emit();
                //this.saving = false;
                this.cd.detectChanges();
            });
        } else {
            this._attendanceService.declareOffDay(moment(this.date), this.offDayReason).subscribe(res => {
                this.notify.info(this.editMode ? "Successfully Updated" : "Successfully Saved");
                this.bsModalRef.hide();
                this.onSave.emit();
                //this.saving = false;
                this.cd.detectChanges();
            });
        }

    }

    async print() {
        if (!this.attendances) {
            abp.message.info("No record(s) found", "Sorry!");
            return;
        }

        const logo = await Utils.getImageDataUrl('assets/img/logo.png');


        this.pdfMake.tableLayouts = {
            topLineOnly: {
                hLineWidth: function (i, node) {
                    // Only draw line at the very top of the table
                    return (i === 0) ? 1 : 0;
                },
                vLineWidth: function (i) {
                    return 0; // No vertical lines
                },
                hLineColor: function (i) {
                    return 'grey';
                },
                paddingLeft: function (i) { return 0; },
                paddingRight: function (i) { return 0; },
                paddingTop: function (i) { return 2; }, // Space between line and text
                paddingBottom: function (i) { return 0; }
            }
        };

        const dd = {
            pageSize: 'A4',
            pageMargins: [40, 40, 30, 40],
            content: [
                {
                    layout: 'noBorders',
                    table: {
                        widths: ['*'],
                        body: [

                            [{ text: `Institute of Computer Communication`, bold: true, fontSize: 14, alignment: 'center' }],
                            [{ text: `Daily Attendance Sheet (Computer Office Application)`, fontSize: 13, alignment: 'center' }]
                        ]
                    }
                },
                {
                    layout: 'noBorders',
                    table: {
                        widths: ['*'],
                        body: [
                            [{ text: `Date: ${moment(this.date).format('D-MMM-YY').toString()}; Day: ${new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(this.date)}`, style: ['textCenter'] }],

                        ]
                    }
                },
                { text: ' ', fontSize: 5 },
                {
                    layout: {
                        hLineColor: () => 'lightgrey',
                        vLineColor: () => 'lightgrey',
                        hLineWidth: () => 1,
                        vLineWidth: () => 1,
                    },
                    keepWithHeaderRows: 1,
                    dontBreakRows: true,
                    table: {
                        widths: [20, 120, 100, 110, '*'],
                        body: this.getData(this.attendances)
                    },
                }
            ],
            defaultStyle: {
                font: 'TimesNewRoman',
                fontSize: 14
            },
            styles: {
                headerStyle: {
                    bold: true
                },
                subHeader: {
                    bold: true,
                    alignment: 'center'
                },
                cell_style: {
                    alignment: 'center'
                },
                footerStyle: {
                    bold: true,
                    alignment: 'right'
                },
                footerParticular: {
                    bold: true,
                    alignment: 'center'
                },
                textCenter: {
                    alignment: 'center'
                },
                textRight: {
                    alignment: 'right'
                },
                invoiceHeaderLabel: {
                    bold: true,
                },
            }
        };
        this.pdfMake.createPdf(dd).open();



    }


    private getData(data: AttendanceOutputDto[]) {
        if (this.declareOffDay) {
            const body = [
                [{ text: 'Off Day', colSpan: "5", marginTop: 200, alignment: "center", bold: true, fontSize: 50 }, {}, {}, {}, {}] as any,
                [{ text: `${this.offDayReason}`, colSpan: "5", marginTop: 10, alignment: "center", fontSize: 14 }, {}, {}, {}, {}] as any
            ];
            return body;
        } else {
            const body = [
                [{ text: 'SL', style: ['headerStyle', 'textCenter'] }, { text: `ID \n Name`, style: ['headerStyle', 'textCenter'] }, { text: `Is BTEB | Day  \n Session`, style: ['headerStyle', 'textCenter'] }, { text: `Entry Time \n Exit Time`, style: ['headerStyle', 'textCenter'] }, { text: 'Signature', style: ['headerStyle', 'textCenter'] }] as any
            ];
            data.forEach((item, index) => {
                const isBtebText = item.bteb ? 'Yes' : 'No';
                body.push(
                    [
                        { text: index + 1, fontSize: 10, style: ['textCenter'] },
                        { text: `${item.identityNumber} \n ${item.studentName}` },
                        { text: `${isBtebText} | ${item.day} \n ${item.btebSession ?? ""}`, style: ['cell_style'] },
                        { text: `` }, { text: `` },
                    ]
                );
            });
            return body;
        }

        // const totalRows = data.length;
        // let hasNextPage = false;

        // const metaData: AttendanceOutputDto[][] = [];
        // let slicedData: AttendanceOutputDto[] = [];

        // if (totalRows > 10) {
        //     hasNextPage = true;
        //     const partition = Math.ceil(totalRows / 10);
        //     for (let i = 0; i < partition; i++) {
        //         slicedData = [];
        //         const itemsToTransfer = data.slice(0, 10);
        //         slicedData.push(...itemsToTransfer);
        //         data.splice(0, 10);
        //         metaData.push(slicedData);
        //     }
        // }

        // if (!hasNextPage) {
        //     data.forEach((item, index) => {
        //         const isBtebText = item.bteb ? 'Yes' : 'No';
        //         body.push(
        //             [
        //                 { text: index + 1, fontSize: 10, style: ['textCenter'] },
        //                 { text: `${item.identityNumber} \n ${item.studentName}` },
        //                 { text: `${item.day} \n ${isBtebText} \n ${item.btebSession ?? ""}`, style: ['cell_style'] },
        //                 { text: `` }, { text: `` },
        //             ]
        //         );
        //     });
        // }
        // else {
        //     metaData.forEach((items, mIndex) => {
        //         items.forEach((item, index) => {
        //             const isBtebText = item.bteb ? 'Yes' : 'No';
        //             body.push(
        //                 [
        //                     { text: index + 1, fontSize: 10, style: ['textCenter'] },
        //                     { text: `${item.identityNumber} \n ${item.studentName}` },
        //                     { text: `${item.day} \n ${isBtebText} \n ${item.btebSession ?? ""}`, style: ['cell_style'] },
        //                     { text: `` }, { text: `` },
        //                 ]
        //             );
        //         });
        //         body.push([{ text: '' }, { text: '' }, { text: ''}, { text: '' }, { text: '', pageBreak: 'after' }]);
        //     });
        // }



    }
}