export type ExceptionStatus = 'open' | 'resolved'

export type CustomerContact = {
  business: string
  contact: string
  phone: string
}

export type CustomException = {
  id: string
  name: string
  description: string
  trigger: string
  status: 'active' | 'paused'
  createdBy: 'system' | 'coworker'
  createdAt: string
}

export const CUSTOM_EXCEPTIONS: CustomException[] = [
  {
    id: 'cex_001',
    name: 'Driver not moving',
    description:
      'Flag a stop when the driver is stationary for 9 min outside the scheduled window.',
    trigger: 'Driver stationary > 9 min',
    status: 'active',
    createdBy: 'system',
    createdAt: 'Default',
  },
  {
    id: 'cex_002',
    name: 'Order failed',
    description:
      'Flag when a driver cannot complete a pickup or drop-off at a stop.',
    trigger: 'Pickup or drop-off marked failed',
    status: 'active',
    createdBy: 'system',
    createdAt: 'Default',
  },
  {
    id: 'cex_010',
    name: 'Long wait at pickup',
    description:
      'Heads-up when a driver has been on-site at a pickup for more than 15 minutes.',
    trigger: 'On-site at pickup > 15 min',
    status: 'active',
    createdBy: 'coworker',
    createdAt: 'May 18, 2026',
  },
  {
    id: 'cex_011',
    name: 'High-priority customer delay',
    description:
      'Flag any route delay over 8 min for customers tagged as priority (Westside Mechanical, Steel Supply HQ).',
    trigger: 'Priority customer ETA slipped > 8 min',
    status: 'active',
    createdBy: 'coworker',
    createdAt: 'May 20, 2026',
  },
  {
    id: 'cex_012',
    name: 'Missed time window',
    description:
      'Flag when arrival time is past the scheduled end of the stop window.',
    trigger: 'Arrival > stop window end',
    status: 'paused',
    createdBy: 'coworker',
    createdAt: 'May 21, 2026',
  },
]

export type ExceptionRow = {
  id: string
  status: ExceptionStatus
  type: string
  route: string
  order: string
  /** Single affected stop where the exception occurred. */
  stop: string
  pickup: string
  dropoff: string
  driver: string
  detected: string
  customer: CustomerContact
}

export type ExceptionType = 'Driver not moving' | 'Order failed'

export const EXCEPTION_ROWS: ExceptionRow[] = [
  {
    id: 'exc_8401',
    status: 'open',
    type: 'Driver not moving',
    route: 'Downtown SF',
    order: 'HJDGFS',
    stop: '345 Divisadero St',
    pickup: '845 First St',
    dropoff: '345 Divisadero St',
    driver: 'Shanika J.',
    detected: '2m ago',
    customer: {
      business: 'Westside Mechanical',
      contact: 'Mei Lin',
      phone: '(415) 555-2104',
    },
  },
  {
    id: 'exc_8402',
    status: 'open',
    type: 'Order failed',
    route: 'Downtown SF',
    order: 'KXPQRT',
    stop: '1200 Market St',
    pickup: '1200 Market St',
    dropoff: '345 Divisadero St',
    driver: 'Shanika J.',
    detected: '7m ago',
    customer: {
      business: 'Steel Supply HQ',
      contact: 'Devon Park',
      phone: '(415) 555-3201',
    },
  },
  {
    id: 'exc_8380',
    status: 'resolved',
    type: 'Order failed',
    route: 'Hayward',
    order: 'MSB-003',
    stop: '1100 Van Ness Ave',
    pickup: '1100 Van Ness Ave',
    dropoff: '2100 Fillmore St',
    driver: 'Diane W.',
    detected: '34m ago',
    customer: {
      business: 'West Coast Supply',
      contact: 'Renee Cho',
      phone: '(510) 555-7833',
    },
  },
]

export type RouteRow = {
  id: string
  number: string
  driver: string
  stops: number
  completed: number
  etaWindow: string
}

