import Phaser from 'phaser';
import { generateMarsTextures } from '../textures/MarsTextures';
import {
  ExplorerMode,
  GameResources,
  MarsSolScenario,
  Mission2DrillChoice,
  MissionStage,
  MissionTradeOffOption,
  Waypoint,
} from '../../types/game';
import { getSolScenarioById } from '../../data/nasaDatasets';
import { sounds } from '../../audio/SoundManager';
import { virtualInput } from '../virtualInput';
import { SceneCallbacks } from './Mission1Scene';

export class Mission2Scene extends Phaser.Scene {
  private callbacks!: SceneCallbacks;

  private astronaut!: Phaser.Physics.Arcade.Sprite;
  private rover!: Phaser.Physics.Arcade.Sprite;
  private roverHeadlight!: Phaser.GameObjects.Image;
  private habitatSprite!: Phaser.GameObjects.Sprite;
  private skylightPortal!: Phaser.GameObjects.Sprite;
  private anomalyRelic!: Phaser.GameObjects.Sprite;
  private anomalyGlow!: Phaser.GameObjects.Image;
  private safeZoneCircle!: Phaser.GameObjects.Image;

  private beacon1Sprite?: Phaser.GameObjects.Sprite;
  private beacon2Sprite?: Phaser.GameObjects.Sprite;

  private rocksGroup!: Phaser.Physics.Arcade.StaticGroup;
  private stalactitesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private dividerWall!: Phaser.Physics.Arcade.StaticGroup;
  private roughZonesGroup!: Phaser.GameObjects.Zone[];

  private caveDarkness!: Phaser.GameObjects.Rectangle;
  private tremorDustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private stage: MissionStage = 'm2_stage_1_canyon_transit';
  private oxygen = 100;
  private battery = 100;
  private condition = 100;
  private isInRover = false;
  private isInsideHabitat = true;
  private isInLavaTube = false;
  private seismicTremor = false;
  private elapsedSeconds = 0;
  private rockCollisions = 0;

  private beaconsPlaced = 0;
  private totalBeacons = 2;
  private beacon1Coords = { x: 1050, y: 950 };
  private beacon2Coords = { x: 1550, y: 500 };
  private skylightCoords = { x: 1750, y: 950 };
  private cavePortalExit = { x: 1750, y: 1320 };
  private relicCoords = { x: 2350, y: 1650 };

  private signalStrength = 20;
  private lastPingTime = 0;
  private hasCoreSample = false;
  private isDrilling = false;
  private drillProgress = 0;

  private isPlanningFrozen = false;
  private isReadingPaused = false;
  private routePlanChosen = false;
  private pendingMarsquakeTimer: number | null = null;
  private drillChoice?: Mission2DrillChoice;
  private extraQuakeRocks: Phaser.Physics.Arcade.Sprite[] = [];
  private crystalPickups: Array<{ sprite: Phaser.GameObjects.Sprite; collected: boolean }> = [];
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
  private oxygenMult = 1.0;
  private batteryMult = 1.0;
  private shieldingMult = 1.0;
  private scienceScore = 15;
  private caveNoticeShown = false;
  private radWarnShown = false;
  private zeroShieldWarnShown = false;

  private roverSpeed = 0;
  private roverMaxSpeed = 270;
  private roverAcceleration = 230;
  private roverDrag = 140;
  private roverTurnSpeed = 2.4;

  private eKeyCooldown = 0;
  private collisionCooldown = 0;

  constructor() {
    super('Mission2Scene');
  }

  public init(data: { callbacks: SceneCallbacks }) {
    this.callbacks = data.callbacks;
  }

  public preload() {
    generateMarsTextures(this);
  }

