import Phaser from 'phaser';
import { generateMarsTextures } from '../textures/MarsTextures';
import {
  CinematicEventType,
  ExplorerMode,
  GameResources,
  MarsSolScenario,
  MissionStage,
  MissionTradeOffOption,
  Waypoint,
} from '../../types/game';
import { getSolScenarioById } from '../../data/nasaDatasets';
import { sounds } from '../../audio/SoundManager';
import { virtualInput } from '../virtualInput';

export interface SceneCallbacks {
  onResourceUpdate: (resources: GameResources) => void;
  onStageChange: (stage: MissionStage) => void;
  onPromptChange: (prompt: string | null) => void;
  onDialogueTrigger: (dialogueKey: string) => void;
  onFactUnlock: (factId: string) => void;
  onWarning: (msg: string) => void;
  onWaypointUpdate: (wp: Waypoint) => void;
  onMissionEnd: (success: boolean) => void;
  onOpenBreakerConsole?: () => void;
  onTriggerDisasterCinematic?: (eventType?: CinematicEventType) => void;
  onOpenRadioMiniGame?: () => void;
  onOpenDrillMiniGame?: () => void;
  onOpenCrewHealthModal?: () => void;
  onOpenLaunchDecision?: () => void;
  onOpenRoverPrepDecision?: () => void;
  onOpenMission2RouteDecision?: () => void;

  // ------ MODIFIED PART ----------
  onMission2TermLearned?: (term: {
  id: string;
  title: string;
  explanation: string;
}) => void;
// -----------------
}

export class Mission1Scene extends Phaser.Scene {
  private callbacks!: SceneCallbacks;

  private astronaut!: Phaser.Physics.Arcade.Sprite;
  private rover!: Phaser.Physics.Arcade.Sprite;
  private roverHeadlight!: Phaser.GameObjects.Image;
  private habitatSprite!: Phaser.GameObjects.Sprite;
  private crateSprite!: Phaser.GameObjects.Sprite;
  private relayTowerSprite!: Phaser.GameObjects.Sprite;
  private relayDishGlow!: Phaser.GameObjects.Image;
  private safeZoneCircle!: Phaser.GameObjects.Image;

  private rocksGroup!: Phaser.Physics.Arcade.StaticGroup;
  private roughZonesGroup!: Phaser.GameObjects.Zone[];

  private checkPadCircle!: Phaser.GameObjects.Image;
  private checkPadLabel!: Phaser.GameObjects.Text;
  private damagedSmokeEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private isCutsceneFrozen = false;
  private isReadingPaused = false;
  private pendingStormTimer: number | null = null;
  private powerPickups: Array<{ sprite: Phaser.GameObjects.Sprite; collected: boolean }> = [];

  private stormEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private stage: MissionStage = 'stage_0_opening_explore';
  private oxygen = 100;
  private battery = 100;
  private condition = 100;
  private hasCoupler = false;
  private isInRover = false;
  private isInsideHabitat = true;
  private isDustStormActive = false;
  private rockCollisions = 0;
  private elapsedSeconds = 0;

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
  private repairSpeedMult = 1.0;
  private baseRefillMult = 1.0;
  private scienceScore = 10;
  private radWarnShown = false;
  private zeroShieldWarnShown = false;

  private roverSpeed = 0;
  private roverMaxSpeed = 260;
  private roverAcceleration = 220;
  private roverDrag = 140;
  private roverTurnSpeed = 2.4;

  private isRepairing = false;
  private repairProgress = 0;
  private relayRepaired = false;
  private roverPlanChosen = false;
  private stormChoice?: 'auto' | 'wait_earth';
  private stormWindWarned = false;

  private eKeyCooldown = 0;
  private collisionCooldown = 0;

  private waypointLocations = {
    crate: { x: 520, y: 720, label: 'Orange Box' },
    rover: { x: 700, y: 520, label: 'Mars Rover' },
    relay: { x: 1950, y: 850, label: 'Radio Tower' },
    habitat: { x: 350, y: 500, label: 'Safe Base' },
  };

  constructor() {
    super('Mission1Scene');
  }

  public init(data: { callbacks: SceneCallbacks }) {
    this.callbacks = data.callbacks;
  }

