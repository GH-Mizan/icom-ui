import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                children: [
                    {
                        path: 'home',
                        loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'about',
                        loadChildren: () => import('./about/about.module').then((m) => m.AboutModule),
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'users',
                        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
                        data: { permission: 'Pages.Users' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'roles',
                        loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
                        data: { permission: 'Pages.Roles' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'tenants',
                        loadChildren: () => import('./tenants/tenants.module').then((m) => m.TenantsModule),
                        data: { permission: 'Pages.Tenants' },
                        canActivate: [AppRouteGuard],
                    },
                    {
                        path: 'update-password',
                        loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
                        canActivate: [AppRouteGuard],
                    },
                    { path: 'brands', loadChildren: () => import('./brands/brands.module').then(m => m.BrandsModule) },
                    { path: 'suppliers', loadChildren: () => import('./suppliers/suppliers.module').then(m => m.SuppliersModule) },
                    { path: 'categories', loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesModule) },
                    { path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) },
                    { path: 'pricelists', loadChildren: () => import('./pricelists/pricelists.module').then(m => m.PricelistsModule) },
                    { path: 'inventories', loadChildren: () => import('./inventories/inventories.module').then(m => m.InventoriesModule) },
                    { path: 'sales', loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule) },
                    { path: 'clients', loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule) },
                    { path: 'services', loadChildren: () => import('./services/services.module').then(m => m.ServicesModule) },
                ],
            },
            
            
            
           
            
            


        ]),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
