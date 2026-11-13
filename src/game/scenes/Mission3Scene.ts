import Phaser from 'phaser';
import { generateMarsTextures } from '../textures/MarsTextures';
import {
  BreakerAllocationChoice,
  ExplorerMode,
  MarsSolScenario,
  Mission3LaunchChoice,
  MissionStage,
  MissionTradeOffOption,
} from '../../types/game';
import { getSolScenarioById } from '../../data/nasaDatasets';
import { sounds } from '../../audio/SoundManager';
import { virtualInput } from '../virtualInput';
import { SceneCallbacks } from './Mission1Scene';

interface DustDevil {
  sprite: Phaser.GameObjects.Sprite;
  baseX: number;
  baseY: number;
  rangeX: number;
  speed: number;
  phase: number;
}

export class Mission3Scene extends Phaser.Scene {
  private callbacks!: SceneCallbacks;

  private astronaut!: Phaser.Physics.Arcade.Sprite;
  private rover!: Phaser.Physics.Arcade.Sprite;
  private roverHeadlight!: Phaser.GameObjects.Image;
  private habitatSprite!: Phaser.GameObjects.Sprite;
  private launchPadSprite!: Phaser.GameObjects.Sprite;
  private mavRocketSprite!: Phaser.Physics.Arcade.Sprite;
  private mavStage1Debris?: Phaser.GameObjects.Sprite;
  private earthReturnOrbiter?: Phaser.GameObjects.Sprite;
  private dockingCrosshair?: Phaser.GameObjects.Image;
  private dockingGuideRing?: Phaser.GameObjects.Image;

  private ascentSkyBg?: Phaser.GameObjects.Rectangle;
  private ascentStars: Phaser.GameObjects.Rectangle[] = [];
  private ascentCorridorGraphic?: Phaser.GameObjects.Graphics;
  private ascentHorizonLine?: Phaser.GameObjects.Rectangle;
  private ascentStagePromptSent = false;

  private rocksGroup!: Phaser.Physics.Arcade.StaticGroup;
  private roughZonesGroup!: Phaser.GameObjects.Zone[];
  private dustDevils: DustDevil[] = [];
  private energyPickups: Array<{ sprite: Phaser.GameObjects.Sprite; collected: boolean }> = [];

  private rocketPlumeEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private stage: MissionStage = 'm3_stage_1_grid_triage';
  private oxygen = 100;
  private battery = 100;
  private condition = 100;
  private isInRover = false;
  private isInsideHabitat = true;
  private elapsedSeconds = 0;
  private rockCollisions = 0;

  private isPlanningFrozen = true;
  private solScenario: MarsSolScenario = getSolScenarioById('sol_142_clear');
  private explorerMode: ExplorerMode = 'junior';
  private activeTradeOff?: MissionTradeOffOption;
  private crewId?: string;
  private crewO2Mult = 1.0;
  private crewBatteryMult = 1.0;
  private crewShieldMult = 1.0;
  private crewRefillMult = 1.0;
  private crewSpeedMult = 1.0;
  private crewBumpMult = 1.0;
  private crewBonusScience = 0;
  private breakerChoice: BreakerAllocationChoice = 'shield';
  private launchChoice: Mission3LaunchChoice = 'heavy_shield';
  private oxygenMult = 1.0;
  private batteryMult = 1.0;
  private shieldingMult = 1.0;
  private ascentSpeedMult = 1.0;
  private scienceScore = 20;
  private radWarnShown = false;
  private zeroShieldWarnShown = false;
  private ascentCorridorTicks = 0;
  private ascentTotalTicks = 0;

  private roverSpeed = 0;
  private roverMaxSpeed = 265;
  private roverAcceleration = 220;
  private roverDrag = 140;
  private roverTurnSpeed = 2.4;

  private eKeyCooldown = 0;
  private collisionCooldown = 0;
  private lastDustDevilHitTime = 0;
  private lastThrustAudioTime = 0;
  private lastGuidanceWarnTime = 0;

  private habitatCoords = { x: 350, y: 550 };
  private roverCoords = { x: 530, y: 580 };
  private mavPadCoords = { x: 2300, y: 750 };
  private mavGantryCoords = { x: 2345, y: 720 };

  public breakers = {
    auxBus2: true,
    spectrometer: true,
    driveMotors: true,
    lifeSupport: true,
  };
  private breakersSolved = false;

  private mavAltitudeKm = 0;
  private mavVelocityMs = 0;
  private mavPitchDeg = 0;
  private mavStage: 1 | 2 = 1;
  private mavFuelPercent = 100;
  private isMavFlying = false;

  private orbitalDistanceMeters = 85;
  private dockingOffsetX = 35;
  private isDocked = false;

  constructor() {
    super('Mission3Scene');
  }

  public init(data: {
    callbacks: SceneCallbacks;
    autoStart?: boolean;
    solScenario?: MarsSolScenario;
    crewId?: string;
  }) {
    this.callbacks = data.callbacks;
    this.autoStartAfterRestart = Boolean(data.autoStart);
    if (data.solScenario) {
      this.solScenario = data.solScenario;
    }
    if (data.crewId !== undefined) {
      this.setCrewSpecialty(data.crewId);
    }
  }

  public preload() {
    generateMarsTextures(this);
  }

  public create() {
    const worldWidth = 2800;
    const worldHeight = 1800;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.add.tileSprite(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 'martian_ground');

    this.roughZonesGroup = [];
    const scarpDunes = [
      { x: 950, y: 600, w: 320, h: 420 },
      { x: 1450, y: 900, w: 380, h: 450 },
      { x: 1850, y: 620, w: 280, h: 360 },
    ];
    scarpDunes.forEach((d) => {
      this.add.tileSprite(d.x, d.y, d.w, d.h, 'rough_dunes').setAlpha(0.85);
      const zone = this.add.zone(d.x, d.y, d.w, d.h);
      this.roughZonesGroup.push(zone);
    });

    this.habitatSprite = this.add.sprite(this.habitatCoords.x, this.habitatCoords.y, 'habitat_base');
    this.add.image(this.habitatCoords.x, this.habitatCoords.y, 'pixel_safe_ring');

    this.launchPadSprite = this.add.sprite(this.mavPadCoords.x, this.mavPadCoords.y, 'mav_launchpad');
    this.launchPadSprite.setDepth(10);

    const gantryRing = this.add.image(this.mavGantryCoords.x, this.mavGantryCoords.y, 'pixel_pad_amber');
    gantryRing.setDepth(12);
    this.add
      .text(this.mavPadCoords.x, this.mavPadCoords.y + 104, 'MARS ROCKET PAD // BOARD HERE', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#fcd34d',
        backgroundColor: '#09090b',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(12);

    this.mavRocketSprite = this.physics.add.sprite(this.mavPadCoords.x, this.mavPadCoords.y - 12, 'mav_rocket');
    this.mavRocketSprite.setOrigin(0.5, 0.5);
    this.mavRocketSprite.setDepth(18);

    this.rocketPlumeEmitter = this.add.particles(0, 0, 'rocket_flame', {
      speed: { min: 200, max: 450 },
      scale: { start: 1.5, end: 0.1 },
      alpha: { start: 0.95, end: 0 },
      lifespan: 550,
      frequency: 20,
      emitting: false,
    });
    this.rocketPlumeEmitter.setDepth(49);

    this.rocksGroup = this.physics.add.staticGroup();
    const scarpRocks = [
      { x: 720, y: 400, key: 'rock_1' },
      { x: 780, y: 780, key: 'rock_2' },
      { x: 1100, y: 450, key: 'rock_3' },
      { x: 1250, y: 820, key: 'rock_1' },
      { x: 1380, y: 480, key: 'rock_2' },
      { x: 1680, y: 520, key: 'rock_3' },
      { x: 1720, y: 980, key: 'rock_1' },
      { x: 2020, y: 580, key: 'rock_2' },
      { x: 2080, y: 920, key: 'rock_3' },
    ];
    scarpRocks.forEach((pos) => {
      const rock = this.rocksGroup.create(pos.x, pos.y, pos.key) as Phaser.Physics.Arcade.Sprite;
      rock.refreshBody();
      const radius = rock.width * 0.38;
      rock.body?.setCircle(radius, rock.width / 2 - radius, rock.height / 2 - radius);
    });

    this.dustDevils = [];
    const dustDevilSpawns = [
      { x: 920, y: 680, rangeX: 200, speed: 0.6 },
      { x: 1350, y: 720, rangeX: 240, speed: 0.8 },
      { x: 1650, y: 850, rangeX: 210, speed: 0.7 },
      { x: 1950, y: 650, rangeX: 230, speed: 0.5 },
    ];
    dustDevilSpawns.forEach((spawn, idx) => {
      const sprite = this.add.sprite(spawn.x, spawn.y, 'dust_devil');
      sprite.setDepth(16);
      this.tweens.add({
        targets: sprite,
        rotation: Math.PI * 2,
        duration: 2200,
        repeat: -1,
        ease: 'Linear',
      });
      this.dustDevils.push({
        sprite,
        baseX: spawn.x,
        baseY: spawn.y,
        rangeX: spawn.rangeX,
        speed: spawn.speed,
        phase: idx * 1.5,
      });
    });

    this.energyPickups = [
      { x: 1050, y: 580 },
      { x: 1520, y: 790 },
      { x: 1920, y: 720 },
    ].map((pt) => {
      const sprite = this.add.sprite(pt.x, pt.y, 'pickup_cell').setDepth(16);
      this.tweens.add({
        targets: sprite,
        y: pt.y - 6,
        duration: 750,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return { sprite, collected: false };
    });

    this.rover = this.physics.add.sprite(this.roverCoords.x, this.roverCoords.y, 'rover');
    this.rover.setOrigin(0.5, 0.5);
    this.rover.setCollideWorldBounds(true);
    this.rover.setDepth(15);
    this.rover.setRotation(Math.PI / 2);
    this.rover.body?.setSize(48, 70);

    this.roverHeadlight = this.add.image(this.roverCoords.x, this.roverCoords.y, 'headlight_cone');
    this.roverHeadlight.setOrigin(0.5, 0);
    this.roverHeadlight.setDepth(14);

    this.astronaut = this.physics.add.sprite(350, 600, 'astronaut');
    this.astronaut.setOrigin(0.5, 0.5);
    this.astronaut.setCollideWorldBounds(true);
    this.astronaut.setDepth(20);
    this.astronaut.body?.setCircle(14, 10, 10);

    this.physics.add.collider(this.astronaut, this.rocksGroup);
    this.physics.add.collider(this.rover, this.rocksGroup, this.handleRoverCollision, undefined, this);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.astronaut, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.15);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      SPACE: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    this.stage = 'm3_stage_1_grid_triage';
    this.oxygen = 100;
    this.battery = this.activeTradeOff?.effects.startingBattery ?? 100;
    this.condition = this.activeTradeOff?.effects.startingCondition ?? 100;
    this.scienceScore = 20 + this.crewBonusScience + (this.activeTradeOff?.effects.bonusScienceScore ?? 0);
    this.radWarnShown = false;
    this.zeroShieldWarnShown = false;
    this.ascentCorridorTicks = 0;
    this.ascentTotalTicks = 0;
    this.isInRover = false;
    this.isInsideHabitat = true;
    this.elapsedSeconds = 0;
    this.rockCollisions = 0;
    this.breakersSolved = false;
    this.breakers = { auxBus2: true, spectrometer: true, driveMotors: true, lifeSupport: true };
    this.launchChoice = 'heavy_shield';
    this.isMavFlying = false;
    this.isDocked = false;
    this.isReadingPaused = false;
    this.mavAltitudeKm = 0;
    this.mavVelocityMs = 0;
    this.mavPitchDeg = 0;
    this.mavStage = 1;
    this.mavFuelPercent = 100;
    this.orbitalDistanceMeters = 85;
    this.dockingOffsetX = 35;

    this.isPlanningFrozen = false;
    this.callbacks.onFactUnlock('sample_caching_heritage');
    this.callbacks.onStageChange(this.stage);
    this.callbacks.onDialogueTrigger('m3_stage1_start');
    sounds.playObjectiveStinger();
  }

  private handleRoverCollision() {
    if (!this.isInRover || this.collisionCooldown > 0) return;

    const currentSpeed = Math.abs(this.roverSpeed);
    if (currentSpeed > 50) {
      this.collisionCooldown = 0.8;
      this.rockCollisions++;
      const bumpDamage = Math.max(
        4,
        Math.round(10 * Math.min(1.3, this.shieldingMult * this.crewShieldMult) * this.crewBumpMult)
      );
      this.condition = Math.max(0, this.condition - bumpDamage);

      sounds.playCrash();
      this.cameras.main.shake(180, 0.015);
      this.roverSpeed = -this.roverSpeed * 0.4;

      this.callbacks.onWarning(`OUCH! Rock bump! Shield & Rover: ${Math.round(this.condition)}%`);

      if (this.condition <= 0) {
        this.callbacks.onWarning('OH NO! Shield/Rover hit 0%! Finish walking on foot!');
        this.exitRover();
      }
    }
  }

  private enterRover() {
    if (this.condition <= 0) {
      this.callbacks.onWarning('The rover is broken! You have to walk.');
      return;
    }
    this.isInRover = true;
    this.astronaut.setVisible(false);
    this.astronaut.body!.enable = false;
    this.cameras.main.startFollow(this.rover, true, 0.08, 0.08);
  }

  private exitRover() {
    this.isInRover = false;
    this.roverSpeed = 0;
    sounds.stopEngine();

    const exitAngle = this.rover.rotation + Math.PI / 2;
    const exitX = this.rover.x + Math.cos(exitAngle) * 44;
    const exitY = this.rover.y + Math.sin(exitAngle) * 44;

    this.astronaut.setPosition(exitX, exitY);
    this.astronaut.setVisible(true);
    this.astronaut.body!.enable = true;
    this.cameras.main.startFollow(this.astronaut, true, 0.08, 0.08);
  }

  private isReadingPaused = false;

  public setReadingPaused(paused: boolean) {
    this.isReadingPaused = paused;
    if (paused) {
      sounds.stopEngine();
    }
  }

  public setCrewSpecialty(crewId?: string) {
    this.crewId = crewId;
    this.crewO2Mult = 1.0;
    this.crewBatteryMult = 1.0;
    this.crewShieldMult = 1.0;
    this.crewRefillMult = 1.0;
    this.crewSpeedMult = 1.0;
    this.crewBumpMult = 1.0;
    this.crewBonusScience = 0;

    if (crewId === '01-BIO') {
      this.crewRefillMult = 1.25;
      this.crewShieldMult = 0.85;
      this.crewBatteryMult = 1.1;
    } else if (crewId === '02-ENG') {
      this.crewBatteryMult = 0.85;
      this.crewShieldMult = 1.15;
      this.crewBonusScience = 10;
    } else if (crewId === '03-CMD') {
      this.crewSpeedMult = 1.08;
      this.crewBumpMult = 0.8;
      this.crewO2Mult = 1.1;
    }
    this.scienceScore = 20 + this.crewBonusScience + (this.activeTradeOff?.effects.bonusScienceScore ?? 0);
  }

  public update(_time: number, delta: number) {
    if (
      this.isPlanningFrozen ||
      this.isReadingPaused ||
      this.stage === 'mission_complete' ||
      this.stage === 'mission_failed'
    ) {
      (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.rover.setVelocity(0, 0);
      sounds.stopEngine();
      return;
    }

    const dt = delta / 1000;
    if (this.stage !== 'm3_cinematic_ending') {
      this.elapsedSeconds += dt;
    }

    if (this.eKeyCooldown > 0) this.eKeyCooldown -= dt;
    if (this.collisionCooldown > 0) this.collisionCooldown -= dt;

    if (this.stage === 'm3_stage_4_mav_ascent') {
      this.updateMavAscentFlight(dt);
      return;
    }

    if (this.stage === 'm3_stage_5_orbital_dock') {
      this.updateOrbitalDocking(dt);
      return;
    }

    if (this.stage === 'm3_cinematic_ending') {
      return;
    }

    const px = this.isInRover ? this.rover.x : this.astronaut.x;
    const py = this.isInRover ? this.rover.y : this.astronaut.y;

    const distToHabitat = Phaser.Math.Distance.Between(px, py, this.habitatCoords.x, this.habitatCoords.y);
    this.isInsideHabitat = distToHabitat < 135;

    if (this.isInsideHabitat) {
      const sunlightFactor = 0.7 + (this.solScenario.sunlightPercentForCrops / 100) * 0.6;
      this.oxygen = Math.min(100, this.oxygen + 28 * this.crewRefillMult * sunlightFactor * dt);
      if (this.condition < 65) {
        this.condition = Math.min(65, this.condition + 10 * dt);
      }
    } else {
      const baseO2Drain = this.isInRover ? 0.18 : 0.36;
      const zeroShieldLeak = this.condition <= 0 ? 2.2 : 1.0;
      if (this.condition <= 0 && !this.zeroShieldWarnShown) {
        this.zeroShieldWarnShown = true;
        this.callbacks.onWarning('SHIELDING AT 0%! Unprotected suit loses Air twice as fast!');
      }
      const modeDrainMult = this.explorerMode === 'junior' ? 0.78 : 1.05;
      const o2Drain =
        baseO2Drain *
        zeroShieldLeak *
        modeDrainMult *
        this.oxygenMult *
        this.crewO2Mult *
        this.solScenario.oxygenDrainMultiplier;
      this.oxygen = Math.max(0, this.oxygen - o2Drain * dt);

      const radDrain =
        this.solScenario.shieldingDrainPerSec *
        2.2 *
        modeDrainMult *
        this.shieldingMult *
        this.crewShieldMult;
      this.condition = Math.max(0, this.condition - radDrain * dt);
      if (this.condition < 30 && !this.radWarnShown) {
        this.radWarnShown = true;
        this.callbacks.onWarning('WARNING! Space rays wore down Shielding below 30%!');
      }
      if (this.condition <= 0 && this.isInRover) {
        this.callbacks.onWarning('OH NO! Shield/Rover hit 0%! Finish walking on foot!');
        this.exitRover();
      }

      if (this.oxygen <= 0) {
        this.stage = 'mission_failed';
        sounds.playMissionFailed();
        this.callbacks.onMissionEnd(false);
        return;
      }
    }

    this.updateDustDevils(dt, px, py);

    for (const pickup of this.energyPickups) {
      if (!pickup.collected) {
        const d = Phaser.Math.Distance.Between(px, py, pickup.sprite.x, pickup.sprite.y);
        if (d < 58) {
          pickup.collected = true;
          pickup.sprite.setVisible(false);
          this.battery = Math.min(100, this.battery + 15);
          this.condition = Math.min(100, this.condition + 10);
          this.scienceScore += 10;
          sounds.playPickup();
          this.callbacks.onWarning('ENERGY CELL! +15% Battery & +10% Shield!');
        }
      }
    }

    let inRoughDunes = false;
    for (const zone of this.roughZonesGroup) {
      if (
        px >= zone.x - zone.width / 2 &&
        px <= zone.x + zone.width / 2 &&
        py >= zone.y - zone.height / 2 &&
        py <= zone.y + zone.height / 2
      ) {
        inRoughDunes = true;
        break;
      }
    }

    if (!this.isInRover) {
      this.updateAstronautMovement();
    } else {
      this.updateRoverMovement(dt, inRoughDunes);
    }

    this.updateMission3SurfaceLogic(dt);

    this.roverHeadlight.setPosition(this.rover.x, this.rover.y);
    this.roverHeadlight.setRotation(this.rover.rotation - Math.PI / 2);

    this.callbacks.onResourceUpdate({
      oxygen: this.oxygen,
      battery: this.battery,
      condition: this.condition,
      hasCoupler: false,
      isInRover: this.isInRover,
      isInsideHabitat: this.isInsideHabitat,
      isDustStormActive: false,
      elapsedSeconds: this.elapsedSeconds,
      rockCollisions: this.rockCollisions,
      hasCoreSample: true,
      breakersConfigured: this.breakersSolved,
      breakerChoice: this.breakerChoice,
      m3LaunchChoice: this.launchChoice,
      solId: this.solScenario.id,
      solLabel: this.solScenario.solLabel,
      radiationMsvPerDay: this.solScenario.radiationMsvPerDay,
      tradeOffId: this.activeTradeOff?.id,
      tradeOffTitle: this.activeTradeOff?.title,
      scienceScore: this.scienceScore,
    });
  }

  private updateAstronautMovement() {
    const body = this.astronaut.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;
    const speed = 155;

    const left = this.cursors.left.isDown || this.wasd.A.isDown || virtualInput.left;
    const right = this.cursors.right.isDown || this.wasd.D.isDown || virtualInput.right;
    const up = this.cursors.up.isDown || this.wasd.W.isDown || virtualInput.up;
    const down = this.cursors.down.isDown || this.wasd.S.isDown || virtualInput.down;

    if (left) vx -= speed;
    if (right) vx += speed;
    if (up) vy -= speed;
    if (down) vy += speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    body.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      const angle = Math.atan2(vy, vx);
      this.astronaut.setRotation(angle - Math.PI / 2);
      sounds.playFootstep();
    }
  }

  private updateRoverMovement(dt: number, inRoughDunes: boolean) {
    const left = this.cursors.left.isDown || this.wasd.A.isDown || virtualInput.left;
    const right = this.cursors.right.isDown || this.wasd.D.isDown || virtualInput.right;
    const up = this.cursors.up.isDown || this.wasd.W.isDown || virtualInput.up;
    const down = this.cursors.down.isDown || this.wasd.S.isDown || virtualInput.down;

    const maxSpeed = (inRoughDunes ? 165 : this.roverMaxSpeed) * this.crewSpeedMult;

    if (left) this.rover.rotation -= this.roverTurnSpeed * dt;
    if (right) this.rover.rotation += this.roverTurnSpeed * dt;

    if (up && this.battery > 0 && this.condition > 0) {
      this.roverSpeed = Math.min(maxSpeed, this.roverSpeed + this.roverAcceleration * dt);
    } else if (down && this.battery > 0 && this.condition > 0) {
      this.roverSpeed = Math.max(-100, this.roverSpeed - this.roverAcceleration * dt);
    } else {
      if (this.roverSpeed > 0) {
        this.roverSpeed = Math.max(0, this.roverSpeed - this.roverDrag * dt);
      } else if (this.roverSpeed < 0) {
        this.roverSpeed = Math.min(0, this.roverSpeed + this.roverDrag * dt);
      }
    }

    const angle = this.rover.rotation - Math.PI / 2;
    const vx = Math.cos(angle) * this.roverSpeed;
    const vy = Math.sin(angle) * this.roverSpeed;
    this.rover.setVelocity(vx, vy);

    const isDriving = Math.abs(this.roverSpeed) > 10;
    if (isDriving) {
      const baseDrain = inRoughDunes ? 0.65 : 0.34;
      const drainRate =
        baseDrain * this.batteryMult * this.crewBatteryMult * this.solScenario.batteryDrainMultiplier;
      this.battery = Math.max(0, this.battery - drainRate * dt);

      if (this.battery <= 0) {
        this.callbacks.onWarning('Rover battery is empty! Press [E] to walk.');
        this.roverSpeed = 0;
      }
    }

    const speedRatio = Math.abs(this.roverSpeed) / maxSpeed;
    sounds.updateEngine(speedRatio, isDriving);
  }

  private updateDustDevils(dt: number, px: number, py: number) {
    this.dustDevils.forEach((dd) => {
      dd.phase += dd.speed * dt;
      dd.sprite.x = dd.baseX + Math.sin(dd.phase) * dd.rangeX;
      dd.sprite.y = dd.baseY + Math.cos(dd.phase * 1.4) * 80;

      const dist = Phaser.Math.Distance.Between(px, py, dd.sprite.x, dd.sprite.y);
      if (dist < 65 && this.elapsedSeconds - this.lastDustDevilHitTime > 3.0) {
        this.lastDustDevilHitTime = this.elapsedSeconds;
        const batLoss = this.explorerMode === 'junior' ? 2 : 4;
        this.battery = Math.max(0, this.battery - batLoss);
        this.cameras.main.shake(150, 0.008);
        sounds.playCrash();
        this.callbacks.onWarning(`Dust devil! Mars air is too thin to hurt us, but dust got in the wheels (-${batLoss}% Battery)`);
        this.callbacks.onDialogueTrigger('m3_dust_devil_hit');
      }
    });
  }

  private updateMission3SurfaceLogic(_dt: number) {
    const px = this.isInRover ? this.rover.x : this.astronaut.x;
    const py = this.isInRover ? this.rover.y : this.astronaut.y;

    const distToRover = Phaser.Math.Distance.Between(this.astronaut.x, this.astronaut.y, this.rover.x, this.rover.y);
    const distToGantry = Phaser.Math.Distance.Between(px, py, this.mavGantryCoords.x, this.mavGantryCoords.y);
    const distToMavPad = Phaser.Math.Distance.Between(px, py, this.mavPadCoords.x, this.mavPadCoords.y);

    let prompt: string | null = null;
    const ePressed = Phaser.Input.Keyboard.JustDown(this.wasd.E) || virtualInput.consumeAction();
    let actionTriggered = false;

    if (this.stage === 'm3_stage_1_grid_triage') {
      this.callbacks.onWaypointUpdate({
        x: this.rover.x,
        y: this.rover.y,
        dx: this.rover.x - this.astronaut.x,
        dy: this.rover.y - this.astronaut.y,
        label: 'Rover Switches',
        distanceMeters: Math.round(distToRover / 10),
        stage: this.stage,
      });

      if (distToRover < 85 && !this.isInRover) {
        prompt = 'Press [E] Fix Rover Power Switches';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          actionTriggered = true;
          if (this.callbacks.onOpenBreakerConsole) {
            this.callbacks.onOpenBreakerConsole();
          } else {
            this.toggleBreakerTriage();
          }
        }
      } else if (!this.breakersSolved) {
        prompt = 'Walk to the Rover and press [E] to fix power!';
      }
    }

    else if (this.stage === 'm3_stage_2_scarp_traverse') {
      this.callbacks.onWaypointUpdate({
        x: this.mavPadCoords.x,
        y: this.mavPadCoords.y,
        dx: this.mavPadCoords.x - px,
        dy: this.mavPadCoords.y - py,
        label: 'Rocket Pad',
        distanceMeters: Math.round(distToMavPad / 10),
        stage: this.stage,
      });

      if (distToMavPad < 160) {
        this.stage = 'm3_stage_3_mav_transfer';
        this.callbacks.onStageChange(this.stage);
        this.callbacks.onDialogueTrigger('m3_mav_reached');
        sounds.playObjectiveStinger();
      }
    }

    else if (this.stage === 'm3_stage_3_mav_transfer') {
      this.callbacks.onWaypointUpdate({
        x: this.mavGantryCoords.x,
        y: this.mavGantryCoords.y,
        dx: this.mavGantryCoords.x - px,
        dy: this.mavGantryCoords.y - py,
        label: 'Rocket Door',
        distanceMeters: Math.round(distToGantry / 10),
        stage: this.stage,
      });

      if (distToGantry < 115) {
        prompt = 'Press [E] Load Rock Tube #14 & Launch!';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.6;
          actionTriggered = true;
          this.isPlanningFrozen = true;
          (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
          this.rover.setVelocity(0, 0);
          this.roverSpeed = 0;
          sounds.stopEngine();
          this.callbacks.onPromptChange(null);
          // No rocket-setup choice anymore: there is one rocket design (NASA's two-stage
          // Mars Ascent Vehicle concept), so we launch it directly.
          this.confirmLaunchChoice('heavy_shield');
        }
      }
    }

    if (!actionTriggered && !prompt && this.breakersSolved) {
      if (this.isInRover) {
        prompt = 'Press [E] Get Out of Rover';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          this.exitRover();
        }
      } else if (distToRover < 85) {
        prompt = 'Press [E] Get in Rover';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          this.enterRover();
        }
      }
    }

    this.callbacks.onPromptChange(prompt);
  }

  public toggleBreakerTriage(_choice: BreakerAllocationChoice = 'eco') {
    if (this.breakersSolved) return;
    sounds.playSwitchClick();
    this.breakers.auxBus2 = false;
    this.breakers.spectrometer = false;
    this.breakerChoice = 'eco';
    this.breakersSolved = true;

    // Turning off a part that wastes power makes the battery last longer.
    this.battery = Math.min(100, this.battery + 15);
    this.batteryMult *= 0.8;
    this.callbacks.onWarning('Broken heater OFF! We now use 320 W of our 400 W. The battery will last longer!');

    sounds.playObjectiveStinger();
    this.callbacks.onDialogueTrigger('m3_bus_isolated');

    this.stage = 'm3_stage_2_scarp_traverse';
    this.callbacks.onStageChange(this.stage);
    this.enterRover();
  }

  public setSolScenario(sol: MarsSolScenario) {
    this.solScenario = sol;
  }

  public setExplorerMode(mode: ExplorerMode) {
    this.explorerMode = mode;
  }

  public confirmLaunchChoice(choice: Mission3LaunchChoice) {
    this.launchChoice = choice;
    if (choice === 'heavy_shield') {
      this.condition = Math.min(100, this.condition + 20);
    } else if (choice === 'science_cargo') {
      this.scienceScore += 35;
    }
    sounds.playWarningAlarm();
    this.callbacks.onTriggerDisasterCinematic?.('mission_3_launch_crisis');
  }

  public startMavAscentAfterEvent() {
    this.isPlanningFrozen = false;
    if (this.stage !== 'm3_stage_3_mav_transfer') return;
    this.startMavAscentSequence();
  }

  private startMavAscentSequence() {
    sounds.stopEngine();
    this.stage = 'm3_stage_4_mav_ascent';
    this.callbacks.onStageChange(this.stage);
    this.callbacks.onFactUnlock('mars_ascent_vehicle');
    this.callbacks.onDialogueTrigger('m3_launch_ignited');
    sounds.playObjectiveStinger();

    this.astronaut.setVisible(false);
    this.astronaut.body!.enable = false;
    this.rover.setVelocity(0, 0);
    this.isInRover = false;

    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(1400, 900);
    this.cameras.main.setZoom(1.0);

    this.ascentSkyBg = this.add.rectangle(1400, 900, 3200, 2200, 0x7c2d12);
    this.ascentSkyBg.setDepth(40);

    this.ascentHorizonLine = this.add.rectangle(1400, 1180, 3200, 360, 0x9a3412);
    this.ascentHorizonLine.setDepth(42);

    this.ascentStars = [];
    for (let i = 0; i < 110; i++) {
      const starSize = i % 3 === 0 ? 4 : 2;
      const star = this.add.rectangle(
        Phaser.Math.Between(600, 2200),
        Phaser.Math.Between(200, 1600),
        starSize,
        starSize,
        0xffffff,
        0
      );
      star.setDepth(41);
      this.ascentStars.push(star);
    }

    this.ascentCorridorGraphic = this.add.graphics();
    this.ascentCorridorGraphic.setDepth(48);

    this.mavRocketSprite.setPosition(1400, 980);
    this.mavRocketSprite.setRotation(0);
    this.mavRocketSprite.setScale(1.1);
    this.mavRocketSprite.setDepth(50);

    this.mavAltitudeKm = 0;
    this.mavVelocityMs = 0;
    this.mavPitchDeg = 0;
    this.mavStage = 1;
    this.mavFuelPercent = 100;
    this.ascentStagePromptSent = false;

    this.time.delayedCall(1200, () => {
      if (this.stage !== 'm3_stage_4_mav_ascent') return;
      this.isMavFlying = true;
      this.mavAltitudeKm = 0.5;
      this.mavVelocityMs = 120;
      this.rocketPlumeEmitter.start();
      sounds.playRocketThruster(1.0);
    });
  }

  private updateMavAscentFlight(dt: number) {
    if (!this.isMavFlying) {
      this.callbacks.onPromptChange('GET READY FOR BLAST OFF!');
      return;
    }

    const left = this.cursors.left.isDown || this.wasd.A.isDown || virtualInput.left;
    const right = this.cursors.right.isDown || this.wasd.D.isDown || virtualInput.right;

    const steerRate = this.launchChoice === 'light_autopilot' ? 32 : 28;
    if (left) this.mavPitchDeg = Math.max(-35, this.mavPitchDeg - steerRate * dt);
    if (right) this.mavPitchDeg = Math.min(45, this.mavPitchDeg + steerRate * dt);

    if (this.launchChoice === 'science_cargo') {
      const windMag = this.explorerMode === 'junior' ? 5.5 : 8.5;
      this.mavPitchDeg = Phaser.Math.Clamp(
        this.mavPitchDeg + Math.sin(this.elapsedSeconds * 1.9) * windMag * dt,
        -35,
        45
      );
    }

    const targetGravityTurnDeg = Math.min(28, (this.mavAltitudeKm / 285) * 28);
    const pitchError = Math.abs(this.mavPitchDeg - targetGravityTurnDeg);
    const corridorHalfDeg = this.explorerMode === 'junior' ? 13 : 8.5;
    const inCorridor = pitchError <= corridorHalfDeg;

    this.ascentTotalTicks++;
    if (inCorridor) {
      this.ascentCorridorTicks++;
    } else {
      const hullWear =
        this.launchChoice === 'light_autopilot'
          ? 2.5
          : this.launchChoice === 'heavy_shield'
          ? 0.7
          : 1.5;
      this.condition = Math.max(0, this.condition - hullWear * dt);
    }

    const baseAcc = this.mavStage === 1 ? 105 : 145;
    const launchSpeedMult =
      this.launchChoice === 'light_autopilot'
        ? 1.24
        : this.launchChoice === 'heavy_shield'
        ? 0.86
        : 1.0;
    const efficiency = (inCorridor ? 1.15 : 0.72) * this.ascentSpeedMult * launchSpeedMult;
    this.mavVelocityMs += baseAcc * efficiency * dt;
    this.mavAltitudeKm += (this.mavVelocityMs * dt) / 120;

    if (!inCorridor && this.elapsedSeconds - this.lastGuidanceWarnTime > 3.5) {
      this.lastGuidanceWarnTime = this.elapsedSeconds;
      const hint = this.mavPitchDeg < targetGravityTurnDeg ? 'PRESS [D] TO STEER RIGHT' : 'PRESS [A] TO STEER LEFT';
      this.callbacks.onWarning(`STAY IN GREEN BOX! ${hint}`);
    }

    if (this.ascentSkyBg) {
      if (this.mavAltitudeKm < 35) {
        this.ascentSkyBg.setFillStyle(0x7c2d12);
      } else if (this.mavAltitudeKm < 70) {
        this.ascentSkyBg.setFillStyle(0x1e1b4b);
      } else {
        this.ascentSkyBg.setFillStyle(0x030712);
      }
    }

    if (this.ascentHorizonLine) {
      this.ascentHorizonLine.y += (this.mavVelocityMs * 0.22) * dt;
    }

    const starAlpha = Phaser.Math.Clamp((this.mavAltitudeKm - 15) / 45, 0.08, 0.95);
    const starSpeed = Math.max(90, this.mavVelocityMs * 0.28);
    this.ascentStars.forEach((star) => {
      star.setAlpha(starAlpha);
      star.y += starSpeed * dt;
      if (star.y > 1450) {
        star.y = 350;
        star.x = Phaser.Math.Between(650, 2150);
      }
    });

    const jitterX = (Math.random() - 0.5) * (this.mavStage === 1 ? 3 : 1.5);
    const jitterY = (Math.random() - 0.5) * 2;
    this.mavRocketSprite.setPosition(1400 + jitterX, 950 + jitterY);
    this.mavRocketSprite.setRotation(Phaser.Math.DegToRad(this.mavPitchDeg));

    const tailAngle = this.mavRocketSprite.rotation + Math.PI / 2;
    this.rocketPlumeEmitter.setPosition(
      this.mavRocketSprite.x + Math.cos(tailAngle) * 58,
      this.mavRocketSprite.y + Math.sin(tailAngle) * 58
    );

    if (this.ascentCorridorGraphic) {
      const g = this.ascentCorridorGraphic;
      g.clear();
      const barX = 1400;
      const barY = 1090;
      const barW = 240;

      g.fillStyle(0x0f172a, 0.92);
      g.fillRect(barX - barW / 2, barY - 12, barW, 24);
      g.lineStyle(3, 0x704137, 1);
      g.strokeRect(barX - barW / 2, barY - 12, barW, 24);

      const degToX = (deg: number) => barX - 110 + ((deg + 35) / 80) * 220;
      const targetX = Math.round(degToX(targetGravityTurnDeg));
      const currentX = Math.round(degToX(this.mavPitchDeg));

      const halfBoxW = this.explorerMode === 'junior' ? 32 : 24;
      g.fillStyle(inCorridor ? 0x22c55e : 0xf59e0b, 0.45);
      g.fillRect(targetX - halfBoxW, barY - 10, halfBoxW * 2, 20);
      g.lineStyle(2, inCorridor ? 0x4ade80 : 0xfbbf24, 1);
      g.strokeRect(targetX - halfBoxW, barY - 10, halfBoxW * 2, 20);

      g.fillStyle(0xffffff, 1);
      g.fillRect(currentX - 3, barY - 15, 6, 30);
    }

    if (this.elapsedSeconds - this.lastThrustAudioTime > 0.35) {
      this.lastThrustAudioTime = this.elapsedSeconds;
      sounds.playRocketThruster(this.mavStage === 1 ? 0.7 : 0.45);
    }

    if (this.mavStage === 1) {
      const fuelBurn = this.launchChoice === 'science_cargo' ? 10.5 : 8;
      this.mavFuelPercent = Math.max(0, this.mavFuelPercent - fuelBurn * dt);

      if (this.mavAltitudeKm >= 126 || this.mavFuelPercent <= 0) {
        if (!this.ascentStagePromptSent) {
          this.ascentStagePromptSent = true;
          this.callbacks.onWarning('STAGE 1 IS OUT OF FUEL! Press [SPACEBAR] to drop it!');
        }
        this.callbacks.onPromptChange('Press [SPACEBAR] to drop Stage 1 and start Stage 2!');
        if (Phaser.Input.Keyboard.JustDown(this.wasd.SPACE) || virtualInput.consumeSpace()) {
          this.executeStageSeparation();
        }
      } else {
        this.callbacks.onPromptChange(
          `STEER [A / D]: keep the white bar in the green box! | Stage 1 fuel: ${Math.round(this.mavFuelPercent)}%`
        );
      }
    } else {
      this.callbacks.onPromptChange(
        `FLY TO ORBIT [A / D]: Height ${Math.round(this.mavAltitudeKm)}/343 km | Speed ${Math.round(this.mavVelocityMs)}/3400 m/s`
      );

      if (this.mavAltitudeKm >= 343 && this.mavVelocityMs >= 3200) {
        this.enterOrbitalDockingPhase();
      }
    }

    this.callbacks.onWaypointUpdate({
      x: 1400,
      y: 740,
      dx: (targetGravityTurnDeg - this.mavPitchDeg) * 18,
      dy: -220,
      label: 'Green Box',
      distanceMeters: Math.max(0, Math.round(115 - this.mavAltitudeKm)),
      stage: this.stage,
    });

    this.callbacks.onResourceUpdate({
      oxygen: 100,
      battery: Math.round(this.battery),
      condition: Math.round(this.condition),
      hasCoupler: false,
      isInRover: false,
      isInsideHabitat: false,
      isDustStormActive: false,
      elapsedSeconds: this.elapsedSeconds,
      rockCollisions: this.rockCollisions,
      hasCoreSample: true,
      breakersConfigured: this.breakersSolved,
      breakerChoice: this.breakerChoice,
      m3LaunchChoice: this.launchChoice,
      mavAltitudeKm: Math.round(this.mavAltitudeKm),
      mavVelocityMs: Math.round(this.mavVelocityMs),
      mavPitchDegrees: Math.round(this.mavPitchDeg),
      mavStage: this.mavStage,
      solId: this.solScenario.id,
      solLabel: this.solScenario.solLabel,
      radiationMsvPerDay: this.solScenario.radiationMsvPerDay,
      tradeOffId: this.activeTradeOff?.id,
      tradeOffTitle: this.activeTradeOff?.title,
      scienceScore: this.scienceScore,
    });
  }

  private executeStageSeparation() {
    this.mavStage = 2;
    sounds.playStageSeparation();
    this.cameras.main.shake(220, 0.02);

    this.mavStage1Debris = this.add.sprite(this.mavRocketSprite.x, this.mavRocketSprite.y + 45, 'stalactite_rock');
    this.mavStage1Debris.setTint(0xf8fafc);
    this.mavStage1Debris.setDepth(49);
    this.tweens.add({
      targets: this.mavStage1Debris,
      y: this.mavStage1Debris.y + 450,
      rotation: 3.2,
      alpha: 0,
      duration: 2400,
    });

    this.callbacks.onWarning('Stage 1 dropped! The rocket is lighter, so Stage 2 can go faster!');
    this.callbacks.onDialogueTrigger('m3_stage1_burnout');
  }

  private enterOrbitalDockingPhase() {
    this.isMavFlying = false;
    this.rocketPlumeEmitter.stop();
    this.ascentCorridorGraphic?.clear();
    if (this.ascentTotalTicks > 0 && this.ascentCorridorTicks / this.ascentTotalTicks >= 0.55) {
      this.scienceScore += 10;
      this.callbacks.onWarning('SMOOTH FLIGHT TO ORBIT! +10 Accuracy Science!');
    }
    this.stage = 'm3_stage_5_orbital_dock';
    this.callbacks.onStageChange(this.stage);
    this.callbacks.onFactUnlock('astronaut_health_microgravity');
    this.callbacks.onDialogueTrigger('m3_orbital_dock');
    sounds.playObjectiveStinger();

    const spaceBg = this.add.rectangle(1400, 900, 3200, 2200, 0x030712);
    spaceBg.setDepth(52);

    for (let i = 0; i < 150; i++) {
      const starSize = i % 4 === 0 ? 4 : 2;
      const star = this.add.rectangle(
        Phaser.Math.Between(500, 2300),
        Phaser.Math.Between(250, 1550),
        starSize,
        starSize,
        0xffffff,
        Phaser.Math.FloatBetween(0.45, 0.95)
      );
      star.setDepth(53);
    }

    const marsLimb = this.add.image(1400, 1240, 'pixel_mars_limb');
    marsLimb.setDepth(54);

    this.earthReturnOrbiter = this.add.sprite(1400, 740, 'earth_return_orbiter');
    this.earthReturnOrbiter.setDepth(55);
    this.earthReturnOrbiter.setScale(1.25);

    this.mavRocketSprite.setPosition(1400 + this.dockingOffsetX, 1020);
    this.mavRocketSprite.setRotation(0);
    this.mavRocketSprite.setDepth(56);
    this.mavRocketSprite.setScale(0.85);

    this.dockingGuideRing = this.add.image(1400, 740, 'pixel_pad_cyan');
    this.dockingGuideRing.setDepth(57);

    this.dockingCrosshair = this.add.image(1400 + this.dockingOffsetX, 975, 'pixel_dock_crosshair');
    this.dockingCrosshair.setDepth(58);

    this.cameras.main.centerOn(1400, 880);
    this.cameras.main.setZoom(1.0);
    this.orbitalDistanceMeters = 85;
  }

  private updateOrbitalDocking(dt: number) {
    if (this.isDocked) return;

    const left = this.cursors.left.isDown || this.wasd.A.isDown || virtualInput.left;
    const right = this.cursors.right.isDown || this.wasd.D.isDown || virtualInput.right;
    const up = this.cursors.up.isDown || this.wasd.W.isDown || virtualInput.up;
    const down = this.cursors.down.isDown || this.wasd.S.isDown || virtualInput.down;

    const rcsSpeed = 85 * dt;
    let thrusting = false;

    if (left) {
      this.dockingOffsetX = Math.max(-180, this.dockingOffsetX - rcsSpeed);
      thrusting = true;
    }
    if (right) {
      this.dockingOffsetX = Math.min(180, this.dockingOffsetX + rcsSpeed);
      thrusting = true;
    }
    if (up) {
      this.orbitalDistanceMeters = Math.max(0, this.orbitalDistanceMeters - 22 * dt);
      thrusting = true;
    }
    if (down) {
      this.orbitalDistanceMeters = Math.min(120, this.orbitalDistanceMeters + 16 * dt);
      thrusting = true;
    }

    if (thrusting && this.elapsedSeconds - this.lastThrustAudioTime > 0.16) {
      this.lastThrustAudioTime = this.elapsedSeconds;
      sounds.playRcsPuff();
    }

    this.mavRocketSprite.x = 1400 + this.dockingOffsetX;
    this.mavRocketSprite.y = 740 + this.orbitalDistanceMeters * 3.2;

    if (this.dockingCrosshair) {
      this.dockingCrosshair.x = this.mavRocketSprite.x;
      this.dockingCrosshair.y = this.mavRocketSprite.y - 45;
    }

    const alignTolerance = this.explorerMode === 'junior' ? 20 : 14;
    const alignStatus =
      Math.abs(this.dockingOffsetX) < alignTolerance
        ? 'LINED UP! PRESS [W] UP!'
        : this.dockingOffsetX < 0
        ? 'MOVE RIGHT [D]'
        : 'MOVE LEFT [A]';
    this.callbacks.onPromptChange(
      `DOCK WITH SPACESHIP [WASD / Arrows] | Distance: ${Math.round(this.orbitalDistanceMeters)}m | ${alignStatus}`
    );

    if (this.orbitalDistanceMeters <= 6 && Math.abs(this.dockingOffsetX) < alignTolerance) {
      this.isDocked = true;
      sounds.playDockingSuccess();
      this.cameras.main.shake(150, 0.015);

      this.mavRocketSprite.setPosition(1400, 765);
      this.dockingCrosshair?.setVisible(false);
      this.dockingGuideRing?.setTexture('pixel_dock_ring_ok');

      this.callbacks.onPromptChange('DOCKED SAFE! PREPARING HOME FLIGHT!');
      this.stage = 'm3_cinematic_ending';
      this.callbacks.onStageChange(this.stage);
      if (this.callbacks.onOpenCrewHealthModal) {
        this.callbacks.onOpenCrewHealthModal();
      } else {
        this.callbacks.onDialogueTrigger('m3_ending');
      }
    }

    this.callbacks.onWaypointUpdate({
      x: 1400,
      y: 740,
      dx: -this.dockingOffsetX,
      dy: -this.orbitalDistanceMeters * 3.2,
      label: 'Spaceship Ring',
      distanceMeters: Math.round(Math.hypot(this.dockingOffsetX / 4, this.orbitalDistanceMeters)),
      stage: this.stage,
    });

    this.callbacks.onResourceUpdate({
      oxygen: 100,
      battery: Math.round(this.battery),
      condition: Math.round(this.condition),
      hasCoupler: false,
      isInRover: false,
      isInsideHabitat: false,
      isDustStormActive: false,
      elapsedSeconds: this.elapsedSeconds,
      rockCollisions: this.rockCollisions,
      hasCoreSample: true,
      breakersConfigured: this.breakersSolved,
      mavAltitudeKm: 343,
      mavVelocityMs: 3400,
      mavDocked: this.isDocked,
      breakerChoice: this.breakerChoice,
      m3LaunchChoice: this.launchChoice,
      solId: this.solScenario.id,
      solLabel: this.solScenario.solLabel,
      radiationMsvPerDay: this.solScenario.radiationMsvPerDay,
      tradeOffId: this.activeTradeOff?.id,
      tradeOffTitle: this.activeTradeOff?.title,
      scienceScore: this.scienceScore,
    });
  }

  private autoStartAfterRestart = false;

  public applyMissionConfig(
    sol: MarsSolScenario,
    tradeOff: MissionTradeOffOption
  ) {
    this.solScenario = sol;
    this.activeTradeOff = tradeOff;
    this.oxygenMult = tradeOff.effects.oxygenDrainMultiplier ?? 1.0;
    this.batteryMult = tradeOff.effects.batteryDrainMultiplier ?? 1.0;
    this.shieldingMult = tradeOff.effects.shieldingDrainMultiplier ?? 1.0;
    this.ascentSpeedMult = tradeOff.effects.ascentSpeedMultiplier ?? 1.0;
    this.scienceScore = 20 + this.crewBonusScience + (tradeOff.effects.bonusScienceScore ?? 0);
    this.battery = tradeOff.effects.startingBattery ?? 100;
    this.condition = tradeOff.effects.startingCondition ?? 100;
    this.isPlanningFrozen = false;

    this.callbacks.onFactUnlock('sample_caching_heritage');
    this.callbacks.onStageChange(this.stage);
    this.callbacks.onDialogueTrigger('m3_stage1_start');
    sounds.playObjectiveStinger();
  }

  public resetMission(waitForPlan = false) {
    this.autoStartAfterRestart = !waitForPlan;
    this.scene.restart({
      callbacks: this.callbacks,
      autoStart: !waitForPlan,
      solScenario: this.solScenario,
      crewId: this.crewId,
    });
  }
}
