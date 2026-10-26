export type WeaponId = 'pistol' | 'smg' | 'shotgun' | 'rifle';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  magSize: number;
  spareMags: number;
  auto: boolean;
  /** Minimum ms between shots. */
  fireDelay: number;
  /** Seconds. */
  reloadTime: number;
  pellets: number;
  /** Pellet spread in degrees either side of the laser. */
  spread: number;
  /** Laser wobble in degrees at full instability. Heavier guns wobble more. */
  wobble: number;
  /** Instability added per shot. */
  recoil: number;
  /** How fast the operator can swing the gun round, degrees per second. */
  turnRate: number;
  /** Noise radius in px. */
  noise: number;
  range: number;
}

/** Handling matters as much as damage: heavier guns wobble more and turn more slowly. */
export const WEAPONS: Record<WeaponId, WeaponDef> = {
  pistol: {
    id: 'pistol', name: 'Pistol', magSize: 12, spareMags: 3, auto: false, fireDelay: 140, reloadTime: 1.3,
    pellets: 1, spread: 0, wobble: 5, recoil: 0.12, turnRate: 620, noise: 420, range: 900,
  },
  smg: {
    id: 'smg', name: 'SMG', magSize: 30, spareMags: 3, auto: true, fireDelay: 80, reloadTime: 1.8,
    pellets: 1, spread: 0, wobble: 6.5, recoil: 0.06, turnRate: 540, noise: 520, range: 800,
  },
  shotgun: {
    id: 'shotgun', name: 'Shotgun', magSize: 6, spareMags: 4, auto: false, fireDelay: 650, reloadTime: 2.4,
    pellets: 8, spread: 8, wobble: 7, recoil: 0.4, turnRate: 430, noise: 640, range: 460,
  },
  rifle: {
    id: 'rifle', name: 'Assault rifle', magSize: 30, spareMags: 3, auto: true, fireDelay: 110, reloadTime: 2.1,
    pellets: 1, spread: 0, wobble: 9, recoil: 0.12, turnRate: 300, noise: 760, range: 1400,
  },
};

export class WeaponState {
  mag: number;
  reserve: number;
  reloadLeft = 0;
  private cooldown = 0;

  constructor(public def: WeaponDef) {
    this.mag = def.magSize;
    this.reserve = def.magSize * def.spareMags;
  }

  get reloading(): boolean {
    return this.reloadLeft > 0;
  }

  update(dt: number): void {
    this.cooldown = Math.max(0, this.cooldown - dt * 1000);
    if (this.reloadLeft > 0) {
      this.reloadLeft -= dt;
      if (this.reloadLeft <= 0) {
        this.reloadLeft = 0;
        const take = Math.min(this.def.magSize - this.mag, this.reserve);
        this.mag += take;
        this.reserve -= take;
      }
    }
  }

  canFire(): boolean {
    return this.cooldown <= 0 && !this.reloading && this.mag > 0;
  }

  fire(): void {
    this.mag--;
    this.cooldown = this.def.fireDelay;
  }

  startReload(): boolean {
    if (this.reloading || this.mag >= this.def.magSize || this.reserve <= 0) return false;
    this.reloadLeft = this.def.reloadTime;
    return true;
  }

  refill(): void {
    this.reserve = this.def.magSize * this.def.spareMags;
  }
}
