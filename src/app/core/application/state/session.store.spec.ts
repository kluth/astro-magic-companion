import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session.store';
import { SessionService } from '../services/session.service';
import { LocalSyncAdapter } from '../../../infrastructure/local/local-sync.adapter';

describe('Application Integration', () => {
  let store: any;
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessionStore,
        SessionService,
        { provide: 'SyncPort', useClass: LocalSyncAdapter }
      ]
    });

    store = TestBed.inject(SessionStore);
    service = TestBed.inject(SessionService);
  });

  it('should create a session and update the store', async () => {
    const result = await service.createSession('GM');
    expect(result.success).toBe(true);
    expect(store.roomCode()).toBeTruthy();
    expect(store.isGM()).toBe(true);
  });

  it('should manage characters and dice rolls', async () => {
    await service.createSession('GM');
    const gmId = store.localPlayerId();
    
    // Setup a player character manually for testing
    const player = {
      id: 'p1',
      name: 'Hero',
      attributes: { muckis: 3, koepfchen: 2, herz: 1 },
      starCrystals: 3,
      trashOMeter: 0,
      backpack: []
    };
    
    store.setSession({
      ...store.session(),
      players: { 'p1': player }
    });

    const roll = store.rollForPlayer('p1', 'muckis');
    expect(roll.dice.length).toBe(3);
    expect(roll.successes).toBeGreaterThanOrEqual(0);
  });

  it('should handle the Astro-Kitchen rest logic', async () => {
    await service.createSession('GM');
    
    // Add player properly
    const player = { id: 'p1', name: 'H', attributes: {muckis:1, koepfchen:1, herz:4}, starCrystals: 1, trashOMeter: 0, backpack: [] };
    store.setSession({
      ...store.session(),
      players: { 'p1': player as any }
    });
    
    store.restInKitchen();
    
    expect(store.session().shipConsole.astroKitchenState).toBe('cooldown');
    // Player crystals should be refilled to 5
    expect(store.session().players['p1'].starCrystals).toBe(5);
  });
});
