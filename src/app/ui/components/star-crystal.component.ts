import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-star-crystal',
  standalone: true,
  template: `
    <button 
      (click)="toggle.emit()" 
      class="relative w-12 h-12 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-90"
      [class.opacity-40]="!active()"
    >
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-lg">
        <polygon 
          points="50,5 95,50 50,95 5,50" 
          [attr.fill]="active() ? '#38bdf8' : '#64748b'"
          class="transition-colors duration-500"
        />
        <polygon 
          points="50,20 80,50 50,80 20,50" 
          fill="rgba(255,255,255,0.3)"
        />
      </svg>
      @if (active()) {
        <div class="absolute inset-0 animate-pulse bg-sky-400 blur-md rounded-full -z-10 opacity-30"></div>
      }
    </button>
  `
})
export class StarCrystalComponent {
  active = input.required<boolean>();
  toggle = output<void>();
}
