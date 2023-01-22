import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input'
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule, MAT_LEGACY_SNACK_BAR_DEFAULT_OPTIONS as MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/legacy-snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';

import { environment } from '../environments/environment';
import { BASE_PATH } from './generated/variables';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { SetupComponent } from './components/setup/setup.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';
import { GameComponent } from './components/game/game.component';
import { HeaderComponent } from './components/header/header.component';
import { InfoBarComponent } from './components/info-bar/info-bar.component';
import { ShipStatusComponent } from './components/info-bar/ship-status/ship-status.component';
import { MapComponent } from './components/map/map.component';
import { ActionDisplayComponent } from './components/info-bar/action-display/action-display.component';
import { CityComponent } from './components/city/city.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    SetupComponent,
    GameComponent,
    HeaderComponent,
    InfoBarComponent,
    ShipStatusComponent,
    MapComponent,
    ActionDisplayComponent,
    CityComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    NgxMatColorPickerModule,
    FormsModule,
    HttpClientModule,
    FormsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    NgxMatColorPickerModule,
    MatSidenavModule,
    MatToolbarModule
  ],
  providers: [
    { provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3500 } },
    { provide: BASE_PATH, useValue: environment.apiUrl },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
