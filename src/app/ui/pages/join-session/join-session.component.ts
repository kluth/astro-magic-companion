import { Component, inject, signal } from '@angular/core';
import { SessionService } from '../../../core/application/services/session.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-join-session',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-md mx-auto mt-20 p-8 bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-700">
      <h2 class="text-3xl font-black text-white mb-8 text-center uppercase tracking-tighter">Ready for Takeoff?</h2>
      
      <div class="space-y-6">
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Player Name</label>
          <input 
            [(ngModel)]="name"
            type="text" 
            placeholder="e.g. Captain Spark" 
            class="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-white focus:border-sky-500 outline-none transition-all"
          >
        </div>

        <div class="flex gap-4">
          <div class="flex-grow">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Room Code</label>
            <input 
              [(ngModel)]="roomCode"
              type="text" 
              placeholder="XJ92" 
              maxlength="4"
              class="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-white focus:border-sky-500 outline-none transition-all uppercase"
            >
          </div>
        </div>

        <button 
          (click)="join()"
          [disabled]="!name() || !roomCode()"
          class="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:hover:bg-sky-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
        >
          JOIN ADVENTURE
        </button>

        <div class="relative py-4">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-700"></div></div>
          <div class="relative flex justify-center text-xs uppercase"><span class="bg-slate-800 px-2 text-slate-500">or</span></div>
        </div>

        <button 
          (click)="create()"
          class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-2xl transition-all"
        >
          BE THE GAME MASTER
        </button>
      </div>
    </div>
  `
})
export class JoinSessionPage {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  name = signal('');
  roomCode = signal('');

  async join() {
    const res = await this.sessionService.joinSession(this.roomCode(), this.name());
    if (res.success) {
      this.router.navigate(['/play']);
    } else {
      alert(res.error);
    }
  }

  async create() {
    const res = await this.sessionService.createSession(this.name() || 'Game Master');
    if (res.success) {
      this.router.navigate(['/gm']);
    }
  }
}
