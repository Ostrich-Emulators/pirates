import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { SetupComponent } from './components/setup/setup.component';
import { GameComponent } from './components/game/game.component';

import { GameService } from './services/game.service';
import { ShipService } from './services/ship.service';
import { InfoBarComponent } from './components/info-bar/info-bar.component';
import { MapComponent } from './components/map/map.component';
import { CrewDisplayComponent } from './components/info-bar/crew-display/crew-display.component';
import { ShipDisplayComponent } from './components/info-bar/ship-display/ship-display.component';
import { SupplyDisplayComponent } from './components/info-bar/supply-display/supply-display.component';


@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    SetupComponent,
    GameComponent,
    InfoBarComponent,
    MapComponent,
    CrewDisplayComponent,
    ShipDisplayComponent,
    SupplyDisplayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FlexLayoutModule
  ],
  providers: [ShipService, GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }