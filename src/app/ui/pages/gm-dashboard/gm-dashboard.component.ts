import { Component, inject, signal } from '@angular/core';
import { SessionStore } from '../../../core/application/state/session.store';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gm-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8 p-4">
      
      <!-- Top Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-800 p-6 rounded-3xl border-b-4 border-amber-500 shadow-xl">
        <div class="flex-grow">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Control Center</span>
          <h2 class="text-3xl font-black text-white">Room: <span class="text-amber-400">{{ roomCode() }}</span></h2>
        </div>
        
        <div class="flex gap-4">
          <button 
            (click)="restInKitchen()"
            [disabled]="kitchenState() !== 'ready'"
            class="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-2xl font-black transition-all active:scale-95 text-white"
          >
            🍕 ASTRO-KITCHEN
          </button>
          
          <button 
            (click)="toggleRedButton()"
            class="flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all active:scale-95 text-white"
            [class.bg-rose-600]="redButtonUsed()"
            [class.bg-slate-700]="!redButtonUsed()"
          >
            🚨 RED BUTTON
          </button>
        </div>
      </div>

      <!-- Encounter Manager -->
      <div class="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 shadow-inner">
        <h3 class="text-lg font-black text-white mb-4 uppercase tracking-tighter">Encounter Manager</h3>
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-grow min-w-[300px]">
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
            <input [(ngModel)]="encounterDesc" type="text" placeholder="e.g. Space Pirates boarding!" class="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500">
          </div>
          <div class="w-32">
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Danger Level</label>
            <input [(ngModel)]="dangerLevel" type="number" min="1" max="10" class="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500">
          </div>
          <button (click)="startEncounter()" class="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black px-8 py-3 rounded-xl transition-all">DEPOLY THREAT</button>
          <button (click)="clearEncounter()" class="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-all">CLEAR</button>
        </div>
      </div>

      <!-- Player Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (player of players(); track player.id) {
          <div class="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700 hover:border-sky-500 transition-all">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-sky-400">{{ player.name }}</h3>
              <span class="text-xs bg-slate-900 px-2 py-1 rounded-md text-slate-500">Player</span>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="bg-slate-900 p-2 rounded-lg text-center">
                <div class="text-[10px] text-slate-500 uppercase">Muckis</div>
                <div class="font-bold text-white">{{ player.attributes.muckis }}</div>
              </div>
              <div class="bg-slate-900 p-2 rounded-lg text-center">
                <div class="text-[10px] text-slate-500 uppercase">Brains</div>
                <div class="font-bold text-white">{{ player.attributes.koepfchen }}</div>
              </div>
              <div class="bg-slate-900 p-2 rounded-lg text-center">
                <div class="text-[10px] text-slate-500 uppercase">Heart</div>
                <div class="font-bold text-white">{{ player.attributes.herz }}</div>
              </div>
            </div>

            <!-- Resources -->
            <div class="flex items-center justify-between">
              <div class="flex gap-1">
                @for (i of [1,2,3,4,5]; track i) {
                  <div class="w-4 h-4 rounded-sm transform rotate-45"
                       [class.bg-sky-400]="i <= player.starCrystals"
                       [class.bg-slate-700]="i > player.starCrystals">
                  </div>
                }
              </div>
              <div class="flex gap-1">
                @for (i of [1,2,3]; track i) {
                  <div class="w-3 h-3 rounded-full"
                       [class.bg-amber-500]="i <= player.trashOMeter"
                       [class.bg-slate-700]="i > player.trashOMeter">
                  </div>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
            <p class="text-slate-500 font-bold uppercase tracking-widest">Waiting for players to orbit...</p>
          </div>
        }
      </div>

    </div>
  `
})
export class GmDashboardPage {
  private readonly store = inject(SessionStore);

  protected readonly roomCode = this.store.roomCode;
  protected readonly players = this.store.allPlayers;
  protected readonly redButtonUsed = () => this.store.session()?.shipConsole.redButtonUsed ?? false;
  protected readonly kitchenState = () => this.store.session()?.shipConsole.astroKitchenState ?? 'ready';

  encounterDesc = signal('');
  dangerLevel = signal(3);

  toggleRedButton() {
    this.store.toggleRedButton();
  }

  restInKitchen() {
    this.store.restInKitchen();
  }

  startEncounter() {
    this.store.setEncounter(this.dangerLevel(), this.encounterDesc());
  }

  clearEncounter() {
    this.store.clearEncounter();
  }
}