  public preload() {

    generateMarsTextures(this);
  }

  public create() {

    const worldWidth = 2400;
    const worldHeight = 1800;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.add.tileSprite(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, 'martian_ground');

    this.roughZonesGroup = [];
    const duneAreas = [
      { x: 1050, y: 650, w: 280, h: 420 },
      { x: 1400, y: 1100, w: 320, h: 360 },
      { x: 1650, y: 500, w: 260, h: 400 },
    ];

    duneAreas.forEach((d) => {
      this.add.tileSprite(d.x, d.y, d.w, d.h, 'rough_dunes').setAlpha(0.85);
      const zone = this.add.zone(d.x, d.y, d.w, d.h);
      this.roughZonesGroup.push(zone);
    });

    const trackGraphics = this.add.graphics();
    trackGraphics.lineStyle(4, 0x822e16, 0.45);

    trackGraphics.beginPath();
    trackGraphics.moveTo(370, 560);
    trackGraphics.lineTo(520, 700);
    trackGraphics.lineTo(690, 530);
    trackGraphics.stroke();

    this.habitatSprite = this.add.sprite(350, 500, 'habitat_base');
    this.safeZoneCircle = this.add.image(350, 500, 'pixel_safe_ring');

    this.checkPadCircle = this.add.image(465, 505, 'pixel_pad_sky');
    this.tweens.add({
      targets: this.checkPadCircle,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Stepped',
      easeParams: [2],
    });
    this.checkPadLabel = this.add
      .text(465, 456, 'CHECK SHIP [E]', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#bae6fd',
        backgroundColor: '#020617',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5);

    this.damagedSmokeEmitter = this.add.particles(350, 468, 'dust_particle', {
      speedX: { min: -18, max: 24 },
      speedY: { min: -45, max: -20 },
      scale: { start: 0.9, end: 2.2 },
      alpha: { start: 0.55, end: 0 },
      tint: [0x52525b, 0x71717a, 0x9a3412],
      lifespan: 2000,
      frequency: 110,
      emitting: false,
    });
    this.damagedSmokeEmitter.setDepth(24);

    this.crateSprite = this.add.sprite(520, 720, 'supply_crate');

    this.tweens.add({
      targets: this.crateSprite,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.relayTowerSprite = this.add.sprite(1950, 850, 'relay_tower');
    this.relayDishGlow = this.add.image(1950, 844, 'pixel_glow_cyan');
    this.relayDishGlow.setAlpha(0);

    this.powerPickups = [
      { x: 1120, y: 580 },
      { x: 1420, y: 820 },
      { x: 1680, y: 690 },
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

    this.rocksGroup = this.physics.add.staticGroup();

    const rockPositions = [

      { x: 220, y: 340, key: 'rock_2' },
      { x: 180, y: 520, key: 'rock_1' },
      { x: 230, y: 680, key: 'rock_3' },
      { x: 420, y: 280, key: 'rock_1' },

      { x: 880, y: 380, key: 'rock_2' },
      { x: 890, y: 460, key: 'rock_1' },
      { x: 920, y: 740, key: 'rock_3' },
      { x: 910, y: 920, key: 'rock_2' },
      { x: 950, y: 1100, key: 'rock_1' },

      { x: 1160, y: 320, key: 'rock_1' },
      { x: 1220, y: 480, key: 'rock_2' },
      { x: 1180, y: 880, key: 'rock_2' },
      { x: 1260, y: 1040, key: 'rock_3' },
      { x: 1140, y: 1300, key: 'rock_1' },

      { x: 1480, y: 420, key: 'rock_3' },
      { x: 1540, y: 700, key: 'rock_2' },
      { x: 1500, y: 960, key: 'rock_1' },
      { x: 1560, y: 1250, key: 'rock_2' },
      { x: 1720, y: 580, key: 'rock_1' },
      { x: 1750, y: 980, key: 'rock_3' },
      { x: 1820, y: 720, key: 'rock_2' },
      { x: 2080, y: 780, key: 'rock_2' },
      { x: 2060, y: 940, key: 'rock_1' },
      { x: 1950, y: 1020, key: 'rock_3' },

      { x: 800, y: 1500, key: 'rock_2' },
      { x: 1200, y: 1600, key: 'rock_1' },
      { x: 1600, y: 1550, key: 'rock_3' },
      { x: 600, y: 150, key: 'rock_2' },
      { x: 1400, y: 140, key: 'rock_1' },
    ];

    rockPositions.forEach((pos) => {
      const rock = this.rocksGroup.create(pos.x, pos.y, pos.key) as Phaser.Physics.Arcade.Sprite;
      rock.refreshBody();

      const radius = rock.width * 0.38;
      rock.body?.setCircle(radius, rock.width / 2 - radius, rock.height / 2 - radius);
    });

    this.rover = this.physics.add.sprite(700, 520, 'rover');
    this.rover.setOrigin(0.5, 0.5);
    this.rover.setCollideWorldBounds(true);
    this.rover.setDepth(15);
    this.rover.setRotation(Math.PI / 2);

    this.rover.body?.setSize(48, 70);

    this.roverHeadlight = this.add.image(700, 520, 'headlight_cone');
    this.roverHeadlight.setOrigin(0.5, 0);
    this.roverHeadlight.setDepth(14);
    this.roverHeadlight.setVisible(true);

    this.astronaut = this.physics.add.sprite(350, 550, 'astronaut');
    this.astronaut.setOrigin(0.5, 0.5);
    this.astronaut.setCollideWorldBounds(true);
    this.astronaut.setDepth(20);
    this.astronaut.body?.setCircle(14, 10, 10);

    this.physics.add.collider(this.astronaut, this.rocksGroup);
    this.physics.add.collider(this.rover, this.rocksGroup, this.handleRoverRockCollision, undefined, this);

    this.stormEmitter = this.add.particles(0, 0, 'dust_particle', {
      x: { min: 0, max: worldWidth },
      y: { min: 0, max: worldHeight },
      speedX: { min: -380, max: -240 },
      speedY: { min: 80, max: 180 },
      scale: { start: 1.2, end: 0.2 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 1400,
      frequency: 25,
      emitting: false,
    });
    this.stormEmitter.setDepth(35);

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

    this.stage = 'stage_0_opening_explore';
    this.isCutsceneFrozen = false;
    this.roverPlanChosen = false;
    this.callbacks.onStageChange(this.stage);
    this.callbacks.onDialogueTrigger('opening_explore');
    sounds.playObjectiveStinger();
  }

  private handleRoverRockCollision() {
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
      this.cameras.main.shake(180, 0.012);

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

    if (this.stage === 'stage_3_drive_rover') {
      this.callbacks.onDialogueTrigger('stage3_rover_enter');
      this.callbacks.onFactUnlock('mars_food_production');
    }
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
      // Hedeya: Stronger base life support & suit shielding, heavier gear draws slightly more rover battery
      this.crewRefillMult = 1.25;
      this.crewShieldMult = 0.85;
      this.crewBatteryMult = 1.1;
    } else if (crewId === '02-ENG') {
      // Samantha: Saves rover battery & earns +10 science, lighter rig has slightly less ray shielding
      this.crewBatteryMult = 0.85;
      this.crewShieldMult = 1.15;
      this.crewBonusScience = 10;
    } else if (crewId === '03-CMD') {
      // Hazaloom: Faster rover driving & softer rock bumps, brisk pace uses slightly more suit air on foot
      this.crewSpeedMult = 1.08;
      this.crewBumpMult = 0.8;
      this.crewO2Mult = 1.1;
    }
    this.scienceScore = 10 + this.crewBonusScience + (this.activeTradeOff?.effects.bonusScienceScore ?? 0);
  }

  public update(_time: number, delta: number) {
    if (
      this.isCutsceneFrozen ||
      this.isReadingPaused ||
      this.stage === 'cinematic_ending' ||
      this.stage === 'mission_complete' ||
      this.stage === 'mission_failed'
    ) {
      (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.rover.setVelocity(0, 0);
      sounds.stopEngine();
      return;
    }

    const dt = delta / 1000;
    if (this.stage !== 'stage_0_opening_explore') {
      this.elapsedSeconds += dt;
    }

    if (this.pendingStormTimer !== null) {
      this.pendingStormTimer -= dt;
      if (this.pendingStormTimer <= 0) {
        this.pendingStormTimer = null;
        this.stage = 'stage_5_escape_storm';
        this.callbacks.onStageChange(this.stage);
        this.callbacks.onDialogueTrigger('stage5_storm_alert');
        this.callbacks.onFactUnlock('martian_dust_storms');
        this.isDustStormActive = true;
        this.stormEmitter.start();
        sounds.setStormWind(true);
        sounds.playWarningAlarm();
        sounds.playObjectiveStinger();
      }
    }

    if (this.eKeyCooldown > 0) this.eKeyCooldown -= dt;
    if (this.collisionCooldown > 0) this.collisionCooldown -= dt;

    const distToHabitat = Phaser.Math.Distance.Between(
      this.isInRover ? this.rover.x : this.astronaut.x,
      this.isInRover ? this.rover.y : this.astronaut.y,
      350,
      500
    );
    this.isInsideHabitat = distToHabitat < 135;

    if (this.isInsideHabitat) {
      const sunlightFactor = 0.7 + (this.solScenario.sunlightPercentForCrops / 100) * 0.6;
      this.oxygen = Math.min(
        100,
        this.oxygen + 28 * this.baseRefillMult * this.crewRefillMult * sunlightFactor * dt
      );
      if (this.condition < 65) {
        this.condition = Math.min(65, this.condition + 10 * dt);
      }
    } else if (this.stage !== 'stage_0_opening_explore') {
      // Walking burns 2x Suit Air vs pressurized rover seat; waiting for Earth brings a stronger dust storm
      const stormO2Mult = !this.isDustStormActive
        ? 1.0
        : this.stormChoice === 'wait_earth'
        ? 2.15
        : 1.55;
      const baseO2Drain = (this.isInRover ? 0.18 : 0.36) * stormO2Mult;
      const zeroShieldLeak = this.condition <= 0 ? 2.2 : 1.0;
      if (this.condition <= 0 && !this.zeroShieldWarnShown) {
        this.zeroShieldWarnShown = true;
        this.callbacks.onWarning('SHIELDING AT 0%! Unprotected suit loses Air twice as fast!');
      }
      const modeDrainMult = this.explorerMode === 'junior' ? 0.78 : 1.05;
      const effectiveO2Drain =
        baseO2Drain *
        zeroShieldLeak *
        modeDrainMult *
        this.oxygenMult *
        this.crewO2Mult *
        this.solScenario.oxygenDrainMultiplier;
      this.oxygen = Math.max(0, this.oxygen - effectiveO2Drain * dt);

      const stormShieldMult = !this.isDustStormActive
        ? 1.0
        : this.stormChoice === 'wait_earth'
        ? 1.65
        : 1.35;
      const radDrain =
        this.solScenario.shieldingDrainPerSec *
        2.2 *
        modeDrainMult *
        this.shieldingMult *
        this.crewShieldMult *
        stormShieldMult;
      this.condition = Math.max(0, this.condition - radDrain * dt);
      if (this.condition < 30 && !this.radWarnShown) {
        this.radWarnShown = true;
        this.callbacks.onWarning('WARNING! Space rays wore down Shielding below 30%! Hurry back to Base!');
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

    let inRoughDunes = false;
    const currentEntityX = this.isInRover ? this.rover.x : this.astronaut.x;
    const currentEntityY = this.isInRover ? this.rover.y : this.astronaut.y;

    for (const zone of this.roughZonesGroup) {
      if (
        currentEntityX >= zone.x - zone.width / 2 &&
        currentEntityX <= zone.x + zone.width / 2 &&
        currentEntityY >= zone.y - zone.height / 2 &&
        currentEntityY <= zone.y + zone.height / 2
      ) {
        inRoughDunes = true;
        break;
      }
    }

    if (!this.isInRover) {
      this.updateAstronautMovement(dt);
    } else {
      this.updateRoverMovement(dt, inRoughDunes);
    }

    // If the player waited for Earth, solve the full-strength storm headwind on the return trip
    if (this.isDustStormActive && this.stormChoice === 'wait_earth' && !this.isInsideHabitat) {
      if (!this.stormWindWarned) {
        this.stormWindWarned = true;
        this.callbacks.onWarning('FULL-STRENGTH STORM! Fight the gusty headwind back to Base!');
      }
      if (this.isInRover) {
        const body = this.rover.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(body.velocity.x + 36, body.velocity.y + 14);
      } else {
        const body = this.astronaut.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(body.velocity.x + 32, body.velocity.y + 12);
      }
    }

    this.updateMissionLogic(dt);

    this.roverHeadlight.setPosition(this.rover.x, this.rover.y);
    this.roverHeadlight.setRotation(this.rover.rotation - Math.PI / 2);

    this.callbacks.onResourceUpdate({
      oxygen: this.oxygen,
      battery: this.battery,
      condition: this.condition,
      hasCoupler: this.hasCoupler,
      isInRover: this.isInRover,
      isInsideHabitat: this.isInsideHabitat,
      isDustStormActive: this.isDustStormActive,
      elapsedSeconds: this.elapsedSeconds,
      rockCollisions: this.rockCollisions,
      solId: this.solScenario.id,
      solLabel: this.solScenario.solLabel,
      radiationMsvPerDay: this.solScenario.radiationMsvPerDay,
      tradeOffId: this.activeTradeOff?.id,
      tradeOffTitle: this.activeTradeOff?.title,
      m1StormChoice: this.stormChoice,
      scienceScore: this.scienceScore,
    });
  }

  private updateAstronautMovement(_dt: number) {
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

    if (left) {
      this.rover.rotation -= this.roverTurnSpeed * dt;
    }
    if (right) {
      this.rover.rotation += this.roverTurnSpeed * dt;
    }

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
        this.callbacks.onWarning('Rover battery is empty! Press [E] to get out and walk.');
        this.roverSpeed = 0;
      }
    }

    const speedRatio = Math.abs(this.roverSpeed) / maxSpeed;
    sounds.updateEngine(speedRatio, isDriving);
  }

  private updateMissionLogic(dt: number) {
    const px = this.isInRover ? this.rover.x : this.astronaut.x;
    const py = this.isInRover ? this.rover.y : this.astronaut.y;

    if (this.stage !== 'stage_0_opening_explore') {
      for (const pickup of this.powerPickups) {
        if (!pickup.collected) {
          const d = Phaser.Math.Distance.Between(px, py, pickup.sprite.x, pickup.sprite.y);
          if (d < 56) {
            pickup.collected = true;
            pickup.sprite.setVisible(false);
            this.battery = Math.min(100, this.battery + 12);
            this.scienceScore += 10;
            sounds.playPickup();
            this.callbacks.onWarning('SOLAR CELL! +12% Battery & +10 Science!');
          }
        }
      }
    }

    const distToCrate = Phaser.Math.Distance.Between(this.astronaut.x, this.astronaut.y, 520, 720);
    const distToRover = Phaser.Math.Distance.Between(this.astronaut.x, this.astronaut.y, this.rover.x, this.rover.y);
    const distToRelay = Phaser.Math.Distance.Between(this.astronaut.x, this.astronaut.y, 1950, 850);
    const distToHabitat = Phaser.Math.Distance.Between(px, py, 350, 500);

    let prompt: string | null = null;
    const ePressed = Phaser.Input.Keyboard.JustDown(this.wasd.E) || virtualInput.consumeAction();

    if (this.stage === 'stage_0_opening_explore') {
      const distToCheckPad = Phaser.Math.Distance.Between(this.astronaut.x, this.astronaut.y, 465, 505);
      this.callbacks.onWaypointUpdate({
        x: 465,
        y: 505,
        dx: 465 - this.astronaut.x,
        dy: 505 - this.astronaut.y,
        label: 'Check Ship',
        distanceMeters: Math.round(distToCheckPad / 10),
        stage: this.stage,
      });

      if (distToCheckPad < 85 && !this.isInRover) {
        prompt = 'Press [E] Check Spacecraft';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          this.isCutsceneFrozen = true;
          (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
          this.checkPadCircle.setVisible(false);
          this.checkPadLabel.setVisible(false);
          this.callbacks.onPromptChange(null);
          sounds.playRadioBeep();
          this.callbacks.onTriggerDisasterCinematic?.('mission_1_explosion');
          return;
        }
      }

      this.callbacks.onPromptChange(prompt);
      return;
    }

    if (this.stage === 'stage_1_leave_habitat') {
      this.callbacks.onWaypointUpdate({
        x: 520,
        y: 720,
        dx: 520 - this.astronaut.x,
        dy: 720 - this.astronaut.y,
        label: 'Orange Box',
        distanceMeters: Math.round(distToCrate / 10),
        stage: this.stage,
      });

      if (!this.isInsideHabitat) {
        this.stage = 'stage_2_collect_coupler';
        this.callbacks.onStageChange(this.stage);
      }
    }

    if (this.stage === 'stage_2_collect_coupler') {
      this.callbacks.onWaypointUpdate({
        x: 520,
        y: 720,
        dx: 520 - this.astronaut.x,
        dy: 720 - this.astronaut.y,
        label: 'Orange Box',
        distanceMeters: Math.round(distToCrate / 10),
        stage: this.stage,
      });

      if (!this.hasCoupler && distToCrate < 75 && !this.isInRover) {
        prompt = 'Press [E] Open Orange Box';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          this.hasCoupler = true;
          sounds.playPickup();
          this.callbacks.onFactUnlock('equipment_maintenance');
          this.callbacks.onDialogueTrigger('stage2_crate');
          sounds.playObjectiveStinger();
          this.stage = 'stage_3_drive_rover';
          this.callbacks.onStageChange(this.stage);
        }
      }
    }

    if (this.stage === 'stage_3_drive_rover') {
      if (!this.isInRover) {
        this.callbacks.onWaypointUpdate({
          x: this.rover.x,
          y: this.rover.y,
          dx: this.rover.x - this.astronaut.x,
          dy: this.rover.y - this.astronaut.y,
          label: 'Mars Rover',
          distanceMeters: Math.round(distToRover / 10),
          stage: this.stage,
        });

        if (distToRover < 80) {
          prompt = !this.roverPlanChosen
            ? 'Press [E] Check & Upgrade Rover!'
            : 'Press [E] Get in Rover';
          if (ePressed && this.eKeyCooldown <= 0) {
            this.eKeyCooldown = 0.5;
            if (!this.roverPlanChosen && this.callbacks.onOpenRoverPrepDecision) {
              this.isCutsceneFrozen = true;
              (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
              this.callbacks.onPromptChange(null);
              sounds.playRadioBeep();
              this.callbacks.onOpenRoverPrepDecision();
              return;
            }
            this.enterRover();
            this.stage = 'stage_4_repair_relay';
            this.callbacks.onStageChange(this.stage);
            sounds.playObjectiveStinger();
          }
        }
      }
    }

    if (this.stage === 'stage_4_repair_relay') {
      this.callbacks.onWaypointUpdate({
        x: 1950,
        y: 850,
        dx: 1950 - px,
        dy: 850 - py,
        label: 'Radio Tower',
        distanceMeters: Math.round(Phaser.Math.Distance.Between(px, py, 1950, 850) / 10),
        stage: this.stage,
      });

      let relayTriggered = false;
      if (!this.isInRover && distToRelay < 95 && !this.relayRepaired) {
        if (this.hasCoupler) {
          prompt = 'Press [E] Tune & Fix Radio Tower!';
          if (ePressed && this.eKeyCooldown <= 0) {
            this.eKeyCooldown = 0.5;
            relayTriggered = true;
            sounds.playRadioBeep();
            if (this.callbacks.onOpenRadioMiniGame) {
              this.callbacks.onOpenRadioMiniGame();
            } else {
              this.completeRadioRepairMiniGame();
            }
          }
        } else {
          prompt = 'You need the power part from the orange box first!';
        }
      }

      if (!relayTriggered && !prompt) {
        if (this.isInRover) {
          prompt = 'Press [E] Get Out of Rover';
          if (ePressed && this.eKeyCooldown <= 0) {
            this.eKeyCooldown = 0.5;
            this.exitRover();
          }
        } else if (distToRover < 80) {
          prompt = 'Press [E] Get in Rover';
          if (ePressed && this.eKeyCooldown <= 0) {
            this.eKeyCooldown = 0.5;
            this.enterRover();
          }
        }
      }
    }

    if (this.stage === 'stage_5_escape_storm') {
      this.callbacks.onWaypointUpdate({
        x: 350,
        y: 500,
        dx: 350 - px,
        dy: 500 - py,
        label: 'Safe Base',
        distanceMeters: Math.round(distToHabitat / 10),
        stage: this.stage,
      });

      if (this.isInRover) {
        prompt = 'Press [E] Get Out of Rover';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          this.exitRover();
        }
      } else if (distToRover < 80) {
        prompt = 'Press [E] Get in Rover';
        if (ePressed && this.eKeyCooldown <= 0) {
          this.eKeyCooldown = 0.5;
          this.enterRover();
        }
      }

      if (distToHabitat < 130) {
        this.stage = 'cinematic_ending';
        this.callbacks.onStageChange(this.stage);
        sounds.setStormWind(false);
        sounds.stopEngine();
        sounds.playMissionSuccess();
        this.callbacks.onDialogueTrigger('ending');
      }
    }

    this.callbacks.onPromptChange(prompt);
  }

  public applyMissionConfig(
    sol: MarsSolScenario,
    tradeOff: MissionTradeOffOption,
    startNow = false
  ) {
    this.solScenario = sol;
    this.activeTradeOff = tradeOff;
    this.oxygenMult = tradeOff.effects.oxygenDrainMultiplier ?? 1.0;
    this.batteryMult = tradeOff.effects.batteryDrainMultiplier ?? 1.0;
    this.shieldingMult = tradeOff.effects.shieldingDrainMultiplier ?? 1.0;
    this.repairSpeedMult = tradeOff.effects.repairSpeedMultiplier ?? 1.0;
    this.baseRefillMult = tradeOff.effects.baseAirRefillMultiplier ?? 1.0;
    this.scienceScore = 10 + this.crewBonusScience + (tradeOff.effects.bonusScienceScore ?? 0);
    this.radWarnShown = false;
    this.zeroShieldWarnShown = false;

    this.battery = tradeOff.effects.startingBattery ?? 100;
    this.condition = tradeOff.effects.startingCondition ?? 100;

    if (startNow) {
      this.startPostDisasterMission();
    }
  }

  public applyMission1RoverPlan(tradeOff: MissionTradeOffOption) {
    this.activeTradeOff = tradeOff;
    this.roverPlanChosen = true;
    this.oxygenMult = tradeOff.effects.oxygenDrainMultiplier ?? 1.0;
    this.batteryMult = tradeOff.effects.batteryDrainMultiplier ?? 1.0;
    this.shieldingMult = tradeOff.effects.shieldingDrainMultiplier ?? 1.0;
    this.repairSpeedMult = tradeOff.effects.repairSpeedMultiplier ?? 1.0;
    this.baseRefillMult = tradeOff.effects.baseAirRefillMultiplier ?? 1.0;
    this.scienceScore += tradeOff.effects.bonusScienceScore ?? 0;
    this.radWarnShown = false;
    this.zeroShieldWarnShown = false;

    if (tradeOff.effects.startingBattery !== undefined) {
      this.battery = Math.min(this.battery, tradeOff.effects.startingBattery);
    }
    if (tradeOff.effects.startingCondition !== undefined) {
      this.condition = Math.min(this.condition, tradeOff.effects.startingCondition);
    }

    this.isCutsceneFrozen = false;
    this.enterRover();
    this.stage = 'stage_4_repair_relay';
    this.callbacks.onStageChange(this.stage);
    sounds.playObjectiveStinger();
  }

  public setSolScenario(sol: MarsSolScenario) {
    this.solScenario = sol;
  }

  public completeRadioRepairMiniGame(choice: 'auto' | 'wait_earth' = 'auto') {
    if (this.relayRepaired) return;
    this.isRepairing = false;
    this.relayRepaired = true;
    this.stormChoice = choice;
    this.stormWindWarned = false;

    if (choice === 'wait_earth') {
      this.oxygen = Math.max(8, this.oxygen - 15);
      this.scienceScore += 35;
      this.callbacks.onWarning('EARTH SCAN SENT! -15% Air & full storm hitting soon (+35 Science)!');
    } else {
      this.battery = Math.max(0, this.battery - 15);
      this.scienceScore += 20;
      this.callbacks.onWarning('AUTO-SOS SENT! -15% Battery, racing ahead of full storm (+20 Science)!');
    }

    this.relayDishGlow.setAlpha(0.7);
    this.tweens.add({
      targets: this.relayDishGlow,
      scaleX: 2.2,
      scaleY: 2.2,
      alpha: 0,
      duration: 1400,
      repeat: -1,
    });

    sounds.playObjectiveStinger();
    this.callbacks.onDialogueTrigger('stage4_repaired');
    this.callbacks.onFactUnlock('space_communications');
    this.pendingStormTimer = 2.0;
  }

  public startPostDisasterMission() {
    this.isCutsceneFrozen = false;
    if (this.stage !== 'stage_0_opening_explore') return;
    this.stage = 'stage_1_leave_habitat';
    this.oxygen = 100;
    this.elapsedSeconds = 0;
    this.relayRepaired = false;

    this.checkPadCircle.setVisible(false);
    this.checkPadLabel.setVisible(false);
    this.habitatSprite.setTint(0xffb49a);
    this.damagedSmokeEmitter.start();

    this.astronaut.setPosition(350, 550);
    this.astronaut.setVisible(true);
    this.astronaut.body!.enable = true;
    (this.astronaut.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.cameras.main.startFollow(this.astronaut, true, 0.08, 0.08);
    this.cameras.main.shake(180, 0.008);

    this.callbacks.onStageChange(this.stage);
    this.callbacks.onFactUnlock('jezero_crater');
    this.callbacks.onDialogueTrigger('stage1_exit');
    sounds.playObjectiveStinger();
  }

  public resetMission(waitForPlan = false) {
    this.isCutsceneFrozen = waitForPlan;
    this.isReadingPaused = false;
    this.pendingStormTimer = null;
    this.stage = 'stage_1_leave_habitat';
    this.activeTradeOff = undefined;
    this.roverPlanChosen = false;
    this.oxygenMult = 1.0;
    this.batteryMult = 1.0;
    this.shieldingMult = 1.0;
    this.repairSpeedMult = 1.0;
    this.baseRefillMult = 1.0;
    this.oxygen = 100;
    this.battery = 100;
    this.condition = 100;
    this.scienceScore = 10 + this.crewBonusScience;
    this.radWarnShown = false;
    this.zeroShieldWarnShown = false;
    this.hasCoupler = false;
    this.isInRover = false;
    this.isInsideHabitat = true;
    this.isDustStormActive = false;
    this.rockCollisions = 0;
    this.elapsedSeconds = 0;
    this.roverSpeed = 0;
    this.isRepairing = false;
    this.repairProgress = 0;
    this.relayRepaired = false;
    this.stormChoice = undefined;
    this.stormWindWarned = false;

    this.powerPickups.forEach((p) => {
      p.collected = false;
      p.sprite.setVisible(true);
    });

    sounds.setStormWind(false);
    sounds.stopEngine();

    this.stormEmitter.stop();
    this.relayDishGlow.setAlpha(0);
    this.checkPadCircle.setVisible(false);
    this.checkPadLabel.setVisible(false);
    this.habitatSprite.setTint(0xffb49a);
    this.damagedSmokeEmitter.start();

    this.rover.setPosition(700, 520);
    this.rover.setRotation(Math.PI / 2);
    this.rover.setVelocity(0, 0);

    this.astronaut.setPosition(350, 550);
    this.astronaut.setVisible(true);
    this.astronaut.body!.enable = true;
    this.astronaut.setVelocity(0, 0);

    this.cameras.main.startFollow(this.astronaut, true, 0.08, 0.08);

    this.callbacks.onStageChange(this.stage);
    if (!waitForPlan) {
      this.callbacks.onDialogueTrigger('stage1_exit');
      sounds.playObjectiveStinger();
    }
  }
}