export const ROUTES: RouteRow[] = [
  { id: 'r1247', number: '#1247', driver: 'Shanika J.', stops: 8, completed: 3, etaWindow: '11:40a – 2:10p' },
  { id: 'r1248', number: '#1248', driver: 'Deshawn M.', stops: 6, completed: 2, etaWindow: '11:55a – 1:30p' },
  { id: 'r1249', number: '#1249', driver: 'Carlos R.',  stops: 9, completed: 4, etaWindow: '12:10p – 3:00p' },
  { id: 'r1250', number: '#1250', driver: 'Diane W.',   stops: 7, completed: 5, etaWindow: '10:20a – 1:45p' },
  { id: 'r1251', number: '#1251', driver: 'Tomas E.',   stops: 5, completed: 0, etaWindow: '1:00p – 2:50p' },
  { id: 'r1252', number: '#1252', driver: 'Carlos R.',  stops: 4, completed: 1, etaWindow: '12:25p – 1:55p' },
  { id: 'r1253', number: '#1253', driver: 'Louis P.',   stops: 6, completed: 6, etaWindow: '9:00a – 11:40a' },
  { id: 'r1254', number: '#1254', driver: 'Pat C.',     stops: 5, completed: 2, etaWindow: '12:00p – 2:00p' },
]

export function exceptionsForRoute(routeNumber: string) {
  return EXCEPTION_ROWS.filter((e) => e.route === routeNumber)
}

export type StopRow = {
  num: number
  address: string
  recipient: string
  status: 'completed' | 'arrived' | 'en-route' | 'pending'
  eta: string
}

export const PLANNER_ROUTE_NUMBER = '#1247'
export const PLANNER_ROUTE_DRIVER = 'Shanika J.'

export const PLANNER_STOPS: StopRow[] = [
  { num: 1, address: '845 First St',       recipient: 'Chalk Silvs...',  status: 'completed', eta: '11:42a' },
  { num: 2, address: '120 Howard St',      recipient: 'Lin Zhao',        status: 'completed', eta: '12:01p' },
  { num: 3, address: '400 Howard St',      recipient: 'Mei Lin',         status: 'completed', eta: '12:18p' },
  { num: 4, address: '345 Divisadero St',  recipient: 'Troy Williams',   status: 'en-route',  eta: '12:40p' },
  { num: 5, address: '900 Brannan St',     recipient: 'Alex Torres',     status: 'pending',   eta: '1:05p' },
  { num: 6, address: '1550 Mission St',    recipient: 'Beth Nguyen',     status: 'pending',   eta: '1:25p' },
  { num: 7, address: '2200 Mission St',    recipient: 'Sarah Park',      status: 'pending',   eta: '1:50p' },
  { num: 8, address: '2400 Irving St',     recipient: 'Kate Wilson',     status: 'pending',   eta: '2:10p' },
]

export function exceptionForStop(
  routeNumber: string,
  stopAddress: string,
): ExceptionRow | undefined {
  return EXCEPTION_ROWS.find(
    (e) =>
      e.route === routeNumber &&
      (e.pickup === stopAddress || e.dropoff === stopAddress),
  )
}

export type StopKind = 'pickup' | 'dropoff'
export type StopStatus = 'pickup-pending' | 'pickup-active' | 'in-transit' | 'delivered'

export type PlannerStop = {
  id: string
  kind: StopKind
  company: string
  address: string
  arrival: string
  duration: string
  departure: string
  orderId: string
  weight: string
  window: string
}

export type PlannerLane = {
  id: string
  routeName: string
  driver: string
  truck: string
  duration: string
  miles: string
  code: string
  colorBar: string
  stops: PlannerStop[]
}

export type LaneTimeBlock = { startMin: number; endMin: number }

export const NOW_MIN = 12 * 60 + 35

export type LatLng = [number, number]

