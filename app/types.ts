export type Coach = {
  id: number;
  coachName: string;
  vin: string;
  year: string;
  model: string;
  coachType: "Star Coach" | "Crew Coach" | "Entertainer Coach" | "Sleeper Coach";
  baseStatus?: "Available" | "Maintenance" | "Sold";
  licensePlate?: string;
  currentLocation?: string;
  notes?: string;
  soldDate?: string;
  isArchived?: boolean;
};

export type Driver = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  baseStatus: "Active" | "Inactive" | "Vacation";
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  homeBase?: string;
  notes?: string;
};

export type CustomerContact = {
  id: number;
  name: string;
  role:
    | "Manager"
    | "AP"
    | "Tour Manager"
    | "Assistant"
    | "Billing"
    | "Operations"
    | "Other";
  email: string;
  phone: string;
  isPrimaryBilling: boolean;
  isPrimaryOperations: boolean;
};

export type Customer = {
  id: number;
  artistName: string;
  companyName: string;
  companyAddress: string;
  managerEmail: string;
  apEmail: string;
  status: "Active" | "Inactive" | "Prospect";
  notes: string;
  contacts?: CustomerContact[];
};

export type Trip = {
  id: number;
  tripName: string;
  startDate: string;
  endDate: string;
  coachName: string;
  driverName: string;
};

export type QuoteCoachNeed = {
  id: string;
  coachType: "Star Single Slide" | "Star Double Slide" | "Crew Single Slide";
  quantity: number;
  preferredCoachId: string;
  preferredCoachName: string;
  notes: string;
};

export type QuoteDriverNeed = {
  id: string;
  driverRole: "Primary Driver" | "Co-Driver";
  quantity: number;
  preferredDriverId: string;
  preferredDriverName: string;
  notes: string;
};

export type QuoteInput = {
  id: number | null;
  quoteNumber: string;
  quoteStatus: "Draft" | "Sent" | "Accepted" | "Rejected";
  customerName: string;
  tourName: string;
  tourType: "Short Term" | "Long Term";
  salesperson: string;
  startDate: string;
  endDate: string;
  coachName: string;
  driverName: string;
  coachNeeds: QuoteCoachNeed[];
  driverNeeds: QuoteDriverNeed[];
  miles: number;
  busDayRate: number;
  driverDayRate: number;
  fuelRate: number;
  perDiemRate: number;
  mainEngineServiceRate: number;
  generatorWeeklyRate: number;
  wirelessDailyRate: number;
  hotelQty: number;
  hotelRate: number;
  payrollFee: number;
  adminFee: number;
  useDeadhead: boolean;
  busDHF: number;
  busDHR: number;
  driverDHF: number;
  driverDHR: number;
};

export type SavedQuote = QuoteInput & {
  totalTourBudget: number;
  savedAt: string;
};

export type SortDirection = "asc" | "desc";