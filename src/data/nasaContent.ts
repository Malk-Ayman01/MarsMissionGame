import { DialogueLine, EducationalFact } from '../types/game';

export const NASA_FACTS: EducationalFact[] = [

  {
    id: 'jezero_crater',
    title: 'Jezero Crater: An Old Lake on Mars',
    subtitle: 'Where NASA Sent the Perseverance Rover',
    category: 'GEOLOGY',
    imageSrc: '/assets/nasa/jezero_crater.jpg',
    imageCaption: 'NASA picture of Jezero Crater on Mars (curved ancient river delta).',
    nasaFact:
      'Long ago, Jezero Crater (45 km wide and ~2,500 meters deep below average Mars ground!) was a big lake full of water! Rivers carried mud and clay into the lake. Today, each sol (one Mars day — 24 hours and 39 minutes) is freezing cold with very thin air, so astronauts must wear pressurized spacesuits.',
    olderKidsNote:
      'Orbital elevation maps show Jezero Crater sitting around -2,500 meters elevation where the Neretva river delta flowed in. Surface air pressure stays near ~710–760 Pa (under 1% of Earth) and background radiation is ~0.64 mSv/day.',
    classroomPrompt:
      'Class Question: Why can liquid rivers NOT flow on Mars today even though Jezero Crater held a giant lake 3.5 billion years ago?',
    gameContext:
      'In Mission 1, your damaged ship and broken radio tower sit on this rocky lake edge during real Mars Sol weather.',
    sourceName: 'NASA Mars 2020 Perseverance & MSL RAD',
    sourceUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
    missionId: 'mission_1',
    unlockedAtStage: 'stage_1_leave_habitat',
    instrumentName: 'Space Orbiter Camera & MEDA',
    solObservation: 'Jezero Crater',
    datasetType: 'REAL_NASA_OBSERVATION',
  },
  {
    id: 'mars_food_production',
    title: 'Growing Food on Mars (Space Farming!)',
    subtitle: 'Why Hydroponics Beats Planting in Mars Dirt',
    category: 'POWER SYSTEMS',
    imageSrc: '/assets/nasa/meda_weather_station.jpg',
    imageCaption: 'NASA weather sensors checking Mars sunlight and dust levels needed for greenhouses.',
    nasaFact:
      'Food rockets from Earth take 7 to 9 months! So Mars astronauts grow lettuce and veggies using hydroponics (growing plants in clean water instead of dirt), because real Mars dirt has yucky salty chemicals called perchlorates. Plants also turn astronaut breath back into fresh oxygen!',
    olderKidsNote:
      'Mars only receives ~43% of Earth sunlight (~590 W/m² peak) — and during dusty Sols (Tau 1.65) sunlight drops near ~18%! So NASA Veggie / Advanced Plant Habitat LED grow lights demand heavy electric power, creating a real trade-off with rover battery and habitat heaters.',
    classroomPrompt:
      'Explore Question: Why is growing plants in clean water with space lights safer than using real Mars dirt?',
    gameContext:
      'Whenever you walk inside the green circle at your base, your Suit Air fills back up using real life-support oxygen science!',
    sourceName: 'NASA Growing Plants in Space (VEGGIE & APH)',
    sourceUrl: 'https://www.nasa.gov/missions/station/iss-research/growing-plants-in-space/',
    missionId: 'mission_1',
    unlockedAtStage: 'stage_3_drive_rover',
    instrumentName: 'NASA VEGGIE / APH & MEDA Sunlight Data',
    solObservation: 'Sol Crop Study',
    datasetType: 'REAL_NASA_OBSERVATION',
  },
  {
    id: 'equipment_maintenance',
    title: 'Fixing Broken Tools on Mars',
    subtitle: 'Why Spare Parts Keep Astronauts Safe',
    category: 'ROVER TECH',
    imageSrc: '/assets/nasa/perseverance_rover.jpg',
    imageCaption: 'NASA Perseverance rover and Ingenuity helicopter working on Mars.',
    nasaFact:
      'It takes about 7 months for a supply rocket to bring new things from Earth to Mars! So astronauts and rovers must carry spare parts and fix broken tools right away using what they have.',
    olderKidsNote:
      'NASA launches Mars transfer missions only once every ~26 months when Earth and Mars line up (Hohmann transfer window). Carrying extra mass costs huge rocket fuel, forcing tight weight trade-offs.',
    classroomPrompt:
      'Design Challenge: If you could only pack 3 spare parts for a 500-day Mars trip, which tools would you pick first?',
    gameContext:
      'You pick up a spare power part from the orange box so you can fix the broken radio tower yourself.',
    sourceName: 'NASA Mars Rover Pictures',
    sourceUrl: 'https://mars.nasa.gov/mars2020/multimedia/raw-images/',
    missionId: 'mission_1',
    unlockedAtStage: 'stage_2_collect_coupler',
    instrumentName: 'Rover Camera',
    solObservation: 'Sol 46',
    datasetType: 'REAL_NASA_OBSERVATION',
  },
  {
    id: 'space_communications',
    title: 'Radio Delay: Waiting for Earth to Answer!',
    subtitle: 'Why Messages Take About 6 to 44 Minutes Round-Trip',
    category: 'COMMUNICATIONS',
    imageSrc: '/assets/nasa/deep_space_network.jpg',
    imageCaption: 'A giant 70-meter NASA Deep Space Network radio dish on Earth listening to Mars.',
    nasaFact:
      'Mars is 55 to 401 million kilometers away! Even at the speed of light, a radio "HELLO!" takes about 3 to 22 minutes just to arrive on Earth — so waiting for an answer can take up to 44 minutes! That is why Mars crews must make quick safety choices on their own.',
    olderKidsNote:
      'Radio waves travel at c = 299,792 km/s. When Mars is near solar conjunction (378+ million km), one-way light-time lag hits ~21 minutes (42 min round trip). NASA rovers use onboard autonomous hazard avoidance instead of Earth joystick control.',
    classroomPrompt:
      'Math Check: If Mars is 252 million km away and light travels ~18 million km per minute, how long do you wait to hear back after asking Earth for help?',
    gameContext:
      'Watch the Light-Time Radio Delay readout in your mission header — and notice why astronauts must think fast in storms!',
    sourceName: 'NASA Deep Space Network',
    sourceUrl: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/deep-space-network/',
    missionId: 'mission_1',
    unlockedAtStage: 'stage_4_repair_relay',
    instrumentName: 'Deep Space Network 70m Antenna',
    solObservation: 'Light-Time Telemetry',
    datasetType: 'REAL_NASA_OBSERVATION',
  },
  {
    id: 'martian_dust_storms',
    title: 'Big Dust Storms on Mars',
    subtitle: 'Tiny Powder Dust & Solar Blackouts',
    category: 'ATMOSPHERE',
    imageSrc: '/assets/nasa/mars_dust_storm.jpg',
    imageCaption: 'Mars before (left) and during (right) a giant planet-wide dust storm.',
    nasaFact:
      'Mars has very thin air, so wind does not push hard. But Mars dust is tiny like baby powder! Big storms can block sunlight from solar panels and greenhouses, and clog spacesuit air filters.',
    olderKidsNote:
      'Perseverance MEDA measures atmospheric dust using optical depth ("Tau"). Clear skies measure Tau ~0.4, while heavy storms exceed Tau 1.65–5.0, slashing solar energy and cooling daytime highs.',
    classroomPrompt:
      'Science Link: How does a planet-wide dust storm affect both rover batteries and indoor greenhouse plants at the same time?',
    gameContext:
      'When the storm arrives, it gets harder to see and your Suit Air drains twice as fast. Hurry back inside!',
    sourceName: 'NASA Mars Science & MEDA',
    sourceUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/science/',
    missionId: 'mission_1',
    unlockedAtStage: 'stage_5_escape_storm',
    instrumentName: 'MEDA Dust Sensor & Orbiter Camera',
    solObservation: 'Dust Tau Study',
    datasetType: 'REAL_NASA_OBSERVATION',
  },

  {
    id: 'rimfax_subsurface_radar',
    title: 'Looking Underground with Radar',
    subtitle: 'How NASA Sees Under Mars Dirt',
    category: 'GEOLOGY',
    imageSrc: '/assets/nasa/rimfax_radar.jpg',
    imageCaption: 'NASA RIMFAX radar map showing hidden rock layers under the ground.',
    nasaFact:
      'Perseverance has a special tool called RIMFAX. It sends radio waves 10 meters down into the ground to spot hidden rock layers and buried caves without digging!',
    olderKidsNote:
      'RIMFAX is a ground-penetrating radar operating at 150–1,200 MHz, helping scientists locate ancient lake sediments and buried lava channels beneath Jezero Crater.',
    classroomPrompt:
      'Think Like a Scientist: Why is radar scanning safer and faster than drilling holes everywhere at random?',
    gameContext:
      'Watch your Cave Signal bar and listen to the beeps to find where to drop both ground sensors.',
    sourceName: 'NASA RIMFAX Radar',
    sourceUrl: 'https://mars.nasa.gov/mars2020/spacecraft/instruments/rimfax/',
    missionId: 'mission_2',
    unlockedAtStage: 'm2_stage_1_canyon_transit',
    instrumentName: 'RIMFAX Subsurface Radar',
    solObservation: 'Sol 210',
    datasetType: 'REAL_NASA_OBSERVATION',
  },
  {
    id: 'neretva_vallis_floods',
    title: 'Neretva Valley: An Ancient River',
    subtitle: 'Carved by Rushing Water Long Ago',
    category: 'GEOLOGY',
    imageSrc: '/assets/nasa/neretva_vallis.jpg',
    imageCaption: 'A dry ancient river valley on Mars called Neretva Vallis.',
    nasaFact:
      'Over 3 billion years ago, huge floods of water rushed through this valley and carried mud and clay into Jezero Crater! Clay rocks can even trap tiny signs of ancient water.',
    olderKidsNote:
      'Steep canyon walls like Neretva Vallis also partially shield explorers from incoming cosmic rays by blocking wide angles of the Martian sky, though loose windblown sand costs rovers extra battery torque.',
    classroomPrompt:
      'Compare Routes: Why might mission planners choose a slower, sandy canyon floor over a fast, exposed flat ridge during a solar storm?',
    gameContext:
      'You drive into this old river valley to place Ground Sensor 1.',
    sourceName: 'NASA Neretva Vallis',
    sourceUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/science/',
    missionId: 'mission_2',
    unlockedAtStage: 'm2_stage_2_deploy_beacons',
    instrumentName: 'Orbiter Map',
    solObservation: 'Sol 1140',
    datasetType: 'REAL_NASA_OBSERVATION',
  },
  {
    id: 'martian_lava_tubes',
    title: 'Caves That Block Space Rays! (Lava Tubes)',
    subtitle: 'Natural Shields Against Radiation Dose',
    category: 'SUBTERRANEAN',
    imageSrc: '/assets/nasa/mars_lava_tube.jpg',
    imageCaption: 'A hole (skylight) on Mars leading down into an underground lava cave.',
    nasaFact:
      'Mars does not have a strong magnetic shield like Earth, so harmful space rays (radiation dose) hit the ground! Underground volcano caves called lava tubes have thick stone roofs that block ~95% of space rays and keep astronauts safer than even the International Space Station!',
    olderKidsNote:
      'ISS radiation dosimeters record around ~0.52 mSv/day in orbit and Mars rovers measure ~0.64 mSv/day (jumping past 3.8 mSv/day during solar storms). Under thick lava-tube rock, radiation drops ~95% to roughly ~0.03 mSv/day.',
    classroomPrompt:
      'Mission Planning: How could future Mars habitats inside lava tubes stay warm and grow food without natural sunlight?',
    gameContext:
      'When you enter the cave in Mission 2, your HUD shows 95% Space Rays Blocked — protecting your Shielding meter!',
    sourceName: 'NASA Mars Caves & Curiosity RAD',
    sourceUrl: 'https://science.nasa.gov/mission/msl-curiosity/',
    missionId: 'mission_2',
    unlockedAtStage: 'm2_stage_3_lava_tube_entry',
    instrumentName: 'HiRISE Camera & RAD Radiation Data',
    solObservation: 'Volcanic Cave Shelter',
    datasetType: 'REAL_NASA_OBSERVATION',
  },
  {
    id: 'sample_core_caching',
    title: 'Drilling a Mars Rock Sample',
    subtitle: 'Saving Clean Rocks in Metal Tubes',
    category: 'ROVER TECH',
    imageSrc: '/assets/nasa/sample_core_tube.jpg',
    imageCaption: 'A shiny titanium tube holding a real finger-sized piece of Mars rock.',
    nasaFact:
      'NASA uses a spinning drill on the rover arm to cut out finger-sized rock pieces (~10–15 grams) and seal them inside super clean metal tubes to study in Earth labs.',
    olderKidsNote:
      'Perseverance carries 43 ultra-clean titanium sample tubes sterilized to avoid contaminating Mars rocks with Earth microbes before Mars Sample Return.',
    classroomPrompt:
      'Lab Check: Why do NASA scientists work so hard to keep the inside of sample tubes cleaner than a hospital operating room?',
    gameContext:
      'Use the rock drill inside the cave to collect Rock Tube #14 before the ground starts shaking!',
    sourceName: 'NASA Mars Sample Return',
    sourceUrl: 'https://science.nasa.gov/mission/mars-sample-return/',
    missionId: 'mission_2',
    unlockedAtStage: 'm2_stage_4_sample_extraction',
    instrumentName: 'Rover Percussive Drill',
    solObservation: 'Sol 194',
    datasetType: 'REAL_NASA_OBSERVATION',
  },

  {
    id: 'sample_caching_heritage',
    title: 'Every Watt Counts on Mars',
    subtitle: 'Why Rover Teams Plan Their Power',
    category: 'POWER SYSTEMS',
    imageSrc: '/assets/nasa/perseverance_rover.jpg',
    imageCaption: 'NASA’s Perseverance rover on Mars.',
    nasaFact:
      'NASA’s Perseverance rover makes about 110 watts of electricity. That is about the same as one light bulb! Batteries help when the rover needs more power for a short time.',
    olderKidsNote:
      'Perseverance’s nuclear power source (MMRTG) makes about 110 W and charges two batteries. During science work the rover can need up to 900 W, so the team plans which parts are on at the same time. (The 400 W limit and Heater #2 are a game story based on this idea.)',
    classroomPrompt:
      'Think: If a broken part wastes most of your power, what should you turn off first? What must always stay on?',
    gameContext:
      'In Mission 3, Hedeya shows you that Heater #2 is wasting power. Turn it off so Suit Air and the Wheels fit under 400 W!',
    sourceName: 'NASA JPL – Perseverance Power System',
    sourceUrl: 'https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/mission/spacecraft/power/',
    missionId: 'mission_3',
    unlockedAtStage: 'm3_stage_1_grid_triage',
    instrumentName: 'MMRTG Power Source',
    solObservation: 'Rover Power Planning',
    datasetType: 'SIMULATED_SCENARIO',
  },
  {
    id: 'mars_ascent_vehicle',
    title: 'A Two-Stage Rocket From Mars',
    subtitle: 'NASA’s Mars Ascent Vehicle Design',
    category: 'NAVIGATION',
    imageSrc: '/assets/nasa/sample_core_tube.jpg',
    imageCaption: 'A sample tube like the ones a Mars rocket would carry to orbit.',
    nasaFact:
      'NASA engineers designed a small rocket with two parts, called stages. Stage 1 burns its fuel and falls away. That makes the rocket lighter, so Stage 2 can carry the rock samples all the way to orbit around Mars.',
    olderKidsNote:
      'NASA’s Mars Ascent Vehicle design used two solid rocket motors and aimed for a circular orbit about 343 km above Mars. Radio messages take about 3 to 22 minutes to travel between Earth and Mars, so the rocket must steer itself. In real life no people would ride it: robots would launch the samples. NASA’s Mars Sample Return program lost its funding in 2026, so the samples are still waiting on Mars.',
    classroomPrompt:
      'Think: Why can’t someone on Earth steer a Mars rocket with a game controller while it is flying?',
    gameContext:
      'In the game, YOU are the rocket’s computer: steer with A and D inside the green box, press SPACE to drop Stage 1, then dock in orbit.',
    sourceName: 'NASA Technical Reports Server – Mars Ascent Vehicle Design',
    sourceUrl: 'https://ntrs.nasa.gov/citations/20205008210',
    missionId: 'mission_3',
    unlockedAtStage: 'm3_stage_4_mav_ascent',
    instrumentName: 'Mars Ascent Vehicle (MAV)',
    solObservation: 'Target Orbit 343 km',
    datasetType: 'DERIVED_SCIENTIFIC_DATA',
  },
  {
    id: 'astronaut_health_microgravity',
    title: 'Staying Healthy in Space (Bones, Muscles & Sleep)',
    subtitle: 'How Long Space Trips Change Astronaut Bodies',
    category: 'SPACE BIOLOGY',
    imageSrc: '/assets/nasa/meda_weather_station.jpg',
    imageCaption: 'Space life-support and environmental sensors keep astronaut crews healthy on long journeys.',
    nasaFact:
      'In space, astronauts float, so their bones and muscles do not have to hold up their weight. To stay strong, astronauts on the Space Station exercise about 2 hours every day.',
    olderKidsNote:
      'Even with exercise, astronauts can lose about 1% of their bone density each month in space. NASA also uses special lights to help sleep (brighter and bluer in the morning, dimmer and redder at night), and astronauts have grown and eaten fresh lettuce on the Space Station.',
    classroomPrompt:
      'Think: Which daily habits keep bones, muscles, and sleep healthy when you float in space?',
    gameContext:
      'Open the Space Facts Book -> Crew Health tab anytime to explore real space biology discoveries on bones, muscles, sleep, and immunity!',
    sourceName: 'NASA Open Science Data Repository',
    sourceUrl: 'https://osdr.nasa.gov/',
    missionId: 'mission_3',
    unlockedAtStage: 'm3_stage_5_orbital_dock',
    instrumentName: 'Space Biology & Dosimetry Lab',
    solObservation: 'Return Orbit Health',
    datasetType: 'REAL_NASA_OBSERVATION',
  },
];

