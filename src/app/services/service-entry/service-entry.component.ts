import { ChangeDetectorRef, Component, EventEmitter, Injector, OnInit, Output } from "@angular/core";
import { AppComponentBase } from "../../../shared/app-component-base";
import { ClientServiceProxy, ComboboxItemDto, PaymentStatus, ServiceDueReceivedHistoryDto, ServiceEntryDto, ServiceEntryInputDto, ServiceServiceProxy } from "@shared/service-proxies/service-proxies";
import { BsModalRef } from "ngx-bootstrap/modal";
import moment from "moment";
import { debounceTime, distinctUntilChanged, firstValueFrom, map, Observable } from "rxjs";

@Component({
    selector: 'app-service-entry',
    templateUrl: './service-entry.component.html',
    standalone: false,
    styles: [
        `
            /* Chrome, Safari, Edge, Opera */
            input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            /* Firefox */
            input[type=number] {
                -moz-appearance: textfield;
            }
                       
        `
    ]
})

export class ServiceEntryComponent extends AppComponentBase implements OnInit {
    @Output() onSave = new EventEmitter<any>();
    model: ServiceEntryDto;

    serviceTypes: ComboboxItemDto[];
    selectedServiceTypes!: any[];
    clients: ComboboxItemDto[];
    selectedClient: any;
    date = new Date();

    saving = false;
    loading = true;

    constructor(
        injector: Injector,
        public bsModalRef: BsModalRef,
        private readonly _servicesService: ServiceServiceProxy,
        private readonly _clientService: ClientServiceProxy,
        private cd: ChangeDetectorRef
    ) {
        super(injector);

    }

    async ngOnInit() {
        await Promise.all([
            this.loadServiceTypes(),
            this.loadClients()
        ]);
        if (this.model?.id) {
            this.date = this.model.date.toDate();
            this.selectedClient = {
                displayText: this.clients.find(f => f.value == this.model.clientId.toString()).displayText,
                isSelected: false,
                value: this.model.clientId.toString()
            }
            this.selectedServiceTypes = [];
            const serviceTypesArray = this.model.serviceTypes.split(',');
            serviceTypesArray.forEach(x => {
                this.selectedServiceTypes.push({
                    value: x.trim(), 
                    displayText: this.serviceTypes.find(f=> f.value === x.trim()).displayText,
                    isSelected: false 
                } as ComboboxItemDto);
            });
         
            this.cd.detectChanges();
        }

        this.loading = false;
        this.cd.detectChanges();
    }

    // search = (text$: Observable<string>) =>
    //     text$.pipe(
    //         debounceTime(200),
    //         distinctUntilChanged(),
    //         map(term => term === '' ? [] : this.products.filter(v => v.displayText.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    //     );


    async loadClients() {
        this.clients = await firstValueFrom(this._clientService.getClientsSelectList());
        this.cd.detectChanges();
    }

    async loadServiceTypes() {
        this.serviceTypes = await firstValueFrom(this._servicesService.getServiceTypesSelectList());
        this.cd.detectChanges();
    }

    save() {
        this.saving = true;
        //this.model.sales.date = moment(this.date);
        //this.model.clientId = parseInt(this.selectedClient.value);
        //this.model.productsJson = JSON.stringify(this.saleProducts);
        const model = this.model;
        model.date = moment(this.date);
        model.clientId = parseInt(this.selectedClient.value);
        model.serviceTypes = this.selectedServiceTypes.map(item => item.value).join(', ');
        model.paymentStatus = model.due == 0 ? PaymentStatus._1 : model.serviceCharge == model.due ? PaymentStatus._3 : PaymentStatus._2

        const input = {
            service: model
        } as ServiceEntryInputDto;

        input.dueReceived = {
            serviceId: model.id,
            clientId: model.clientId,
            paymentStatus: model.due == 0 ? PaymentStatus._1 : model.serviceCharge == model.due ? PaymentStatus._3 : PaymentStatus._2,
            grandTotal: model.serviceCharge,
            totalPaid: model.totalPaid,
            due: model.due,
            default: true
        } as ServiceDueReceivedHistoryDto;

        this._servicesService.createOrUpdate(input).subscribe(() => {
            this.notify.info(this.model.id ? "Successfully Updated" : "Successfully Saved");
            this.bsModalRef.hide();
            this.onSave.emit();
            this.saving = false;
            this.cd.detectChanges();
        });
    }

    calculateDue() {
        this.model.due = this.model.serviceCharge - this.model.totalPaid;
    }



}