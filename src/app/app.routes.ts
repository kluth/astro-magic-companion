import { Routes } from '@angular/router';
import { JoinSessionPage } from './ui/pages/join-session/join-session.component';
import { CharacterSheetPage } from './ui/pages/character-sheet/character-sheet.component';
import { GmDashboardPage } from './ui/pages/gm-dashboard/gm-dashboard.component';

export const routes: Routes = [
  { path: '', component: JoinSessionPage },
  { path: 'play', component: CharacterSheetPage },
  { path: 'gm', component: GmDashboardPage },
  { path: '**', redirectTo: '' }
];