export const DIALOGUE_SCRIPTS: Record<string, DialogueLine[]> = {
  opening_explore: [
    {
      id: 'op_1',
      speaker: 'SAMANTHA',
      characterId: 'samantha',
      callsign: 'SPACE SCIENTIST',
      text: 'Welcome to Jezero Crater, Rescue Lead! Everything looks calm—walk to the blue pad by our ship and press [E] to check thruster pressure so Earth clears our landing.',
    },
  ],
  stage1_exit: [
    {
      id: 's1_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'That blast broke our return rocket AND fried our ship radio! Right now Earth thinks we landed fine and cannot warn us about storms.',
    },
    {
      id: 's1_2',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'Grab the spare Radio Power Part in the Orange Box outside [E], then hop in the Rover so we can fix the Hill Radio Tower and call Earth!',
    },
  ],
  stage2_crate: [
    {
      id: 's2_1',
      speaker: 'HAZALOOM',
      characterId: 'hazaloom',
      callsign: 'ROVER PARTNER',
      text: 'Nice, you got the Radio Power Part! Walking outside burns Suit Air twice as fast—head to the Rover and press [E] to ride safely to the Hill Tower.',
    },
  ],
  stage3_rover_enter: [
    {
      id: 's3_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'Rover online! Riding inside protects your Suit Air and shields you from space rays—steer past boulders and grab yellow Solar Cells to keep Battery charged!',
    },
  ],
  stage4_repaired: [
    {
      id: 's4_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'You reconnected us to Earth! Because you fixed the Hill Tower, NASA satellites just spotted a huge Mars dust storm heading straight here!',
    },
  ],
  stage5_storm_alert: [
    {
      id: 's5_1',
      speaker: 'SAMANTHA',
      characterId: 'samantha',
      callsign: 'SPACE SCIENTIST',
      text: 'DUST STORM HIT! Baby-powder dust blocks sunlight and clogs suit filters, draining Air fast—race back to our green Hydroponics Base ring where plants make fresh oxygen!',
    },
  ],
  ending: [
    {
      id: 'end_1',
      speaker: 'SAMANTHA',
      characterId: 'samantha',
      callsign: 'SPACE SCIENTIST',
      text: 'Everyone is breathing safe inside Base! Earth heard our SOS and sent our next rescue plan—Mission 2: Cave Shield & Rock #14 is unlocked!',
    },
  ],

  m2_stage1_start: [
    {
      id: 'm2_s1_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'Earth needs Rock Tube #14 for a rescue rocket, but space radiation outside is dangerous! Hop in the Rover [E] and drop Sensor 1 to bounce radar waves underground.',
    },
  ],
  m2_beacon1_placed: [
    {
      id: 'm2_b1_1',
      speaker: 'SAMANTHA',
      characterId: 'samantha',
      callsign: 'SPACE SCIENTIST',
      text: 'Sensor 1 is reading the ancient river clay! Drive north to drop Sensor 2—two radar pings together will map a hidden lava cave safe from space rays.',
    },
  ],
  m2_beacon2_placed: [
    {
      id: 'm2_b2_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'Bingo—RIMFAX radar found a giant underground lava cave! Drive to the cave hole and press [E] to climb down out of the space rays.',
    },
  ],
  m2_cave_entry: [
    {
      id: 'm2_ce_1',
      speaker: 'SAMANTHA',
      characterId: 'samantha',
      callsign: 'SPACE SCIENTIST',
      text: 'Look at your shield readout—thick cave stone blocks 95% of harmful space rays! Grab blue ice crystals for Suit Air and drill glowing Rock Tube #14 [E]!',
    },
  ],
  m2_sample_drilled: [
    {
      id: 'm2_sd_1',
      speaker: 'HAZALOOM',
      characterId: 'hazaloom',
      callsign: 'ROVER PARTNER',
      text: 'Rock Tube #14 is sealed inside clean titanium! We have what Earth asked for—wait, feel that rumble?!',
    },
  ],
  m2_tremor_alert: [
    {
      id: 'm2_ta_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'MARSQUAKE! Cave stones are shaking loose—sprint back to the blue Cave Exit circle right now to save Rock Tube #14!',
    },
  ],
  m2_ending: [
    {
      id: 'm2_end_1',
      speaker: 'SAMANTHA',
      characterId: 'samantha',
      callsign: 'SPACE SCIENTIST',
      text: 'You got our crew and Rock Tube #14 out alive! Earth cleared our emergency launch—Mission 3: Launch & Fly Home is unlocked!',
    },
  ],

  m3_stage1_start: [
    {
      id: 'm3_s1_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'Mars dust jammed Heater #2 ON. It uses 380 W, and our rover can only use 400 W at once! Walk to the rover and press [E] to turn it off.',
    },
  ],
  m3_bus_isolated: [
    {
      id: 'm3_bi_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'Great! Now Suit Air and the Wheels have enough power. Drive east to the rocket pad. Watch out for dust devils!',
    },
  ],
  m3_dust_devil_hit: [
    {
      id: 'm3_dd_1',
      speaker: 'SAMANTHA',
      characterId: 'samantha',
      callsign: 'SPACE SCIENTIST',
      text: 'A dust devil! Mars air is very thin, so it can’t flip us over. But dust gets into the wheels and uses battery. Drive around them!',
    },
  ],
  m3_mav_reached: [
    {
      id: 'm3_mr_1',
      speaker: 'HAZALOOM',
      characterId: 'hazaloom',
      callsign: 'ROVER PARTNER',
      text: 'There is the Mars rocket! Park on the yellow pad and press [E] to load Rock Tube #14.',
    },
  ],
  m3_launch_ignited: [
    {
      id: 'm3_li_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'LIFTOFF! Radio messages take minutes to reach Earth, so the rocket must steer itself. Today YOU are its computer! Keep the white line in the green box with [A] and [D].',
    },
  ],
  m3_stage1_burnout: [
    {
      id: 'm3_sb_1',
      speaker: 'HEDEYA',
      characterId: 'hedeya',
      callsign: 'FIX-IT ENGINEER',
      text: 'Stage 1 is out of fuel! Press [SPACEBAR] to drop it. A lighter rocket goes faster!',
    },
  ],
  m3_orbital_dock: [
    {
      id: 'm3_od_1',
      speaker: 'SAMANTHA',
      characterId: 'samantha',
      callsign: 'SPACE SCIENTIST',
      text: 'We are in orbit! Things keep moving in space until something stops them, so tap [WASD] gently to line up with the spaceship ring.',
    },
  ],
  m3_ending: [
    {
      id: 'm3_end_1',
      speaker: 'HAZALOOM',
      characterId: 'hazaloom',
      callsign: 'ROVER PARTNER',
      text: 'Docked! Thank you, Mission Control. All three of us are flying home to Earth!',
    },
  ],
};
