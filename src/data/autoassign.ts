import { PLANNER_LANES, ORDER_QUEUE } from './exceptions'

// Deterministic pseudo-random so the demo data is stable across renders.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export type AssignStop = {
  id: string
  kind: 'pickup' | 'dropoff'
  company: string
  address: string
  /** Initially pinned in place — the optimizer won't reorder it. */
  locked: boolean
}

export type AssignRoute = {
  id: string
  branch: string
  routeName: string
  driver: string
  truck: string
  duration: string
  miles: string
  colorBar: string
  stops: AssignStop[]
  /** Route skills constraining which orders can be assigned. */
  skills: string[]
  /** Driver shift window, e.g. "7:00 AM–3:30 PM". */
  shift: string
  /** Total shift length in minutes. */
  shiftMin: number
  /** Unplanned time left in the shift. */
  freeMin: number
  /** Weight currently loaded — the capacity signal is vehicle fill. */
  loadLbs: number
  /** Vehicle weight capacity. */
  capacityLbs: number
}

const TRUCK_CAPACITY: Record<string, number> = {
  "26' Box Truck": 10000,
  "16' Box Truck": 7500,
  'Sprinter Van': 3500,
  'Flatbed': 12000,
}

// Regional branches of the customer's company, not separate companies.
export const BRANCHES = [
  'San Francisco',
  'Oakland',
  'San Jose',
  'Concord',
  'Santa Rosa',
]

export type AssignOrder = {
  id: string
  branch: string
  orderNum: string
  pickupCompany: string
  dropoffCompany: string
  window: string
}

const ROUTE_NAMES = [
  'Daly City', 'Sunset', 'Richmond District', 'SoMa', 'Potrero Hill',
  'Bayview', 'Excelsior', 'Outer Mission', 'Glen Park', 'Noe Valley',
  'Castro', 'Haight', 'Marina', 'Pacific Heights', 'Nob Hill',
  'Chinatown', 'Financial District', 'Embarcadero', 'Dogpatch', 'Bernal Heights',
  'Oakland Downtown', 'Berkeley', 'Emeryville', 'Alameda', 'San Leandro',
  'Fremont', 'Union City', 'Newark', 'Milpitas', 'Santa Clara',
  'San Jose North', 'San Jose South', 'Campbell', 'Cupertino', 'Sunnyvale',
  'Mountain View', 'Palo Alto', 'Redwood City', 'San Mateo', 'Burlingame',
  'South SF', 'Brisbane', 'Sausalito', 'San Rafael', 'Novato',
  'Vallejo', 'Concord', 'Walnut Creek',
]

const DRIVERS = [
  'Marcus T.', 'Elena V.', 'Jamal K.', 'Priya N.', 'Hector S.',
  'Lauren B.', 'Andre F.', 'Mei C.', 'Roberto G.', 'Tasha L.',
  'Kevin O.', 'Dana P.', 'Samir A.', 'Gloria M.', 'Felix R.',
  'Nina H.', 'Omar D.', 'Jess W.', 'Caleb Y.', 'Rosa Z.',
]

const TRUCKS = ["16' Box Truck", "26' Box Truck", 'Sprinter Van', 'Flatbed']

const ACCENTS = [
  '--color-background-accent-hivis-bold-pressed',
  '--color-background-accent-brickwork-bold',
  '--color-background-accent-craneberry-bold',
  '--color-background-accent-cement-bold',
]

export const SKILLS = ['Liftgate', 'Hazmat', 'Forklift', 'TWIC', 'Curbside']

/** Tag indicator dot per skill, from the accent token set. */
export const SKILL_DOTS: Record<string, string> = {
  Liftgate: '--color-background-accent-hivis-bold-pressed',
  Hazmat: '--color-background-accent-brickwork-bold',
  Forklift: '--color-background-accent-cement-bold',
  TWIC: '--color-background-accent-craneberry-bold',
  Curbside: '--color-border-bold',
}

const STREETS = [
  'Howard St',
  'Mission St',
  'Folsom St',
  'Brannan St',
  'Market St',
  'Van Ness Ave',
  'Geary Blvd',
  'Harrison St',
]

const PICKUP_COMPANIES = [
  'Steel Supply HQ', 'Pacific Stone Works', 'Norton Hardware', 'Bay Area Materials',
  'BlueGrass Lumber', 'Capital Building Supplies', 'West Coast Supply', 'Pacific Plumbing',
  'Granite Depot', 'ProBuild Yard 12', 'Ferguson Counter 8', 'ABC Roofing Supply',
  'Coast Electric Supply', 'Golden Gate Lumber', 'Mission Pipe & Steel', 'Bayshore Fasteners',
]

const DROPOFF_COMPANIES = [
  'Bay Construction', 'Mission Bay Builders', 'East Side Builders', 'Mei Lin Construction',
  'Alex Torres LLC', 'Leo Crane Inc', 'Westside Mechanical', 'Riverside Apartments',
  'Summit Framing Co', 'Harbor Point HOA', 'Castro Valley Remodel', 'Pinnacle Drywall',
  'Cornerstone Concrete', 'Skyline Roofing Crew', 'Jim Smith Design', 'Owen Heating and Cooling',
]