export type LaneGeo = {
  pickup: LatLng
  dropoff: LatLng
  /** Road-shaped waypoints (incl. pickup and dropoff). */
  path: LatLng[]
  /** Current driver position along the route. */
  driverPos: LatLng
}

export const LANE_GEO: Record<string, LaneGeo> = {
  r1247: {
    pickup: [37.7766, -122.3957],
    dropoff: [37.7757, -122.4373],
    path: [
      [37.7766, -122.3957],
      [37.7785, -122.4022],
      [37.7790, -122.4123],
      [37.7773, -122.4225],
      [37.7757, -122.4373],
    ],
    driverPos: [37.7787, -122.4108],
  },
  r1248: {
    pickup: [37.7884, -122.3962],
    dropoff: [37.7783, -122.4012],
    path: [
      [37.7884, -122.3962],
      [37.7856, -122.3988],
      [37.7820, -122.4002],
      [37.7783, -122.4012],
    ],
    driverPos: [37.7842, -122.3996],
  },
  r1249: {
    pickup: [37.7907, -122.3955],
    dropoff: [37.7600, -122.4189],
    path: [
      [37.7907, -122.3955],
      [37.7848, -122.4015],
      [37.7762, -122.4071],
      [37.7700, -122.4140],
      [37.7600, -122.4189],
    ],
    driverPos: [37.7710, -122.4128],
  },
  r1250: {
    pickup: [37.7866, -122.4216],
    dropoff: [37.7892, -122.4343],
    path: [
      [37.7866, -122.4216],
      [37.7872, -122.4253],
      [37.7883, -122.4298],
      [37.7892, -122.4343],
    ],
    driverPos: [37.7884, -122.4298],
  },
  r1251: {
    pickup: [37.7907, -122.3955],
    dropoff: [37.7600, -122.4189],
    path: [
      [37.7907, -122.3955],
      [37.7870, -122.4001],
      [37.7820, -122.4055],
      [37.7740, -122.4115],
      [37.7670, -122.4160],
      [37.7600, -122.4189],
    ],
    driverPos: [37.7820, -122.4055],
  },
}

