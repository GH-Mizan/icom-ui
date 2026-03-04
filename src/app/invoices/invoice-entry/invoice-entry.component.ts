import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { ClientServiceProxy, ComboboxItemDto, InvoiceDetailsEntryDto, InvoicedProductInfoDto, InvoiceEntryDto, InvoiceEntryInputDto, InvoiceServiceProxy, InvoiceType, PricelistServiceProxy, ServiceServiceProxy, ServiceType } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/app-component-base";
import { firstValueFrom } from "rxjs";
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';
import { Utils } from '@shared/helpers/Utils';


@Component({
    selector: 'app-invoice-entry',
    templateUrl: './invoice-entry.component.html',
    standalone: false
})

export class InvoiceEntryComponent extends AppComponentBase implements OnInit {

    @Output() onSave = new EventEmitter<any>();
    model: InvoiceEntryDto;
    invoiceDetails: InvoiceDetailsEntryDto[];

    clients: ComboboxItemDto[];
    selectedClient: any;
    types: ComboboxItemDto[];
    date = new Date();

    products: ComboboxItemDto[];
    productId: string = "";
    productObj: any;
    serialNumber: string;
    warrantyPeriod: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;

    productInfo: InvoicedProductInfoDto;
    totalValues: any;

    saving = false;
    loading = true;
    editMode = false;
    selectedUid: string;
    isSeal = false;
    pdfMake: any;
    sealText: string;
    productInvoice = true;

