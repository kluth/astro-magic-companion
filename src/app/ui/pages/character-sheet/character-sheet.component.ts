import { Component, inject, signal } from '@angular/core';
import { SessionStore } from '../../../core/application/state/session.store';
import { StarCrystalComponent } from '../../components/star-crystal.component';
import { TrashMeterComponent } from '../../components/trash-meter.component';
import { RollResult } from '../../../core/domain/models';

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [StarCrystalComponent, TrashMeterComponent],
  template: `
    @if (player()) {
      <div class="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <!-- Active Encounter -->
        @if (encounter()) {
          <div class="bg-amber-500/20 border-2 border-amber-500 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
            <div class="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl">⚠️</div>
            <div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-amber-500">Active Encounter</div>
              <div class="text-white font-black">{{ encounter()?.description }}</div>
              <div class="text-xs text-amber-400">Danger Level: {{ encounter()?.dangerLevel }}</div>
            </div>
          </div>
        }

        <!-- Header -->
        <div class="bg-slate-800 rounded-3xl p-6 shadow-2xl border-b-4 border-sky-500">
          <h2 class="text-3xl font-black text-sky-400 mb-1">{{ player()?.name }}</h2>
          <div class="flex gap-2">
            @for (i of [1,2,3,4,5]; track i) {
              @if (i <= (player()?.starCrystals ?? 0)) {
                <app-star-crystal [active]="true" (toggle)="useCrystal()" />
              } @else {
                <app-star-crystal [active]="false" (toggle)="refillCrystals()" />
              }
            }
          </div>
        </div>

        <!-- Attributes & Rolling -->
        <div class="grid grid-cols-1 gap-4">
          @for (attr of attributes; track attr.key) {
            <button 
              (click)="roll(attr.key)"
              class="group relative flex items-center justify-between p-5 bg-slate-800 rounded-2xl border-2 border-slate-700 hover:border-sky-500 hover:bg-slate-700 transition-all active:scale-95"
            >
              <div class="flex flex-col items-start">
                <span class="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-sky-300 transition-colors">{{ attr.label }}</span>
                <span class="text-2xl font-black">{{ player()?.attributes?.[attr.key] }}</span>
              </div>
              <div class="w-12 h-12 flex items-center justify-center bg-slate-900 rounded-xl group-hover:bg-sky-500 transition-colors">
                <span class="text-2xl">🎲</span>
              </div>
            </button>
          }
        </div>

        <!-- Roll Results Modal-ish -->
        @if (lastResult()) {
          <div class="bg-sky-900/40 border-2 border-sky-400 rounded-2xl p-6 text-center animate-bounce-short">
            <div class="text-sm font-bold text-sky-300 mb-2 uppercase">Roll Results</div>
            <div class="flex justify-center gap-2 mb-4">
              @for (d of lastResult()?.dice; track $index) {
                <span class="w-10 h-10 flex items-center justify-center bg-white text-slate-900 rounded-lg font-bold text-xl"
                      [class.bg-sky-400]="d >= 5" [class.text-white]="d >= 5">
                  {{ d }}
                </span>
              }
            </div>
            @if (lastResult()?.isPatzer) {
              <div class="text-rose-400 font-black text-xl animate-pulse">AETHER-PATZER! 💥</div>
            } @else {
              <div class="text-2xl font-black text-white">
                {{ lastResult()?.successes }} Success{{ lastResult()?.successes !== 1 ? 'es' : '' }}!
              </div>
            }
          </div>
        }

        <!-- Resources -->
        <div class="grid grid-cols-1 gap-4">
          <app-trash-meter [value]="player()?.trashOMeter ?? 0" (increment)="addTrash()" />
        </div>

      </div>
    } @else {
      <div class="text-center p-12">
        <div class="text-2xl font-bold mb-4">No Character Found</div>
        <p class="text-slate-400">Join a session to start your adventure!</p>
      </div>
    }
  `,
  styles: [`
    .animate-bounce-short {
      animation: bounce 0.5s ease-in-out;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `]
})
export class CharacterSheetPage {
  private readonly store = inject(SessionStore);
  
  protected readonly player = this.store.localPlayer;
  protected readonly encounter = computed(() => this.store.session()?.activeEncounter);
  protected readonly lastResult = signal<RollResult | null>(null);

  protected readonly attributes = [
    { key: 'muckis' as const, label: 'Muckis (Brawn)' },
    { key: 'koepfchen' as const, label: 'Köpfchen (Brains)' },
    { key: 'herz' as const, label: 'Herz (Heart)' }
  ];

  roll(attr: 'muckis' | 'koepfchen' | 'herz') {
    const player = this.player();
    if (!player) return;

    const result = this.store.rollForPlayer(player.id, attr);
    this.lastResult.set(result);
    
    // Clear result after 5 seconds
    setTimeout(() => {
      if (this.lastResult() === result) this.lastResult.set(null);
    }, 5000);
  }

  useCrystal() {
    const player = this.player();
    if (player && player.starCrystals > 0) {
      this.store.updateCharacter(player.id, { starCrystals: player.starCrystals - 1 });
    }
  }

  refillCrystals() {
    // Usually part of a rest, but let's allow manual refill for now
    const player = this.player();
    if (player && player.starCrystals < 5) {
      this.store.updateCharacter(player.id, { starCrystals: player.starCrystals + 1 });
    }
  }

  addTrash() {
    const player = this.player();
    if (player) {
      const next = (player.trashOMeter + 1);
      if (next > 3) {
        this.store.updateCharacter(player.id, { trashOMeter: 0 });
      } else {
        this.store.updateCharacter(player.id, { trashOMeter: next });
      }
    }
  }
}
