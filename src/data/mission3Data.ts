export interface SubsystemDiagnostic {
  id: string;
  name: string;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL_FAULT';
  currentDrawWatts: number;
  isEssentialForLifeOrMobility: boolean;
  symptom: string;
  recommendedAction: string;
}

export const MISSION_3_DIAGNOSTICS: SubsystemDiagnostic[] = [
  {
    id: 'power_bus_aux',
    name: 'Auxiliary Power Distribution Bus #2',
    status: 'CRITICAL_FAULT',
    currentDrawWatts: 380,
    isEssentialForLifeOrMobility: false,
    symptom:
      'Electrostatic dust accumulation across the external radiator has induced a high-resistance thermal fault. Power draw has spiked 250% above nominal limits.',
    recommendedAction:
      'Isolate and power down Auxiliary Bus #2 immediately to protect primary batteries and life-support reserves.',
  },
  {
    id: 'primary_life_support',
    name: 'PLSS Primary Oxygen Circulation & Scrubber',
    status: 'NOMINAL',
    currentDrawWatts: 140,
    isEssentialForLifeOrMobility: true,
    symptom: 'CO2 scrubbers and O2 delivery lines operating nominally at 21.0 kPa partial pressure.',
    recommendedAction: 'Maintain uninterrupted power feed; essential for crew survival.',
  },
  {
    id: 'drive_mobility',
    name: 'Rover 6-Wheel Rocker-Bogie Drive Actuators',
    status: 'WARNING',
    currentDrawWatts: 210,
    isEssentialForLifeOrMobility: true,
    symptom:
      'Fine silica dust in left-rear wheel seal causing 12% increased friction torque. Speed limited to 14 km/h.',
    recommendedAction: 'Engage low-torque drive mode and avoid steep rocky inclines.',
  },
  {
    id: 'science_spectrometer',
    name: 'Contact Raman & Luminescence Spectrometer',
    status: 'WARNING',
    currentDrawWatts: 180,
    isEssentialForLifeOrMobility: false,
    symptom:
      'Sensor cooler continuously cycling on backup power, drawing energy from the main battery.',
    recommendedAction:
      'Place science instrument into cold standby to conserve power for the return traverse.',
  },
  {
    id: 'comm_uhf_link',
    name: 'High-Gain Microwave & UHF Base Transceiver',
    status: 'NOMINAL',
    currentDrawWatts: 45,
    isEssentialForLifeOrMobility: true,
    symptom: 'Downlink with Ares-1 habitat base beacon is stable at 8.4 GHz.',
    recommendedAction: 'Maintain low-power carrier ping for base navigation lock.',
  },
];

export interface ReturnRouteChoice {
  id: 'direct_scarp' | 'delta_shelf';
  name: string;
  distanceMeters: number;
  elevationGradePercent: number;
  batteryCostPercent: number;
  oxygenTimeMinutes: number;
  riskAssessment: 'HIGH' | 'LOW';
  description: string;
  crewEvaluation: string;
}

export const RETURN_ROUTES: ReturnRouteChoice[] = [
  {
    id: 'direct_scarp',
    name: 'Scarp Direct Return (Northern Wall)',
    distanceMeters: 580,
    elevationGradePercent: 18,
    batteryCostPercent: 28,
    oxygenTimeMinutes: 5.5,
    riskAssessment: 'HIGH',
    description:
      'Direct route climbing up the 18% slope of the delta scarp. Shortest distance, but steep incline increases rover motor strain and risks roll-over with damaged wheel seal.',
    crewEvaluation:
      'Hedeya advises: "The steep grade puts maximum strain on our degraded wheel actuator. If the motor seizes on the slope, we will be stranded outside safe walking radius."',
  },
  {
    id: 'delta_shelf',
    name: 'Delta Shelf Traverse (Gentle Terrace)',
    distanceMeters: 940,
    elevationGradePercent: 4,
    batteryCostPercent: 19,
    oxygenTimeMinutes: 7.2,
    riskAssessment: 'LOW',
    description:
      'Follows a consolidated sedimentary contour with a gentle 4% slope. 360 meters longer, but provides firm traction and stable power consumption.',
    crewEvaluation:
      'Samantha advises: "The shelf route is flat and predictable. Our energy consumption will remain constant, leaving a healthy 20%+ reserve when we reach the habitat airlock."',
  },
];
