import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppAuthService } from '@shared/auth/app-auth.service';
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from 'ngx-bootstrap/dropdown';
import { LocalizePipe } from '@shared/pipes/localize.pipe';
import { ChangePasswordComponent } from '@app/users/change-password/change-password.component';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

@Component({
    selector: 'header-user-menu',
    templateUrl: './header-user-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective, LocalizePipe],
})
export class HeaderUserMenuComponent {
    constructor(
        private _authService: AppAuthService,
        private _modalService: BsModalService) { }

    logout(): void {
        this._authService.logout();
    }

    changePassword() {
        this.showChangePasswordDialog();
    }

    private showChangePasswordDialog(): void {
        let changePasswordDialog: BsModalRef;
        changePasswordDialog = this._modalService.show(
            ChangePasswordComponent,
            {
                class: "modal-lg"
            }
        );
        changePasswordDialog.content.onSave.subscribe(() => {
            changePasswordDialog.hide();
        });
    }
}
