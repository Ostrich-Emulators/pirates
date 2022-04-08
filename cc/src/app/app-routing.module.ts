import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { SetupComponent } from './components/setup/setup.component';
import { GameComponent } from './components/game/game.component';
import { TargettingService } from './services/targetting.service';

const routes: Routes = [
    { path: '', redirectTo: '/welcome', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'setup', component: SetupComponent },
    { path: 'game', component: GameComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule],
    providers: [TargettingService]
})
export class AppRoutingModule { }