    serviceTypes: ComboboxItemDto[];
    serviceType: string = "";
    blankRows: number = 17;


    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _pricelistService: PricelistServiceProxy,
        private readonly _invoiceService: InvoiceServiceProxy,
        private readonly _clientService: ClientServiceProxy,
        private readonly _serviceService: ServiceServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);
    }

    async ngOnInit() {
        await Promise.all([
            this.getInvoiceNumber(),
            this.loadTypes(),
            this.loadClients(),
            this.loadProducts()
        ]);

        if (this.model?.id) {
            this.date = this.model.date.toDate();
            this.selectedClient = {
                displayText: this.clients.find(f => f.value == this.model.clientId.toString()).displayText,
                isSelected: false,
                value: this.model.clientId.toString()
            }
            if (this.model.invoiceType == InvoiceType._2) {
                this.productInvoice = false;
                await this.loadServiceTypes();
            } else {
                this.productInvoice = true;

            }
            this.calculateTotalValues();
            this.cd.detectChanges();
        }

        this.productInfo = {
            warrantyPeriods: []
        } as InvoicedProductInfoDto;
        this.loading = false;
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

    async getInvoiceNumber() {
        if (!this.model.id) {
            this.model.invoiceNumber = await firstValueFrom(this._invoiceService.generateNewInvoiceNumber());
        }
    }

    async loadProducts() {
        this.products = await firstValueFrom(this._pricelistService.getProductsSelectList());
        this.cd.detectChanges();
    }

    async loadTypes() {
        this.types = await firstValueFrom(this._invoiceService.getInvoiceTypesSelectList());
        this.cd.detectChanges();
    }

    async loadClients() {
        this.clients = await firstValueFrom(this._clientService.getClientsSelectList());
        this.cd.detectChanges();
    }

    async loadServiceTypes() {
        if (!this.serviceTypes || this.serviceTypes.length == 0) {
            this.serviceTypes = await firstValueFrom(this._serviceService.getServiceTypesSelectList());
            this.cd.detectChanges();
        }

    }

    async onTypeChanged() {
        this.invoiceDetails = [];
        this.calculateTotalValues();
        if (this.model.invoiceType == InvoiceType._1) {
            this.serviceType = undefined;
            this.productInvoice = true;
        } else {
            this.productInvoice = false;
            await this.loadServiceTypes();
        }
        this.clear();
    }

    async onProductChanged() {
        this.saving = true;
        this.cd.detectChanges();
        this.productId = this.productObj.value;
        this.productInfo = await firstValueFrom(this._invoiceService.getWarrantyPeriodsSelectList(parseInt(this.productId)));
        if (this.productInfo.warrantyPeriods.length === 1) this.warrantyPeriod = this.productInfo.warrantyPeriods[0].value;
        if (this.productInfo.category === "Stamp Seal") {
            this.isSeal = true;
            this.warrantyPeriod = "";
            this.serialNumber = "";
        } else {
            this.isSeal = false;
            this.sealText = "";
        }
        this.saving = false;
        this.cd.detectChanges();
    }

    calculateIndividualTotal() {
        if (!this.quantity) this.quantity = 0;
        if (!this.unitPrice) this.unitPrice = 0;
        this.totalAmount = this.quantity * this.unitPrice;
    }

    async edit(record: InvoiceDetailsEntryDto) {
        this.editMode = true;
        this.selectedUid = record.uid;
        if (this.productInvoice) {
            this.productId = record.productId.toString();
            this.productObj = {
                displayText: this.products.find(f => f.value == this.productId.toString()).displayText,
                isSelected: false,
                value: this.productId.toString()
            };
            await this.onProductChanged();
            this.warrantyPeriod = record.warrantyPeriod;
            this.serialNumber = record.serialNumber;
        } else {
            this.serviceType = record.serviceType.toString();
        }

        this.unitPrice = record.unitPrice;
        this.quantity = record.quantity;
        this.totalAmount = record.totalAmount;
        this.cd.detectChanges();
    }

    updateList() {
        const detail = this.invoiceDetails.find(f => f.uid == this.selectedUid);
        if (this.productInvoice) {
            detail.productId = parseInt(this.productId);
            detail.productName = this.products.find(f => f.value === this.productId).displayText;
            detail.category = this.productInfo.category;
            detail.brand = this.productInfo.brand;
            detail.serialNumber = this.serialNumber;
            detail.sealText = this.sealText;
            detail.warrantyPeriod = this.warrantyPeriod;
        } else {
            const serviceTypeObject = this.convertServiceTypeToEnum();
            detail.serviceType = serviceTypeObject.type;
            detail.serviceTypeText = serviceTypeObject.displayText;
        }
        detail.unitPrice = this.unitPrice;
        detail.quantity = this.quantity;
        detail.totalAmount = this.totalAmount;
        this.selectedUid = "";
        this.editMode = false;
        this.calculateTotalValues();
        this.clear();
    }

    deleteFromList(uid: string) {
        this.invoiceDetails = this.invoiceDetails.filter(f => f.uid != uid);
        this.calculateTotalValues();
        this.cd.detectChanges();
    }

    addToList() {
        if (this.productInvoice) {
            const invoiceDetail = {
                id: undefined,
                invoiceId: 0,
                productId: parseInt(this.productId),
                productName: this.products.find(f => f.value === this.productId).displayText,
                category: this.productInfo.category,
                brand: this.productInfo.brand,
                serialNumber: this.serialNumber,
                sealText: this.sealText,
                warrantyPeriod: this.warrantyPeriod,
                unitPrice: this.unitPrice,
                quantity: this.quantity,
                totalAmount: this.totalAmount,
                //serviceType: this.serviceType == _1 ? ServiceType.,
                uid: uuidv4()
            } as InvoiceDetailsEntryDto;
            this.invoiceDetails.push(invoiceDetail);
        } else {
            const serviceTypeObject = this.convertServiceTypeToEnum();

            const invoiceDetail = {
                id: undefined,
                invoiceId: 0,
                serviceType: serviceTypeObject.type,
                serviceTypeText: serviceTypeObject.displayText,
                unitPrice: this.unitPrice,
                quantity: this.quantity,
                totalAmount: this.totalAmount,
                //serviceType: this.serviceType == _1 ? ServiceType.,
                uid: uuidv4()
            } as InvoiceDetailsEntryDto;
            this.invoiceDetails.push(invoiceDetail);
        }

        this.calculateTotalValues();
        this.clear();
    }

    convertServiceTypeToEnum() {
        const serviceTypeObject: any = {
            displayText: this.serviceTypes.find(f => f.value == this.serviceType).displayText
        };
        switch (this.serviceType) {
            case "1":
                serviceTypeObject.type = ServiceType._1;
                break;
            case "2":
                serviceTypeObject.type = ServiceType._2;
                break;
            case "3":
                serviceTypeObject.type = ServiceType._3;
                break;
            case "4":
                serviceTypeObject.type = ServiceType._4;
                break;
            case "5":
                serviceTypeObject.type = ServiceType._5;
                break;
        };
        return serviceTypeObject;
    }

    calculateTotalValues() {
        this.totalValues = this.invoiceDetails.reduce((accumulator, item) => {
            accumulator.quantity += item.quantity;
            accumulator.totalBill += item.totalAmount;
            return accumulator;
        }, { quantity: 0, totalBill: 0 });
    }

    clear() {
        this.productId = "";
        this.productObj = undefined;
        this.serialNumber = "";
        this.sealText = "";
        this.warrantyPeriod = "";
        this.quantity = 0;
        this.unitPrice = 0;
        this.totalAmount = 0;
        this.serviceType = undefined;
        this.cd.detectChanges();
    }

    save() {
        this.saving = true;
        const model = this.model;
        model.date = moment(this.date);

        model.clientId = parseInt(this.selectedClient.value);
        model.totalBill = this.totalValues.totalBill;

        const details: InvoiceDetailsEntryDto[] = [];
        this.invoiceDetails.filter(f => f.quantity > 0 && f.totalAmount > 0).forEach(x => {
            details.push({
                productId: x.productId,
                serialNumber: x.serialNumber,
                sealText: x.sealText,
                warrantyPeriod: x.warrantyPeriod,
                serviceType: x.serviceType,
                unitPrice: x.unitPrice,
                quantity: x.quantity,
                totalAmount: x.totalAmount
            } as InvoiceDetailsEntryDto);
        });

        const input = {
            invoice: model,
            invoiceDetails: details
        } as InvoiceEntryInputDto;

        this._invoiceService.createOrUpdateInvoice(input).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });

    }

    async print(download?: boolean) {
        if (!this.invoiceDetails) {
            abp.message.info("No record(s) found", "Sorry!");
            return;
        }
        const totalValues = this.invoiceDetails.reduce((accumulator, item) => {
            accumulator.quantity += item.quantity;
            accumulator.totalBill += item.totalAmount;
            return accumulator;
        }, { quantity: 0, totalBill: 0 });
        const logo = await Utils.getImageDataUrl('assets/img/logo.png');
        const model = this.model;
        model.clientId = parseInt(this.selectedClient.value);
        const clientContact = await firstValueFrom(this._clientService.getClientContactNumber(model.clientId));


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
        if (this.productInvoice) {
            const dd = {
                pageSize: 'A4',
                pageMargins: [30, 20, 30, 20],
                content: [
                    Utils.getReportHeaders(logo),
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [{ text: `Sales Invoice`, bold: true, fontSize: 13, alignment: 'center', borderColor: ['grey', 'grey', 'grey', 'grey'], fillColor: 'lightgrey' }],
                            ]
                        }
                    },
                    { text: ' ', fontSize: 10 },
                    {
                        layout: 'noBorders',
                        table: {
                            widths: [80, '*', 80, 80],
                            body: [
                                [{ text: 'Invoice:', style: ['invoiceHeaderLabel'] }, { text: model.invoiceNumber, style: ['invoiceHeaderText'] }, { text: 'Date:', style: ['invoiceHeaderLabel', 'textRight'] }, { text: moment(this.date).format('D-MMM-YY').toString(), style: ['invoiceHeaderText', 'textRight'] }],
                                [{ text: 'Client:', style: ['invoiceHeaderLabel'] }, { text: this.selectedClient.displayText, style: ['invoiceHeaderText'] }, { text: 'Contact No.', style: ['invoiceHeaderLabel', 'textRight'] }, { text: clientContact, style: ['invoiceHeaderText', 'textRight'] }],
                            ]
                        }
                    },
                    { text: ' ', fontSize: 15 },
                    {
                        layout: {
                            hLineColor: () => 'lightgrey',
                            vLineColor: () => 'lightgrey',
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                        },
                        table: {
                            widths: ['*', 100, 55, 30, 40, 65],
                            body: this.getData(this.invoiceDetails, totalValues)
                        }
                    },
                    { text: ' ', fontSize: 5 },

                    { text: `In words: ${Utils.capitalizeFirstLetter(Utils.inWords(totalValues.totalBill))} taka only.`, fontSize: 10 },

                    { text: ' ', fontSize: 10 },

                    { text: 'Terms & Conditions', fontSize: 10, bold: true },
                    { text: '1. Goods once sold will not be refunded & changed.', fontSize: 10 },
                    { text: '2. VAT & Taxes are not included in the above price.', fontSize: 10 },
                    { text: '3. Warranty Policy: Any physical damage, burn, case, short circuit, or unauthorized repair is not under warranty', fontSize: 10 },
                    { text: ' ', fontSize: 70 },
                    {
                        layout: 'topLineOnly',
                        table: {
                            widths: ['*', '*'],
                            body: [
                                [{ text: 'Customer Signature', fontSize: 11 }, { text: 'Authorized Signature', fontSize: 11, style: ['textRight'] }],

                            ]
                        },
                    },
                ],
                defaultStyle: {
                    font: 'TimesNewRoman'
                },
                styles: {
                    headerStyle: {
                        fontSize: 12,
                        bold: true
                    },
                    subHeader: {
                        fontSize: 10,
                        bold: true,
                        alignment: 'center'
                    },
                    cell_style: {
                        fontSize: 10,
                        alignment: 'center'
                    },
                    footerStyle: {
                        fontSize: 11,
                        bold: true,
                        alignment: 'right'
                    },
                    footerParticular: {
                        fontSize: 10,
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
                        fontSize: 12
                    },
                    invoiceHeaderText: {
                        fontSize: 12
                    },
                    cellAmount: {
                        fontSize: 10,
                        alignment: 'right'
                    }
                }
            };

            //if(download) this.pdfMake.createPdf(dd).download( `Sales Invoive${moment(this.date).format('D-MMM-YY').toString()}.pdf`);
            this.pdfMake.createPdf(dd).open();
            //this.loading = false;
        } else {
            const dd = {
                pageSize: 'A4',
                pageMargins: [30, 20, 30, 20],
                content: [
                    Utils.getReportHeaders(logo),
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [{ text: `Sales Invoice`, bold: true, fontSize: 13, alignment: 'center', borderColor: ['grey', 'grey', 'grey', 'grey'], fillColor: 'lightgrey' }],
                            ]
                        }
                    },
                    { text: ' ', fontSize: 10 },
                    {
                        layout: 'noBorders',
                        table: {
                            widths: [80, '*', 80, 80],
                            body: [
                                [{ text: 'Invoice:', style: ['invoiceHeaderLabel'] }, { text: model.invoiceNumber, style: ['invoiceHeaderText'] }, { text: 'Date:', style: ['invoiceHeaderLabel', 'textRight'] }, { text: moment(this.date).format('D-MMM-YY').toString(), style: ['invoiceHeaderText', 'textRight'] }],
                                [{ text: 'Client:', style: ['invoiceHeaderLabel'] }, { text: this.selectedClient.displayText, style: ['invoiceHeaderText'] }, { text: 'Contact No.', style: ['invoiceHeaderLabel', 'textRight'] }, { text: clientContact, style: ['invoiceHeaderText', 'textRight'] }],
                            ]
                        }
                    },
                    { text: ' ', fontSize: 15 },
                    {
                        layout: {
                            hLineColor: () => 'lightgrey',
                            vLineColor: () => 'lightgrey',
                            hLineWidth: () => 1,
                            vLineWidth: () => 1,
                        },
                        table: {
                            widths: ['*', '*', '*', '*'],
                            body: this.getData(this.invoiceDetails, totalValues)
                        }
                    },
                    { text: ' ', fontSize: 5 },

                    { text: `In words: ${Utils.capitalizeFirstLetter(Utils.inWords(totalValues.totalBill))} TK only`, fontSize: 10 },

                    { text: ' ', fontSize: 10 },

                    { text: 'Terms & Conditions', fontSize: 10, bold: true },
                    { text: '1. Goods once sold will not be refunded & changed.', fontSize: 10 },
                    { text: '2. VAT & Taxes are not included in the above price.', fontSize: 10 },
                    { text: '3. Warranty Policy: Any physical damage, burn, case, short circuit, or unauthorized repair is not under warranty', fontSize: 10 },
                    { text: ' ', fontSize: 70 },
                    {
                        layout: 'topLineOnly',
                        table: {
                            widths: ['*', '*'],
                            body: [
                                [{ text: 'Customer Signature', fontSize: 11 }, { text: 'Authorized Signature', fontSize: 11, style: ['textRight'] }],

                            ]
                        },
                    },
                ],
                defaultStyle: {
                    font: 'TimesNewRoman'
                },
                styles: {
                    headerStyle: {
                        fontSize: 12,
                        bold: true
                    },
                    subHeader: {
                        fontSize: 10,
                        bold: true,
                        alignment: 'center'
                    },
                    cell_style: {
                        fontSize: 10,
                        alignment: 'center'
                    },
                    footerStyle: {
                        fontSize: 11,
                        bold: true,
                        alignment: 'right'
                    },
                    footerParticular: {
                        fontSize: 10,
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
                        fontSize: 12
                    },
                    invoiceHeaderText: {
                        fontSize: 12
                    },
                    cellAmount: {
                        fontSize: 10,
                        alignment: 'right'
                    }
                }
            };
            this.pdfMake.createPdf(dd).open();
        }



    }


    private getData(data: InvoiceDetailsEntryDto[], totalValues) {
        if (this.productInvoice) {
            const body = [
                [{ text: 'Product', style: ['headerStyle'] }, { text: 'Serial', style: ['headerStyle'] }, { text: 'Warranty', style: ['headerStyle'] }, { text: 'Qty', style: ['headerStyle'] }, { text: 'U. P.', style: ['headerStyle', 'textRight'] }, { text: 'Total Price', style: ['headerStyle', 'textRight'] }] as any
            ];
            data.forEach(item => {
                let productText = "";
                if (item.category === "Stamp Seal") {
                    let sealText = "";
                    // if (item.sealText) {
                    //     const sealArray = item.sealText.split('###');
                    //     sealText = `\r\nSealText:\r\n${sealArray[0]}\r\n${sealArray[1]}`
                    // }
                    sealText = `\r\nSealText:\r\n${item.sealText}`;

                    productText = `Category:  ${item.category};   Brand: ${item.brand}\r\n${item.productName}\r\n${sealText}`
                } else {
                    productText = `Category:  ${item.category};   Brand: ${item.brand}\r\n${item.productName}`;
                }

                body.push(
                    [
                        { text: productText, fontSize: 10 },
                        { text: item.serialNumber, style: ['cell_style'] },
                        { text: item.warrantyPeriod, style: ['cell_style'] },
                        { text: item.quantity, style: ['cell_style'] },
                        { text: `${Utils.thousandsSeparator(item.unitPrice)}`, style: ['cell_style'] },
                        { text: `${Utils.thousandsSeparator(item.totalAmount)}`, style: ['cellAmount'] }
                    ]
                );
            });

            let count = data.length + 1;
            if (count < this.blankRows) {
                for (let i = count; i < this.blankRows - count; i++) {
                    body.push([{ text: ' \r\n ' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }]);
                }
            }

            body.push([
                { text: 'Total', style: ['footerStyle'], colSpan: 3, },
                { text: '' },
                { text: '' },
                { text: totalValues.quantity, style: ['footerStyle'] },
                { text: '' },
                { text: `${Utils.thousandsSeparator(totalValues.totalBill)}/-`, style: ['footerStyle'] }
            ]);

            return body;
        } else {
            const body = [
                [{ text: 'Service Type', style: ['headerStyle'] }, { text: 'Qty', style: ['headerStyle'] }, { text: 'U. P.', style: ['headerStyle', 'textRight'] }, { text: 'Total Price', style: ['headerStyle', 'textRight'] }] as any
            ];
            data.forEach(item => {
                const serviceText = this.serviceTypes.find(f => f.value === item.serviceType.toString()).displayText;

                body.push(
                    [
                        { text: serviceText, fontSize: 10 },
                        { text: `${Utils.thousandsSeparator(item.unitPrice)}`, style: ['cell_style'] },
                        { text: item.quantity, style: ['cell_style'] },
                        { text: `${Utils.thousandsSeparator(item.totalAmount)}`, style: ['cellAmount'] }
                    ]
                );
            });

            let count = data.length + 1;
            if (count < this.blankRows) {
                for (let i = count; i < this.blankRows - count; i++) {
                    body.push([{ text: '' }, { text: '' }, { text: '' }, { text: '' }]);
                }
            }

            body.push([
                { text: 'Total', style: ['footerStyle'] },
                { text: '' },
                { text: totalValues.quantity, style: ['footerStyle'] },
                { text: `${Utils.thousandsSeparator(totalValues.totalBill)}/-`, style: ['footerStyle'] }
            ]);

            return body;
        }

    }

}
