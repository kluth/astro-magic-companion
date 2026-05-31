import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-trash-meter',
  standalone: true,
  template: `
    <div class="flex flex-col gap-2 p-4 bg-slate-800 rounded-xl border-2 border-slate-700">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Trash-O-Meter</span>
        @if (value() === 3) {
          <span class="text-xs font-bold text-amber-400 animate-bounce">GADGET READY!</span>
        }
      </div>
      <div class="flex gap-3">
        @for (slot of [1, 2, 3]; track slot) {
          <button 
            (click)="increment.emit()"
            class="w-8 h-8 rounded-md border-2 transition-all duration-300 flex items-center justify-center"
            [class.bg-amber-500]="value() >= slot"
            [class.border-amber-400]="value() >= slot"
            [class.border-slate-600]="value() < slot"
            [class.bg-slate-900]="value() < slot"
          >
            @if (value() >= slot) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            }
          </button>
        }
      </div>
    </div>
  `
})
export class TrashMeterComponent {
  value = input.required<number>();
  increment = output<void>();
}