export const PLANNER_LANES: (PlannerLane & {
  timeBlocks: LaneTimeBlock[]
})[] = [
  {
    id: 'r1247',
    routeName: 'Downtown SF',
    driver: 'Shanika J.',
    truck: "26' Box Truck",
    duration: '8 hr 5 min',
    miles: '120 mi',
    code: 'EZOYOG',
    colorBar: '--color-background-accent-hivis-bold-pressed',
    timeBlocks: [{ startMin: 7 * 60 + 30, endMin: 13 * 60 + 45 }],
    stops: [
      {
        id: 's1',
        kind: 'pickup',
        company: 'Owen Heating and Cooling LLC',
        address: '845 First St',
        arrival: '7:41 AM',
        duration: '5 min',
        departure: '7:46 AM',
        orderId: 'HJDGFS',
        weight: '700 lbs',
        window: 'May 20, 6:00AM-7:00AM',
      },
      {
        id: 's2',
        kind: 'dropoff',
        company: 'Westside Mechanical',
        address: '345 Divisadero St',
        arrival: '8:12 AM',
        duration: '6 min',
        departure: '8:18 AM',
        orderId: 'HJDGFS',
        weight: '700 lbs',
        window: 'May 20, 8:00AM-9:00AM',
      },
      {
        id: 's3',
        kind: 'pickup',
        company: 'Steel Supply HQ',
        address: '1200 Market St',
        arrival: '9:05 AM',
        duration: '8 min',
        departure: '9:13 AM',
        orderId: 'KXPQRT',
        weight: '420 lbs',
        window: 'May 20, 9:00AM-10:00AM',
      },
    ],
  },
  {
    id: 'r1248',
    routeName: 'Mission',
    driver: 'Deshawn M.',
    truck: "16' Box Truck",
    duration: '6 hr 20 min',
    miles: '85 mi',
    code: 'KQPLMS',
    colorBar: '--color-background-accent-brickwork-bold',
    timeBlocks: [{ startMin: 8 * 60, endMin: 14 * 60 + 20 }],
    stops: [
      {
        id: 's4',
        kind: 'pickup',
        company: 'Pacific Plumbing',
        address: '400 Howard St',
        arrival: '8:00 AM',
        duration: '5 min',
        departure: '8:05 AM',
        orderId: 'BNMVWS',
        weight: '350 lbs',
        window: 'May 20, 7:30AM-8:30AM',
      },
      {
        id: 's5',
        kind: 'dropoff',
        company: 'Mei Lin Construction',
        address: '1100 Folsom St',
        arrival: '8:42 AM',
        duration: '7 min',
        departure: '8:49 AM',
        orderId: 'BNMVWS',
        weight: '350 lbs',
        window: 'May 20, 9:00AM-10:00AM',
      },
    ],
  },
  {
    id: 'r1249',
    routeName: 'East Bay',
    driver: 'Carlos R.',
    truck: "26' Box Truck",
    duration: '9 hr 10 min',
    miles: '142 mi',
    code: 'PXMQLO',
    colorBar: '--color-background-accent-craneberry-bold',
    timeBlocks: [{ startMin: 6 * 60 + 45, endMin: 15 * 60 + 55 }],
    stops: [
      {
        id: 's6',
        kind: 'pickup',
        company: 'Bay Area Materials',
        address: '55 Fremont St',
        arrival: '7:30 AM',
        duration: '8 min',
        departure: '7:38 AM',
        orderId: 'LPQMXZ',
        weight: '900 lbs',
        window: 'May 20, 7:00AM-8:00AM',
      },
      {
        id: 's7',
        kind: 'dropoff',
        company: 'Alex Torres LLC',
        address: '2200 Mission St',
        arrival: '8:25 AM',
        duration: '10 min',
        departure: '8:35 AM',
        orderId: 'LPQMXZ',
        weight: '900 lbs',
        window: 'May 20, 8:30AM-9:30AM',
      },
      {
        id: 's8',
        kind: 'pickup',
        company: 'Pacific Stone Works',
        address: '900 Brannan St',
        arrival: '9:18 AM',
        duration: '12 min',
        departure: '9:30 AM',
        orderId: 'MSA-002',
        weight: '1,150 lbs',
        window: 'May 20, 9:00AM-10:00AM',
      },
    ],
  },
  {
    id: 'r1250',
    routeName: 'Hayward',
    driver: 'Diane W.',
    truck: "16' Box Truck",
    duration: '5 hr 45 min',
    miles: '68 mi',
    code: 'NPWXTQ',
    colorBar: '--color-background-accent-cement-bold',
    timeBlocks: [{ startMin: 8 * 60 + 30, endMin: 14 * 60 + 15 }],
    stops: [
      {
        id: 's9',
        kind: 'pickup',
        company: 'West Coast Supply',
        address: '1100 Van Ness Ave',
        arrival: '8:15 AM',
        duration: '6 min',
        departure: '8:21 AM',
        orderId: 'MSB-003',
        weight: '600 lbs',
        window: 'May 20, 8:00AM-9:00AM',
      },
      {
        id: 's10',
        kind: 'dropoff',
        company: 'Leo Crane Inc',
        address: '2100 Fillmore St',
        arrival: '8:55 AM',
        duration: '8 min',
        departure: '9:03 AM',
        orderId: 'MSB-003',
        weight: '600 lbs',
        window: 'May 20, 9:00AM-10:00AM',
      },
    ],
  },
  {
    id: 'r1251',
    routeName: 'North Bay',
    driver: 'Tomas E.',
    truck: "26' Box Truck",
    duration: '7 hr 30 min',
    miles: '95 mi',
    code: 'LMQRTW',
    colorBar: '--color-background-accent-hivis-bold-pressed',
    timeBlocks: [{ startMin: 9 * 60 + 15, endMin: 16 * 60 + 45 }],
    stops: [
      {
        id: 's11',
        kind: 'pickup',
        company: 'Capital Building Supplies',
        address: '55 Fremont St',
        arrival: '8:45 AM',
        duration: '7 min',
        departure: '8:52 AM',
        orderId: 'LPQMXZ',
        weight: '480 lbs',
        window: 'May 20, 8:30AM-9:30AM',
      },
      {
        id: 's12',
        kind: 'dropoff',
        company: 'Mission Materials',
        address: '2200 Mission St',
        arrival: '9:30 AM',
        duration: '9 min',
        departure: '9:39 AM',
        orderId: 'LPQMXZ',
        weight: '480 lbs',
        window: 'May 20, 9:30AM-10:30AM',
      },
    ],
  },
]