function pad(n: number, w: number) {
  return String(n).padStart(w, '0')
}

const rand = seeded(42)

export const ASSIGN_ROUTES: AssignRoute[] = [
  ...PLANNER_LANES.map((l, i) => ({
    id: l.id,
    branch: BRANCHES[i % BRANCHES.length],
    routeName: l.routeName,
    driver: l.driver,
    truck: l.truck,
    duration: l.duration,
    miles: l.miles,
    colorBar: l.colorBar,
    stops: l.stops.map((s, j) => ({
      id: s.id,
      kind: s.kind,
      company: s.company,
      address: s.address,
      locked: i === 0 && j < 2,
    })),
    skills: i === 2 ? ['Liftgate'] : [],
    shift: [
      '7:00 AM–3:30 PM',
      '8:00 AM–4:30 PM',
      '6:30 AM–3:00 PM',
      '8:30 AM–5:00 PM',
      '9:00 AM–5:30 PM',
    ][i],
    shiftMin: 510,
    freeMin: [85, 180, 40, 230, 150][i],
    loadLbs: [8200, 3400, 9600, 2100, 4700][i],
    capacityLbs: TRUCK_CAPACITY[l.truck] ?? 10000,
  })),
  ...ROUTE_NAMES.map((name, i) => {
    const hours = 4 + Math.floor(rand() * 6)
    const mins = Math.floor(rand() * 12) * 5
    const miles = 40 + Math.floor(rand() * 120)
    const stopCount = 2 + Math.floor(rand() * 8)
    const lockedCount = rand() < 0.22 ? 1 + Math.floor(rand() * 2) : 0
    const shiftStart = 6 + Math.floor(rand() * 4)
    const shiftLen = 8 + Math.floor(rand() * 2)
    const truck = TRUCKS[Math.floor(rand() * TRUCKS.length)]
    const capacityLbs = TRUCK_CAPACITY[truck] ?? 10000
    const fmtShift = (h: number) =>
      `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`
    const stops = Array.from({ length: stopCount }, (_, j) => {
      const kind: 'pickup' | 'dropoff' =
        j === 0 ? 'pickup' : rand() < 0.35 ? 'pickup' : 'dropoff'
      return {
        id: `gr${i}s${j}`,
        kind,
        company:
          kind === 'pickup'
            ? PICKUP_COMPANIES[Math.floor(rand() * PICKUP_COMPANIES.length)]
            : DROPOFF_COMPANIES[Math.floor(rand() * DROPOFF_COMPANIES.length)],
        address: `${100 + Math.floor(rand() * 3800)} ${STREETS[Math.floor(rand() * STREETS.length)]}`,
        locked: j < lockedCount,
      }
    })
    return {
      id: `gr${i}`,
      branch: BRANCHES[Math.floor(rand() * BRANCHES.length)],
      routeName: name,
      driver: DRIVERS[Math.floor(rand() * DRIVERS.length)],
      truck,
      duration: `${hours} hr ${mins} min`,
      miles: `${miles} mi`,
      colorBar: ACCENTS[i % ACCENTS.length],
      stops,
      skills:
        rand() < 0.3
          ? SKILLS.slice(
              Math.floor(rand() * 3),
              Math.floor(rand() * 3) + 1 + Math.floor(rand() * 2),
            )
          : [],
      shift: `${fmtShift(shiftStart)}–${fmtShift(shiftStart + shiftLen)}`,
      shiftMin: shiftLen * 60,
      freeMin: 30 + Math.floor(rand() * 18) * 15,
      loadLbs: Math.round((capacityLbs * (0.2 + rand() * 0.75)) / 50) * 50,
      capacityLbs,
    }
  }),
]

const WINDOW_STARTS = [6, 7, 8, 9, 10, 11, 12, 13, 14]

export const ASSIGN_ORDERS: AssignOrder[] = [
  ...ORDER_QUEUE.map((o, i) => ({
    id: o.id,
    branch: BRANCHES[i % BRANCHES.length],
    orderNum: o.orderNum,
    pickupCompany: o.pickupCompany,
    dropoffCompany: o.dropoffCompany,
    window: o.window,
  })),
  ...Array.from({ length: 123 }, (_, i) => {
    const start = WINDOW_STARTS[Math.floor(rand() * WINDOW_STARTS.length)]
    const fmt = (h: number) =>
      `${h > 12 ? h - 12 : h}:00${h >= 12 ? 'PM' : 'AM'}`
    return {
      id: `go${i}`,
      branch: BRANCHES[Math.floor(rand() * BRANCHES.length)],
      orderNum: `${361 + i}-${pad(Math.floor(rand() * 9999), 4)}${String.fromCharCode(65 + Math.floor(rand() * 26))}${String.fromCharCode(65 + Math.floor(rand() * 26))}`,
      pickupCompany:
        PICKUP_COMPANIES[Math.floor(rand() * PICKUP_COMPANIES.length)],
      dropoffCompany:
        DROPOFF_COMPANIES[Math.floor(rand() * DROPOFF_COMPANIES.length)],
      window: `May 20, ${fmt(start)}-${fmt(start + 1)}`,
    }
  }),
]