  public create() {
    const worldWidth = 2600;
    const worldHeight = 2000;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.add.tileSprite(worldWidth / 2, 600, worldWidth, 1200, 'martian_ground');

    this.add.tileSprite(worldWidth / 2, 1600, worldWidth, 800, 'subsurface_rock');

    const divider = this.add.graphics();
    divider.fillStyle(0x09090b, 1);
    divider.fillRect(0, 1180, worldWidth, 40);

    this.dividerWall = this.physics.add.staticGroup();
    const barrierZone = this.add.rectangle(worldWidth / 2, 1200, worldWidth, 40, 0x09090b, 0);
    this.physics.add.existing(barrierZone, true);
    this.dividerWall.add(barrierZone);

    this.roughZonesGroup = [];
    const duneAreas = [
      { x: 800, y: 700, w: 260, h: 350 },
      { x: 1300, y: 750, w: 300, h: 280 },
    ];
    duneAreas.forEach((d) => {
      this.add.tileSprite(d.x, d.y, d.w, d.h, 'rough_dunes').setAlpha(0.85);
      const zone = this.add.zone(d.x, d.y, d.w, d.h);
      this.roughZonesGroup.push(zone);
    });

    this.habitatSprite = this.add.sprite(300, 450, 'habitat_base');
    this.safeZoneCircle = this.add.image(300, 450, 'pixel_safe_ring');

    this.skylightPortal = this.add.sprite(this.skylightCoords.x, this.skylightCoords.y, 'lava_skylight');

    const caveExitPad = this.add.image(this.cavePortalExit.x, this.cavePortalExit.y, 'pixel_pad_cyan');
    caveExitPad.setDepth(14);
    this.add
      .text(this.cavePortalExit.x, this.cavePortalExit.y + 58, 'CAVE EXIT', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#67e8f9',
        backgroundColor: '#09090b',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(14);

    this.add.image(this.beacon1Coords.x, this.beacon1Coords.y, 'pixel_pad_amber');
    this.add
      .text(this.beacon1Coords.x, this.beacon1Coords.y + 54, 'SENSOR 1 SPOT', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#fcd34d',
        backgroundColor: '#09090b',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5);

    this.add.image(this.beacon2Coords.x, this.beacon2Coords.y, 'pixel_pad_amber');
    this.add
      .text(this.beacon2Coords.x, this.beacon2Coords.y + 54, 'SENSOR 2 SPOT', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#fcd34d',
        backgroundColor: '#09090b',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5);

    this.anomalyRelic = this.add.sprite(this.relicCoords.x, this.relicCoords.y, 'anomaly_relic');
    this.anomalyRelic.setDepth(15);
    this.anomalyGlow = this.add.image(this.relicCoords.x, this.relicCoords.y, 'pixel_glow_cyan');
    this.anomalyGlow.setDepth(14);
    this.add
      .text(this.relicCoords.x, this.relicCoords.y + 56, 'DRILL ROCK HERE', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#67e8f9',
        backgroundColor: '#09090b',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(15);

    this.tweens.add({
      targets: [this.anomalyGlow, this.anomalyRelic],
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Stepped',
      easeParams: [2],
    });

    this.crystalPickups = [
      { x: 1220, y: 740 },
      { x: 1960, y: 1480 },
      { x: 2220, y: 1680 },
    ].map((pt) => {
      const sprite = this.add.sprite(pt.x, pt.y, 'pickup_crystal').setDepth(16);
      this.tweens.add({
        targets: sprite,
        y: pt.y - 6,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return { sprite, collected: false };
    });

    this.rocksGroup = this.physics.add.staticGroup();
    this.stalactitesGroup = this.physics.add.staticGroup();

    const surfaceRocks = [
      { x: 600, y: 350, key: 'rock_2' },
      { x: 620, y: 650, key: 'rock_1' },
      { x: 850, y: 400, key: 'rock_3' },
      { x: 920, y: 550, key: 'rock_2' },
      { x: 1200, y: 350, key: 'rock_1' },
      { x: 1250, y: 620, key: 'rock_3' },
      { x: 1450, y: 750, key: 'rock_2' },
      { x: 1600, y: 700, key: 'rock_1' },
      { x: 1850, y: 800, key: 'rock_2' },
      { x: 1900, y: 1050, key: 'rock_3' },
    ];
    surfaceRocks.forEach((pos) => {
      const rock = this.rocksGroup.create(pos.x, pos.y, pos.key) as Phaser.Physics.Arcade.Sprite;
      rock.refreshBody();
      const radius = rock.width * 0.38;
      rock.body?.setCircle(radius, rock.width / 2 - radius, rock.height / 2 - radius);
    });

    const caveStalactites = [
      { x: 1900, y: 1400 },
      { x: 1920, y: 1550 },
      { x: 2050, y: 1350 },
      { x: 2100, y: 1750 },
      { x: 2200, y: 1500 },
      { x: 2250, y: 1800 },
      { x: 2450, y: 1550 },
      { x: 2480, y: 1720 },
    ];
    caveStalactites.forEach((pos) => {
      const stal = this.stalactitesGroup.create(pos.x, pos.y, 'stalactite_rock') as Phaser.Physics.Arcade.Sprite;
      stal.setDepth(14);
      stal.refreshBody();
      stal.body?.setSize(36, 42);
    });

    this.rover = this.physics.add.sprite(500, 480, 'rover');
    this.rover.setOrigin(0.5, 0.5);
    this.rover.setCollideWorldBounds(true);
    this.rover.setDepth(15);
    this.rover.setRotation(Math.PI / 2);
    this.rover.body?.setSize(48, 70);

    this.roverHeadlight = this.add.image(500, 480, 'headlight_cone');
    this.roverHeadlight.setOrigin(0.5, 0);
    this.roverHeadlight.setDepth(14);
    this.roverHeadlight.setVisible(true);

    this.astronaut = this.physics.add.sprite(300, 500, 'astronaut');
    this.astronaut.setOrigin(0.5, 0.5);
    this.astronaut.setCollideWorldBounds(true);
    this.astronaut.setDepth(20);
    this.astronaut.body?.setCircle(14, 10, 10);

    this.physics.add.collider(this.astronaut, this.rocksGroup);
    this.physics.add.collider(this.astronaut, this.stalactitesGroup);
    this.physics.add.collider(this.astronaut, this.dividerWall);
    this.physics.add.collider(this.rover, this.rocksGroup, this.handleRoverCollision, undefined, this);
    this.physics.add.collider(this.rover, this.stalactitesGroup, this.handleRoverCollision, undefined, this);
    this.physics.add.collider(this.rover, this.dividerWall);

    this.caveDarkness = this.add.rectangle(worldWidth / 2, 1600, worldWidth, 800, 0x050508, 0.72);
    this.caveDarkness.setDepth(12);

    this.tremorDustEmitter = this.add.particles(0, 0, 'dust_particle', {
      x: { min: 1600, max: worldWidth },
      y: { min: 1200, max: 1300 },
      speedY: { min: 120, max: 280 },
      speedX: { min: -40, max: 40 },
      scale: { start: 1.5, end: 0.3 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1600,
      frequency: 30,
      emitting: false,
    });
    this.tremorDustEmitter.setDepth(30);

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

    this.isPlanningFrozen = false;
    this.routePlanChosen = false;
    this.callbacks.onFactUnlock('rimfax_subsurface_radar');
    this.callbacks.onStageChange(this.stage);
    this.callbacks.onDialogueTrigger('m2_stage1_start');
    sounds.playObjectiveStinger();
  }

  private handleRoverCollision() {
    if (!this.isInRover || this.collisionCooldown > 0) return;

    const currentSpeed = Math.abs(this.roverSpeed);
    if (currentSpeed > 50) {
      this.collisionCooldown = 0.8;
      this.rockCollisions++;
      const modeHitMult = this.explorerMode === 'junior' ? 0.7 : 1.0;
      const bumpDamage = Math.max(
        3,
        Math.round(10 * modeHitMult * Math.min(1.3, this.shieldingMult * this.crewShieldMult) * this.crewBumpMult)
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

  public setReadingPaused(paused: boolean) {
    this.isReadingPaused = paused;
    if (paused) {
      sounds.stopEngine();
      virtualInput.resetAll();
    }
  }

  public setExplorerMode(mode: ExplorerMode) {
    this.explorerMode = mode;
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
    this.scienceScore = 15 + this.crewBonusScience + (this.activeTradeOff?.effects.bonusScienceScore ?? 0);
  }

  public update(_time: number, delta: number) {
    if (
      this.isPlanningFrozen ||
      this.isReadingPaused ||
      this.stage === 'm2_cinematic_ending' ||
      this.stage === 'mission_complete' ||
      this.stage === 'mission_failed'
    ) {
      (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.rover.setVelocity(0, 0);
      sounds.stopEngine();
      return;
    }

    const dt = delta / 1000;
    this.elapsedSeconds += dt;

    if (this.pendingMarsquakeTimer !== null) {
      this.pendingMarsquakeTimer -= dt;
      if (this.pendingMarsquakeTimer <= 0) {
        this.pendingMarsquakeTimer = null;
        this.isPlanningFrozen = true;
        (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.rover.setVelocity(0, 0);
        this.roverSpeed = 0;
        sounds.stopEngine();
        sounds.playWarningAlarm();
        this.callbacks.onTriggerDisasterCinematic?.('mission_2_marsquake');
        return;
      }
    }

    if (this.eKeyCooldown > 0) this.eKeyCooldown -= dt;
    if (this.collisionCooldown > 0) this.collisionCooldown -= dt;

    const px = this.isInRover ? this.rover.x : this.astronaut.x;
    const py = this.isInRover ? this.rover.y : this.astronaut.y;

    const distToHabitat = Phaser.Math.Distance.Between(px, py, 300, 450);
    this.isInsideHabitat = distToHabitat < 135;
    this.isInLavaTube = py > 1200;

    if (this.isInLavaTube && !this.caveNoticeShown) {
      this.caveNoticeShown = true;
      this.callbacks.onWarning('SHIELD BONUS! Thick cave stone blocks 95% of space rays!');
    }

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
      const drainRate =
        baseO2Drain *
        zeroShieldLeak *
        modeDrainMult *
        this.oxygenMult *
        this.crewO2Mult *
        this.solScenario.oxygenDrainMultiplier;
      this.oxygen = Math.max(0, this.oxygen - drainRate * dt);

      const caveShieldFactor = this.isInLavaTube ? 0.05 : 1.0;
      const radDrain =
        this.solScenario.shieldingDrainPerSec *
        2.2 *
        modeDrainMult *
        this.shieldingMult *
        this.crewShieldMult *
        caveShieldFactor;
      this.condition = Math.max(0, this.condition - radDrain * dt);

      if (this.condition < 30 && !this.radWarnShown && !this.isInLavaTube) {
        this.radWarnShown = true;
        this.callbacks.onWarning('WARNING! Surface space rays wore down Shielding below 30%!');
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

    let targetX = this.beacon1Coords.x;
    let targetY = this.beacon1Coords.y;
    if (this.beaconsPlaced === 1) {
      targetX = this.beacon2Coords.x;
      targetY = this.beacon2Coords.y;
    } else if (this.beaconsPlaced >= 2) {
      targetX = this.relicCoords.x;
      targetY = this.relicCoords.y;
    }

    const distToTarget = Phaser.Math.Distance.Between(px, py, targetX, targetY);
    this.signalStrength = Math.max(15, Math.min(100, Math.round(100 - (distToTarget / 1500) * 85)));

    const pingInterval = 4.0 - (this.signalStrength / 100) * 2.8;
    if (this.elapsedSeconds - this.lastPingTime > pingInterval) {
      this.lastPingTime = this.elapsedSeconds;
      sounds.playSonarPing(this.signalStrength / 100);
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

    this.updateMission2Logic(dt);

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
      signalStrength: this.signalStrength,
      beaconsPlaced: this.beaconsPlaced,
      totalBeacons: this.totalBeacons,
      hasCoreSample: this.hasCoreSample,
      isInLavaTube: this.isInLavaTube,
      caveRadiationBlocked: this.isInLavaTube,
      seismicTremor: this.seismicTremor,
      solId: this.solScenario.id,
      solLabel: this.solScenario.solLabel,
      radiationMsvPerDay: this.solScenario.radiationMsvPerDay,
      tradeOffId: this.activeTradeOff?.id,
      tradeOffTitle: this.activeTradeOff?.title,
      m2DrillChoice: this.drillChoice,
      scienceScore: this.scienceScore,
    });
  }

  private updateAstronautMovement() {
    const body = this.astronaut.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;
    const speed = 150;

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

    const maxSpeed = (inRoughDunes ? 160 : this.roverMaxSpeed) * this.crewSpeedMult;

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
      const baseDrain = inRoughDunes ? 0.72 : 0.38;
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

  private updateMission2Logic(dt: number) {
    const px = this.isInRover ? this.rover.x : this.astronaut.x;
    const py = this.isInRover ? this.rover.y : this.astronaut.y;

    for (const pickup of this.crystalPickups) {
      if (!pickup.collected) {
        const d = Phaser.Math.Distance.Between(px, py, pickup.sprite.x, pickup.sprite.y);
        if (d < 56) {
          pickup.collected = true;
          pickup.sprite.setVisible(false);
          this.oxygen = Math.min(100, this.oxygen + 12);
          this.scienceScore += 10;
          sounds.playPickup();
          this.callbacks.onWarning('ICE CRYSTAL! +12% Suit Air & +10 Science!');
        }
      }
    }

    const distToRover = Phaser.Math.Distance.Between(this.astronaut.x, this.astronaut.y, this.rover.x, this.rover.y);
    const distToBeacon1 = Phaser.Math.Distance.Between(px, py, this.beacon1Coords.x, this.beacon1Coords.y);
    const distToBeacon2 = Phaser.Math.Distance.Between(px, py, this.beacon2Coords.x, this.beacon2Coords.y);
    const distToSkylight = Phaser.Math.Distance.Between(px, py, this.skylightCoords.x, this.skylightCoords.y);
    const distToCaveExit = Phaser.Math.Distance.Between(px, py, this.cavePortalExit.x, this.cavePortalExit.y);
    const distToRelic = Phaser.Math.Distance.Between(px, py, this.relicCoords.x, this.relicCoords.y);

    let prompt: string | null = null;
    const ePressed = Phaser.Input.Keyboard.JustDown(this.wasd.E) || virtualInput.consumeAction();
    let actionTriggered = false;

    if (this.stage === 'm2_stage_1_canyon_transit') {
      this.callbacks.onWaypointUpdate({
        x: this.beacon1Coords.x,
        y: this.beacon1Coords.y,
        dx: this.beacon1Coords.x - px,
        dy: this.beacon1Coords.y - py,
        label: 'Sensor 1 Spot',
        distanceMeters: Math.round(distToBeacon1 / 10),
        stage: this.stage,
      });

      if (distToBeacon1 < 90) {
        prompt = 'Press [E] Drop Ground Sensor 1';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.6;
          actionTriggered = true;
          this.beaconsPlaced = 1;
          this.battery = Math.max(0, this.battery - 6);
          this.scienceScore += 15;
          this.beacon1Sprite = this.add.sprite(this.beacon1Coords.x, this.beacon1Coords.y, 'seismic_beacon');
          sounds.playBeaconDeploy();
          sounds.playObjectiveStinger();
          this.stage = 'm2_stage_2_deploy_beacons';

          if (!this.routePlanChosen && this.callbacks.onOpenMission2RouteDecision) {
            this.isPlanningFrozen = true;
            (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
            this.rover.setVelocity(0, 0);
            this.roverSpeed = 0;
            sounds.stopEngine();
            this.callbacks.onPromptChange(null);
            this.callbacks.onOpenMission2RouteDecision();
            return;
          }

          this.callbacks.onWarning('SENSOR 1 ACTIVE! -6% Battery power used, +15 Science!');
          this.callbacks.onFactUnlock('neretva_vallis_floods');
          this.callbacks.onDialogueTrigger('m2_beacon1_placed');
          this.callbacks.onStageChange(this.stage);
        }
      }
    }

    else if (this.stage === 'm2_stage_2_deploy_beacons') {
      this.callbacks.onWaypointUpdate({
        x: this.beacon2Coords.x,
        y: this.beacon2Coords.y,
        dx: this.beacon2Coords.x - px,
        dy: this.beacon2Coords.y - py,
        label: 'Sensor 2 Spot',
        distanceMeters: Math.round(distToBeacon2 / 10),
        stage: this.stage,
      });

      if (distToBeacon2 < 90) {
        prompt = 'Press [E] Drop Ground Sensor 2 (-6% Power)';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.6;
          actionTriggered = true;
          this.beaconsPlaced = 2;
          this.battery = Math.max(0, this.battery - 6);
          this.scienceScore += 15;
          this.beacon2Sprite = this.add.sprite(this.beacon2Coords.x, this.beacon2Coords.y, 'seismic_beacon');
          sounds.playBeaconDeploy();
          sounds.playObjectiveStinger();
          this.callbacks.onWarning('SENSOR 2 ACTIVE! -6% Battery power used, +15 Science!');
          this.callbacks.onFactUnlock('martian_lava_tubes');
          this.callbacks.onDialogueTrigger('m2_beacon2_placed');

          this.stage = 'm2_stage_3_lava_tube_entry';
          this.callbacks.onStageChange(this.stage);
        }
      }
    }

    else if (this.stage === 'm2_stage_3_lava_tube_entry') {
      this.callbacks.onWaypointUpdate({
        x: this.skylightCoords.x,
        y: this.skylightCoords.y,
        dx: this.skylightCoords.x - px,
        dy: this.skylightCoords.y - py,
        label: 'Cave Entrance',
        distanceMeters: Math.round(distToSkylight / 10),
        stage: this.stage,
      });

      if (distToSkylight < 100) {
        prompt = 'Press [E] Go Down Into Cave';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.6;
          actionTriggered = true;

          if (this.isInRover) {
            this.exitRover();
          }
          this.astronaut.setPosition(this.cavePortalExit.x, this.cavePortalExit.y);
          sounds.playObjectiveStinger();
          this.callbacks.onDialogueTrigger('m2_cave_entry');

          this.stage = 'm2_stage_4_sample_extraction';
          this.callbacks.onStageChange(this.stage);
        }
      }
    }

    else if (this.stage === 'm2_stage_4_sample_extraction') {
      this.callbacks.onWaypointUpdate({
        x: this.relicCoords.x,
        y: this.relicCoords.y,
        dx: this.relicCoords.x - px,
        dy: this.relicCoords.y - py,
        label: 'Glowing Rock',
        distanceMeters: Math.round(distToRelic / 10),
        stage: this.stage,
      });

      if (distToRelic < 100 && !this.hasCoreSample) {
        prompt = 'Press [E] Drill Mars Rock Sample!';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          actionTriggered = true;
          sounds.playDrillSound();
          if (this.callbacks.onOpenDrillMiniGame) {
            this.callbacks.onOpenDrillMiniGame();
          } else {
            this.completeDrillMiniGame();
          }
        }
      }
    }

    else if (this.stage === 'm2_stage_5_seismic_evacuation') {
      this.callbacks.onWaypointUpdate({
        x: this.cavePortalExit.x,
        y: this.cavePortalExit.y,
        dx: this.cavePortalExit.x - px,
        dy: this.cavePortalExit.y - py,
        label: 'Cave Exit!',
        distanceMeters: Math.round(distToCaveExit / 10),
        stage: this.stage,
      });

      if (Math.random() < 0.05) {
        this.cameras.main.shake(200, 0.02);
        sounds.playSeismicRumble();
      }

      if (distToCaveExit < 95) {
        prompt = 'Press [E] Escape Out of Cave!';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.6;
          actionTriggered = true;

          if (this.isInRover) {
            this.rover.setPosition(this.skylightCoords.x - 70, this.skylightCoords.y);
          } else {
            this.astronaut.setPosition(this.skylightCoords.x - 70, this.skylightCoords.y);
          }
          this.seismicTremor = false;
          this.tremorDustEmitter.stop();
          sounds.stopEngine();
          sounds.playMissionSuccess();

          this.stage = 'm2_cinematic_ending';
          this.callbacks.onStageChange(this.stage);
          this.callbacks.onDialogueTrigger('m2_ending');
        }
      }
    }

    if (!actionTriggered && !prompt) {
      if (this.isInRover) {
        prompt = 'Press [E] Get Out of Rover';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          this.exitRover();
        }
      } else if (distToRover < 80 && !this.isInLavaTube) {
        prompt = 'Press [E] Get in Rover';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          this.enterRover();
        }
      }
    }

    this.callbacks.onPromptChange(prompt);
  }

  public applyMissionConfig(
    sol: MarsSolScenario,
    tradeOff: MissionTradeOffOption
  ) {
    this.solScenario = sol;
    this.activeTradeOff = tradeOff;
    this.routePlanChosen = true;
    this.oxygenMult = tradeOff.effects.oxygenDrainMultiplier ?? 1.0;
    this.batteryMult = tradeOff.effects.batteryDrainMultiplier ?? 1.0;
    this.shieldingMult = tradeOff.effects.shieldingDrainMultiplier ?? 1.0;
    this.scienceScore += tradeOff.effects.bonusScienceScore ?? 0;

    if (tradeOff.effects.startingBattery !== undefined) {
      this.battery = Math.min(this.battery, tradeOff.effects.startingBattery);
    }
    if (tradeOff.effects.startingCondition !== undefined) {
      this.condition = Math.min(this.condition, tradeOff.effects.startingCondition);
    }

    this.isPlanningFrozen = false;

    this.callbacks.onWarning('SENSOR 1 ACTIVE! -6% Battery power used, +15 Science!');
    this.callbacks.onFactUnlock('neretva_vallis_floods');
    this.callbacks.onStageChange(this.stage);
    this.callbacks.onDialogueTrigger('m2_beacon1_placed');
    sounds.playObjectiveStinger();
  }

  public setSolScenario(sol: MarsSolScenario) {
    this.solScenario = sol;
  }

  public completeDrillMiniGame(
    batteryUsed = 5,
    drillChoice: Mission2DrillChoice = 'standard'
  ) {
    if (this.hasCoreSample) return;
    this.isDrilling = false;
    this.hasCoreSample = true;
    this.drillChoice = drillChoice;
    this.battery = Math.max(0, this.battery - batteryUsed);

    if (drillChoice === 'deep_ice') {
      this.scienceScore += 55;
      this.oxygen = Math.min(100, this.oxygen + 15);
      this.callbacks.onWarning(
        `DEEP ICE-VEIN SEALED! -${batteryUsed}% Power, +15% Air & +55 Science!`
      );
    } else {
      this.scienceScore += 25;
      this.callbacks.onWarning(
        `TUBE #14 SEALED! -${batteryUsed}% Power, +25 Science!`
      );
    }

    sounds.playPickup();
    sounds.playObjectiveStinger();
    this.callbacks.onFactUnlock('sample_core_caching');
    this.callbacks.onDialogueTrigger('m2_sample_drilled');
    this.pendingMarsquakeTimer = 1.6;
  }

  public startPostQuakeEvacuation() {
    this.isPlanningFrozen = false;
    if (this.stage !== 'm2_stage_4_sample_extraction' || !this.hasCoreSample) return;
    this.stage = 'm2_stage_5_seismic_evacuation';
    this.callbacks.onStageChange(this.stage);
    this.seismicTremor = true;
    this.tremorDustEmitter.start();

    if (this.drillChoice === 'deep_ice') {
      const quakeSpots = [
        { x: 2150, y: 1590 },
        { x: 2010, y: 1470 },
        { x: 1875, y: 1390 },
      ];
      quakeSpots.forEach((pt) => {
        const rock = this.stalactitesGroup.create(pt.x, pt.y, 'stalactite_rock') as Phaser.Physics.Arcade.Sprite;
        rock.setDepth(14);
        rock.setTint(0xfca5a5);
        rock.refreshBody();
        rock.body?.setSize(36, 42);
        this.extraQuakeRocks.push(rock);
      });
      this.cameras.main.shake(450, 0.028);
      this.callbacks.onWarning('DEEP DRILL SHOOK EXTRA BOULDERS LOOSE! Dodge them to Cave Exit!');
    } else {
      this.cameras.main.shake(300, 0.02);
    }

    sounds.playSeismicRumble();
    sounds.playWarningAlarm();
    sounds.playObjectiveStinger();
    this.callbacks.onDialogueTrigger('m2_tremor_alert');
  }

  public resetMission(waitForPlan = false) {
    this.isPlanningFrozen = waitForPlan;
    this.isReadingPaused = false;
    this.routePlanChosen = false;
    this.activeTradeOff = undefined;
    this.oxygenMult = 1.0;
    this.batteryMult = 1.0;
    this.shieldingMult = 1.0;
    this.pendingMarsquakeTimer = null;
    this.drillChoice = undefined;
    this.extraQuakeRocks.forEach((rock) => rock.destroy());
    this.extraQuakeRocks = [];
    this.stage = 'm2_stage_1_canyon_transit';
    this.oxygen = 100;
    this.battery = 100;
    this.condition = 100;
    this.scienceScore = 15 + this.crewBonusScience;
    this.caveNoticeShown = false;
    this.radWarnShown = false;
    this.zeroShieldWarnShown = false;
    this.isInRover = false;
    this.isInsideHabitat = true;
    this.isInLavaTube = false;
    this.seismicTremor = false;
    this.elapsedSeconds = 0;
    this.rockCollisions = 0;
    this.roverSpeed = 0;
    this.beaconsPlaced = 0;
    this.hasCoreSample = false;
    this.isDrilling = false;
    this.drillProgress = 0;

    this.crystalPickups.forEach((p) => {
      p.collected = false;
      p.sprite.setVisible(true);
    });

    sounds.stopEngine();
    this.tremorDustEmitter.stop();

    if (this.beacon1Sprite) {
      this.beacon1Sprite.destroy();
      this.beacon1Sprite = undefined;
    }
    if (this.beacon2Sprite) {
      this.beacon2Sprite.destroy();
      this.beacon2Sprite = undefined;
    }

    this.rover.setPosition(500, 480);
    this.rover.setRotation(Math.PI / 2);
    this.rover.setVelocity(0, 0);

    this.astronaut.setPosition(300, 500);
    this.astronaut.setVisible(true);
    this.astronaut.body!.enable = true;
    this.astronaut.setVelocity(0, 0);

    this.cameras.main.startFollow(this.astronaut, true, 0.08, 0.08);

    this.callbacks.onStageChange(this.stage);
    if (!waitForPlan) {
      this.callbacks.onDialogueTrigger('m2_stage1_start');
      sounds.playObjectiveStinger();
    }
  }
}