export type OrderQueueItem = {
  id: string
  orderNum: string
  pickupCompany: string
  pickupAddress: string
  dropoffCompany: string
  dropoffAddress: string
  window: string
  tags: string[]
}

export const ORDER_QUEUE: OrderQueueItem[] = [
  {
    id: 'oq1',
    orderNum: '356-5666ZQ',
    pickupCompany: 'Steel Supply HQ',
    pickupAddress: '7920 Kentucky Dr, Florence KY',
    dropoffCompany: 'Jim Smith Design',
    dropoffAddress: '10036 Springfield Pike, Cincinnati OH',
    window: 'May 20, 6:00AM-7:00AM',
    tags: ['Transfer', 'Priority'],
  },
  {
    id: 'oq2',
    orderNum: '357-5821AW',
    pickupCompany: 'Owen Heating & Cooling',
    pickupAddress: '10829 Seabiscuit Ct, Union KY',
    dropoffCompany: 'Riverside Apartments',
    dropoffAddress: '4502 Vine St, Cincinnati OH',
    window: 'May 20, 7:00AM-8:00AM',
    tags: ['Standard'],
  },
  {
    id: 'oq3',
    orderNum: '358-5919PR',
    pickupCompany: 'BlueGrass Lumber',
    pickupAddress: '901 Madison Ave, Covington KY',
    dropoffCompany: 'East Side Builders',
    dropoffAddress: '7700 Reading Rd, Cincinnati OH',
    window: 'May 20, 8:00AM-9:00AM',
    tags: ['Same-day'],
  },
  {
    id: 'oq4',
    orderNum: '359-6021TR',
    pickupCompany: 'Pacific Stone Works',
    pickupAddress: '900 Brannan St, SF CA',
    dropoffCompany: 'Bay Construction',
    dropoffAddress: '2200 Mission St, SF CA',
    window: 'May 20, 9:00AM-10:00AM',
    tags: ['Priority'],
  },
  {
    id: 'oq5',
    orderNum: '360-6155MN',
    pickupCompany: 'Norton Hardware',
    pickupAddress: '1450 Howard St, SF CA',
    dropoffCompany: 'Mission Bay Builders',
    dropoffAddress: '700 Illinois St, SF CA',
    window: 'May 20, 10:00AM-11:00AM',
    tags: ['Standard'],
  },
]

export function laneException(lane: PlannerLane): ExceptionRow | undefined {
  return EXCEPTION_ROWS.find((e) => e.route === lane.routeName)
}

export function exceptionsForLane(lane: PlannerLane): ExceptionRow[] {
  return EXCEPTION_ROWS.filter((e) => e.route === lane.routeName)
}

export function stopException(
  lane: PlannerLane,
  stop: PlannerStop,
): ExceptionRow | undefined {
  const exc = laneException(lane)
  if (!exc) return undefined
  if (stop.kind === 'pickup' && exc.pickup === stop.address) return exc
  if (stop.kind === 'dropoff' && exc.dropoff === stop.address) return exc
  return undefined
}
