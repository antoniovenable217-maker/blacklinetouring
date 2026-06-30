"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Coach,
  Driver,
  Customer,
  CustomerContact,
  Trip,
  QuoteCoachNeed,
  QuoteDriverNeed,
  QuoteInput,
  SavedQuote,
  SortDirection,
} from "@/app/types";
import PageHeader from "@/app/components/ui/PageHeader";
import ActionButton from "@/app/components/ui/ActionButton";
import MetricCard from "@/app/components/ui/MetricCard";
import PageShell from "@/app/components/ui/PageShell";
import SectionCard from "@/app/components/ui/SectionCard";
import FilterBar from "@/app/components/ui/FilterBar";
import StatusBadge from "@/app/components/ui/StatusBadge";
import ListRow from "@/app/components/ui/ListRow";
import EmptyState from "@/app/components/ui/EmptyState";
import ModalShell from "@/app/components/ui/ModalShell";

type AddCustomerModalDraft = {
  artistName: string;
  companyName: string;
  status: "Active" | "Inactive" | "Prospect";
  companyAddress: string;
  notes: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  apName: string;
  apEmail: string;
  apPhone: string;
};

type DriverListSortKey =
  | "driver"
  | "operationalStatus"
  | "baseStatus"
  | "currentTour"
  | "upcomingTours"
  | "homeBase";

type CoachListSortKey =
  | "coach"
  | "operationalStatus"
  | "baseStatus"
  | "currentTour"
  | "upcomingTours"
  | "location";

type LeasingStageTab =
  | "Draft Quotes"
  | "Awaiting Customer Response"
  | "Collect Deposit"
  | "Ready for Operations"
  | "Booked / Tour Ready";

type QuoteWorkspaceSectionKey =
  | "customerBrief"
  | "pricingWorkbench"
  | "workflowRail"
  | "operationsNotes"
  | "salesNotes"
  | "attachments"
  | "documents";

const blankQuote: QuoteInput = {
  id: null,
  quoteNumber: "",
  quoteStatus: "Draft",
  customerName: "",
  tourName: "",
  tourType: "Long Term",
  salesperson: "Current User",
  startDate: "",
  endDate: "",
  coachName: "",
  driverName: "",
  coachNeeds: [],
  driverNeeds: [],
  miles: 0,
  busDayRate: 0,
  driverDayRate: 0,
  fuelRate: 0,
  perDiemRate: 0,
  mainEngineServiceRate: 0,
  generatorWeeklyRate: 0,
  wirelessDailyRate: 0,
  hotelQty: 0,
  hotelRate: 0,
  payrollFee: 0,
  adminFee: 0,
  useDeadhead: true,
  busDHF: 2,
  busDHR: 2,
  driverDHF: 2,
  driverDHR: 2,
};

const coachTypeOptions: QuoteCoachNeed["coachType"][] = [
  "Star Single Slide",
  "Star Double Slide",
  "Crew Single Slide",
];

const driverRoleOptions: QuoteDriverNeed["driverRole"][] = [
  "Primary Driver",
  "Co-Driver",
];

const blankAddCustomerModalDraft: AddCustomerModalDraft = {
  artistName: "",
  companyName: "",
  status: "Prospect",
  companyAddress: "",
  notes: "",
  managerName: "",
  managerEmail: "",
  managerPhone: "",
  apName: "",
  apEmail: "",
  apPhone: "",
};

const pageShellClass = "lux-page-shell h-screen flex flex-col overflow-hidden";
const contentShellClass = "flex-1 p-8 overflow-y-auto space-y-3";
const cardClass = "lux-card p-6 rounded-lg shadow";
const sectionCardClass = "lux-section-card p-4 rounded-lg";
const inputClass = "lux-input border p-3 rounded w-full";
const selectClass = "lux-select border p-3 rounded w-full";
const primaryButtonClass = "lux-primary-button px-4 py-2 rounded font-semibold";
const secondaryButtonClass = "lux-secondary-button px-4 py-2 rounded font-semibold";
const dangerButtonClass = "lux-danger-button px-4 py-2 rounded font-semibold";
const detailsButtonClass = "lux-details-button px-3 py-1 rounded text-sm font-semibold";
const tableClass = "w-full border-collapse border";
const modalClass = "lux-modal rounded-lg shadow-2xl";
const pageLayoutClass = "bl-page";
const pageHeaderCardClass = "bl-page-header bg-white p-6 rounded-lg shadow mb-6";
const focusCardClass = "bl-focus bg-white p-6 rounded-lg shadow";
const filterBarClass = "bl-filter-bar bg-white p-6 rounded-lg shadow mb-6";
const kpiGridClass = "bl-kpi-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3";
const workAreaClass = "bl-work-area bg-white p-6 rounded-lg shadow";
const secondaryAreaClass = "bl-secondary-area bg-white p-6 rounded-lg shadow";

export default function Home() {
  const [activePage, setActivePage] = useState("Home");
  const [isDemoAuthenticated, setIsDemoAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRememberMe, setLoginRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [activeQuoteTab, setActiveQuoteTab] = useState("Quote List");
  const [activeCustomerTab, setActiveCustomerTab] = useState("Overview");
  const [showQuickCustomerForm, setShowQuickCustomerForm] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [quoteListSearchTerm, setQuoteListSearchTerm] = useState("");
  const [quoteListStatusFilter, setQuoteListStatusFilter] = useState<
    "All" | "Draft" | "Sent" | "Accepted" | "Rejected"
  >("All");
  const [quoteWorkspaceSections, setQuoteWorkspaceSections] = useState<
    Record<QuoteWorkspaceSectionKey, boolean>
  >({
    customerBrief: true,
    pricingWorkbench: true,
    workflowRail: true,
    operationsNotes: false,
    salesNotes: false,
    attachments: false,
    documents: false,
  });
  const [dispatcherTourFilter, setDispatcherTourFilter] = useState<
    | "All"
    | "Coach Conflict"
    | "Driver Conflict"
    | "Missing Coach"
    | "Missing Driver"
    | "Maintenance"
    | "Tour Ready"
    | "Starts Soon"
  >("All");
  const [dispatcherSearchTerm, setDispatcherSearchTerm] = useState("");
  const [calendarSearchTerm, setCalendarSearchTerm] = useState("");
  const [calendarStatusFilter, setCalendarStatusFilter] = useState<
    "All" | "On Tour" | "Scheduled / Completed" | "Missing Assignment"
  >("All");
  const [calendarCoachView, setCalendarCoachView] = useState<
    "All Coaches" | "Coaches Out" | "Available Coaches" | "Missing Assignment"
  >("All Coaches");
  const [calendarRowLimit, setCalendarRowLimit] = useState<
    "25" | "50" | "100" | "All"
  >("25");
  const [leasingPipelineSearchTerm, setLeasingPipelineSearchTerm] = useState("");
  const [leasingPipelineStatusFilter, setLeasingPipelineStatusFilter] = useState<
    "All" | "Draft" | "Sent" | "Accepted" | "Rejected"
  >("All");
  const [leasingAttentionFilter, setLeasingAttentionFilter] = useState<
    | "All"
    | "Draft Quotes"
    | "Awaiting Customer Response"
    | "Collect Deposit"
    | "Accepted Quotes Ready for Operations"
    | "Tour Ready"
  >("All");
  const [activeLeasingStageTab, setActiveLeasingStageTab] = useState<LeasingStageTab>(
    "Draft Quotes"
  );
  const [leasingQueueGroupExpanded, setLeasingQueueGroupExpanded] = useState<
    Record<
      | "Draft Quotes"
      | "Awaiting Customer Response"
      | "Collect Deposit"
      | "Accepted Quotes Ready for Operations"
      | "Tour Ready",
      boolean
    >
  >({
    "Draft Quotes": true,
    "Awaiting Customer Response": true,
    "Collect Deposit": true,
    "Accepted Quotes Ready for Operations": false,
    "Tour Ready": false,
  });
  const [dispatchQueueGroupExpanded, setDispatchQueueGroupExpanded] = useState<
    Record<"Coach Conflict" | "Driver Conflict" | "Missing Coach" | "Missing Driver" | "Maintenance" | "Tour Ready" | "Starts Soon", boolean>
  >({
    "Coach Conflict": true,
    "Driver Conflict": true,
    "Missing Coach": true,
    "Missing Driver": true,
    "Maintenance": false,
    "Tour Ready": false,
    "Starts Soon": false,
  });
  const [selectedCalendarTrip, setSelectedCalendarTrip] = useState<Trip | null>(null);
  const [assignmentTrip, setAssignmentTrip] = useState<Trip | null>(null);
  const [assignmentCoachName, setAssignmentCoachName] = useState("");
  const [assignmentDriverName, setAssignmentDriverName] = useState("");
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [driverStatusFilter, setDriverStatusFilter] = useState<
    "All" | "Available" | "On Tour" | "Active" | "Vacation" | "Inactive"
  >("All");
  const [driverRowLimit, setDriverRowLimit] = useState<"25" | "50" | "100" | "All">(
    "25"
  );
  const [showArchivedDrivers, setShowArchivedDrivers] = useState(false);
  const [coachSearchTerm, setCoachSearchTerm] = useState("");
  const [coachStatusFilter, setCoachStatusFilter] = useState<
    "All" | "Available" | "On Tour" | "Maintenance" | "Sold / Archived"
  >("All");
  const [coachRowLimit, setCoachRowLimit] = useState<"25" | "50" | "100" | "All">(
    "25"
  );
  const [showArchivedCoaches, setShowArchivedCoaches] = useState(false);
  const [showArchivedCustomers, setShowArchivedCustomers] = useState(false);
  const [showAddCoachModal, setShowAddCoachModal] = useState(false);
  const [selectedDriverForDetails, setSelectedDriverForDetails] =
    useState<Driver | null>(null);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [isEditingDriverDetails, setIsEditingDriverDetails] = useState(false);
  const [editedDriverDetails, setEditedDriverDetails] =
    useState<Driver | null>(null);
  const [customerDirectorySearchTerm, setCustomerDirectorySearchTerm] =
    useState("");
  const [customerIntelligenceFilter, setCustomerIntelligenceFilter] = useState<
    "All" | "Prospects" | "Follow Up" | "High Value" | "Repeat" | "Dormant"
  >("All");
  const [customerQueueGroupExpanded, setCustomerQueueGroupExpanded] = useState<
    Record<
      | "Follow Up Needed"
      | "High Value Customer"
      | "Repeat Customer"
      | "Dormant Customer"
      | "Missing Contact Info"
      | "No Recent Activity",
      boolean
    >
  >({
    "Follow Up Needed": true,
    "High Value Customer": true,
    "Repeat Customer": true,
    "Dormant Customer": false,
    "Missing Contact Info": false,
    "No Recent Activity": false,
  });
  const [showCustomerDirectoryDropdown, setShowCustomerDirectoryDropdown] =
    useState(false);
  const [quoteCustomerSearchTerm, setQuoteCustomerSearchTerm] = useState("");
  const [showQuoteCustomerDropdown, setShowQuoteCustomerDropdown] =
    useState(false);
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] =
    useState(false);
  const [isEditingCustomerDetails, setIsEditingCustomerDetails] =
    useState(false);
  const [editedCustomerDetails, setEditedCustomerDetails] =
    useState<Customer | null>(null);
  const [showAddCustomerContactForm, setShowAddCustomerContactForm] =
    useState(false);
  const [newCustomerContact, setNewCustomerContact] = useState<
    Omit<CustomerContact, "id">
  >({
    name: "",
    role: "Manager",
    email: "",
    phone: "",
    isPrimaryBilling: false,
    isPrimaryOperations: false,
  });
  const [customerDetailsTab, setCustomerDetailsTab] = useState<
    | "Overview"
    | "Contacts"
    | "Quotes"
    | "Tours"
    | "Financials"
    | "Documents"
    | "Timeline"
    | "Notes"
  >("Overview");
  const [customerNotesDraft, setCustomerNotesDraft] = useState("");
  const [customerRequestedPrice, setCustomerRequestedPrice] = useState("");

  const [coaches, setCoaches] = useState<Coach[]>([
    {
      id: 1,
      coachName: "Raptor",
      vin: "TBD",
      year: "2020",
      model: "Prevost",
      coachType: "Star Coach",
    },
  ]);

  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: 1,
      firstName: "Darlin",
      lastName: "Driver",
      phone: "",
      email: "",
      address: "",
      baseStatus: "Active",
    },
  ]);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [quote, setQuote] = useState<QuoteInput>(blankQuote);
  const [customers, setCustomers] = useState<Customer[]>([
  {
    id: 1,
    artistName: "Morgan Wallen",
    companyName: "Big Loud",
    companyAddress: "Nashville, TN",
    managerEmail: "manager@bigloud.com",
    apEmail: "ap@bigloud.com",
    status: "Prospect",
    notes: "",
  },
]);

const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(1);

const [newCustomer, setNewCustomer] = useState<Customer>({
  id: 0,
  artistName: "",
  companyName: "",
  companyAddress: "",
  managerEmail: "",
  apEmail: "",
  status: "Prospect",
  notes: "",
});
const [addCustomerModalDraft, setAddCustomerModalDraft] =
  useState<AddCustomerModalDraft>(blankAddCustomerModalDraft);

const [newCoach, setNewCoach] = useState<Coach>({
  id: 0,
  coachName: "",
  vin: "",
  year: "",
  model: "",
  coachType: "Star Coach",
  baseStatus: "Available",
  licensePlate: "",
  currentLocation: "",
  notes: "",
  soldDate: "",
  isArchived: false,
});

const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
const [isEditingCoach, setIsEditingCoach] = useState(false);
const [editedCoach, setEditedCoach] = useState<Coach | null>(null);

  const [newDriver, setNewDriver] = useState<Driver>({
    id: 0,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    baseStatus: "Active",
    emergencyContactName: "",
    emergencyContactPhone: "",
    homeBase: "",
    notes: "",
  });

  const [newTrip, setNewTrip] = useState<Trip>({
    id: 0,
    tripName: "",
    startDate: "",
    endDate: "",
    coachName: "",
    driverName: "",
  });

  const [coachSort, setCoachSort] = useState<{
    key: keyof Coach;
    direction: SortDirection;
  }>({ key: "coachName", direction: "asc" });

  const [driverSort, setDriverSort] = useState<{
    key: keyof Driver;
    direction: SortDirection;
  }>({ key: "lastName", direction: "asc" });

  const [driverListSort, setDriverListSort] = useState<{
    key: DriverListSortKey;
    direction: SortDirection;
  }>({ key: "driver", direction: "asc" });

  const [coachListSort, setCoachListSort] = useState<{
    key: CoachListSortKey;
    direction: SortDirection;
  }>({ key: "coach", direction: "asc" });

  function normalizeCoachNeed(
    coachNeed: Partial<QuoteCoachNeed> | null | undefined,
    fallbackId: string
  ): QuoteCoachNeed {
    const safeCoachType = coachTypeOptions.includes(
      coachNeed?.coachType as QuoteCoachNeed["coachType"]
    )
      ? (coachNeed?.coachType as QuoteCoachNeed["coachType"])
      : "Star Single Slide";

    return {
      id: coachNeed?.id || fallbackId,
      coachType: safeCoachType,
      quantity: Math.max(Number(coachNeed?.quantity || 1), 1),
      preferredCoachId: coachNeed?.preferredCoachId || "",
      preferredCoachName: coachNeed?.preferredCoachName || "",
      notes: coachNeed?.notes || "",
    };
  }

  function normalizeDriverNeed(
    driverNeed: Partial<QuoteDriverNeed> | null | undefined,
    fallbackId: string
  ): QuoteDriverNeed {
    const safeDriverRole = driverRoleOptions.includes(
      driverNeed?.driverRole as QuoteDriverNeed["driverRole"]
    )
      ? (driverNeed?.driverRole as QuoteDriverNeed["driverRole"])
      : "Primary Driver";

    return {
      id: driverNeed?.id || fallbackId,
      driverRole: safeDriverRole,
      quantity: Math.max(Number(driverNeed?.quantity || 1), 1),
      preferredDriverId: driverNeed?.preferredDriverId || "",
      preferredDriverName: driverNeed?.preferredDriverName || "",
      notes: driverNeed?.notes || "",
    };
  }

  function normalizeQuoteRecord(
    quoteRecord: Partial<SavedQuote> | Partial<QuoteInput> | null | undefined
  ): QuoteInput {
    const normalizedCoachNeeds = Array.isArray(quoteRecord?.coachNeeds)
      ? quoteRecord.coachNeeds.map((coachNeed, index) =>
          normalizeCoachNeed(coachNeed, `coach-need-${Date.now()}-${index}`)
        )
      : [];

    const normalizedDriverNeeds = Array.isArray(quoteRecord?.driverNeeds)
      ? quoteRecord.driverNeeds.map((driverNeed, index) =>
          normalizeDriverNeed(driverNeed, `driver-need-${Date.now()}-${index}`)
        )
      : [];

    // TODO: Migrate legacy coachAssignments into coachNeeds/driverNeeds if needed.

    return {
      ...blankQuote,
      ...quoteRecord,
      coachNeeds: normalizedCoachNeeds,
      driverNeeds: normalizedDriverNeeds,
      mainEngineServiceRate:
        typeof quoteRecord?.mainEngineServiceRate === "number"
          ? quoteRecord.mainEngineServiceRate
          : 0,
      payrollFee:
        typeof quoteRecord?.payrollFee === "number" ? quoteRecord.payrollFee : 0,
      adminFee:
        typeof quoteRecord?.adminFee === "number" ? quoteRecord.adminFee : 0,
    };
  }

  function normalizeSavedQuoteRecord(
    quoteRecord: Partial<SavedQuote> | null | undefined
  ): SavedQuote {
    const normalizedQuote = normalizeQuoteRecord(quoteRecord);

    return {
      ...normalizedQuote,
      totalTourBudget:
        typeof quoteRecord?.totalTourBudget === "number"
          ? quoteRecord.totalTourBudget
          : 0,
      savedAt: quoteRecord?.savedAt || "",
    };
  }

  useEffect(() => {
    const savedCoaches = localStorage.getItem("blackline_coaches");
    const savedDrivers = localStorage.getItem("blackline_drivers");
    const savedTrips = localStorage.getItem("blackline_trips");
    const savedQuoteRecords = localStorage.getItem("blackline_quotes");
    const savedCustomers = localStorage.getItem("blackline_customers");

    if (savedCoaches) setCoaches(JSON.parse(savedCoaches));
    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    if (savedTrips) setTrips(JSON.parse(savedTrips));
    if (savedQuoteRecords) {
      const parsedQuotes = JSON.parse(savedQuoteRecords) as Array<Partial<SavedQuote>>;
      setSavedQuotes(parsedQuotes.map((record) => normalizeSavedQuoteRecord(record)));
    }
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

    const rememberedEmail = localStorage.getItem("blackline_remembered_email");
    if (rememberedEmail) {
      setLoginEmail(rememberedEmail);
      setLoginRememberMe(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("blackline_coaches", JSON.stringify(coaches));
  }, [coaches]);

  useEffect(() => {
    localStorage.setItem("blackline_drivers", JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem("blackline_trips", JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem("blackline_quotes", JSON.stringify(savedQuotes));
  }, [savedQuotes]);

  useEffect(() => {
    localStorage.setItem("blackline_customers", JSON.stringify(customers));
  }, [customers]);

  function todayDateOnly() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function isTodayBetween(startDate: string, endDate: string) {
    if (!startDate || !endDate) return false;

    const today = todayDateOnly();
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return today >= start && today <= end;
  }

  function isTripActiveOnDate(trip: Trip, targetDate: Date) {
    if (!trip.startDate || !trip.endDate) return false;

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const day = new Date(targetDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    day.setHours(0, 0, 0, 0);

    return day >= start && day <= end;
  }

  function getCalendarTripStatus(trip: Trip) {
    if (!trip.coachName || !trip.driverName) return "Missing Assignment";
    return isTodayBetween(trip.startDate, trip.endDate)
      ? "On Tour"
      : "Scheduled / Completed";
  }

  function getDriverFullName(driver: Driver) {
    return `${driver.firstName} ${driver.lastName}`;
  }

  function getDriverOperationalStatus(driver: Driver) {
    if (driver.baseStatus === "Inactive") return "Inactive";
    if (driver.baseStatus === "Vacation") return "Vacation";

    const fullName = getDriverFullName(driver);
    const activeTrip = trips.find(
      (trip) =>
        trip.driverName === fullName &&
        isTodayBetween(trip.startDate, trip.endDate)
    );

    return activeTrip ? "On Tour" : "Available";
  }

  const availableDrivers = drivers.filter(
    (driver) => getDriverOperationalStatus(driver) === "Available"
  );

  const assignableCalendarCoaches = coaches.filter(
    (coach) => {
      const operationalStatus = getCoachOperationalStatus(coach);
      return operationalStatus !== "Sold / Archived" && operationalStatus !== "Maintenance";
    }
  );

  const assignableCalendarDrivers = drivers.filter(
    (driver) =>
      driver.baseStatus === "Active" ||
      getDriverOperationalStatus(driver) === "Available"
  );

  function updateQuote(field: keyof QuoteInput, value: string | boolean) {
    setQuote({
      ...quote,
      [field]:
        typeof value === "boolean" ||
        field === "id" ||
        field === "quoteNumber" ||
        field === "quoteStatus" ||
        field === "customerName" ||
        field === "tourName" ||
        field === "tourType" ||
        field === "salesperson" ||
        field === "startDate" ||
        field === "endDate" ||
        field === "coachName" ||
        field === "driverName"
          ? value
          : Number(value),
    });
  }

  function createCoachNeedRow(): QuoteCoachNeed {
    return {
      id: `coach-need-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      coachType: "Star Single Slide",
      quantity: 1,
      preferredCoachId: "",
      preferredCoachName: "",
      notes: "",
    };
  }

  function createDriverNeedRow(): QuoteDriverNeed {
    return {
      id: `driver-need-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      driverRole: "Primary Driver",
      quantity: 1,
      preferredDriverId: "",
      preferredDriverName: "",
      notes: "",
    };
  }

  function addCoachNeedRow() {
    setQuote((previousQuote) => ({
      ...previousQuote,
      coachNeeds: [...previousQuote.coachNeeds, createCoachNeedRow()],
    }));
  }

  function addDriverNeedRow() {
    setQuote((previousQuote) => ({
      ...previousQuote,
      driverNeeds: [...previousQuote.driverNeeds, createDriverNeedRow()],
    }));
  }

  function removeCoachNeedRow(needId: string) {
    setQuote((previousQuote) => ({
      ...previousQuote,
      coachNeeds: previousQuote.coachNeeds.filter((coachNeed) => coachNeed.id !== needId),
    }));
  }

  function removeDriverNeedRow(needId: string) {
    setQuote((previousQuote) => ({
      ...previousQuote,
      driverNeeds: previousQuote.driverNeeds.filter((driverNeed) => driverNeed.id !== needId),
    }));
  }

  function ensureDriverRoleValue(value: string): QuoteDriverNeed["driverRole"] {
    return value === "Co-Driver" ? "Co-Driver" : "Primary Driver";
  }

  function ensureCoachTypeValue(value: string): QuoteCoachNeed["coachType"] {
    if (value === "Star Double Slide") return "Star Double Slide";
    if (value === "Crew Single Slide") return "Crew Single Slide";
    return "Star Single Slide";
  }

  function updateCoachNeedType(
    needId: string,
    coachTypeValue: QuoteCoachNeed["coachType"]
  ) {
    setQuote((previousQuote) => ({
      ...previousQuote,
      coachNeeds: previousQuote.coachNeeds.map((coachNeed) =>
        coachNeed.id === needId
          ? {
              ...coachNeed,
              coachType: coachTypeValue,
            }
          : coachNeed
      ),
    }));
  }

  function updateDriverNeedRole(
    needId: string,
    driverRoleValue: QuoteDriverNeed["driverRole"]
  ) {
    setQuote((previousQuote) => ({
      ...previousQuote,
      driverNeeds: previousQuote.driverNeeds.map((driverNeed) =>
        driverNeed.id === needId
          ? {
              ...driverNeed,
              driverRole: driverRoleValue,
            }
          : driverNeed
      ),
    }));
  }

  function updateCoachNeedQuantity(needId: string, quantityValue: string) {
    setQuote((previousQuote) => ({
      ...previousQuote,
      coachNeeds: previousQuote.coachNeeds.map((coachNeed) =>
        coachNeed.id === needId
          ? {
              ...coachNeed,
              quantity: Math.max(Number(quantityValue || "1"), 1),
            }
          : coachNeed
      ),
    }));
  }

  function updateDriverNeedQuantity(needId: string, quantityValue: string) {
    setQuote((previousQuote) => ({
      ...previousQuote,
      driverNeeds: previousQuote.driverNeeds.map((driverNeed) =>
        driverNeed.id === needId
          ? {
              ...driverNeed,
              quantity: Math.max(Number(quantityValue || "1"), 1),
            }
          : driverNeed
      ),
    }));
  }

  function updateCoachNeedPreferredCoach(needId: string, selectedCoachId: string) {
    const selectedCoach = coaches.find((coach) => String(coach.id) === selectedCoachId);

    setQuote((previousQuote) => ({
      ...previousQuote,
      coachNeeds: previousQuote.coachNeeds.map((coachNeed) =>
        coachNeed.id === needId
          ? {
              ...coachNeed,
              preferredCoachId: selectedCoachId,
              preferredCoachName: selectedCoach?.coachName || "",
            }
          : coachNeed
      ),
    }));
  }

  function updateDriverNeedPreferredDriver(needId: string, selectedDriverId: string) {
    const selectedDriver = drivers.find((driver) => String(driver.id) === selectedDriverId);
    const selectedDriverName = selectedDriver ? getDriverFullName(selectedDriver) : "";

    setQuote((previousQuote) => ({
      ...previousQuote,
      driverNeeds: previousQuote.driverNeeds.map((driverNeed) =>
        driverNeed.id === needId
          ? {
              ...driverNeed,
              preferredDriverId: selectedDriverId,
              preferredDriverName: selectedDriverName,
            }
          : driverNeed
      ),
    }));
  }

  function updateCoachNeedNotes(needId: string, notesValue: string) {
    setQuote((previousQuote) => ({
      ...previousQuote,
      coachNeeds: previousQuote.coachNeeds.map((coachNeed) =>
        coachNeed.id === needId
          ? {
              ...coachNeed,
              notes: notesValue,
            }
          : coachNeed
      ),
    }));
  }

  function updateDriverNeedNotes(needId: string, notesValue: string) {
    setQuote((previousQuote) => ({
      ...previousQuote,
      driverNeeds: previousQuote.driverNeeds.map((driverNeed) =>
        driverNeed.id === needId
          ? {
              ...driverNeed,
              notes: notesValue,
            }
          : driverNeed
      ),
    }));
  }

  function updateNewCoach(field: keyof Coach, value: string) {
    setNewCoach({ ...newCoach, [field]: value });
  }

  function updateNewDriver(field: keyof Driver, value: string) {
    setNewDriver({ ...newDriver, [field]: value });
  }

  function updateNewTrip(field: keyof Trip, value: string) {
    setNewTrip({ ...newTrip, [field]: value });
  }

  function openAssignmentModal(trip: Trip) {
    setAssignmentTrip(trip);
    setAssignmentCoachName(trip.coachName || "");
    setAssignmentDriverName(trip.driverName || "");
  }

  function closeAssignmentModal() {
    setAssignmentTrip(null);
    setAssignmentCoachName("");
    setAssignmentDriverName("");
  }

  function saveTripAssignment() {
    if (!assignmentTrip) return;

    const updatedTrip: Trip = {
      ...assignmentTrip,
      coachName: assignmentCoachName,
      driverName: assignmentDriverName,
    };

    setTrips(
      trips.map((trip) => (trip.id === assignmentTrip.id ? updatedTrip : trip))
    );

    if (selectedCalendarTrip?.id === assignmentTrip.id) {
      setSelectedCalendarTrip(updatedTrip);
    }

    closeAssignmentModal();
    alert("Assignment updated.");
  }

  function addCoach() {
    if (!newCoach.coachName.trim()) {
      alert("Coach Name is required.");
      return;
    }

    const isSoldArchived = newCoach.baseStatus === "Sold";
    setCoaches([
      ...coaches,
      {
        ...newCoach,
        id: Date.now(),
        isArchived: isSoldArchived,
        soldDate: isSoldArchived
          ? new Date().toISOString().slice(0, 10)
          : newCoach.soldDate || "",
      },
    ]);

    setNewCoach({
      id: 0,
      coachName: "",
      vin: "",
      year: "",
      model: "",
      coachType: "Star Coach",
      baseStatus: "Available",
      licensePlate: "",
      currentLocation: "",
      notes: "",
      soldDate: "",
      isArchived: false,
    });

    setShowAddCoachModal(false);
    alert("Coach added.");
  }
  function getCoachOperationalStatus(coach: Coach) {
  if (coach.baseStatus === "Sold" || coach.isArchived) return "Sold / Archived";
  if (coach.baseStatus === "Maintenance") return "Maintenance";

  const coachIsOnTour = trips.some(
    (trip) =>
      trip.coachName === coach.coachName &&
      isTodayBetween(trip.startDate, trip.endDate)
  );

  return coachIsOnTour ? "On Tour" : "Available";
}

function openCoachDetails(coach: Coach) {
  setSelectedCoachId(coach.id);
  setEditedCoach({ ...coach });
  setIsEditingCoach(false);
}

function updateEditedCoach(field: keyof Coach, value: string) {
  if (!editedCoach) return;

  setEditedCoach({
    ...editedCoach,
    [field]: value,
  });
}

function saveCoachDetails() {
  if (!editedCoach) return;

  setCoaches(
    coaches.map((coach) =>
      coach.id === editedCoach.id ? editedCoach : coach
    )
  );

  setIsEditingCoach(false);
}

function startEditingCoachDetails() {
  if (!selectedCoach) return;

  setEditedCoach({ ...selectedCoach });
  setIsEditingCoach(true);
}

function cancelCoachDetailsEdit() {
  if (!selectedCoach) return;

  setEditedCoach({ ...selectedCoach });
  setIsEditingCoach(false);
}

function setCoachMaintenance(id: number, isMaintenance: boolean) {
  setCoaches(
    coaches.map((coach) =>
      coach.id === id
        ? {
            ...coach,
            baseStatus: isMaintenance ? "Maintenance" : "Available",
          }
        : coach
    )
  );

  if (editedCoach?.id === id) {
    setEditedCoach({
      ...editedCoach,
      baseStatus: isMaintenance ? "Maintenance" : "Available",
    });
  }
}

function markCoachSold(id: number) {
  const confirmed = confirm(
    "Mark this coach as sold? It will be archived for historical purposes."
  );

  if (!confirmed) return;

  setCoaches(
    coaches.map((coach) =>
      coach.id === id
        ? {
            ...coach,
            baseStatus: "Sold",
            isArchived: true,
            soldDate: new Date().toISOString().slice(0, 10),
          }
        : coach
    )
  );

  if (selectedCoachId === id && selectedCoach) {
    setEditedCoach({
      ...selectedCoach,
      baseStatus: "Sold",
      isArchived: true,
      soldDate: new Date().toISOString().slice(0, 10),
    });
    setIsEditingCoach(false);
  }

  alert("Coach archived.");
}

function updateNewCustomer(field: keyof Customer, value: string) {
  setNewCustomer({
    ...newCustomer,
    [field]: value,
  });
}

const selectedCoach = coaches.find(
  (coach) => coach.id === selectedCoachId
);

function addCustomer() {
  if (
    !addCustomerModalDraft.artistName.trim() &&
    !addCustomerModalDraft.companyName.trim()
  ) {
    alert("Artist Name or Company Name is required.");
    return;
  }

  const managerEmail = addCustomerModalDraft.managerEmail.trim();
  const apEmail = addCustomerModalDraft.apEmail.trim();

  const managerContact: CustomerContact = {
    id: Date.now(),
    name: addCustomerModalDraft.managerName.trim() || "Primary Manager",
    role: "Manager",
    email: managerEmail,
    phone: addCustomerModalDraft.managerPhone.trim(),
    isPrimaryBilling: false,
    isPrimaryOperations: true,
  };

  const apContact: CustomerContact = {
    id: Date.now() + 1,
    name: addCustomerModalDraft.apName.trim() || "Primary AP",
    role: "AP",
    email: apEmail,
    phone: addCustomerModalDraft.apPhone.trim(),
    isPrimaryBilling: true,
    isPrimaryOperations: false,
  };

  const customerToAdd: Customer = {
    id: Date.now(),
    artistName: addCustomerModalDraft.artistName.trim(),
    companyName: addCustomerModalDraft.companyName.trim(),
    status: addCustomerModalDraft.status,
    companyAddress: addCustomerModalDraft.companyAddress.trim(),
    notes: addCustomerModalDraft.notes.trim(),
    managerEmail,
    apEmail,
    contacts: [managerContact, apContact],
  };

  setCustomers([...customers, customerToAdd]);
  setSelectedCustomerId(customerToAdd.id);
  setShowAddCustomer(false);
  setAddCustomerModalDraft(blankAddCustomerModalDraft);
  openCustomerDetails(customerToAdd.id);
  alert("Customer added.");
}

function updateAddCustomerModalDraft(
  field: keyof AddCustomerModalDraft,
  value: string
) {
  setAddCustomerModalDraft({
    ...addCustomerModalDraft,
    [field]: value,
  });
}

function cancelAddCustomerModal() {
  setShowAddCustomer(false);
  setAddCustomerModalDraft(blankAddCustomerModalDraft);
}
function getCustomerDisplayName(customer: Customer) {
  return customer.artistName || customer.companyName;
}

function getCustomerSearchLabel(customer: Customer) {
  return `${customer.artistName || "Unknown Artist"} — ${
    customer.companyName || "Unknown Company"
  }`;
}

function addCustomerFromQuote() {
  if (!newCustomer.artistName.trim() && !newCustomer.companyName.trim()) {
    alert("Artist Name or Company Name is required.");
    return;
  }

  const customerToAdd: Customer = {
    ...newCustomer,
    id: Date.now(),
  };

  const customerName = getCustomerDisplayName(customerToAdd);

  setCustomers([...customers, customerToAdd]);
  setSelectedCustomerId(customerToAdd.id);

  setQuote({
    ...quote,
    customerName,
  });

  setNewCustomer({
    id: 0,
    artistName: "",
    companyName: "",
    companyAddress: "",
    managerEmail: "",
    apEmail: "",
    status: "Prospect",
    notes: "",
  });

  setShowQuickCustomerForm(false);
}
function deleteCustomer(id: number) {
  setCustomers(customers.filter((customer) => customer.id !== id));

  if (selectedCustomerId === id) {
    setSelectedCustomerId(null);
  }
}

function saveCustomerNotes() {
  if (!selectedCustomer) return;

  setCustomers(
    customers.map((customer) =>
      customer.id === selectedCustomer.id
        ? { ...customer, notes: customerNotesDraft }
        : customer
    )
  );

  alert("Customer notes updated.");
}

function openCustomerDetails(customerId: number) {
  setSelectedCustomerId(customerId);
  setCustomerDetailsTab("Overview");
  setIsEditingCustomerDetails(false);
  setEditedCustomerDetails(null);
  setShowAddCustomerContactForm(false);
  setShowCustomerDetailsModal(true);
}

function startEditingCustomerDetails() {
  if (!selectedCustomer) return;

  setEditedCustomerDetails({
    ...selectedCustomer,
    contacts: selectedCustomer.contacts
      ? selectedCustomer.contacts.map((contact) => ({ ...contact }))
      : undefined,
  });
  setIsEditingCustomerDetails(true);
}

function updateEditedCustomerDetails(field: keyof Customer, value: string) {
  if (!editedCustomerDetails) return;

  setEditedCustomerDetails({
    ...editedCustomerDetails,
    [field]: value,
  });
}

function saveCustomerDetails() {
  if (!editedCustomerDetails || !selectedCustomer) return;

  const updatedCustomer: Customer = {
    ...editedCustomerDetails,
    id: selectedCustomer.id,
  };

  setCustomers(
    customers.map((customer) =>
      customer.id === selectedCustomer.id ? updatedCustomer : customer
    )
  );

  setIsEditingCustomerDetails(false);
  setEditedCustomerDetails(null);
  alert("Customer updated.");
}

function cancelCustomerDetailsEdit() {
  setIsEditingCustomerDetails(false);
  setEditedCustomerDetails(null);
}

function updateEditedCustomerContact(
  contactId: number,
  field: keyof Omit<CustomerContact, "id">,
  value: string | boolean
) {
  if (!editedCustomerDetails) return;

  const editedContacts = editedCustomerDetails.contacts
    ? editedCustomerDetails.contacts.map((contact) =>
        contact.id === contactId ? { ...contact, [field]: value } : contact
      )
    : [];

  setEditedCustomerDetails({
    ...editedCustomerDetails,
    contacts: editedContacts,
  });
}

function resetNewCustomerContact() {
  setNewCustomerContact({
    name: "",
    role: "Manager",
    email: "",
    phone: "",
    isPrimaryBilling: false,
    isPrimaryOperations: false,
  });
}

function addCustomerContact() {
  if (!selectedCustomer) return;

  if (!newCustomerContact.name.trim() || !newCustomerContact.email.trim()) {
    alert("Contact name and email are required.");
    return;
  }

  const contactToAdd: CustomerContact = {
    ...newCustomerContact,
    id: Date.now(),
    name: newCustomerContact.name.trim(),
    email: newCustomerContact.email.trim(),
    phone: newCustomerContact.phone.trim(),
  };

  setCustomers(
    customers.map((customer) =>
      customer.id === selectedCustomer.id
        ? {
            ...customer,
            contacts: [...customerContacts, contactToAdd],
          }
        : customer
    )
  );

  setShowAddCustomerContactForm(false);
  resetNewCustomerContact();
  alert("Contact added.");
}

function deleteCustomerContact(contactId: number) {
  if (!selectedCustomer) return;

  setCustomers(
    customers.map((customer) =>
      customer.id === selectedCustomer.id
        ? {
            ...customer,
            contacts: customerContacts.filter((contact) => contact.id !== contactId),
          }
        : customer
    )
  );
}

  function addDriver() {
    if (!newDriver.firstName.trim() || !newDriver.lastName.trim()) {
      alert("First Name and Last Name are required.");
      return;
    }

    setDrivers([...drivers, { ...newDriver, id: Date.now() }]);

    setNewDriver({
      id: 0,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      baseStatus: "Active",
      emergencyContactName: "",
      emergencyContactPhone: "",
      homeBase: "",
      notes: "",
    });

    setShowAddDriverModal(false);
    alert("Driver added.");
  }

  function addTrip() {
    if (!newTrip.tripName.trim()) {
      alert("Trip Name is required.");
      return;
    }

    if (!newTrip.startDate || !newTrip.endDate) {
      alert("Start Date and End Date are required.");
      return;
    }

    if (!newTrip.coachName || !newTrip.driverName) {
      alert("Coach and Driver are required.");
      return;
    }

    setTrips([...trips, { ...newTrip, id: Date.now() }]);

    setNewTrip({
      id: 0,
      tripName: "",
      startDate: "",
      endDate: "",
      coachName: "",
      driverName: "",
    });
  }

  function generateDemoData() {
    const shouldContinue = confirm(
      "This will replace current demo data. Continue?"
    );

    if (!shouldContinue) return;

    const baseId = Date.now();

    const coachTypeCycle: Coach["coachType"][] = [
      "Star Coach",
      "Entertainer Coach",
      "Sleeper Coach",
    ];

    const coachesDemo: Coach[] = Array.from({ length: 100 }, (_, index) => {
      let baseStatus: Coach["baseStatus"] = "Available";
      if (index % 20 === 0) {
        baseStatus = "Sold";
      } else if (index % 9 === 0) {
        baseStatus = "Maintenance";
      }

      return {
        id: baseId + index,
        coachName: `Coach ${String(index + 1).padStart(3, "0")}`,
        vin: `VIN${String(index + 1).padStart(6, "0")}`,
        year: String(2015 + (index % 11)),
        model: index % 2 === 0 ? "Prevost" : "MCI",
        coachType: coachTypeCycle[index % coachTypeCycle.length],
        baseStatus,
        licensePlate: `BL-${String(index + 1).padStart(4, "0")}`,
        currentLocation: "Nashville, TN",
        notes: "",
        soldDate: baseStatus === "Sold" ? "2025-12-15" : "",
        isArchived: baseStatus === "Sold",
      };
    });

    const firstNames = [
      "James",
      "Michael",
      "David",
      "Chris",
      "Robert",
      "John",
      "Daniel",
      "Brian",
      "Tyler",
      "Matthew",
      "Ryan",
      "Jacob",
      "Jason",
      "Brandon",
      "Austin",
      "Dylan",
      "Logan",
      "Ethan",
      "Noah",
      "Mason",
    ];

    const lastNames = [
      "Johnson",
      "Miller",
      "Davis",
      "Wilson",
      "Brown",
      "Taylor",
      "Anderson",
      "Thomas",
      "Moore",
      "Jackson",
      "Martin",
      "Lee",
      "Walker",
      "Hall",
      "Allen",
      "Young",
      "King",
      "Wright",
      "Scott",
      "Green",
    ];

    const driversDemo: Driver[] = Array.from({ length: 175 }, (_, index) => {
      const firstName = firstNames[index % firstNames.length];
      const lastName = `${lastNames[index % lastNames.length]}${Math.floor(
        index / lastNames.length
      )}`;

      let baseStatus: Driver["baseStatus"] = "Active";
      if (index % 11 === 0) {
        baseStatus = "Vacation";
      } else if (index % 17 === 0) {
        baseStatus = "Inactive";
      }

      return {
        id: baseId + 1000 + index,
        firstName,
        lastName,
        phone: `615-555-${String(1000 + index).slice(-4)}`,
        email: `${firstName.toLowerCase()}.${lastName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")}@blackline.com`,
        address: `${100 + (index % 900)} Music Row, Nashville, TN`,
        baseStatus,
      };
    });

    const seededCustomers: Array<{ artistName: string; companyName: string }> = [
      { artistName: "Morgan Wallen", companyName: "Big Loud" },
      { artistName: "Luke Combs", companyName: "River House" },
      { artistName: "Lainey Wilson", companyName: "BBR" },
      { artistName: "Jelly Roll", companyName: "Stoney Creek" },
      { artistName: "Chris Stapleton", companyName: "Mercury Nashville" },
      { artistName: "Zach Bryan", companyName: "Belting Bronco" },
      { artistName: "Kacey Musgraves", companyName: "MCA Nashville" },
      { artistName: "Tyler Childers", companyName: "Hickman Holler" },
      { artistName: "Eric Church", companyName: "EMI Nashville" },
      { artistName: "Kenny Chesney", companyName: "Blue Chair Bay" },
    ];

    while (seededCustomers.length < 50) {
      const idx = seededCustomers.length + 1;
      seededCustomers.push({
        artistName: `Demo Artist ${String(idx).padStart(2, "0")}`,
        companyName: `Demo Entertainment ${String(idx).padStart(2, "0")}`,
      });
    }

    const customersDemo: Customer[] = seededCustomers.map((entry, index) => ({
      id: baseId + 2000 + index,
      artistName: entry.artistName,
      companyName: entry.companyName,
      companyAddress: `${200 + index} Broadway, Nashville, TN`,
      managerEmail: `manager${index + 1}@${entry.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}.com`,
      apEmail: `ap${index + 1}@${entry.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}.com`,
      status: index % 5 === 0 ? "Prospect" : "Active",
      notes: "",
    }));

    const quoteStatusCycle: SavedQuote["quoteStatus"][] = [
      "Draft",
      "Sent",
      "Accepted",
      "Rejected",
    ];

    const quoteTourTypeCycle: SavedQuote["tourType"][] = ["Short Term", "Long Term"];

    const today = todayDateOnly();
    const quotesDemo: SavedQuote[] = Array.from({ length: 75 }, (_, index) => {
      const customer = customersDemo[index % customersDemo.length];
      const start = new Date(today);
      start.setDate(today.getDate() + (index % 30) - 10);
      const end = new Date(start);
      end.setDate(start.getDate() + 14 + (index % 20));

      const coachName = coachesDemo[index % coachesDemo.length].coachName;
      const driver = driversDemo[index % driversDemo.length];
      const driverName = `${driver.firstName} ${driver.lastName}`;
      const totalTourBudget = 90000 + (index % 25) * 11000;

      return {
        id: baseId + 3000 + index,
        quoteNumber: `Q-${1001 + index}`,
        quoteStatus: quoteStatusCycle[index % quoteStatusCycle.length],
        customerName: customer.artistName,
        tourName: `${customer.artistName} ${index % 2 === 0 ? "Arena" : "Festival"} Tour`,
        tourType: quoteTourTypeCycle[index % quoteTourTypeCycle.length],
        salesperson: "Current User",
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        coachName,
        driverName,
        coachNeeds: [],
        driverNeeds: [],
        miles: 3000 + (index % 12) * 250,
        busDayRate: 1800 + (index % 8) * 120,
        driverDayRate: 450 + (index % 6) * 35,
        fuelRate: 1.7,
        perDiemRate: 80,
        mainEngineServiceRate: 0,
        generatorWeeklyRate: 1200,
        wirelessDailyRate: 35,
        hotelQty: 0,
        hotelRate: 0,
        payrollFee: 0,
        adminFee: 0,
        useDeadhead: true,
        busDHF: 2,
        busDHR: 2,
        driverDHF: 2,
        driverDHR: 2,
        totalTourBudget,
        savedAt: new Date().toLocaleString(),
      };
    });

    const activeCoachPool = coachesDemo
      .filter((coach) => coach.baseStatus === "Available")
      .map((coach) => coach.coachName);
    const activeDriverPool = driversDemo
      .filter((driver) => driver.baseStatus === "Active")
      .map((driver) => `${driver.firstName} ${driver.lastName}`);

    const tripsDemo: Trip[] = Array.from({ length: 40 }, (_, index) => {
      const start = new Date(today);
      const end = new Date(today);

      if (index < 16) {
        start.setDate(today.getDate() - (index % 2));
        end.setDate(today.getDate() + 2 + (index % 3));
      } else if (index < 28) {
        start.setDate(today.getDate() + (index % 7));
        end.setDate(start.getDate() + 5 + (index % 4));
      } else {
        start.setDate(today.getDate() + 9 + (index % 12));
        end.setDate(start.getDate() + 6 + (index % 5));
      }

      let coachName = activeCoachPool[index % activeCoachPool.length] || "";
      let driverName = activeDriverPool[index % activeDriverPool.length] || "";

      if (index % 7 === 0) coachName = "";
      if (index % 9 === 0) driverName = "";

      if (index === 2 || index === 3) coachName = "Coach 002";
      if (index === 4 || index === 5) driverName = activeDriverPool[2] || driverName;

      return {
        id: baseId + 4000 + index,
        tripName: `Tour ${String(index + 1).padStart(3, "0")}`,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        coachName,
        driverName,
      };
    });

    setCoaches(coachesDemo);
    setDrivers(driversDemo);
    setCustomers(customersDemo);
    setSavedQuotes(quotesDemo);
    setTrips(tripsDemo);
    setQuote({
      ...blankQuote,
      quoteNumber: "",
      id: null,
    });
    setActivePage("Leasing Dashboard");
    setActiveQuoteTab("Quote List");
    setSelectedCustomerId(null);
    setShowAddCustomer(false);

    alert("Demo data generated.");
  }

  function clearDemoData() {
    const shouldContinue = confirm("This will clear demo data. Continue?");

    if (!shouldContinue) return;

    localStorage.removeItem("blackline_coaches");
    localStorage.removeItem("blackline_drivers");
    localStorage.removeItem("blackline_trips");
    localStorage.removeItem("blackline_quotes");
    localStorage.removeItem("blackline_customers");

    setCoaches([]);
    setDrivers([]);
    setCustomers([]);
    setSavedQuotes([]);
    setTrips([]);
    setQuote({
      ...blankQuote,
      quoteNumber: "",
      id: null,
    });
    setSelectedCustomerId(null);
    setShowAddCustomer(false);
    setCustomerDirectorySearchTerm("");
    setShowCustomerDirectoryDropdown(false);
    setQuoteCustomerSearchTerm("");
    setShowQuoteCustomerDropdown(false);
    setCustomerRequestedPrice("");
    setDispatcherSearchTerm("");
    setDispatcherTourFilter("All");

    alert("Demo data cleared.");
  }

  function deleteCoach(id: number) {
    setCoaches(coaches.filter((coach) => coach.id !== id));
  }

  function deleteDriver(id: number) {
    setDrivers(drivers.filter((driver) => driver.id !== id));
  }

  function archiveDriver(id: number) {
    setDrivers(
      drivers.map((driver) =>
        driver.id === id ? { ...driver, baseStatus: "Inactive" } : driver
      )
    );

    if (selectedDriverForDetails?.id === id) {
      const driverToArchive = drivers.find((driver) => driver.id === id);

      if (driverToArchive) {
        setSelectedDriverForDetails({ ...driverToArchive, baseStatus: "Inactive" });
      }
    }

    alert("Driver archived.");
  }

  function openDriverDetails(driver: Driver) {
    setSelectedDriverForDetails(driver);
    setIsEditingDriverDetails(false);
    setEditedDriverDetails(null);
  }

  function startEditingDriverDetails() {
    if (!selectedDriverDetails) return;

    setEditedDriverDetails({ ...selectedDriverDetails });
    setIsEditingDriverDetails(true);
  }

  function updateEditedDriverDetails(field: keyof Driver, value: string) {
    if (!editedDriverDetails) return;

    setEditedDriverDetails({
      ...editedDriverDetails,
      [field]: value,
    });
  }

  function saveDriverDetails() {
    if (!editedDriverDetails) return;

    const updatedDriver = { ...editedDriverDetails };

    setDrivers(
      drivers.map((driver) =>
        driver.id === updatedDriver.id ? updatedDriver : driver
      )
    );

    setSelectedDriverForDetails(updatedDriver);
    setIsEditingDriverDetails(false);
    setEditedDriverDetails(null);
    alert("Driver updated.");
  }

  function cancelDriverDetailsEdit() {
    setIsEditingDriverDetails(false);
    setEditedDriverDetails(null);
  }

  function deleteTrip(id: number) {
    setTrips(trips.filter((trip) => trip.id !== id));
  }

  function deleteQuote(id: number | null) {
    if (!id) return;
    setSavedQuotes(savedQuotes.filter((savedQuote) => savedQuote.id !== id));
  }

  function sortCoaches(key: keyof Coach) {
    setCoachSort({
      key,
      direction:
        coachSort.key === key && coachSort.direction === "asc" ? "desc" : "asc",
    });
  }

  function sortDrivers(key: keyof Driver) {
    setDriverSort({
      key,
      direction:
        driverSort.key === key && driverSort.direction === "asc"
          ? "desc"
          : "asc",
    });
  }

  function toggleDriverListSort(key: DriverListSortKey) {
    setDriverListSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function toggleCoachListSort(key: CoachListSortKey) {
    setCoachListSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function updateCoachStatusFilter(
    value: "All" | "Available" | "On Tour" | "Maintenance" | "Sold / Archived"
  ) {
    setCoachStatusFilter(value);

    if (value === "Sold / Archived") {
      setShowArchivedCoaches(true);
    }
  }

  function updateDriverStatusFilter(
    value: "All" | "Available" | "On Tour" | "Active" | "Vacation" | "Inactive"
  ) {
    setDriverStatusFilter(value);

    if (value === "Inactive") {
      setShowArchivedDrivers(true);
    }
  }

  const sortedCoaches = [...coaches].sort((a, b) => {
    const aValue = String(a[coachSort.key]).toLowerCase();
    const bValue = String(b[coachSort.key]).toLowerCase();

    if (aValue < bValue) return coachSort.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return coachSort.direction === "asc" ? 1 : -1;
    return 0;
  });

  const sortedDrivers = [...drivers].sort((a, b) => {
    const aValue = String(a[driverSort.key]).toLowerCase();
    const bValue = String(b[driverSort.key]).toLowerCase();

    if (aValue < bValue) return driverSort.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return driverSort.direction === "asc" ? 1 : -1;
    return 0;
  });

  const driverSearchValue = driverSearchTerm.trim().toLowerCase();
  const displayedDrivers = sortedDrivers.filter((driver) => {
    const operationalStatus = getDriverOperationalStatus(driver);
    const includeArchivedDrivers =
      showArchivedDrivers || driverStatusFilter === "Inactive";

    if (!includeArchivedDrivers && driver.baseStatus === "Inactive") {
      return false;
    }

    const matchesStatus =
      driverStatusFilter === "All"
        ? true
        : driverStatusFilter === "Available" || driverStatusFilter === "On Tour"
        ? operationalStatus === driverStatusFilter
        : driver.baseStatus === driverStatusFilter;

    if (!matchesStatus) return false;
    if (!driverSearchValue) return true;

    const fullName = getDriverFullName(driver).toLowerCase();

    return (
      fullName.includes(driverSearchValue) ||
      driver.phone.toLowerCase().includes(driverSearchValue) ||
      driver.email.toLowerCase().includes(driverSearchValue) ||
      operationalStatus.toLowerCase().includes(driverSearchValue) ||
      driver.baseStatus.toLowerCase().includes(driverSearchValue)
    );
  });

  const sortedCoachCards = [...coaches].sort((a, b) => {
    const aOperationalStatus = getCoachOperationalStatus(a).toLowerCase();
    const bOperationalStatus = getCoachOperationalStatus(b).toLowerCase();
    const aTourSummary = getCoachTourSummary(a);
    const bTourSummary = getCoachTourSummary(b);

    let aValue = "";
    let bValue = "";

    if (coachListSort.key === "coach") {
      aValue = (a.coachName || "").toLowerCase();
      bValue = (b.coachName || "").toLowerCase();
    } else if (coachListSort.key === "operationalStatus") {
      aValue = aOperationalStatus;
      bValue = bOperationalStatus;
    } else if (coachListSort.key === "baseStatus") {
      aValue = (a.baseStatus || "").toLowerCase();
      bValue = (b.baseStatus || "").toLowerCase();
    } else if (coachListSort.key === "currentTour") {
      aValue = (aTourSummary.currentTour?.tripName || "").toLowerCase();
      bValue = (bTourSummary.currentTour?.tripName || "").toLowerCase();
    } else if (coachListSort.key === "upcomingTours") {
      aValue = String(aTourSummary.upcomingToursCount);
      bValue = String(bTourSummary.upcomingToursCount);
    } else {
      aValue = (a.currentLocation || "").toLowerCase();
      bValue = (b.currentLocation || "").toLowerCase();
    }

    if (aValue < bValue) return coachListSort.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return coachListSort.direction === "asc" ? 1 : -1;
    return 0;
  });

  const coachSearchValue = coachSearchTerm.trim().toLowerCase();
  const displayedCoaches = sortedCoachCards.filter((coach) => {
    const operationalStatus = getCoachOperationalStatus(coach);
    const includeArchivedCoaches =
      showArchivedCoaches || coachStatusFilter === "Sold / Archived";

    if (!includeArchivedCoaches && operationalStatus === "Sold / Archived") {
      return false;
    }

    const matchesStatus =
      coachStatusFilter === "All"
        ? true
        : operationalStatus === coachStatusFilter;

    if (!matchesStatus) return false;
    if (!coachSearchValue) return true;

    return (
      (coach.coachName || "").toLowerCase().includes(coachSearchValue) ||
      (coach.vin || "").toLowerCase().includes(coachSearchValue) ||
      (coach.model || "").toLowerCase().includes(coachSearchValue) ||
      (coach.licensePlate || "").toLowerCase().includes(coachSearchValue) ||
      (coach.currentLocation || "").toLowerCase().includes(coachSearchValue) ||
      operationalStatus.toLowerCase().includes(coachSearchValue) ||
      (coach.baseStatus || "").toLowerCase().includes(coachSearchValue)
    );
  });

  const coachRowLimitValue =
    coachRowLimit === "All" ? displayedCoaches.length : Number(coachRowLimit);
  const limitedDisplayedCoaches = displayedCoaches.slice(0, coachRowLimitValue);

  const totalCoachesCount = coaches.length;
  const availableCoachesCount = coaches.filter(
    (coach) => getCoachOperationalStatus(coach) === "Available"
  ).length;
  const onTourCoachesCount = coaches.filter(
    (coach) => getCoachOperationalStatus(coach) === "On Tour"
  ).length;
  const maintenanceCoachesCount = coaches.filter(
    (coach) => getCoachOperationalStatus(coach) === "Maintenance"
  ).length;
  const soldArchivedCoachesCount = coaches.filter(
    (coach) => getCoachOperationalStatus(coach) === "Sold / Archived"
  ).length;
  const activeCoachesCount = coaches.filter((coach) => {
    const operationalStatus = getCoachOperationalStatus(coach);
    return operationalStatus !== "Sold / Archived" && operationalStatus !== "Maintenance";
  }).length;
  const coachUtilizationPercent =
    activeCoachesCount === 0
      ? 0
      : Math.round((onTourCoachesCount / activeCoachesCount) * 100);
  const coachUtilizationColorClass =
    coachUtilizationPercent >= 85
      ? "text-green-700"
      : coachUtilizationPercent >= 70
      ? "text-amber-700"
      : "text-red-700";

  const sortedDriverCards = [...displayedDrivers].sort((a, b) => {
    const aOperationalStatus = getDriverOperationalStatus(a).toLowerCase();
    const bOperationalStatus = getDriverOperationalStatus(b).toLowerCase();
    const aTourSummary = getDriverTourSummary(a);
    const bTourSummary = getDriverTourSummary(b);

    let aValue = "";
    let bValue = "";

    if (driverListSort.key === "driver") {
      aValue = getDriverFullName(a).toLowerCase();
      bValue = getDriverFullName(b).toLowerCase();
    } else if (driverListSort.key === "operationalStatus") {
      aValue = aOperationalStatus;
      bValue = bOperationalStatus;
    } else if (driverListSort.key === "baseStatus") {
      aValue = (a.baseStatus || "").toLowerCase();
      bValue = (b.baseStatus || "").toLowerCase();
    } else if (driverListSort.key === "currentTour") {
      aValue = (aTourSummary.currentTour?.tripName || "").toLowerCase();
      bValue = (bTourSummary.currentTour?.tripName || "").toLowerCase();
    } else if (driverListSort.key === "upcomingTours") {
      aValue = String(aTourSummary.upcomingToursCount);
      bValue = String(bTourSummary.upcomingToursCount);
    } else {
      aValue = (a.homeBase || "").toLowerCase();
      bValue = (b.homeBase || "").toLowerCase();
    }

    if (aValue < bValue) return driverListSort.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return driverListSort.direction === "asc" ? 1 : -1;
    return 0;
  });

  const driverRowLimitValue =
    driverRowLimit === "All" ? displayedDrivers.length : Number(driverRowLimit);
  const limitedDisplayedDrivers = sortedDriverCards.slice(0, driverRowLimitValue);

  const totalDriversCount = drivers.length;
  const availableDriversCount = drivers.filter(
    (driver) => getDriverOperationalStatus(driver) === "Available"
  ).length;
  const onTourDriversCount = drivers.filter(
    (driver) => getDriverOperationalStatus(driver) === "On Tour"
  ).length;
  const vacationDriversCount = drivers.filter(
    (driver) => driver.baseStatus === "Vacation"
  ).length;
  const inactiveDriversCount = drivers.filter(
    (driver) => driver.baseStatus === "Inactive"
  ).length;
  const activeDriversCount = drivers.filter(
    (driver) => driver.baseStatus !== "Inactive"
  ).length;
  const driverUtilizationPercent =
    activeDriversCount === 0
      ? 0
      : Math.round((onTourDriversCount / activeDriversCount) * 100);
  const driverUtilizationColorClass =
    driverUtilizationPercent >= 85
      ? "text-green-700"
      : driverUtilizationPercent >= 70
      ? "text-amber-700"
      : "text-red-700";
  const availableDriverCapacity = Math.max(
    activeDriversCount - onTourDriversCount,
    0
  );
  const driverUtilizationLabel =
    driverUtilizationPercent >= 85
      ? "High utilization"
      : driverUtilizationPercent >= 70
      ? "Balanced"
      : "Low utilization";

  function getDriverTourSummary(driver: Driver) {
    const today = todayDateOnly();
    const fullName = getDriverFullName(driver);

    const currentTour = trips.find(
      (trip) =>
        trip.driverName === fullName &&
        isTodayBetween(trip.startDate, trip.endDate)
    );

    const upcomingToursCount = trips.filter((trip) => {
      if (trip.driverName !== fullName || !trip.startDate) return false;

      const start = new Date(trip.startDate);
      start.setHours(0, 0, 0, 0);

      return start > today;
    }).length;

    const lastTourDate = trips
      .filter((trip) => {
        if (trip.driverName !== fullName || !trip.endDate) return false;

        const end = new Date(trip.endDate);
        end.setHours(23, 59, 59, 999);

        return end < today;
      })
      .sort(
        (a, b) =>
          new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      )[0]?.endDate;

    return { currentTour, upcomingToursCount, lastTourDate };
  }

  function getCoachTourSummary(coach: Coach) {
    const today = todayDateOnly();

    const currentTour = trips.find(
      (trip) =>
        trip.coachName === coach.coachName &&
        isTodayBetween(trip.startDate, trip.endDate)
    );

    const upcomingToursCount = trips.filter((trip) => {
      if (trip.coachName !== coach.coachName || !trip.startDate) return false;

      const start = new Date(trip.startDate);
      start.setHours(0, 0, 0, 0);

      return start > today;
    }).length;

    const lastTourDate = trips
      .filter((trip) => {
        if (trip.coachName !== coach.coachName || !trip.endDate) return false;

        const end = new Date(trip.endDate);
        end.setHours(23, 59, 59, 999);

        return end < today;
      })
      .sort(
        (a, b) =>
          new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      )[0]?.endDate;

    return { currentTour, upcomingToursCount, lastTourDate };
  }

  const selectedCoachTourSummary = selectedCoach
    ? getCoachTourSummary(selectedCoach)
    : null;

  const selectedDriverDetails = selectedDriverForDetails
    ? drivers.find((driver) => driver.id === selectedDriverForDetails.id) ??
      selectedDriverForDetails
    : null;
  const selectedDriverTourSummary = selectedDriverDetails
    ? getDriverTourSummary(selectedDriverDetails)
    : null;

  function money(value: number) {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function calculateTourDays() {
    if (!quote.startDate || !quote.endDate) return 0;
    const start = new Date(quote.startDate);
    const end = new Date(quote.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1, 0);
  }

  const tourDays = calculateTourDays();

  const busDHF = quote.useDeadhead ? quote.busDHF : 0;
  const busDHR = quote.useDeadhead ? quote.busDHR : 0;
  const driverDHF = quote.useDeadhead ? quote.driverDHF : 0;
  const driverDHR = quote.useDeadhead ? quote.driverDHR : 0;

  const billedDays = tourDays + busDHF + busDHR;
  const driverDays = tourDays + driverDHF + driverDHR;
  const perDiemDays = driverDays;
  const billedMonths = billedDays / 28;
  const generatorWeeks = Math.ceil(billedDays / 7);
  const wirelessDays = billedDays;

  const busTotal = billedDays * quote.busDayRate;
  const driverTotal = driverDays * quote.driverDayRate;
  const fuelTotal = quote.miles * quote.fuelRate;
  const perDiemTotal = perDiemDays * quote.perDiemRate;
  const mainEngineServiceTotal = quote.miles * quote.mainEngineServiceRate;
  const generatorTotal = generatorWeeks * quote.generatorWeeklyRate;
  const wirelessTotal = wirelessDays * quote.wirelessDailyRate;
  const hotelTotal = quote.hotelQty * quote.hotelRate;
  const payrollFeeTotal = quote.payrollFee;
  const adminFeeTotal = quote.adminFee;

  const totalTourBudget =
    busTotal +
    driverTotal +
    fuelTotal +
    perDiemTotal +
    mainEngineServiceTotal +
    generatorTotal +
    wirelessTotal +
    hotelTotal +
    payrollFeeTotal +
    adminFeeTotal;

  const estimatedCost = totalTourBudget * 0.72;
  const grossProfit = totalTourBudget - estimatedCost;
  const marginPercent = totalTourBudget > 0 ? grossProfit / totalTourBudget : 0;
  const lowestRecommendedPrice = estimatedCost / 0.78;
  const quoteReadinessItems = [
    {
      label: "Customer selected",
      isComplete: quote.customerName.trim() !== "",
    },
    {
      label: "Tour name entered",
      isComplete: quote.tourName.trim() !== "",
    },
    {
      label: "Tour type selected",
      isComplete: quote.tourType.trim() !== "",
    },
    {
      label: "Start date entered",
      isComplete: quote.startDate !== "",
    },
    {
      label: "End date entered",
      isComplete: quote.endDate !== "",
    },
    {
      label: "Coach selected",
      isComplete: quote.coachName.trim() !== "",
    },
    {
      label: "Driver selected",
      isComplete: quote.driverName.trim() !== "",
    },
    {
      label: "Price calculated",
      isComplete: totalTourBudget > 0,
    },
  ];
  const quoteReadinessCompletedCount = quoteReadinessItems.filter(
    (item) => item.isComplete
  ).length;
  const quoteReadinessPercent = Math.round(
    (quoteReadinessCompletedCount / quoteReadinessItems.length) * 100
  );
  const dealStatus =
    marginPercent >= 0.3
      ? "Healthy"
      : marginPercent >= 0.22
      ? "Tight"
      : "Approval Needed";
  const targetPrice = totalTourBudget * 1.03;
  const pricingFlexibility = totalTourBudget - lowestRecommendedPrice;
  const hasCustomerRequestedPrice = customerRequestedPrice.trim() !== "";
  const parsedCustomerRequestedPrice = Number(customerRequestedPrice);
  const negotiationComparisonPrice =
    hasCustomerRequestedPrice && !Number.isNaN(parsedCustomerRequestedPrice)
      ? parsedCustomerRequestedPrice
      : totalTourBudget;
  const differenceFromCurrentQuote = negotiationComparisonPrice - totalTourBudget;
  const isCounterofferAcceptable =
    negotiationComparisonPrice >= lowestRecommendedPrice;
  const belowMinimumAmount = lowestRecommendedPrice - negotiationComparisonPrice;
  const negotiationStatusLabel = isCounterofferAcceptable
    ? "🟢 ACCEPTABLE"
    : "🔴 MANAGER APPROVAL REQUIRED";
  const negotiationStatusColorClass = isCounterofferAcceptable
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  function generateQuoteNumber() {
    const nextNumber = savedQuotes.length + 1001;
    return `Q-${nextNumber}`;
  }

  function newQuote() {
    setQuote({
      ...blankQuote,
      id: null,
      quoteNumber: generateQuoteNumber(),
    });
    setCustomerRequestedPrice("");
    setActiveQuoteTab("Pricing Info");
  }

  function validateQuoteHeader() {
    const errors: string[] = [];

    if (!quote.customerName.trim()) {
      errors.push("Customer is required.");
    }

    if (!quote.tourName.trim()) {
      errors.push("Tour Name is required.");
    }

    if (!quote.tourType.trim()) {
      errors.push("Tour Type is required.");
    }

    if (!quote.startDate) {
      errors.push("Start Date is required.");
    }

    if (!quote.endDate) {
      errors.push("End Date is required.");
    }

    if (
      quote.startDate &&
      quote.endDate &&
      new Date(quote.endDate) < new Date(quote.startDate)
    ) {
      errors.push("End Date cannot be before Start Date.");
    }

    if (!quote.quoteStatus.trim()) {
      errors.push("Quote Status is required.");
    }

    return errors;
  }

  function saveQuote() {
    const headerErrors = validateQuoteHeader();

    if (headerErrors.length > 0) {
      alert(`Please fix these items before saving:\n\n- ${headerErrors.join("\n- ")}`);
      return;
    }

    const normalizedQuote = normalizeQuoteRecord(quote);

    const quoteToSave: SavedQuote = {
      ...normalizedQuote,
      id: quote.id ?? Date.now(),
      quoteNumber: quote.quoteNumber || generateQuoteNumber(),
      totalTourBudget,
      savedAt: new Date().toLocaleString(),
    };

    const existingQuote = savedQuotes.find(
      (savedQuote) => savedQuote.id === quoteToSave.id
    );

    if (existingQuote) {
      setSavedQuotes(
        savedQuotes.map((savedQuote) =>
          savedQuote.id === quoteToSave.id ? quoteToSave : savedQuote
        )
      );
    } else {
      setSavedQuotes([...savedQuotes, quoteToSave]);
    }

    setQuote(normalizeQuoteRecord(quoteToSave));
    setActiveQuoteTab("Quote List");
  }

  function editQuote(savedQuote: SavedQuote) {
    setQuote(normalizeQuoteRecord(savedQuote));
    setCustomerRequestedPrice("");
    setActiveQuoteTab("Pricing Info");
  }

  function convertQuoteToTrip(savedQuote: SavedQuote) {
    if (!savedQuote.coachName || !savedQuote.driverName) {
      alert("Quote must have a coach and driver before converting.");
      return;
    }

    if (!savedQuote.startDate || !savedQuote.endDate) {
      alert("Quote must have start and end dates before converting.");
      return;
    }

    setTrips([
      ...trips,
      {
        id: Date.now(),
        tripName: savedQuote.tourName,
        startDate: savedQuote.startDate,
        endDate: savedQuote.endDate,
        coachName: savedQuote.coachName,
        driverName: savedQuote.driverName,
      },
    ]);

    setSavedQuotes(
      savedQuotes.map((q) =>
        q.id === savedQuote.id ? { ...q, quoteStatus: "Accepted" } : q
      )
    );

    alert("Quote converted to trip.");
  }

  const invoiceLines = [
    {
      qty: billedDays,
      uom: "Days",
      description: `${quote.coachName || "Bus / Trailer"} (${
        quote.startDate || "Start"
      } - ${quote.endDate || "End"})`,
      rate: quote.busDayRate,
      total: busTotal,
    },
    {
      qty: driverDays,
      uom: "Days",
      description: `${quote.driverName || "Driver"} (${
        quote.startDate || "Start"
      } - ${quote.endDate || "End"})`,
      rate: quote.driverDayRate,
      total: driverTotal,
    },
    {
      qty: quote.miles,
      uom: "Miles",
      description: "Fuel",
      rate: quote.fuelRate,
      total: fuelTotal,
    },
    {
      qty: perDiemDays,
      uom: "Days",
      description: "Driver Per Diem",
      rate: quote.perDiemRate,
      total: perDiemTotal,
    },
    {
      qty: quote.miles,
      uom: "Miles",
      description: "Main Engine Service",
      rate: quote.mainEngineServiceRate,
      total: mainEngineServiceTotal,
    },
    {
      qty: generatorWeeks,
      uom: "Weeks",
      description: "Generator Service",
      rate: quote.generatorWeeklyRate,
      total: generatorTotal,
    },
    {
      qty: wirelessDays,
      uom: "Days",
      description: "Coach Wireless Service",
      rate: quote.wirelessDailyRate,
      total: wirelessTotal,
    },
    {
      qty: quote.hotelQty,
      uom: "Each",
      description: "Hotel Buyout",
      rate: quote.hotelRate,
      total: hotelTotal,
    },
    {
      qty: 1,
      uom: "Each",
      description: "Payroll Fee",
      rate: quote.payrollFee,
      total: payrollFeeTotal,
    },
    {
      qty: 1,
      uom: "Each",
      description: "Admin Fee",
      rate: quote.adminFee,
      total: adminFeeTotal,
    },
  ];

const selectedCustomer = customers.find(
  (customer) => customer.id === selectedCustomerId
);

useEffect(() => {
  setCustomerNotesDraft(selectedCustomer?.notes || "");
}, [selectedCustomerId, customers]);

function isQuoteLinkedToSelectedCustomer(savedQuote: SavedQuote, customer: Customer) {
  const customerName = savedQuote.customerName.trim().toLowerCase();
  const artistName = customer.artistName.trim().toLowerCase();
  const companyName = customer.companyName.trim().toLowerCase();

  return customerName === artistName || customerName === companyName;
}

const customerQuotes = selectedCustomer
  ? savedQuotes.filter(
      (savedQuote) => isQuoteLinkedToSelectedCustomer(savedQuote, selectedCustomer)
    )
  : [];

const activeCustomerQuotes = customerQuotes.filter(
  (quote) => quote.quoteStatus === "Draft" || quote.quoteStatus === "Sent"
);

const acceptedCustomerQuotes = customerQuotes.filter(
  (quote) => quote.quoteStatus === "Accepted"
);

const rejectedCustomerQuotes = customerQuotes.filter(
  (quote) => quote.quoteStatus === "Rejected"
);

const customerTourNames = new Set(
  customerQuotes.map((customerQuote) => customerQuote.tourName.trim().toLowerCase())
);

const customerActiveTours = selectedCustomer
  ? trips.filter((trip) => {
      const tripNameLower = trip.tripName.trim().toLowerCase();
      const artistNameLower = selectedCustomer.artistName.trim().toLowerCase();
      const companyNameLower = selectedCustomer.companyName.trim().toLowerCase();

      return (
        customerTourNames.has(tripNameLower) ||
        (!!artistNameLower && tripNameLower.includes(artistNameLower)) ||
        (!!companyNameLower && tripNameLower.includes(companyNameLower))
      );
    })
  : [];

const totalCustomerQuoteValue = customerQuotes.reduce(
  (sum, customerQuote) => sum + customerQuote.totalTourBudget,
  0
);
const acceptedCustomerQuoteValue = acceptedCustomerQuotes.reduce(
  (sum, customerQuote) => sum + customerQuote.totalTourBudget,
  0
);
const averageCustomerQuoteValue =
  customerQuotes.length === 0
    ? 0
    : totalCustomerQuoteValue / customerQuotes.length;
const customerLastTourDate = customerActiveTours
  .filter((trip) => !!trip.endDate)
  .sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  )[0]?.endDate;

function mostFrequentValue(values: string[]) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    const normalized = value.trim();
    if (!normalized) return;

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  });

  let mostFrequent = "";
  let maxCount = 0;

  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = value;
    }
  });

  return mostFrequent || "Not tracked yet";
}

const favoriteCoach = mostFrequentValue(
  customerActiveTours.map((trip) => trip.coachName || "")
);
const favoriteDriver = mostFrequentValue(
  customerActiveTours.map((trip) => trip.driverName || "")
);
const favoriteDestination = "Not tracked yet";

const averageTourLengthDays =
  customerActiveTours.length === 0
    ? null
    : customerActiveTours.reduce((sum, trip) => {
        if (!trip.startDate || !trip.endDate) return sum;

        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const daysOut = Math.max(
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
          0
        );

        return sum + daysOut;
      }, 0) / customerActiveTours.length;

const averageTourRevenue =
  acceptedCustomerQuotes.length === 0
    ? null
    : acceptedCustomerQuoteValue / acceptedCustomerQuotes.length;

const totalCustomerTours = customerActiveTours.length;
const totalAcceptedRevenue = acceptedCustomerQuoteValue;

const mostRecentQuote = customerQuotes
  .filter((savedQuote) => !!savedQuote.savedAt)
  .sort(
    (a, b) =>
      new Date(b.savedAt || "").getTime() - new Date(a.savedAt || "").getTime()
  )[0];

const mostCommonTourType = mostFrequentValue(
  customerQuotes.map((savedQuote) => savedQuote.tourType || "")
);

const customerDashboardToday = todayDateOnly();
const dormantThresholdDate = new Date(customerDashboardToday);
dormantThresholdDate.setDate(dormantThresholdDate.getDate() - 180);

function parseValidDate(value: string | undefined) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

const managementCustomers = showArchivedCustomers
  ? customers
  : customers.filter((customer) => customer.status !== "Inactive");

const customerIntelligenceRows = managementCustomers.map((customer) => {
  const matchingQuotes = savedQuotes.filter((savedQuote) =>
    isQuoteLinkedToSelectedCustomer(savedQuote, customer)
  );

  const matchingAcceptedQuotes = matchingQuotes.filter(
    (savedQuote) => savedQuote.quoteStatus === "Accepted"
  );

  const matchingQuoteTourNames = new Set(
    matchingQuotes.map((savedQuote) => savedQuote.tourName.trim().toLowerCase())
  );

  const artistNameLower = customer.artistName.trim().toLowerCase();
  const companyNameLower = customer.companyName.trim().toLowerCase();

  const matchingTours = trips.filter((trip) => {
    const tripNameLower = trip.tripName.trim().toLowerCase();

    return (
      matchingQuoteTourNames.has(tripNameLower) ||
      (!!artistNameLower && tripNameLower.includes(artistNameLower)) ||
      (!!companyNameLower && tripNameLower.includes(companyNameLower))
    );
  });

  const totalQuoteValue = matchingQuotes.reduce(
    (sum, savedQuote) => sum + savedQuote.totalTourBudget,
    0
  );

  const acceptedQuoteValue = matchingAcceptedQuotes.reduce(
    (sum, savedQuote) => sum + savedQuote.totalTourBudget,
    0
  );

  const hasLongTermQuote = matchingQuotes.some(
    (savedQuote) => savedQuote.tourType === "Long Term"
  );
  const hasShortTermQuote = matchingQuotes.some(
    (savedQuote) => savedQuote.tourType === "Short Term"
  );

  const quoteActivityDates = matchingQuotes
    .map((savedQuote) => {
      const endDate = parseValidDate(savedQuote.endDate);
      const startDate = parseValidDate(savedQuote.startDate);
      const savedAtDate = parseValidDate(savedQuote.savedAt);

      return endDate || startDate || savedAtDate;
    })
    .filter((activityDate): activityDate is Date => activityDate !== null);

  const tourActivityDates = matchingTours
    .map((trip) => parseValidDate(trip.endDate) || parseValidDate(trip.startDate))
    .filter((activityDate): activityDate is Date => activityDate !== null);

  const allActivityDates = [...quoteActivityDates, ...tourActivityDates].sort(
    (a, b) => b.getTime() - a.getTime()
  );

  const lastActivityDate = allActivityDates[0] ?? null;
  const daysSinceActivity = lastActivityDate
    ? Math.floor(
        (customerDashboardToday.getTime() - lastActivityDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const lastTourDate = matchingTours
    .map((trip) => parseValidDate(trip.endDate))
    .filter((tripDate): tripDate is Date => tripDate !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    customer,
    matchingQuotes,
    matchingTours,
    totalQuoteValue,
    acceptedQuoteValue,
    quoteCount: matchingQuotes.length,
    tourCount: matchingTours.length,
    hasLongTermQuote,
    hasShortTermQuote,
    lastActivityDate,
    daysSinceActivity,
    lastTourDate,
  };
});

const totalCustomersCount = customers.length;
const longTermCustomersCount = customerIntelligenceRows.filter(
  (row) => row.hasLongTermQuote
).length;
const shortTermCustomersCount = customerIntelligenceRows.filter(
  (row) => row.hasShortTermQuote
).length;
const mixedTourCustomersCount = customerIntelligenceRows.filter(
  (row) => row.hasLongTermQuote && row.hasShortTermQuote
).length;
const repeatCustomersCount = customerIntelligenceRows.filter(
  (row) => row.quoteCount > 1 || row.tourCount > 1
).length;
const dormantCustomersCount = customerIntelligenceRows.filter(
  (row) => !row.lastActivityDate || row.lastActivityDate < dormantThresholdDate
).length;

const topCustomersByValue = [...customerIntelligenceRows]
  .sort((a, b) => b.totalQuoteValue - a.totalQuoteValue)
  .slice(0, 20);

const repeatCustomerRows = customerIntelligenceRows
  .filter((row) => row.quoteCount > 1 || row.tourCount > 1)
  .sort(
    (a, b) => b.quoteCount + b.tourCount - (a.quoteCount + a.tourCount)
  );

const dormantCustomerRows = customerIntelligenceRows
  .filter((row) => !row.lastActivityDate || row.lastActivityDate < dormantThresholdDate)
  .sort((a, b) => {
    const aDays = a.daysSinceActivity ?? Number.MAX_SAFE_INTEGER;
    const bDays = b.daysSinceActivity ?? Number.MAX_SAFE_INTEGER;

    return bDays - aDays;
  });

const longTermOnlyCustomersCount = customerIntelligenceRows.filter(
  (row) => row.hasLongTermQuote && !row.hasShortTermQuote
).length;
const shortTermOnlyCustomersCount = customerIntelligenceRows.filter(
  (row) => row.hasShortTermQuote && !row.hasLongTermQuote
).length;
const mixedTourTypeCustomersCount = customerIntelligenceRows.filter(
  (row) => row.hasLongTermQuote && row.hasShortTermQuote
).length;
const noQuoteHistoryCustomersCount = customerIntelligenceRows.filter(
  (row) => row.quoteCount === 0
).length;

const customerTotalQuoteValueById = new Map<number, number>(
  customerIntelligenceRows.map((row) => [row.customer.id, row.totalQuoteValue])
);

type CustomerQueueFilter =
  | "All"
  | "Prospects"
  | "Follow Up"
  | "High Value"
  | "Repeat"
  | "Dormant";

type CustomerQueueGroupKey =
  | "Prospect"
  | "Follow Up Needed"
  | "High Value Customer"
  | "Repeat Customer"
  | "Dormant Customer";

type CustomerHealthTone = "Priority" | "Strong" | "Healthy" | "Watch" | "At Risk" | "Needs Info";

type CustomerQueueItem = {
  id: string;
  customerId: number;
  filterKey: Exclude<CustomerQueueFilter, "All">;
  groupKey: CustomerQueueGroupKey;
  health: CustomerHealthTone;
  customer: string;
  company: string;
  reason: string;
  lastActivity: string;
  sortDate: number;
  onOpen: () => void;
};

const prospectRows: CustomerQueueItem[] = customerIntelligenceRows
  .filter((row) => row.acceptedQuoteValue === 0 || row.quoteCount === 0)
  .map((row) => ({
    id: `customer-prospect-${row.customer.id}`,
    customerId: row.customer.id,
    filterKey: "Prospects",
    groupKey: "Prospect",
    health: "Watch",
    customer: row.customer.artistName || "Unknown Customer",
    company: row.customer.companyName || "No company",
    reason: row.quoteCount === 0 ? "No quote history yet" : "No accepted tours yet",
    lastActivity: row.lastActivityDate ? row.lastActivityDate.toISOString().slice(0, 10) : "Not tracked yet",
    sortDate: row.lastActivityDate ? row.lastActivityDate.getTime() : 0,
    onOpen: () => openCustomerDetails(row.customer.id),
  }));

const followUpRows: CustomerQueueItem[] = customerIntelligenceRows
  .filter((row) => row.matchingQuotes.some((savedQuote) => savedQuote.quoteStatus === "Sent"))
  .map((row) => ({
    id: `customer-follow-up-${row.customer.id}`,
    customerId: row.customer.id,
    filterKey: "Follow Up",
    groupKey: "Follow Up Needed",
    health: "Priority",
    customer: row.customer.artistName || "Unknown Customer",
    company: row.customer.companyName || "No company",
    reason: "Pending quote response",
    lastActivity: row.lastActivityDate ? row.lastActivityDate.toISOString().slice(0, 10) : "Not tracked yet",
    sortDate: row.lastActivityDate ? row.lastActivityDate.getTime() : 0,
    onOpen: () => openCustomerDetails(row.customer.id),
  }));

const highValueRows: CustomerQueueItem[] = [...topCustomersByValue]
  .filter((row) => row.totalQuoteValue > 0)
  .slice(0, 20)
  .map((row) => ({
    id: `customer-high-value-${row.customer.id}`,
    customerId: row.customer.id,
    filterKey: "High Value",
    groupKey: "High Value Customer",
    health: "Strong",
    customer: row.customer.artistName || "Unknown Customer",
    company: row.customer.companyName || "No company",
    reason: `Portfolio value ${money(row.totalQuoteValue)}`,
    lastActivity: row.lastActivityDate ? row.lastActivityDate.toISOString().slice(0, 10) : "Not tracked yet",
    sortDate: row.totalQuoteValue,
    onOpen: () => openCustomerDetails(row.customer.id),
  }));

const repeatRows: CustomerQueueItem[] = repeatCustomerRows.map((row) => ({
  id: `customer-repeat-${row.customer.id}`,
  customerId: row.customer.id,
  filterKey: "Repeat",
  groupKey: "Repeat Customer",
  health: "Healthy",
  customer: row.customer.artistName || "Unknown Customer",
  company: row.customer.companyName || "No company",
  reason: `${row.quoteCount} quotes · ${row.tourCount} tours`,
  lastActivity: row.lastActivityDate ? row.lastActivityDate.toISOString().slice(0, 10) : "Not tracked yet",
  sortDate: row.quoteCount + row.tourCount,
  onOpen: () => openCustomerDetails(row.customer.id),
}));

const dormantRows: CustomerQueueItem[] = dormantCustomerRows.map((row) => ({
  id: `customer-dormant-${row.customer.id}`,
  customerId: row.customer.id,
  filterKey: "Dormant",
  groupKey: "Dormant Customer",
  health: "At Risk",
  customer: row.customer.artistName || "Unknown Customer",
  company: row.customer.companyName || "No company",
  reason: "No customer activity in 180+ days",
  lastActivity: row.lastActivityDate ? row.lastActivityDate.toISOString().slice(0, 10) : "Not tracked yet",
  sortDate: row.daysSinceActivity ?? Number.MAX_SAFE_INTEGER,
  onOpen: () => openCustomerDetails(row.customer.id),
}));

const customerWorkspaceQueueRows: CustomerQueueItem[] = [
  ...prospectRows,
  ...followUpRows,
  ...highValueRows,
  ...repeatRows,
  ...dormantRows,
];

const filteredCustomerWorkspaceQueueRows =
  customerIntelligenceFilter === "All"
    ? customerWorkspaceQueueRows
    : customerWorkspaceQueueRows.filter(
        (row) => row.filterKey === (customerIntelligenceFilter as Exclude<CustomerQueueFilter, "All">)
      );

const customerQueueGroupOrder: CustomerQueueGroupKey[] = [
  "Prospect",
  "Follow Up Needed",
  "High Value Customer",
  "Repeat Customer",
  "Dormant Customer",
];

const customerQueueCounts = customerWorkspaceQueueRows.reduce(
  (counts, row) => {
    counts[row.groupKey] += 1;
    return counts;
  },
  {
    Prospect: 0,
    "Follow Up Needed": 0,
    "High Value Customer": 0,
    "Repeat Customer": 0,
    "Dormant Customer": 0,
  } as Record<CustomerQueueGroupKey, number>
);

const customerFilterToGroupKey: Record<Exclude<CustomerQueueFilter, "All">, CustomerQueueGroupKey> = {
  Prospects: "Prospect",
  "Follow Up": "Follow Up Needed",
  "High Value": "High Value Customer",
  "Repeat": "Repeat Customer",
  "Dormant": "Dormant Customer",
};

const customerQueueGroupsToRender: CustomerQueueGroupKey[] =
  customerIntelligenceFilter === "All"
    ? customerQueueGroupOrder.filter((groupKey) => customerQueueCounts[groupKey] > 0)
    : [customerFilterToGroupKey[customerIntelligenceFilter as Exclude<CustomerQueueFilter, "All">]];

const customerGroupedQueueRows = customerQueueGroupsToRender.map((groupKey) => ({
  groupKey,
  rows: filteredCustomerWorkspaceQueueRows
    .filter((row) => row.groupKey === groupKey)
    .sort((a, b) => b.sortDate - a.sortDate),
}));

const customerWorkspaceRowsForActiveFilter = [...filteredCustomerWorkspaceQueueRows].sort(
  (a, b) => b.sortDate - a.sortDate
);

const customerHealthCounts = customerWorkspaceQueueRows.reduce(
  (counts, row) => {
    counts[row.health] += 1;
    return counts;
  },
  {
    Priority: 0,
    Strong: 0,
    Healthy: 0,
    Watch: 0,
    "At Risk": 0,
    "Needs Info": 0,
  } as Record<CustomerHealthTone, number>
);

const customerContacts: CustomerContact[] = selectedCustomer
  ? selectedCustomer.contacts
    ? selectedCustomer.contacts
    : [
        selectedCustomer.managerEmail
          ? {
              id: -1,
              name: "Management Contact",
              role: "Manager",
              email: selectedCustomer.managerEmail,
              phone: "",
              isPrimaryBilling: false,
              isPrimaryOperations: true,
            }
          : null,
        selectedCustomer.apEmail
          ? {
              id: -2,
              name: "AP Contact",
              role: "AP",
              email: selectedCustomer.apEmail,
              phone: "",
              isPrimaryBilling: true,
              isPrimaryOperations: false,
            }
          : null,
      ].filter((contact): contact is CustomerContact => contact !== null)
  : [];

const customerDraftQuotes = customerQuotes.filter(
  (quoteRecord) => quoteRecord.quoteStatus === "Draft"
);
const customerSentQuotes = customerQuotes.filter(
  (quoteRecord) => quoteRecord.quoteStatus === "Sent"
);

const customerHasLongTermQuotes = customerQuotes.some(
  (quoteRecord) => quoteRecord.tourType === "Long Term"
);
const customerHasShortTermQuotes = customerQuotes.some(
  (quoteRecord) => quoteRecord.tourType === "Short Term"
);

const customerTypeLabel =
  customerQuotes.length === 0
    ? "No Quote History"
    : customerHasLongTermQuotes && customerHasShortTermQuotes
    ? "Mixed"
    : customerHasLongTermQuotes
    ? "Long Term"
    : "Short Term";

const primaryManagerContact = customerContacts.find(
  (contact) => contact.isPrimaryOperations || contact.role === "Manager"
);
const primaryAPContact = customerContacts.find(
  (contact) => contact.isPrimaryBilling || contact.role === "AP"
);

const customerProfileToday = todayDateOnly();
const customerActiveToursOnly = customerActiveTours.filter((trip) =>
  isTodayBetween(trip.startDate, trip.endDate)
);
const customerUpcomingTours = customerActiveTours
  .filter((trip) => {
    const startDate = parseValidDate(trip.startDate);
    return !!startDate && startDate.getTime() > customerProfileToday.getTime();
  })
  .sort(
    (a, b) =>
      new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime()
  );
const customerCompletedTours = customerActiveTours
  .filter((trip) => {
    const endDate = parseValidDate(trip.endDate);
    return !!endDate && endDate.getTime() < customerProfileToday.getTime();
  })
  .sort(
    (a, b) =>
      new Date(b.endDate || "").getTime() - new Date(a.endDate || "").getTime()
  );

const customerAverageRevenuePerTour =
  customerActiveTours.length === 0
    ? null
    : acceptedCustomerQuoteValue / customerActiveTours.length;

const latestCustomerQuoteActivityDate = customerQuotes
  .map(
    (quoteRecord) =>
      parseValidDate(quoteRecord.savedAt) ||
      parseValidDate(quoteRecord.endDate) ||
      parseValidDate(quoteRecord.startDate)
  )
  .filter((activityDate): activityDate is Date => activityDate !== null)
  .sort((a, b) => b.getTime() - a.getTime())[0];

const customerHasRecentQuoteActivity =
  !!latestCustomerQuoteActivityDate &&
  latestCustomerQuoteActivityDate.getTime() >=
    customerProfileToday.getTime() - 180 * 24 * 60 * 60 * 1000;

const hasPrimaryBillingContact = customerContacts.some(
  (contact) => contact.isPrimaryBilling
);
const hasPrimaryOperationsContact = customerContacts.some(
  (contact) => contact.isPrimaryOperations
);
const hasBusinessRulesSaved = false;

const customerHealthPenalties = [
  {
    applies: acceptedCustomerQuotes.length === 0,
    points: 20,
    reason: "No accepted quotes",
  },
  {
    applies: activeCustomerQuotes.length > 0 && acceptedCustomerQuotes.length === 0,
    points: 15,
    reason: "Open quotes without accepted business",
  },
  {
    applies: customerContacts.length === 0,
    points: 15,
    reason: "No contacts on file",
  },
  {
    applies: !hasPrimaryBillingContact,
    points: 10,
    reason: "Needs primary billing contact",
  },
  {
    applies: !hasPrimaryOperationsContact,
    points: 10,
    reason: "Needs primary operations contact",
  },
  {
    applies: !customerHasRecentQuoteActivity,
    points: 10,
    reason: "No recent activity",
  },
  {
    applies: !selectedCustomer?.notes.trim(),
    points: 10,
    reason: "No notes added",
  },
  {
    applies: customerQuotes.length > 0 && !hasBusinessRulesSaved,
    points: 10,
    reason: "Quote operations details not set",
  },
];

const customerHealthScore = Math.max(
  0,
  Math.min(
    100,
    100 -
      customerHealthPenalties.reduce(
        (sum, penalty) => (penalty.applies ? sum + penalty.points : sum),
        0
      )
  )
);

const customerHealthLabel =
  customerHealthScore >= 85
    ? "Strong"
    : customerHealthScore >= 70
    ? "Healthy"
    : customerHealthScore >= 50
    ? "Watch"
    : "At Risk";

const customerHealthBadgeClass =
  customerHealthLabel === "Strong"
    ? "bg-emerald-700 text-white"
    : customerHealthLabel === "Healthy"
    ? "bg-slate-700 text-white"
    : customerHealthLabel === "Watch"
    ? "bg-amber-600 text-white"
    : "bg-red-700 text-white";

const customerHealthReasons = customerHealthPenalties
  .filter((penalty) => penalty.applies)
  .map((penalty) => penalty.reason)
  .slice(0, 3);

const customerFixNextCards = customerHealthReasons.map((reason) => {
  if (reason === "Needs primary billing contact") {
    return {
      reason,
      action: "Add billing contact",
      targetTab: "Contacts" as const,
      buttonLabel: "Go to Contacts",
    };
  }

  if (reason === "Needs primary operations contact") {
    return {
      reason,
      action: "Add operations contact",
      targetTab: "Contacts" as const,
      buttonLabel: "Go to Contacts",
    };
  }

  if (reason === "Quote operations details not set") {
    return {
      reason,
      action: "Add operations details on quote",
      targetTab: "Quotes" as const,
      buttonLabel: "Go to Quotes",
    };
  }

  if (reason === "No recent activity") {
    return {
      reason,
      action: "Review customer activity",
      targetTab: "Timeline" as const,
      buttonLabel: "Go to Timeline",
    };
  }

  if (reason === "No notes added") {
    return {
      reason,
      action: "Add customer note",
      targetTab: "Notes" as const,
      buttonLabel: "Go to Notes",
    };
  }

  if (reason === "No contacts on file") {
    return {
      reason,
      action: "Add contact",
      targetTab: "Contacts" as const,
      buttonLabel: "Go to Contacts",
    };
  }

  if (reason === "No accepted quotes") {
    return {
      reason,
      action: "Review quote pipeline",
      targetTab: "Quotes" as const,
      buttonLabel: "Go to Quotes",
    };
  }

  if (reason === "Open quotes without accepted business") {
    return {
      reason,
      action: "Follow up on open quotes",
      targetTab: "Quotes" as const,
      buttonLabel: "Go to Quotes",
    };
  }

  return {
    reason,
    action: "Review customer profile",
    targetTab: null,
    buttonLabel: "",
  };
});

const customerRiskItems = [
  !(selectedCustomer?.managerEmail || "").trim()
    ? "Missing manager email"
    : null,
  !(selectedCustomer?.apEmail || "").trim() ? "Missing AP email" : null,
  customerContacts.length === 0 ? "No contacts on file" : null,
  acceptedCustomerQuotes.length === 0 ? "No accepted quotes yet" : null,
].filter((item): item is string => item !== null);

const customerRecentActivityPreview = [
  mostRecentQuote
    ? `Quote ${mostRecentQuote.quoteNumber || "-"} saved ${
        mostRecentQuote.savedAt || ""
      }`
    : null,
  customerUpcomingTours[0]
    ? `Upcoming tour ${customerUpcomingTours[0].tripName || "-"} starts ${
        customerUpcomingTours[0].startDate || "-"
      }`
    : null,
  customerActiveToursOnly[0]
    ? `Active tour ${customerActiveToursOnly[0].tripName || "-"}`
    : null,
].filter((item): item is string => item !== null);

const customerTimelineItems = [
  ...customerQuotes
    .filter((quoteRecord) => !!quoteRecord.savedAt)
    .map((quoteRecord) => ({
      timestamp: new Date(quoteRecord.savedAt || "").getTime(),
      title: `Quote ${quoteRecord.quoteNumber || "-"} saved`,
      detail: quoteRecord.tourName || "No tour name",
    })),
  ...acceptedCustomerQuotes
    .filter((quoteRecord) => !!quoteRecord.savedAt)
    .map((quoteRecord) => ({
      timestamp: new Date(quoteRecord.savedAt || "").getTime(),
      title: `Quote ${quoteRecord.quoteNumber || "-"} accepted`,
      detail: quoteRecord.tourName || "No tour name",
    })),
  ...customerActiveTours.map((trip) => ({
    timestamp:
      parseValidDate(trip.startDate)?.getTime() || parseValidDate(trip.endDate)?.getTime() || 0,
    title: `Tour ${trip.tripName || "-"} ${
      isTodayBetween(trip.startDate, trip.endDate) ? "active" : "scheduled"
    }`,
    detail: `${trip.startDate || "-"} - ${trip.endDate || "-"}`,
  })),
]
  .filter((timelineItem) => timelineItem.timestamp > 0)
  .sort((a, b) => b.timestamp - a.timestamp)
  .slice(0, 20);

const customerDirectorySearchValue = customerDirectorySearchTerm
  .trim()
  .toLowerCase();

const filteredCustomerDirectoryCustomers = managementCustomers
  .filter((customer) => {
    if (!customerDirectorySearchValue) return true;

    return (
      customer.artistName.toLowerCase().includes(customerDirectorySearchValue) ||
      customer.companyName.toLowerCase().includes(customerDirectorySearchValue) ||
      customer.managerEmail.toLowerCase().includes(customerDirectorySearchValue) ||
      customer.apEmail.toLowerCase().includes(customerDirectorySearchValue) ||
      customer.status.toLowerCase().includes(customerDirectorySearchValue)
    );
  })
  .slice(0, 10);

const quoteCustomerSearchValue = quoteCustomerSearchTerm.trim().toLowerCase();

const filteredQuoteCustomers = managementCustomers
  .filter((customer) => {
    if (!quoteCustomerSearchValue) return true;

    return (
      customer.artistName.toLowerCase().includes(quoteCustomerSearchValue) ||
      customer.companyName.toLowerCase().includes(quoteCustomerSearchValue)
    );
  })
  .slice(0, 10);

const quoteListSearchValue = quoteListSearchTerm.trim().toLowerCase();

const filteredQuoteListQuotes = savedQuotes.filter((savedQuote) => {
  const matchesSearch = !quoteListSearchValue
    ? true
    : [savedQuote.quoteNumber, savedQuote.customerName, savedQuote.tourName, savedQuote.quoteStatus]
        .filter((value): value is string => !!value)
        .some((value) => value.toLowerCase().includes(quoteListSearchValue));

  const matchesStatus =
    quoteListStatusFilter === "All" || savedQuote.quoteStatus === quoteListStatusFilter;

  return matchesSearch && matchesStatus;
});

const isQuoteWorkspaceListView = activeQuoteTab === "Quote List";

const quoteWorkspaceSavedQuote =
  quote.id === null
    ? null
    : savedQuotes.find((savedQuote) => savedQuote.id === quote.id) ?? null;

const quoteWorkspaceCustomer = managementCustomers.find((customer) => {
  const displayName = getCustomerDisplayName(customer).trim().toLowerCase();
  const companyName = customer.companyName.trim().toLowerCase();
  const quoteCustomerName = quote.customerName.trim().toLowerCase();

  return quoteCustomerName !== "" && (displayName === quoteCustomerName || companyName === quoteCustomerName);
});

const quoteWorkspaceContacts: Array<{ label: string; value: string }> = quoteWorkspaceCustomer
  ? quoteWorkspaceCustomer.contacts && quoteWorkspaceCustomer.contacts.length > 0
    ? quoteWorkspaceCustomer.contacts.map((contact) => ({
        label: contact.role,
        value: `${contact.name}${contact.email ? ` · ${contact.email}` : ""}`,
      }))
    : [
        quoteWorkspaceCustomer.managerEmail
          ? { label: "Manager", value: quoteWorkspaceCustomer.managerEmail }
          : null,
        quoteWorkspaceCustomer.apEmail
          ? { label: "AP", value: quoteWorkspaceCustomer.apEmail }
          : null,
      ].filter((contact): contact is { label: string; value: string } => contact !== null)
  : [];

const quoteWorkspacePrimaryContact = quoteWorkspaceCustomer?.contacts?.find(
  (contact) => contact.isPrimaryOperations || contact.role === "Manager"
) ?? quoteWorkspaceCustomer?.contacts?.[0] ?? null;

const quoteWorkspacePrimaryContactName =
  quoteWorkspacePrimaryContact?.name ||
  (quoteWorkspaceCustomer ? getCustomerDisplayName(quoteWorkspaceCustomer) : "Not captured");

const quoteWorkspacePrimaryContactPhone =
  quoteWorkspacePrimaryContact?.phone || "Not captured in current customer fields";

const quoteWorkspacePrimaryContactEmail =
  quoteWorkspacePrimaryContact?.email ||
  quoteWorkspaceCustomer?.managerEmail ||
  quoteWorkspaceCustomer?.apEmail ||
  "Not captured in current customer fields";

const quoteWorkspaceCoach = coaches.find((coach) => coach.coachName === quote.coachName);
const quoteWorkspaceDriver = drivers.find(
  (driver) => getDriverFullName(driver) === quote.driverName
);

const quoteWorkspaceMatchedTrip = trips.find(
  (trip) =>
    trip.tripName === quote.tourName &&
    trip.startDate === quote.startDate &&
    trip.endDate === quote.endDate
);

const quoteWorkspaceSpecialRequirements = [
  quote.useDeadhead ? "Deadhead included" : null,
  quote.generatorWeeklyRate > 0 ? "Generator pricing included" : null,
  quote.wirelessDailyRate > 0 ? "Wireless service included" : null,
  quote.hotelQty > 0 ? "Hotel buyout included" : null,
].filter((item): item is string => item !== null);

const quoteWorkspaceRoutingSummary =
  quote.miles > 0
    ? `${quote.miles.toFixed(0)} estimated miles${quote.useDeadhead ? " with deadhead" : ""}`
    : "Routing details are not captured in current quote fields.";

const quoteWorkspaceOrigin =
  quoteWorkspaceCoach?.currentLocation || quoteWorkspaceDriver?.homeBase || "Not captured";

const quoteWorkspaceDestination = quoteWorkspaceMatchedTrip
  ? quoteWorkspaceMatchedTrip.tripName
  : "Not captured in current quote fields";

const quoteWorkspacePassengerCount = "Not captured in current quote fields";

const totalCoachesNeeded = quote.coachNeeds.reduce(
  (sum, coachNeed) => sum + coachNeed.quantity,
  0
);

const coachNeedTypeSummary = coachTypeOptions
  .map((coachType) => {
    const quantity = quote.coachNeeds
      .filter((coachNeed) => coachNeed.coachType === coachType)
      .reduce((sum, coachNeed) => sum + coachNeed.quantity, 0);

    return quantity > 0 ? `${quantity} ${coachType}` : null;
  })
  .filter((line): line is string => line !== null);

const totalDriversNeeded = quote.driverNeeds.reduce(
  (sum, driverNeed) => sum + driverNeed.quantity,
  0
);

const driverNeedRoleSummary = driverRoleOptions
  .map((driverRole) => {
    const quantity = quote.driverNeeds
      .filter((driverNeed) => driverNeed.driverRole === driverRole)
      .reduce((sum, driverNeed) => sum + driverNeed.quantity, 0);

    if (quantity === 0) return null;

    if (driverRole === "Primary Driver") {
      return `${quantity} ${quantity === 1 ? "Primary Driver" : "Primary Drivers"}`;
    }

    return `${quantity} ${quantity === 1 ? "Co-Driver" : "Co-Drivers"}`;
  })
  .filter((line): line is string => line !== null);

const quoteWorkspaceCurrentStage = quoteWorkspaceMatchedTrip
  ? "Booked"
  : quote.quoteStatus === "Accepted"
  ? quote.coachName || quote.driverName
    ? "Ready for Operations"
    : "Deposit Needed"
  : quote.quoteStatus === "Sent"
  ? "Awaiting Response"
  : quote.quoteStatus === "Rejected"
  ? "Draft"
  : "Draft";

const quoteWorkspaceWorkflowStages = [
  "Draft",
  "Sent",
  "Awaiting Response",
  "Deposit Needed",
  "Ready for Operations",
  "Booked",
] as const;

const quoteWorkspaceActivityTimeline = [
  quoteWorkspaceSavedQuote?.savedAt
    ? { label: "Last saved", value: quoteWorkspaceSavedQuote.savedAt }
    : { label: "Workspace", value: "Draft not saved yet" },
  { label: "Status", value: quote.quoteStatus },
  { label: "Quote owner", value: quote.salesperson || "Current User" },
  {
    label: "Trip setup",
    value: quoteWorkspaceMatchedTrip ? "Trip created from quote" : "No trip created yet",
  },
];

const draftQuotes = savedQuotes.filter((q) => q.quoteStatus === "Draft");
const sentQuotes = savedQuotes.filter((q) => q.quoteStatus === "Sent");
const acceptedQuotes = savedQuotes.filter((q) => q.quoteStatus === "Accepted");
const rejectedQuotes = savedQuotes.filter((q) => q.quoteStatus === "Rejected");
const totalOpenQuoteValue = [...draftQuotes, ...sentQuotes].reduce(
  (sum, q) => sum + q.totalTourBudget,
  0
);

const leasingAlertItems: Array<{
  type: "Draft Quote" | "Awaiting Response" | "Accepted Needs Setup" | "Collect Deposit";
  message: string;
  quote: SavedQuote;
}> = [];

draftQuotes.forEach((quote) => {
  leasingAlertItems.push({
    type: "Draft Quote",
    message: `${quote.quoteNumber}: Quote is still in draft.`,
    quote,
  });
});

sentQuotes.forEach((quote) => {
  leasingAlertItems.push({
    type: "Awaiting Response",
    message: `${quote.quoteNumber}: Quote sent and awaiting customer response.`,
    quote,
  });
});

acceptedQuotes.forEach((quote) => {
  leasingAlertItems.push({
    type: "Collect Deposit",
    message: `${quote.quoteNumber}: Deposit not received.`,
    quote,
  });

  const hasTourSetup = trips.some(
    (trip) =>
      trip.tripName === quote.tourName &&
      trip.startDate === quote.startDate &&
      trip.endDate === quote.endDate
  );

  if (!hasTourSetup) {
    leasingAlertItems.push({
      type: "Accepted Needs Setup",
      message: `${quote.quoteNumber}: Accepted quote needs tour setup.`,
      quote,
    });
  }
});

const today = todayDateOnly();
const weekFromToday = new Date(today);
weekFromToday.setDate(weekFromToday.getDate() + 7);
weekFromToday.setHours(23, 59, 59, 999);

const upcomingTourStarts = trips.filter((trip) => {
  if (!trip.startDate) return false;

  const start = new Date(trip.startDate);
  start.setHours(0, 0, 0, 0);

  return start >= today && start <= weekFromToday;
});

const quotesWaitingOnCustomerCount = leasingAlertItems.filter(
  (alert) => alert.type === "Awaiting Response"
).length;
const acceptedNeedsSetupCount = leasingAlertItems.filter(
  (alert) => alert.type === "Accepted Needs Setup"
).length;
const draftQuotesNeedingReviewCount = leasingAlertItems.filter(
  (alert) => alert.type === "Draft Quote"
).length;
const collectDepositCount = leasingAlertItems.filter(
  (alert) => alert.type === "Collect Deposit"
).length;
const toursStartingSoonCount = upcomingTourStarts.length;

const monthFromToday = new Date(today);
monthFromToday.setMonth(monthFromToday.getMonth() + 1);
monthFromToday.setHours(23, 59, 59, 999);

const openQuotes = [...draftQuotes, ...sentQuotes];
const quotesClosingThisWeekCount = openQuotes.filter((quote) => {
  if (!quote.endDate) return false;

  const closeDate = new Date(quote.endDate);
  closeDate.setHours(0, 0, 0, 0);

  return closeDate >= today && closeDate <= weekFromToday;
}).length;

const quotesClosingThisMonthCount = openQuotes.filter((quote) => {
  if (!quote.endDate) return false;

  const closeDate = new Date(quote.endDate);
  closeDate.setHours(0, 0, 0, 0);

  return closeDate >= today && closeDate <= monthFromToday;
}).length;

const averageQuoteValue =
  savedQuotes.length > 0
    ? savedQuotes.reduce((sum, quote) => sum + quote.totalTourBudget, 0) /
      savedQuotes.length
    : 0;

const averageDaysToClose =
  acceptedQuotes.length > 0
    ? acceptedQuotes.reduce((sum, quote) => {
        if (!quote.endDate) return sum;

        const savedAtTime = new Date(quote.savedAt).getTime();
        const closeTime = new Date(quote.endDate).getTime();

        if (Number.isNaN(savedAtTime) || Number.isNaN(closeTime)) return sum;

        return sum + Math.max(Math.ceil((closeTime - savedAtTime) / (1000 * 60 * 60 * 24)), 0);
      }, 0) / acceptedQuotes.length
    : 0;

const acceptanceRate =
  savedQuotes.length > 0 ? (acceptedQuotes.length / savedQuotes.length) * 100 : 0;

const acceptedRevenue = acceptedQuotes.reduce(
  (sum, quote) => sum + quote.totalTourBudget,
  0
);

const rejectedRevenue = rejectedQuotes.reduce(
  (sum, quote) => sum + quote.totalTourBudget,
  0
);

const toursAwaitingDepositCount = collectDepositCount;

const averageDaysWaitingOnCustomer =
  sentQuotes.length > 0
    ? sentQuotes.reduce((sum, quote) => {
        const savedAtTime = new Date(quote.savedAt).getTime();

        if (Number.isNaN(savedAtTime)) return sum;

        return (
          sum +
          Math.max(
            Math.ceil((today.getTime() - savedAtTime) / (1000 * 60 * 60 * 24)),
            0
          )
        );
      }, 0) / sentQuotes.length
    : 0;

const largestOpenQuoteValue = openQuotes.reduce(
  (maxValue, quote) => Math.max(maxValue, quote.totalTourBudget),
  0
);

const sortedUpcomingTourStarts = [...upcomingTourStarts].sort((a, b) => {
  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
});

const displayedUpcomingTourStarts = sortedUpcomingTourStarts.slice(0, 5);
const upcomingStartsOverflowCount = Math.max(sortedUpcomingTourStarts.length - 5, 0);

type LeasingQueueSeverity = "Critical" | "High" | "Medium" | "Completed";
type LeasingProblemType =
  | "Draft Quotes"
  | "Awaiting Customer Response"
  | "Collect Deposit"
  | "Accepted Quotes Ready for Operations"
  | "Tour Ready";

type LeasingQueueItem = {
  id: string;
  severity: LeasingQueueSeverity;
  problemType: LeasingProblemType;
  task: string;
  customer: string;
  reason: string;
  due: string;
  onOpen: () => void;
  sortDate: number;
};

const formatLeasingDate = (dateValue: string | Date | null | undefined) => {
  if (!dateValue) return "-";

  const parsedDate = typeof dateValue === "string" ? new Date(dateValue) : dateValue;

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const leasingQueueRows: LeasingQueueItem[] = [
  ...leasingAlertItems.map<LeasingQueueItem>((alert, index) => {
    const severity: LeasingQueueSeverity =
      alert.type === "Accepted Needs Setup"
        ? "Critical"
        : alert.type === "Awaiting Response"
        ? "High"
        : "Medium";

    const task =
      alert.type === "Collect Deposit"
        ? "Collect Deposit"
        : alert.type === "Awaiting Response"
        ? "Awaiting Customer Response"
        : alert.type === "Accepted Needs Setup"
        ? "Accepted Quotes Ready for Operations"
        : "Draft Quote";

    const problemType: LeasingProblemType =
      alert.type === "Collect Deposit"
        ? "Collect Deposit"
        : alert.type === "Awaiting Response"
        ? "Awaiting Customer Response"
        : alert.type === "Accepted Needs Setup"
        ? "Accepted Quotes Ready for Operations"
        : "Draft Quotes";

    return {
      id: `queue-${alert.quote.id ?? alert.quote.quoteNumber}-${index}`,
      severity,
      task,
      problemType,
      customer: alert.quote.customerName || alert.quote.tourName || "No customer",
      reason:
        alert.type === "Collect Deposit"
          ? "Deposit not received"
          : alert.type === "Awaiting Response"
          ? "Quote sent and awaiting customer response"
          : alert.type === "Accepted Needs Setup"
          ? "Accepted quote needs tour setup"
          : "Quote is still in draft",
      due:
        alert.type === "Awaiting Response"
          ? "Due Today"
          : alert.type === "Draft Quote"
          ? "Review Today"
          : alert.type === "Accepted Needs Setup" || alert.type === "Collect Deposit"
          ? "Due Today"
          : "Due Today",
      onOpen: () => editQuote(alert.quote),
      sortDate: new Date(alert.quote.savedAt || today).getTime(),
    };
  }),
  ...sortedUpcomingTourStarts
    .filter((trip) => trip.coachName && trip.driverName)
    .slice(0, 4)
    .map((trip, index) => ({
      id: `queue-tour-${trip.id}-${index}`,
      severity: "Completed" as LeasingQueueSeverity,
      problemType: "Tour Ready" as LeasingProblemType,
      task: "Tour Ready",
      customer: trip.tripName,
      reason: `${trip.coachName} and ${trip.driverName} assigned`,
      due: `Start ${formatLeasingDate(trip.startDate)}`,
      onOpen: () => setActivePage("Calendar"),
      sortDate: new Date(trip.startDate || today).getTime(),
    })),
].sort((a, b) => b.sortDate - a.sortDate);

const filteredLeasingQueueRows =
  leasingAttentionFilter === "All"
    ? leasingQueueRows
    : leasingQueueRows.filter((row) => row.problemType === leasingAttentionFilter);

const leasingProblemOrder: LeasingProblemType[] = [
  "Draft Quotes",
  "Awaiting Customer Response",
  "Collect Deposit",
  "Accepted Quotes Ready for Operations",
  "Tour Ready",
];

const leasingGroupsToRender =
  leasingAttentionFilter === "All"
    ? leasingProblemOrder
    : [leasingAttentionFilter];

const leasingGroupedQueueRows = leasingGroupsToRender.map((groupKey) => ({
  groupKey,
  rows: filteredLeasingQueueRows.filter((row) => row.problemType === groupKey),
}));

type LeasingKanbanStage = LeasingStageTab;

type LeasingKanbanCard = {
  id: string;
  quote: SavedQuote;
  stage: LeasingKanbanStage;
  reason: string;
  due: string;
};

const sortedQuotesForLeasingBoard = [...savedQuotes].sort((a, b) => {
  const aSaved = new Date(a.savedAt || "").getTime();
  const bSaved = new Date(b.savedAt || "").getTime();

  if (!Number.isNaN(aSaved) && !Number.isNaN(bSaved)) {
    return bSaved - aSaved;
  }

  return (b.id ?? 0) - (a.id ?? 0);
});

const leasingKanbanCards: LeasingKanbanCard[] = sortedQuotesForLeasingBoard
  .map((quote, index) => {
    const matchingTrip = trips.find(
      (trip) =>
        trip.tripName === quote.tourName &&
        trip.startDate === quote.startDate &&
        trip.endDate === quote.endDate
    );

    if (quote.quoteStatus === "Rejected") return null;

    if (quote.quoteStatus === "Draft") {
      return {
        id: `kanban-draft-${quote.id ?? quote.quoteNumber}-${index}`,
        quote,
        stage: "Draft Quotes" as LeasingKanbanStage,
        reason: "Quote is still in draft",
        due: "Review Today",
      };
    }

    if (quote.quoteStatus === "Sent") {
      return {
        id: `kanban-awaiting-${quote.id ?? quote.quoteNumber}-${index}`,
        quote,
        stage: "Awaiting Customer Response" as LeasingKanbanStage,
        reason: "Awaiting customer response",
        due: "Due Today",
      };
    }

    if (matchingTrip) {
      return {
        id: `kanban-booked-${quote.id ?? quote.quoteNumber}-${index}`,
        quote,
        stage: "Booked / Tour Ready" as LeasingKanbanStage,
        reason: matchingTrip.coachName && matchingTrip.driverName ? "Trip created and fully assigned" : "Trip created from accepted quote",
        due: `Starts ${formatLeasingDate(matchingTrip.startDate)}`,
      };
    }

    // TODO: Replace placeholder deposit logic with real depositReceived field when billing workflow is built.
    const usesDepositPlaceholderLogic = true;
    const demoReadyForOperations = !!(quote.coachName || quote.driverName);

    if (quote.coachName || quote.driverName) {
      return {
        id: `kanban-ready-ops-${quote.id ?? quote.quoteNumber}-${index}`,
        quote,
        stage: "Ready for Operations" as LeasingKanbanStage,
        reason: "Accepted quote staged for operations handoff",
        due: "Due Today",
      };
    }

    return {
      id: `kanban-deposit-${quote.id ?? quote.quoteNumber}-${index}`,
      quote,
      stage:
        usesDepositPlaceholderLogic && demoReadyForOperations
          ? ("Ready for Operations" as LeasingKanbanStage)
          : ("Collect Deposit" as LeasingKanbanStage),
      reason:
        usesDepositPlaceholderLogic && demoReadyForOperations
          ? "Accepted quote ready for operations handoff"
          : "Accepted quote needs deposit follow-up",
      due: "Due Today",
    };
  })
  .filter((card): card is LeasingKanbanCard => card !== null);

const leasingKanbanStageOrder: LeasingKanbanStage[] = [
  "Draft Quotes",
  "Awaiting Customer Response",
  "Collect Deposit",
  "Ready for Operations",
  "Booked / Tour Ready",
];

const leasingKanbanColumns = leasingKanbanStageOrder.map((stageKey) => ({
  stageKey,
  cards: leasingKanbanCards.filter((card) => card.stage === stageKey),
}));

const activeLeasingQueueRows = leasingKanbanColumns.find(
  (column) => column.stageKey === activeLeasingStageTab
)?.cards ?? [];

const getLeasingCreatedLabel = (savedAtValue: string | undefined) => {
  if (!savedAtValue) return "Created recently";

  const savedDate = new Date(savedAtValue);
  if (Number.isNaN(savedDate.getTime())) return "Created recently";

  const daysAgo = Math.max(
    Math.floor((todayDateOnly().getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24)),
    0
  );

  return daysAgo === 0 ? "Created today" : `Created ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
};

const leasingPipelineCards = [
  {
    label: "Draft Pipeline",
    value: `${draftQuotes.length} Quotes`,
    subtitle: `${money(draftQuotes.reduce((sum, quote) => sum + quote.totalTourBudget, 0))} Potential`,
    tone: "default" as const,
  },
  {
    label: "Quotes Awaiting Response",
    value: `${sentQuotes.length} Quotes`,
    subtitle: `${money(sentQuotes.reduce((sum, quote) => sum + quote.totalTourBudget, 0))} Pending`,
    tone: "warning" as const,
  },
  {
    label: "Booked Tours",
    value: `${acceptedQuotes.length} Tours`,
    subtitle: `${money(acceptedRevenue)} Confirmed`,
    tone: "success" as const,
  },
  {
    label: "Pipeline Value",
    value: money(totalOpenQuoteValue),
    subtitle: `${money(acceptedRevenue)} Booked`,
    tone: "premium" as const,
  },
];

const sortedLeasingPipelineQuotes = [...savedQuotes].sort((a, b) => {
  const aSaved = new Date(a.savedAt).getTime();
  const bSaved = new Date(b.savedAt).getTime();

  if (!Number.isNaN(aSaved) && !Number.isNaN(bSaved)) {
    return bSaved - aSaved;
  }

  return (b.id ?? 0) - (a.id ?? 0);
});

const quotePipelineSearchValue = leasingPipelineSearchTerm.trim().toLowerCase();
const quotePipelineQuotes = sortedLeasingPipelineQuotes.filter((quote) => {
  if (!quotePipelineSearchValue) return true;

  return (
    quote.quoteNumber.toLowerCase().includes(quotePipelineSearchValue) ||
    quote.customerName.toLowerCase().includes(quotePipelineSearchValue) ||
    quote.tourName.toLowerCase().includes(quotePipelineSearchValue)
  );
});

const quotePipelineColumns = [
  { key: "Draft", emptyLabel: "No Draft Quotes", tone: "gray" },
  { key: "Sent", emptyLabel: "No Sent Quotes", tone: "blue" },
  { key: "Accepted", emptyLabel: "No Accepted Quotes", tone: "green" },
  { key: "Rejected", emptyLabel: "No Rejected Quotes", tone: "red" },
] as const;

const toursToday = trips.filter((trip) =>
  isTodayBetween(trip.startDate, trip.endDate)
);

const toursStartingThisWeekCount = trips.filter((trip) => {
  if (!trip.startDate) return false;

  const start = new Date(trip.startDate);
  start.setHours(0, 0, 0, 0);

  return start >= today && start <= weekFromToday;
}).length;

const coachesAvailableCount = coaches.filter(
  (coach) => getCoachOperationalStatus(coach) === "Available"
).length;

const driversAvailableCount = availableDrivers.length;

const missingAssignmentsCount = trips.filter(
  (trip) => !trip.coachName || !trip.driverName
).length;

function tripsOverlap(a: Trip, b: Trip) {
  if (!a.startDate || !a.endDate || !b.startDate || !b.endDate) return false;

  const aStart = new Date(a.startDate);
  const aEnd = new Date(a.endDate);
  const bStart = new Date(b.startDate);
  const bEnd = new Date(b.endDate);

  aStart.setHours(0, 0, 0, 0);
  aEnd.setHours(23, 59, 59, 999);
  bStart.setHours(0, 0, 0, 0);
  bEnd.setHours(23, 59, 59, 999);

  return aStart <= bEnd && bStart <= aEnd;
}

const dispatchAlertItems: Array<{
  message: string;
  tripId: number | null;
  isConflict: boolean;
  needsAssignment: boolean;
}> = [];
const conflictingTourIds = new Set<number>();

toursToday.forEach((trip) => {
  if (!trip.coachName) {
    dispatchAlertItems.push({
      message: `${trip.tripName}: Tour missing coach.`,
      tripId: trip.id,
      isConflict: false,
      needsAssignment: true,
    });
  }

  if (!trip.driverName) {
    dispatchAlertItems.push({
      message: `${trip.tripName}: Tour missing driver.`,
      tripId: trip.id,
      isConflict: false,
      needsAssignment: true,
    });
  }
});

for (let i = 0; i < toursToday.length; i++) {
  for (let j = i + 1; j < toursToday.length; j++) {
    const firstTrip = toursToday[i];
    const secondTrip = toursToday[j];

    if (!tripsOverlap(firstTrip, secondTrip)) continue;

    if (
      firstTrip.coachName &&
      secondTrip.coachName &&
      firstTrip.coachName === secondTrip.coachName
    ) {
      conflictingTourIds.add(firstTrip.id);
      conflictingTourIds.add(secondTrip.id);
      dispatchAlertItems.push({
        message: `Coach conflict: ${firstTrip.coachName} is assigned to ${firstTrip.tripName} and ${secondTrip.tripName}.`,
        tripId: null,
        isConflict: true,
        needsAssignment: false,
      });
    }

    if (
      firstTrip.driverName &&
      secondTrip.driverName &&
      firstTrip.driverName === secondTrip.driverName
    ) {
      conflictingTourIds.add(firstTrip.id);
      conflictingTourIds.add(secondTrip.id);
      dispatchAlertItems.push({
        message: `Driver conflict: ${firstTrip.driverName} is assigned to ${firstTrip.tripName} and ${secondTrip.tripName}.`,
        tripId: null,
        isConflict: true,
        needsAssignment: false,
      });
    }
  }
}

const filteredDispatcherToursToday =
  dispatcherTourFilter === "All"
    ? toursToday
    : dispatcherTourFilter === "Missing Coach"
    ? toursToday.filter((trip) => !trip.coachName)
    : dispatcherTourFilter === "Missing Driver"
    ? toursToday.filter((trip) => !trip.driverName)
    : dispatcherTourFilter === "Coach Conflict" || dispatcherTourFilter === "Driver Conflict"
    ? toursToday.filter((trip) => conflictingTourIds.has(trip.id))
    : dispatcherTourFilter === "Maintenance"
    ? toursToday.filter((trip) => {
        const linkedCoach = coaches.find((coach) => coach.coachName === trip.coachName);
        return linkedCoach ? getCoachOperationalStatus(linkedCoach) === "Maintenance" : false;
      })
    : dispatcherTourFilter === "Tour Ready"
    ? toursToday.filter((trip) => !!trip.coachName && !!trip.driverName)
    : sortedUpcomingTourStarts;

const dispatcherSearchValue = dispatcherSearchTerm.trim().toLowerCase();
const displayedDispatcherTours = filteredDispatcherToursToday.filter((trip) => {
  if (!dispatcherSearchValue) return true;

  return (
    trip.tripName.toLowerCase().includes(dispatcherSearchValue) ||
    trip.coachName.toLowerCase().includes(dispatcherSearchValue) ||
    trip.driverName.toLowerCase().includes(dispatcherSearchValue)
  );
});

type DispatchQueueSeverity = "Critical" | "High" | "Medium" | "Ready";
type DispatchProblemType =
  | "Coach Conflict"
  | "Driver Conflict"
  | "Missing Coach"
  | "Missing Driver"
  | "Maintenance"
  | "Tour Ready"
  | "Starts Soon";

type DispatchQueueItem = {
  id: string;
  severity: DispatchQueueSeverity;
  problemType: DispatchProblemType;
  issue: string;
  tour: string;
  resource: string;
  due: string;
  onOpen: () => void;
};

const coachesOnTourCount = coaches.filter(
  (coach) => getCoachOperationalStatus(coach) === "On Tour"
).length;
const coachesInMaintenanceCount = coaches.filter(
  (coach) => getCoachOperationalStatus(coach) === "Maintenance"
).length;
const driversOnTourCount = drivers.filter(
  (driver) => getDriverOperationalStatus(driver) === "On Tour"
).length;
const driversUnavailableCount = drivers.filter(
  (driver) => getDriverOperationalStatus(driver) !== "Available"
).length;

const dispatchConflictItems = dispatchAlertItems.filter((alertItem) => alertItem.isConflict);
const toursMissingCoachCount = toursToday.filter((trip) => !trip.coachName).length;
const toursMissingDriverCount = toursToday.filter((trip) => !trip.driverName).length;

const dispatchUpcomingStarts = sortedUpcomingTourStarts.slice(0, 3);

const dispatchUpcomingMediumRows: DispatchQueueItem[] = dispatchUpcomingStarts
  .filter((trip) => !trip.coachName || !trip.driverName)
  .map((trip, index) => ({
    id: `dispatch-medium-start-${trip.id}-${index}`,
    severity: "Medium" as DispatchQueueSeverity,
    problemType: "Starts Soon" as DispatchProblemType,
    issue: "Tour Starts Soon",
    tour: trip.tripName,
    resource: !trip.coachName && !trip.driverName
      ? "Coach + Driver Needed"
      : !trip.coachName
      ? "Coach Needed"
      : "Driver Needed",
    due: trip.startDate || "Upcoming",
    onOpen: () => openAssignmentModal(trip),
  }));

const dispatchReadyRows: DispatchQueueItem[] = dispatchUpcomingStarts
  .filter((trip) => !!trip.coachName && !!trip.driverName)
  .map((trip, index) => ({
    id: `dispatch-ready-${trip.id}-${index}`,
    severity: "Ready" as DispatchQueueSeverity,
    problemType: "Tour Ready" as DispatchProblemType,
    issue: "Assignments Complete",
    tour: trip.tripName,
    resource: `${trip.coachName} / ${trip.driverName}`,
    due: trip.startDate || "Upcoming",
    onOpen: () => setActivePage("Calendar"),
  }));

const dispatchMaintenanceRows: DispatchQueueItem[] = coachesInMaintenanceCount > 0
  ? [{
      id: "dispatch-maintenance",
      severity: "Medium" as DispatchQueueSeverity,
  problemType: "Maintenance" as DispatchProblemType,
      issue: "Coach In Maintenance",
      tour: `${coachesInMaintenanceCount} coach${coachesInMaintenanceCount === 1 ? "" : "es"}`,
      resource: "Fleet readiness check",
      due: "Review Today",
      onOpen: () => setActivePage("Coaches"),
    }]
  : [];

const dispatchWorkspaceQueueRows: DispatchQueueItem[] = [
  ...dispatchAlertItems.map((alertItem, index) => {
    const linkedTrip =
      alertItem.tripId === null
        ? null
        : trips.find((trip) => trip.id === alertItem.tripId) ?? null;

    const issue = alertItem.message.startsWith("Coach conflict")
      ? "Coach Conflict"
      : alertItem.message.startsWith("Driver conflict")
      ? "Driver Conflict"
      : alertItem.message.includes("missing coach")
      ? "Missing Coach"
      : "Missing Driver";

    const resource = alertItem.message.startsWith("Coach conflict")
      ? alertItem.message.split(":")[1]?.split(" is assigned")[0]?.trim() || "Coach"
      : alertItem.message.startsWith("Driver conflict")
      ? alertItem.message.split(":")[1]?.split(" is assigned")[0]?.trim() || "Driver"
      : issue === "Missing Coach"
      ? "Coach Needed"
      : "Driver Needed";

    return {
      id: `dispatch-queue-${index}`,
      severity: (alertItem.isConflict ? "Critical" : alertItem.needsAssignment ? "High" : "Medium") as DispatchQueueSeverity,
      problemType: issue as DispatchProblemType,
      issue,
      tour: linkedTrip?.tripName || alertItem.message.split(":")[0] || "Dispatch Issue",
      resource,
      due: linkedTrip?.startDate || "Today",
      onOpen: () => {
        if (alertItem.needsAssignment && linkedTrip) {
          openAssignmentModal(linkedTrip);
          return;
        }

        setActivePage("Calendar");
        if (alertItem.isConflict) {
          setCalendarStatusFilter("Missing Assignment");
        }
      },
    };
  }),
  ...dispatchUpcomingMediumRows,
  ...dispatchMaintenanceRows,
  ...dispatchReadyRows,
];

const filteredDispatchWorkspaceQueueRows =
  dispatcherTourFilter === "All"
    ? dispatchWorkspaceQueueRows
    : dispatchWorkspaceQueueRows.filter((row) => row.problemType === dispatcherTourFilter);

const dispatchProblemOrder: DispatchProblemType[] = [
  "Coach Conflict",
  "Driver Conflict",
  "Missing Coach",
  "Missing Driver",
  "Maintenance",
  "Tour Ready",
  "Starts Soon",
];

const dispatchProblemCounts = dispatchWorkspaceQueueRows.reduce(
  (counts, row) => {
    counts[row.problemType] += 1;
    return counts;
  },
  {
    "Coach Conflict": 0,
    "Driver Conflict": 0,
    "Missing Coach": 0,
    "Missing Driver": 0,
    "Maintenance": 0,
    "Tour Ready": 0,
    "Starts Soon": 0,
  } as Record<DispatchProblemType, number>
);

const dispatchGroupsToRender =
  dispatcherTourFilter === "All"
    ? dispatchProblemOrder.filter((problemType) => dispatchProblemCounts[problemType] > 0)
    : [dispatcherTourFilter];

const dispatchGroupedQueueRows = dispatchGroupsToRender.map((problemType) => ({
  problemType,
  rows: filteredDispatchWorkspaceQueueRows.filter((row) => row.problemType === problemType),
}));

const dispatchFocusCards = [
  { label: "Missing Coach", value: toursMissingCoachCount, filter: "Missing Coach" as const, icon: "MC" },
  { label: "Missing Driver", value: toursMissingDriverCount, filter: "Missing Driver" as const, icon: "MD" },
  { label: "Coach Conflict", value: dispatchAlertItems.filter((item) => item.message.startsWith("Coach conflict")).length, filter: "Coach Conflict" as const, icon: "CC" },
  { label: "Driver Conflict", value: dispatchAlertItems.filter((item) => item.message.startsWith("Driver conflict")).length, filter: "Driver Conflict" as const, icon: "DC" },
];

const driverConflictsCount = dispatchAlertItems.filter((item) =>
  item.message.startsWith("Driver conflict")
).length;

const calendarSearchValue = calendarSearchTerm.trim().toLowerCase();
const filteredCalendarTrips = trips.filter((trip) => {
  const tripStatus = getCalendarTripStatus(trip);
  const matchesStatus =
    calendarStatusFilter === "All" || tripStatus === calendarStatusFilter;

  if (!matchesStatus) return false;
  if (!calendarSearchValue) return true;

  return (
    trip.tripName.toLowerCase().includes(calendarSearchValue) ||
    trip.coachName.toLowerCase().includes(calendarSearchValue) ||
    trip.driverName.toLowerCase().includes(calendarSearchValue)
  );
});

const calendarStartDate = todayDateOnly();
const calendarEndDate = new Date(calendarStartDate);
calendarEndDate.setDate(calendarEndDate.getDate() + 13);
calendarEndDate.setHours(23, 59, 59, 999);

const calendarDays = Array.from({ length: 14 }, (_, index) => {
  const date = new Date(calendarStartDate);
  date.setDate(calendarStartDate.getDate() + index);
  date.setHours(0, 0, 0, 0);

  const dayTrips = filteredCalendarTrips.filter(
    (trip) => trip.coachName && isTripActiveOnDate(trip, date)
  );

  return { date, dayTrips };
});

const assignedCalendarTrips = filteredCalendarTrips.filter((trip) => trip.coachName);
const unassignedCalendarTrips = filteredCalendarTrips.filter((trip) => !trip.coachName);

const assignedCalendarTripsInRange = assignedCalendarTrips.filter((trip) => {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return start <= calendarEndDate && end >= calendarStartDate;
});

const coachesWithVisibleTours = new Set(
  assignedCalendarTripsInRange.map((trip) => trip.coachName)
);

const displayedCalendarCoaches = coaches.filter((coach) => {
  const coachMatchesSearch =
    !calendarSearchValue ||
    coach.coachName.toLowerCase().includes(calendarSearchValue);

  if (
    !calendarSearchValue &&
    calendarStatusFilter === "All"
  ) {
    return true;
  }

  if (coachMatchesSearch && calendarStatusFilter === "All") return true;

  return assignedCalendarTripsInRange.some((trip) => {
    if (trip.coachName !== coach.coachName) return false;

    return true;
  });
});

const coachViewFilteredCoaches =
  calendarCoachView === "All Coaches"
    ? displayedCalendarCoaches
    : calendarCoachView === "Coaches Out"
    ? displayedCalendarCoaches.filter((coach) =>
        coachesWithVisibleTours.has(coach.coachName)
      )
    : calendarCoachView === "Available Coaches"
    ? displayedCalendarCoaches.filter(
        (coach) => !coachesWithVisibleTours.has(coach.coachName)
      )
    : [];

const limitedCalendarCoaches =
  calendarRowLimit === "All"
    ? coachViewFilteredCoaches
    : coachViewFilteredCoaches.slice(0, Number(calendarRowLimit));

const shouldShowCalendarGridRows = calendarCoachView !== "Missing Assignment";
const calendarCoachRowsMatch = limitedCalendarCoaches.length > 0;
const calendarCoachResultCountText = `Showing ${limitedCalendarCoaches.length} of ${coaches.length} coaches`;

const coachesOutTodayCount = new Set(
  toursToday
    .filter((trip) => !!trip.coachName)
    .map((trip) => trip.coachName)
).size;

const calendarHasVisibleData =
  (shouldShowCalendarGridRows && calendarCoachRowsMatch) ||
  unassignedCalendarTrips.length > 0;

const [openNavDropdown, setOpenNavDropdown] = useState<"Leasing" | "Dispatch" | null>(null);
const navCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const topNavRef = useRef<HTMLElement | null>(null);

const clearNavCloseTimeout = () => {
  if (navCloseTimeoutRef.current) {
    clearTimeout(navCloseTimeoutRef.current);
    navCloseTimeoutRef.current = null;
  }
};

const openNavDropdownMenu = (menu: "Leasing" | "Dispatch") => {
  clearNavCloseTimeout();
  setOpenNavDropdown(menu);
};

const scheduleNavDropdownClose = () => {
  clearNavCloseTimeout();
  navCloseTimeoutRef.current = setTimeout(() => {
    setOpenNavDropdown(null);
  }, 180);
};

const closeNavDropdownImmediately = () => {
  clearNavCloseTimeout();
  setOpenNavDropdown(null);
};

useEffect(() => {
  const handleDocumentMouseDown = (event: MouseEvent) => {
    if (!topNavRef.current) return;

    if (!topNavRef.current.contains(event.target as Node)) {
      closeNavDropdownImmediately();
    }
  };

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeNavDropdownImmediately();
    }
  };

  document.addEventListener("mousedown", handleDocumentMouseDown);
  document.addEventListener("keydown", handleEscapeKey);

  return () => {
    document.removeEventListener("mousedown", handleDocumentMouseDown);
    document.removeEventListener("keydown", handleEscapeKey);
    clearNavCloseTimeout();
  };
}, []);

const handleDemoSignIn = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (!loginEmail.trim() || !loginPassword.trim()) {
    setLoginError("Enter an email and password to continue.");
    return;
  }

  if (loginRememberMe) {
    localStorage.setItem("blackline_remembered_email", loginEmail.trim());
  } else {
    localStorage.removeItem("blackline_remembered_email");
  }

  setLoginError("");
  setIsDemoAuthenticated(true);
  setActivePage("Home");
};

if (!isDemoAuthenticated) {
  return (
    <main className="min-h-screen bg-[#0d0d0e] text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(320px,1.1fr)_minmax(360px,0.9fr)]">
        <section className="relative overflow-hidden border-b border-[#2f2b23] px-8 py-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(184,149,82,0.24),transparent_58%),radial-gradient(circle_at_85%_75%,rgba(167,139,250,0.08),transparent_55%),linear-gradient(155deg,#151515_0%,#0f1012_44%,#11171c_100%)]" />
          <div className="relative flex h-full flex-col justify-between gap-6 lg:justify-start">
            <div className="space-y-5 lg:pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d7c298]">BlackLine</p>
              <h1 className="max-w-md text-4xl font-bold leading-tight text-[#f6efe2] md:text-5xl">Luxury Tour Operations Platform</h1>
              <div className="h-px w-28 bg-gradient-to-r from-[#b89552] via-[#d6c29a] to-transparent" />
              <p className="max-w-md text-sm leading-7 text-[#d8d3cb]">
                Premium command center for teams that run world-class tours with precision, polish, and confidence.
              </p>
            </div>

            <div className="rounded-2xl border border-[#3a3228] bg-[#141414]/80 p-6 shadow-[0_22px_70px_-45px_rgba(184,149,82,0.8)] backdrop-blur-sm lg:mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c7b084]">Workspace Access</p>
              <ul className="mt-4 space-y-3 text-[15px] text-[#f2ebdf]">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b89552]" />
                  Leasing
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b89552]" />
                  Dispatch
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b89552]" />
                  Fleet
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b89552]" />
                  Accounting
                </li>
              </ul>
            </div>

            <p className="pt-2 text-xs text-[#c0b7a6] lg:mt-auto">© BlackLine</p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:items-start lg:pt-[12vh]">
          <div className="w-full max-w-lg rounded-2xl border border-[#2d2b29] bg-[#171719] p-7 shadow-[0_35px_90px_-50px_rgba(0,0,0,0.9)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#bea16c]">Welcome Back</p>
            <h2 className="mt-3 text-2xl font-bold text-[#f4ede1]">Sign in to BlackLine</h2>

            <form className="mt-6 space-y-4" onSubmit={handleDemoSignIn}>
              <div className="space-y-1.5">
                <label htmlFor="blackline-login-email" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfb7aa]">
                  Email
                </label>
                <input
                  id="blackline-login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => {
                    setLoginEmail(event.target.value);
                    if (loginError) setLoginError("");
                  }}
                  className="w-full rounded-lg border border-[#3a3834] bg-[#111114] px-3 py-2.5 text-sm text-[#f8f3ea] placeholder:text-slate-500 focus:border-[#b89552] focus:outline-none"
                  placeholder="you@blackline.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="blackline-login-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfb7aa]">
                  Password
                </label>
                <input
                  id="blackline-login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(event) => {
                    setLoginPassword(event.target.value);
                    if (loginError) setLoginError("");
                  }}
                  className="w-full rounded-lg border border-[#3a3834] bg-[#111114] px-3 py-2.5 text-sm text-[#f8f3ea] placeholder:text-slate-500 focus:border-[#b89552] focus:outline-none"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-[#d7cfbf]">
                  <input
                    type="checkbox"
                    checked={loginRememberMe}
                    onChange={(event) => setLoginRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#5a5244] bg-[#111114] text-[#b89552] focus:ring-[#b89552]"
                  />
                  Remember Me
                </label>

                <button type="button" className="text-sm font-medium text-[#d0b480] hover:text-[#e6cea4]">
                  Forgot Password
                </button>
              </div>

              {loginError && <p className="text-sm text-[#d68e8e]">{loginError}</p>}

              <button
                type="submit"
                className="mt-2 w-full rounded-lg border border-[#d2b076] bg-gradient-to-b from-[#d5b57d] to-[#b68a44] px-4 py-3 text-sm font-bold text-[#1b1409] shadow-[0_12px_28px_-14px_rgba(184,149,82,0.9)] transition hover:from-[#e0c18a] hover:to-[#bf9551]"
              >
                Sign In
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

const leasingNavActive =
  activePage === "Leasing Dashboard" ||
  activePage === "Quotes" ||
  activePage === "Active Tours";

const customersNavActive = activePage === "Customers";

const dispatchNavActive =
  activePage === "Dispatcher Dashboard" ||
  activePage === "Drivers" ||
  activePage === "Coaches";

const calendarNavActive = activePage === "Calendar";
const reportsNavActive = activePage === "Reports";
const commandCenterDateLabel = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

  return (
    <main className={pageShellClass}>
      <header ref={topNavRef} className="bg-[#121212] border-b border-[#2e2a22] px-8 py-4 text-white">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <button
              type="button"
              onClick={() => setActivePage("Home")}
              className="cursor-pointer text-[2.8rem] font-bold tracking-[0.3em] text-white transition-colors hover:text-[#f2e2bf]"
            >
              BlackLine
            </button>

            <nav className="flex items-center gap-3">
              <div
                className="relative"
                onMouseEnter={() => openNavDropdownMenu("Leasing")}
                onMouseLeave={scheduleNavDropdownClose}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenNavDropdown((previousState) =>
                      previousState === "Leasing" ? null : "Leasing"
                    )
                  }
                  className={`px-3 py-2 text-sm font-semibold rounded-t border-b-2 transition ${
                    leasingNavActive
                      ? "border-[#b89552] text-[#f2e2bf]"
                      : "border-transparent text-slate-200 hover:text-white"
                  }`}
                >
                  Leasing
                </button>
                <div
                  onMouseEnter={() => openNavDropdownMenu("Leasing")}
                  onMouseLeave={scheduleNavDropdownClose}
                  className={`transition absolute left-0 top-full mt-1 w-56 rounded-lg border border-[#3d3528] bg-[#191919] shadow-xl z-50 py-1 ${
                    openNavDropdown === "Leasing" ? "visible opacity-100" : "invisible opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage("Leasing Dashboard");
                      closeNavDropdownImmediately();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-[#2a241b] hover:text-[#f2e2bf]"
                  >
                    Leasing Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuoteTab("Quote List");
                      setActivePage("Quotes");
                      closeNavDropdownImmediately();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-[#2a241b] hover:text-[#f2e2bf]"
                  >
                    Quotes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage("Customers");
                      closeNavDropdownImmediately();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-[#2a241b] hover:text-[#f2e2bf]"
                  >
                    Customers
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage("Active Tours");
                      closeNavDropdownImmediately();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-[#2a241b] hover:text-[#f2e2bf]"
                  >
                    Active Tours
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePage("Customers")}
                className={`px-3 py-2 text-sm font-semibold rounded-t border-b-2 transition ${
                  customersNavActive
                    ? "border-[#b89552] text-[#f2e2bf]"
                    : "border-transparent text-slate-200 hover:text-white"
                }`}
              >
                Customers
              </button>

              <button
                type="button"
                onClick={() => setActivePage("Calendar")}
                className={`px-3 py-2 text-sm font-semibold rounded-t border-b-2 transition ${
                  calendarNavActive
                    ? "border-[#b89552] text-[#f2e2bf]"
                    : "border-transparent text-slate-200 hover:text-white"
                }`}
              >
                Calendar
              </button>

              <div
                className="relative"
                onMouseEnter={() => openNavDropdownMenu("Dispatch")}
                onMouseLeave={scheduleNavDropdownClose}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenNavDropdown((previousState) =>
                      previousState === "Dispatch" ? null : "Dispatch"
                    )
                  }
                  className={`px-3 py-2 text-sm font-semibold rounded-t border-b-2 transition ${
                    dispatchNavActive
                      ? "border-[#b89552] text-[#f2e2bf]"
                      : "border-transparent text-slate-200 hover:text-white"
                  }`}
                >
                  Dispatch
                </button>
                <div
                  onMouseEnter={() => openNavDropdownMenu("Dispatch")}
                  onMouseLeave={scheduleNavDropdownClose}
                  className={`transition absolute left-0 top-full mt-1 w-56 rounded-lg border border-[#3d3528] bg-[#191919] shadow-xl z-50 py-1 ${
                    openNavDropdown === "Dispatch" ? "visible opacity-100" : "invisible opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage("Dispatcher Dashboard");
                      closeNavDropdownImmediately();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-[#2a241b] hover:text-[#f2e2bf]"
                  >
                    Dispatch Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage("Drivers");
                      closeNavDropdownImmediately();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-[#2a241b] hover:text-[#f2e2bf]"
                  >
                    Drivers
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage("Coaches");
                      closeNavDropdownImmediately();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-100 hover:bg-[#2a241b] hover:text-[#f2e2bf]"
                  >
                    Coaches
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePage("Reports")}
                className={`px-3 py-2 text-sm font-semibold rounded-t border-b-2 transition ${
                  reportsNavActive
                    ? "border-[#b89552] text-[#f2e2bf]"
                    : "border-transparent text-slate-200 hover:text-white"
                }`}
              >
                {/* TODO: Add Reports dropdown when report categories are defined. */}
                Reports
              </button>
            </nav>
          </div>

          <button
            type="button"
            onClick={() => console.log("Open Settings/Admin (placeholder)")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#3d3528] bg-[#1c1c1c] text-[#f2e2bf] hover:bg-[#2a241b]"
            aria-label="Settings"
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <section className={contentShellClass}>
        {activePage === "Home" && (
          <div className="mx-auto w-full max-w-[1700px] space-y-6">
            <section className="relative overflow-hidden rounded-2xl border border-[#d8c8ab] bg-[linear-gradient(130deg,#f8f4ea_0%,#f3ebdb_48%,#efe2cc_100%)] p-5 shadow-[0_22px_60px_-52px_rgba(125,93,49,0.8)] md:p-6">
              <div className="absolute -right-20 top-[-86px] h-44 w-44 rounded-full bg-[#d9bf8f]/35 blur-3xl" />
              <div className="absolute -left-20 bottom-[-100px] h-44 w-44 rounded-full bg-[#b08a4e]/16 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-[#2d2214] md:text-[2rem]">Command Center</h2>
                    <p className="mt-1 text-sm font-semibold text-[#6f522c]">Good Morning, Current User</p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c6a39]">{commandCenterDateLabel}</p>
                </div>

                <p className="mt-2 max-w-2xl text-sm text-[#5e4a2b]">
                  Start each day with your business snapshot, then jump directly into the workspace that needs attention.
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Quotes Awaiting Response", value: `${quotesWaitingOnCustomerCount}` },
                    { label: "Tours Starting Soon", value: `${toursStartingSoonCount}` },
                    { label: "Driver Conflicts", value: `${driverConflictsCount}` },
                    { label: "Revenue Pipeline", value: money(totalOpenQuoteValue) },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-[#d5c4a7] bg-white/65 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a6747]">{metric.label}</p>
                      <p className="mt-1 text-base font-bold text-[#2d2214]">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-3xl font-bold tracking-[0.04em] text-[#121212]">Choose Workspace</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Leasing",
                    badgeCount: 19,
                    highlights: [
                      `${quotesWaitingOnCustomerCount} quotes awaiting response`,
                      `${toursStartingSoonCount} tours starting soon`,
                      `Pipeline ${money(totalOpenQuoteValue)}`,
                    ],
                    onClick: () => setActivePage("Leasing Dashboard"),
                  },
                  {
                    label: "Dispatch",
                    badgeCount: 4,
                    highlights: [
                      `${driverConflictsCount} driver conflicts`,
                      `${toursStartingSoonCount} tours starting soon`,
                      "Coverage needs review",
                    ],
                    onClick: () => setActivePage("Dispatcher Dashboard"),
                  },
                  {
                    label: "Customers",
                    badgeCount: 6,
                    highlights: [
                      "6 follow-ups",
                      "Top relationships",
                      "Account health",
                    ],
                    onClick: () => setActivePage("Customers"),
                  },
                  {
                    label: "Reports",
                    badgeCount: 0,
                    highlights: [
                      "Pipeline trends",
                      "Operations reporting",
                      "Financial visibility",
                    ],
                    onClick: () => setActivePage("Reports"),
                  },
                ].map((workspaceCard) => (
                  <button
                    key={workspaceCard.label}
                    type="button"
                    onClick={workspaceCard.onClick}
                    className="group flex min-h-[250px] flex-col rounded-xl border border-[#272727] bg-[#151515] p-6 text-left text-[#f3ecde] shadow-sm transition hover:-translate-y-0.5 hover:border-[#b89552] hover:shadow-lg"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c7ac7b]">Workspace</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <h4 className="text-2xl font-bold">{workspaceCard.label}</h4>
                      <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-[#b89552] bg-[#1f1a12] px-2 py-0.5 text-xs font-bold text-[#e4cc9f]">
                        {workspaceCard.badgeCount}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm text-[#d4ccc0]">
                      {workspaceCard.highlights.map((highlight) => (
                        <p key={highlight} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#b89552]" />
                          {highlight}
                        </p>
                      ))}
                    </div>
                    <p className="mt-auto pt-4 text-xs font-semibold text-[#e4cc9f]">Launch →</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activePage === "Leasing Dashboard" && (
          <div className={pageLayoutClass}>
            <h2 className="text-4xl font-bold">Leasing Workspace</h2>
            <div className="mt-2 mb-4 flex flex-wrap items-stretch gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
              {[
                {
                  label: "Draft Quotes",
                  value: draftQuotes.length,
                  stage: "Draft Quotes" as LeasingStageTab,
                },
                {
                  label: "Awaiting Response",
                  value: sentQuotes.length,
                  stage: "Awaiting Customer Response" as LeasingStageTab,
                },
                {
                  label: "Deposit Needed",
                  value: acceptedQuotes.filter(
                    (quote) =>
                      !trips.some(
                        (trip) =>
                          trip.tripName === quote.tourName &&
                          trip.startDate === quote.startDate &&
                          trip.endDate === quote.endDate
                      )
                  ).length,
                  stage: "Collect Deposit" as LeasingStageTab,
                },
                {
                  label: "Ready for Operations",
                  value: acceptedQuotes.filter(
                    (quote) =>
                      trips.some(
                        (trip) =>
                          trip.tripName === quote.tourName &&
                          trip.startDate === quote.startDate &&
                          trip.endDate === quote.endDate
                      ) && !(quote.coachName || quote.driverName)
                  ).length,
                  stage: "Ready for Operations" as LeasingStageTab,
                },
                {
                  label: "Booked Tours",
                  value: upcomingTourStarts.length,
                  stage: "Booked / Tour Ready" as LeasingStageTab,
                },
              ].map((metric, index) => {
                const isActiveMetric = activeLeasingStageTab === metric.stage;

                return (
                  <button
                    key={metric.label}
                    type="button"
                    onClick={() => setActiveLeasingStageTab(metric.stage)}
                    className={`flex min-w-[120px] flex-1 items-center gap-2 rounded-lg border px-2 py-1 text-left transition ${
                      index > 0 ? "border-l-0" : ""
                    } ${
                      isActiveMetric
                        ? "border-[#b89552] bg-[#f6efe2] shadow-sm"
                        : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">{metric.label}</p>
                      <p className={`mt-0.5 text-[1.15rem] leading-none font-bold ${isActiveMetric ? "text-[#7d5d31]" : "text-slate-900"}`}>
                        {metric.value}
                      </p>
                    </div>
                  </button>
                );
              })}
              <div className="flex min-w-[140px] flex-1 items-center gap-2 rounded-lg border border-transparent px-2 py-1">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold">Pipeline Value</p>
                  <p className="mt-0.5 text-[1.15rem] leading-none font-bold text-slate-900">{money(totalOpenQuoteValue)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2.25fr)_minmax(360px,0.9fr)] items-start">
              <section className="bg-white rounded-xl shadow border border-slate-200">
                <div className="px-3 pb-3 pt-1.5">
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200">
                    {leasingKanbanColumns.map((column) => (
                      <button
                        key={column.stageKey}
                        type="button"
                        onClick={() => setActiveLeasingStageTab(column.stageKey)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          activeLeasingStageTab === column.stageKey
                            ? "border-[#b89552] bg-[#f6efe2] text-[#6f522c]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-[#c8ad79]"
                        }`}
                      >
                        {`${column.stageKey} (${column.cards.length})`}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2.5">
                    <div className="grid grid-cols-[1.2fr_1.15fr_0.9fr_0.85fr_0.95fr_0.9fr_28px] gap-3 px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-slate-600 border-b border-slate-200">
                      <div>Customer</div>
                      <div>Tour</div>
                      <div>Quote</div>
                      <div>Amount</div>
                      <div>Created</div>
                      <div>Due</div>
                      <div className="text-right">→</div>
                    </div>

                    <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
                      {activeLeasingQueueRows.length === 0 ? (
                        <p className="px-3 py-4 text-sm text-slate-600">No quotes in this stage.</p>
                      ) : (
                        activeLeasingQueueRows.map((card) => {
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => {
                                setActivePage("Quotes");
                                setActiveQuoteTab("Pricing Info");
                                editQuote(card.quote);
                              }}
                              className="grid w-full cursor-pointer grid-cols-[1.2fr_1.15fr_0.9fr_0.85fr_0.95fr_0.9fr_28px] items-center gap-3 border-b border-slate-100 px-3 py-3 text-left hover:bg-[#F8F6F2]"
                            >
                              <div className="min-w-0">
                                <p className="text-[15px] font-semibold text-slate-900 truncate">{card.quote.customerName || "No customer"}</p>
                              </div>
                              <div className="min-w-0 text-[14px] text-slate-700 truncate">{card.quote.tourName || "No tour"}</div>
                              <div className="min-w-0 text-[13px] font-semibold text-[#7d5d31] truncate">{card.quote.quoteNumber}</div>
                              <div className="min-w-0 text-[13px] font-semibold text-slate-800 truncate">{money(card.quote.totalTourBudget)}</div>
                              <div className="min-w-0 text-[13px] text-slate-600 truncate">{getLeasingCreatedLabel(card.quote.savedAt)}</div>
                              <div className="min-w-0 text-[13px] font-semibold text-slate-700 truncate">{card.due}</div>
                              <div className="text-right text-slate-400 text-lg">›</div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="space-y-3.5">
                <section className="bg-white p-3 rounded-xl shadow border border-slate-200">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-xl font-bold">Upcoming Tours</h3>
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">3 max</p>
                  </div>

                  {displayedUpcomingTourStarts.length === 0 ? (
                    <p className="text-slate-600 text-sm">No tours starting in the next 7 days.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {displayedUpcomingTourStarts.slice(0, 3).map((trip) => {
                        const readinessStatus = !trip.coachName && !trip.driverName
                          ? "Missing Assignment"
                          : !trip.coachName
                          ? "Missing Coach"
                          : !trip.driverName
                          ? "Missing Driver"
                          : "Ready";

                        const statusClass = readinessStatus === "Ready"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700";

                        return (
                          <article key={trip.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[12px] text-slate-500 truncate">
                                  <span className="font-semibold text-slate-600">Customer:</span>{" "}
                                  {savedQuotes.find(
                                    (quote) =>
                                      quote.quoteStatus === "Accepted" &&
                                      quote.tourName === trip.tripName &&
                                      quote.startDate === trip.startDate &&
                                      quote.endDate === trip.endDate
                                  )?.customerName || "-"}
                                </p>
                                <p className="text-[14px] font-bold text-slate-900 truncate">
                                  <span className="font-semibold text-slate-600">Tour:</span> {trip.tripName}
                                </p>
                              </div>
                              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                                Ready: {readinessStatus}
                              </span>
                            </div>

                            <div className="mt-1.5 grid grid-cols-1 gap-0.5 text-[12px] text-slate-700">
                              <p className="truncate"><span className="font-semibold text-slate-500">Coach:</span> {trip.coachName || "Unassigned"}</p>
                              <p className="truncate"><span className="font-semibold text-slate-500">Driver:</span> {trip.driverName || "Unassigned"}</p>
                              <p className="truncate"><span className="font-semibold text-slate-500">Start Date:</span> {trip.startDate || "-"}</p>
                            </div>

                            <div className="mt-1.5 flex justify-start">
                              <button
                                type="button"
                                onClick={() => (readinessStatus === "Ready" ? setActivePage("Calendar") : openAssignmentModal(trip))}
                                className="rounded-full border border-[#b89552] bg-[#f6efe2] px-2.5 py-1 text-[11px] font-semibold text-[#7d5d31] shadow-sm hover:bg-[#efe3cc]"
                              >
                                Open
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {upcomingStartsOverflowCount > 0 && (
                    <p className="text-sm text-slate-600 mt-2">+ {upcomingStartsOverflowCount} more upcoming starts</p>
                  )}
                </section>

                <section className="bg-white p-3 rounded-xl shadow border border-slate-200">
                  <h3 className="text-xl font-bold mb-3">Leasing KPIs</h3>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Quotes Closing This Week", value: `${quotesClosingThisWeekCount}`, subtitle: "7-day window" },
                      { label: "Acceptance Rate", value: `${Math.round(acceptanceRate)}%`, subtitle: "Accepted / total" },
                      { label: "Open Pipeline Value", value: money(totalOpenQuoteValue), subtitle: "Draft + sent" },
                      { label: "Accepted Revenue", value: money(acceptedRevenue), subtitle: "Closed value" },
                      { label: "Upcoming Tours", value: `${upcomingTourStarts.length}`, subtitle: "Next 7 days" },
                      { label: "Largest Open Quote", value: money(largestOpenQuoteValue), subtitle: "Top pipeline deal" },
                    ].map((metric) => (
                      <article key={metric.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 font-semibold">{metric.label}</p>
                        <p className="mt-1 text-[1.15rem] font-bold text-slate-900 leading-none">{metric.value}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{metric.subtitle}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activePage === "Dispatcher Dashboard" && (
          <div className={pageLayoutClass}>
            <h2 className="text-4xl font-bold">Dispatch Workspace</h2>
            <p className="text-slate-600 mt-2 mb-4">
              Operational conflicts, fleet readiness, and upcoming departures.
            </p>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2.15fr)_minmax(360px,1.08fr)] items-start">
              <section className="bg-white rounded-xl shadow border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-[2.05rem] leading-tight font-bold">Operations Alerts</h3>
                    <p className="text-sm text-slate-600 mt-1">Operational problems grouped by business issue.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["All", "Coach Conflict", "Driver Conflict", "Missing Coach", "Missing Driver", "Maintenance", "Tour Ready", "Starts Soon"] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setDispatcherTourFilter(filter)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                          dispatcherTourFilter === filter
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[860px]">
                    <div className="grid grid-cols-[48px_1.25fr_1.15fr_1.15fr_118px_32px] gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-800 border-b border-slate-200 bg-slate-50/80 font-semibold">
                      <div>Severity</div>
                      <div>Issue</div>
                      <div>Tour</div>
                      <div>Resource</div>
                      <div>Due</div>
                      <div className="text-right">→</div>
                    </div>

                    <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
                      {dispatchGroupedQueueRows.length === 0 ? (
                        <div className="px-4 py-5 text-sm text-slate-600">No dispatch issues right now.</div>
                      ) : (
                        <div>
                          {dispatchGroupedQueueRows.map((group) => {
                            const isExpanded = dispatchQueueGroupExpanded[group.problemType];

                            return (
                              <div key={group.problemType}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDispatchQueueGroupExpanded((previousState) => ({
                                      ...previousState,
                                      [group.problemType]: !previousState[group.problemType],
                                    }))
                                  }
                                  className="w-full px-4 py-2 bg-slate-100/90 border-b border-slate-300 hover:bg-slate-200/60 transition-colors flex items-center justify-between text-left"
                                >
                                  <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-700">
                                    {`${group.problemType} · ${group.rows.length}`}
                                  </span>
                                  {group.rows.length > 0 && (
                                    <span className="text-slate-500 text-sm">{isExpanded ? "▾" : "▸"}</span>
                                  )}
                                </button>

                                {isExpanded && group.rows.map((row) => {
                                  const severityClass =
                                    row.severity === "Critical"
                                      ? "bg-red-100 text-red-700"
                                      : row.severity === "High"
                                      ? "bg-[#f3e3bf] text-[#8c6a3e]"
                                      : row.severity === "Medium"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-700";

                                  return (
                                    <button
                                      key={row.id}
                                      type="button"
                                      onClick={row.onOpen}
                                      className="grid h-[56px] w-full grid-cols-[48px_1.25fr_1.15fr_1.15fr_118px_32px] items-center gap-3 border-b border-slate-100 px-4 text-left transition hover:bg-[#fcfaf4] hover:shadow-[inset_0_1px_0_rgba(184,149,82,0.08)] cursor-pointer"
                                    >
                                      <div className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-semibold ${severityClass}`}>
                                        {row.severity === "Critical" ? "🔴" : row.severity === "High" ? "🟠" : row.severity === "Medium" ? "🟡" : "🟢"}
                                      </div>
                                      <div className="min-w-0 text-[16px] font-semibold text-slate-900 truncate">{row.issue}</div>
                                      <div className="min-w-0 text-[15px] font-semibold text-slate-800 truncate">{row.tour}</div>
                                      <div className="min-w-0 text-[14px] text-slate-600 truncate">{row.resource}</div>
                                      <div className="text-[14px] font-semibold text-slate-800">{row.due}</div>
                                      <div className="text-right text-slate-400 text-lg">›</div>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="space-y-3.5">
                <section className="bg-white p-3.5 rounded-xl shadow border border-slate-200">
                  <h3 className="text-xl font-bold mb-3">Today&apos;s Focus</h3>

                  <div className="grid grid-cols-2 gap-2">
                    {dispatchFocusCards.map((card) => (
                      <button
                        key={card.label}
                        type="button"
                        onClick={() => setDispatcherTourFilter(card.filter)}
                        aria-pressed={dispatcherTourFilter === card.filter}
                        className={`border rounded-xl p-3 text-left bg-white transition hover:-translate-y-0.5 hover:shadow-md ${
                          dispatcherTourFilter === card.filter
                            ? "border-[#8c6a3e] ring-2 ring-[#d9c18b] bg-[#f8eed7] shadow-md"
                            : "border-slate-200 hover:border-[#d4bf90] hover:bg-[#fcfaf4]"
                        }`}
                      >
                        <div className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${dispatcherTourFilter === card.filter ? "bg-[#e8d7b5] text-[#6f522c]" : "bg-slate-100 text-slate-600"}`}>
                          {card.icon}
                        </div>
                        <div className="text-[2.15rem] leading-none font-bold mt-2.5 text-slate-900">{card.value}</div>
                        <div className="text-[13px] font-semibold text-slate-600 mt-1">{card.label}</div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-3.5 rounded-xl shadow border border-slate-200">
                  <h3 className="text-xl font-bold mb-3">Fleet Readiness</h3>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Drivers Available", value: `${driversAvailableCount}`, subtitle: "Ready now", accent: "text-emerald-700" },
                      { label: "Coaches Available", value: `${coachesAvailableCount}`, subtitle: "Ready now", accent: "text-slate-900" },
                      { label: "Trailers Available", value: "TBD", subtitle: "Safe placeholder", accent: "text-[#8c6a3e]" },
                      { label: "Maintenance", value: `${coachesInMaintenanceCount}`, subtitle: "Coaches unavailable", accent: "text-red-700" },
                      { label: "Coverage Gaps", value: `${missingAssignmentsCount}`, subtitle: "Missing coach / driver", accent: "text-red-700" },
                    ].map((metric) => (
                      <article key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm">
                        <p className="text-[11px] tracking-[0.02em] text-slate-600 font-semibold">{metric.label}</p>
                        <p className={`mt-2 text-[1.8rem] leading-none font-bold ${metric.accent}`}>{metric.value}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{metric.subtitle}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-3.5 rounded-xl shadow border border-slate-200">
                  <h3 className="text-xl font-bold mb-3">Coach / Trailer Coverage</h3>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Coaches Available", value: `${coachesAvailableCount}`, subtitle: "Ready now", accent: "text-emerald-700" },
                      { label: "On Tour", value: `${coachesOnTourCount}`, subtitle: "Currently dispatched", accent: "text-slate-900" },
                      { label: "Maintenance", value: `${coachesInMaintenanceCount}`, subtitle: "Unavailable", accent: "text-red-700" },
                      { label: "Trailer Coverage", value: "TBD", subtitle: "Placeholder until trailer assets are modeled", accent: "text-[#8c6a3e]" },
                    ].map((metric) => (
                      <article key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm">
                        <p className="text-[11px] tracking-[0.02em] text-slate-600 font-semibold">{metric.label}</p>
                        <p className={`mt-2 text-[1.8rem] leading-none font-bold ${metric.accent}`}>{metric.value}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{metric.subtitle}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-3.5 rounded-xl shadow border border-slate-200">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="text-xl font-bold">Conflicts</h3>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Critical first</p>
                  </div>

                  <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                    {dispatchConflictItems.length === 0 ? (
                      <p className="text-slate-600 text-sm">No live conflicts right now.</p>
                    ) : (
                      dispatchConflictItems.slice(0, 5).map((item, index) => (
                        <article
                          key={`${item.message}-${index}`}
                          className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:bg-[#fcfaf4]"
                        >
                          <p className="text-[13px] font-semibold text-slate-900 truncate">{item.message}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePage("Calendar");
                              setCalendarStatusFilter("Missing Assignment");
                            }}
                            className="rounded-full border border-[#b89552] bg-[#f4efe6] px-2.5 py-1 text-[11px] font-semibold text-[#7d5d31] shadow-sm"
                          >
                            View
                          </button>
                        </article>
                      ))
                    )}
                  </div>
                </section>

                <section className="bg-white p-3.5 rounded-xl shadow border border-slate-200">
                  <h3 className="text-xl font-bold mb-3">Upcoming Starts</h3>

                  <div className="space-y-2">
                    {sortedUpcomingTourStarts.slice(0, 3).map((trip) => {
                      const readinessStatus = !trip.coachName && !trip.driverName
                        ? "Missing Assignment"
                        : !trip.coachName
                        ? "Missing Coach"
                        : !trip.driverName
                        ? "Missing Driver"
                        : "Ready";

                      const statusClass = readinessStatus === "Ready"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700";

                      return (
                        <article key={trip.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[15px] font-bold text-slate-900 truncate">{trip.tripName}</p>
                              <p className="text-[12px] text-slate-500 truncate">Tour: {trip.tripName}</p>
                              <p className="text-[12px] text-slate-500 truncate">Coach: {trip.coachName || "Unassigned"}</p>
                              <p className="text-[12px] text-slate-500 truncate">Driver: {trip.driverName || "Unassigned"}</p>
                              <p className="text-[12px] text-slate-500 truncate">Start: {trip.startDate || "-"}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                              {readinessStatus}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activePage === "Quotes" && (
          <PageShell>
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h2 className="text-3xl font-bold">Tour Quote Builder</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Create, review, and manage quote workflow from customer to invoice.
                </p>
              </div>
            </div>

            {isQuoteWorkspaceListView && (
              <SectionCard
                title="Quote List"
                action={
                  <ActionButton onClick={newQuote} variant="primary">
                    Create New Quote
                  </ActionButton>
                }
              >
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="w-full lg:max-w-2xl">
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                        Search Quotes
                      </label>
                      <input
                        className="border p-3 rounded w-full"
                        placeholder="Search quote, customer, tour, or status..."
                        value={quoteListSearchTerm}
                        onChange={(e) => setQuoteListSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(["All", "Draft", "Sent", "Accepted", "Rejected"] as const).map((status) => {
                        const isSelected = quoteListStatusFilter === status;

                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setQuoteListStatusFilter(status)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                              isSelected
                                ? "border-[#b89552] bg-[#f6efe2] text-[#7d5d31] shadow-sm"
                                : "border-slate-200 bg-white text-slate-700 hover:border-[#c8ad79] hover:bg-[#fcfaf4]"
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <div className="min-w-[960px]">
                      <div className="grid grid-cols-[0.85fr_1.2fr_1.25fr_0.85fr_1fr_0.9fr_40px] gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                        <div>Quote #</div>
                        <div>Customer</div>
                        <div>Tour</div>
                        <div>Status</div>
                        <div>Dates</div>
                        <div>Amount</div>
                        <div className="text-right">Action</div>
                      </div>

                      <div className="max-h-[calc(100vh-330px)] overflow-y-auto bg-white">
                        {filteredQuoteListQuotes.length === 0 ? (
                          <div className="px-4 py-6 text-sm text-slate-600">
                            {savedQuotes.length === 0
                              ? "No quotes saved yet."
                              : "No quotes match this view."}
                          </div>
                        ) : (
                          filteredQuoteListQuotes.map((savedQuote) => (
                            <button
                              key={savedQuote.id ?? savedQuote.quoteNumber}
                              type="button"
                              onClick={() => {
                                setActiveQuoteTab("Pricing Info");
                                editQuote(savedQuote);
                              }}
                              className="grid w-full grid-cols-[0.85fr_1.2fr_1.25fr_0.85fr_1fr_0.9fr_40px] items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-[#fcfaf4] hover:shadow-[inset_0_1px_0_rgba(184,149,82,0.08)]"
                            >
                              <div className="min-w-0 text-[13px] font-semibold text-[#7d5d31] truncate">
                                {savedQuote.quoteNumber}
                              </div>
                              <div className="min-w-0 text-[14px] font-semibold text-slate-900 truncate">
                                {savedQuote.customerName || "-"}
                              </div>
                              <div className="min-w-0 text-[14px] text-slate-700 truncate">
                                {savedQuote.tourName || "-"}
                              </div>
                              <div className="min-w-0">
                                <StatusBadge
                                  tone={
                                    savedQuote.quoteStatus === "Draft"
                                      ? "info"
                                      : savedQuote.quoteStatus === "Sent"
                                      ? "warning"
                                      : savedQuote.quoteStatus === "Accepted"
                                      ? "success"
                                      : "archived"
                                  }
                                >
                                  {savedQuote.quoteStatus}
                                </StatusBadge>
                              </div>
                              <div className="min-w-0 text-[13px] text-slate-700 truncate">
                                {savedQuote.startDate} - {savedQuote.endDate}
                              </div>
                              <div className="min-w-0 text-[13px] font-semibold text-slate-900 truncate">
                                {money(savedQuote.totalTourBudget)}
                              </div>
                              <div className="text-right text-slate-400 text-lg">›</div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {!isQuoteWorkspaceListView && (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setActiveQuoteTab("Quote List")}
                  className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#c8ad79] hover:bg-[#fcfaf4] hover:text-[#7d5d31]"
                >
                  Back to Quote List
                </button>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className={`${quote.customerName ? "text-4xl" : "text-3xl"} font-bold tracking-tight text-slate-950 truncate`}>
                          {quote.customerName || "No customer selected"}
                        </p>
                        <p className={`${quote.customerName ? "text-2xl" : "text-xl"} font-semibold text-slate-700 truncate`}>
                          {quote.tourName || "Untitled tour"}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Quote Number</p>
                          <p className="mt-1 text-base font-bold text-[#7d5d31] truncate">{quote.quoteNumber || "Draft quote"}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Status</p>
                          <div className="mt-1">
                            <StatusBadge
                              tone={
                                quote.quoteStatus === "Draft"
                                  ? "info"
                                  : quote.quoteStatus === "Sent"
                                  ? "warning"
                                  : quote.quoteStatus === "Accepted"
                                  ? "success"
                                  : "archived"
                              }
                            >
                              {quote.quoteStatus}
                            </StatusBadge>
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Created</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{quoteWorkspaceSavedQuote?.savedAt || "Not saved yet"}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Last Modified</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 truncate">{quoteWorkspaceSavedQuote?.savedAt || "Working draft"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap gap-2 xl:justify-end">
                      <ActionButton onClick={saveQuote} variant="save">
                        Save
                      </ActionButton>
                      <ActionButton
                        onClick={() => console.log("Send Quote prototype action")}
                        variant="secondary"
                        className="border-[#b89552] text-[#7d5d31]"
                      >
                        Send Quote
                      </ActionButton>
                      <ActionButton
                        onClick={() => console.log("Duplicate Quote prototype action")}
                        variant="secondary"
                      >
                        Duplicate
                      </ActionButton>
                      <ActionButton
                        onClick={() => console.log("Archive Quote prototype action")}
                        variant="secondary"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Archive
                      </ActionButton>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.84fr)_minmax(480px,1.42fr)_minmax(260px,0.74fr)] items-start">
                  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:pr-5 xl:border-r-[3px] xl:border-r-[#ece4d2]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">Customer</h3>
                        <p className="text-sm text-slate-600 mt-1">Customer, tour, and routing foundation.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setQuoteWorkspaceSections((previousState) => ({
                            ...previousState,
                            customerBrief: !previousState.customerBrief,
                          }))
                        }
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#c8ad79] hover:bg-[#fcfaf4] hover:text-[#7d5d31]"
                      >
                        {quoteWorkspaceSections.customerBrief ? "Collapse" : "Expand"}
                      </button>
                    </div>

                    {quoteWorkspaceSections.customerBrief && (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                          <h4 className="text-base font-bold text-slate-900">Customer</h4>
                          <div className="mt-3 space-y-2">
                            {[
                              { label: "Customer Name", value: quote.customerName || "No customer selected" },
                              { label: "Company", value: quoteWorkspaceCustomer?.companyName || "No company linked" },
                              { label: "Primary Contact", value: quoteWorkspacePrimaryContactName },
                              { label: "Phone", value: quoteWorkspacePrimaryContactPhone },
                              { label: "Email", value: quoteWorkspacePrimaryContactEmail },
                            ].map((item) => (
                              <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                                <p className={`mt-1 text-sm ${String(item.value).toLowerCase().includes("not ") || String(item.value).toLowerCase().includes("no ") ? "font-medium text-slate-500" : "font-semibold text-slate-900"}`}>{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                          <h4 className="text-base font-bold text-slate-900">Tour</h4>
                          <div className="mt-3 space-y-2">
                            {[
                              { label: "Tour Name", value: quote.tourName || "Untitled Tour" },
                              { label: "Tour Type", value: quote.tourType || "Not captured" },
                              { label: "Start Date", value: quote.startDate || "Not captured" },
                              { label: "End Date", value: quote.endDate || "Not captured" },
                              { label: "Passenger Count", value: quoteWorkspacePassengerCount },
                            ].map((item) => (
                              <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                                <p className={`mt-1 text-sm ${String(item.value).toLowerCase().includes("not ") ? "font-medium text-slate-500" : "font-semibold text-slate-900"}`}>{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base font-bold text-slate-900">Coach Needs</h4>
                            <button
                              type="button"
                              onClick={addCoachNeedRow}
                              className="rounded border border-[#c8ad79] bg-white px-2.5 py-1 text-xs font-semibold text-[#7d5d31] hover:bg-[#fcfaf4]"
                            >
                              + Add Coach Need
                            </button>
                          </div>

                          <div className="mt-3 space-y-3">
                            {quote.coachNeeds.length > 0 && (
                              <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 space-y-0.5">
                                <p className="font-semibold">
                                  {totalCoachesNeeded} {totalCoachesNeeded === 1 ? "Coach Needed" : "Coaches Needed"}
                                </p>
                                {coachNeedTypeSummary.map((summaryLine) => (
                                  <p key={summaryLine}>{summaryLine}</p>
                                ))}
                              </div>
                            )}

                            {quote.coachNeeds.length === 0 ? (
                              <p className="rounded-md border border-dashed border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-500">
                                No coach needs added yet.
                              </p>
                            ) : (
                              quote.coachNeeds.map((coachNeed) => (
                                <div key={coachNeed.id} className="rounded-lg border border-slate-200 bg-white p-2 space-y-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                    <div>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">Coach Type</label>
                                      <select
                                        className="border p-1.5 rounded w-full text-sm"
                                        value={coachNeed.coachType}
                                        onChange={(e) =>
                                          updateCoachNeedType(
                                            coachNeed.id,
                                            ensureCoachTypeValue(e.target.value)
                                          )
                                        }
                                      >
                                        {coachTypeOptions.map((coachType) => (
                                          <option key={coachType} value={coachType}>
                                            {coachType}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">Quantity</label>
                                      <input
                                        type="number"
                                        min={1}
                                        className="border p-1.5 rounded w-full text-sm"
                                        value={coachNeed.quantity}
                                        onChange={(e) => updateCoachNeedQuantity(coachNeed.id, e.target.value)}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">Preferred Coach</label>
                                      <select
                                        className="border p-1.5 rounded w-full text-sm"
                                        value={coachNeed.preferredCoachId}
                                        onChange={(e) => updateCoachNeedPreferredCoach(coachNeed.id, e.target.value)}
                                      >
                                        <option value="">No preferred Coach</option>
                                        {coaches.map((coach) => (
                                          <option key={coach.id} value={String(coach.id)}>
                                            {coach.coachName} ({getCoachOperationalStatus(coach)})
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">Notes</label>
                                      <input
                                        type="text"
                                        className="border p-1.5 rounded w-full text-sm"
                                        value={coachNeed.notes}
                                        onChange={(e) => updateCoachNeedNotes(coachNeed.id, e.target.value)}
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeCoachNeedRow(coachNeed.id)}
                                    className="rounded border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                  >
                                    Remove row
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-base font-bold text-slate-900">Driver Needs</h4>
                            <button
                              type="button"
                              onClick={addDriverNeedRow}
                              className="rounded border border-[#c8ad79] bg-white px-2.5 py-1 text-xs font-semibold text-[#7d5d31] hover:bg-[#fcfaf4]"
                            >
                              + Add Driver Need
                            </button>
                          </div>

                          <div className="mt-3 space-y-3">
                            {quote.driverNeeds.length > 0 && (
                              <div className="rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 space-y-0.5">
                                <p className="font-semibold">
                                  {totalDriversNeeded} {totalDriversNeeded === 1 ? "Driver Needed" : "Drivers Needed"}
                                </p>
                                {driverNeedRoleSummary.map((summaryLine) => (
                                  <p key={summaryLine}>{summaryLine}</p>
                                ))}
                              </div>
                            )}

                            {quote.driverNeeds.length === 0 ? (
                              <p className="rounded-md border border-dashed border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-500">
                                No driver needs added yet.
                              </p>
                            ) : (
                              quote.driverNeeds.map((driverNeed) => (
                                <div key={driverNeed.id} className="rounded-lg border border-slate-200 bg-white p-2 space-y-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                    <div>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">Driver Role</label>
                                      <select
                                        className="border p-1.5 rounded w-full text-sm"
                                        value={driverNeed.driverRole}
                                        onChange={(e) =>
                                          updateDriverNeedRole(
                                            driverNeed.id,
                                            ensureDriverRoleValue(e.target.value)
                                          )
                                        }
                                      >
                                        {driverRoleOptions.map((driverRole) => (
                                          <option key={driverRole} value={driverRole}>
                                            {driverRole}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">Quantity</label>
                                      <input
                                        type="number"
                                        min={1}
                                        className="border p-1.5 rounded w-full text-sm"
                                        value={driverNeed.quantity}
                                        onChange={(e) => updateDriverNeedQuantity(driverNeed.id, e.target.value)}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">Preferred Driver</label>
                                      <select
                                        className="border p-1.5 rounded w-full text-sm"
                                        value={driverNeed.preferredDriverId}
                                        onChange={(e) => updateDriverNeedPreferredDriver(driverNeed.id, e.target.value)}
                                      >
                                        <option value="">No preferred Driver</option>
                                        {drivers.map((driver) => (
                                          <option key={driver.id} value={String(driver.id)}>
                                            {getDriverFullName(driver)} ({getDriverOperationalStatus(driver)})
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">Notes</label>
                                      <input
                                        type="text"
                                        className="border p-1.5 rounded w-full text-sm"
                                        value={driverNeed.notes}
                                        onChange={(e) => updateDriverNeedNotes(driverNeed.id, e.target.value)}
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeDriverNeedRow(driverNeed.id)}
                                    className="rounded border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                  >
                                    Remove row
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                          <h4 className="text-base font-bold text-slate-900">Routing Summary</h4>
                          <div className="mt-3 space-y-2">
                            {[
                              { label: "Origin", value: quoteWorkspaceOrigin },
                              { label: "Destination", value: quoteWorkspaceDestination },
                              { label: "Total Days", value: `${tourDays}` },
                            ].map((item) => (
                              <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                                <p className={`mt-1 text-sm ${String(item.value).toLowerCase().includes("not ") ? "font-medium text-slate-500" : "font-semibold text-slate-900"}`}>{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="rounded-xl border border-[#e7dcc4] bg-white p-5 shadow-md xl:pl-6 xl:pr-6 xl:border-l-[3px] xl:border-r-[3px] xl:border-l-[#ecdcb4] xl:border-r-[#ece4d2]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">Pricing Workbench</h3>
                        <p className="text-sm text-slate-600 mt-1">The live pricing controls and financial output stay here as the main working area.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setQuoteWorkspaceSections((previousState) => ({
                            ...previousState,
                            pricingWorkbench: !previousState.pricingWorkbench,
                          }))
                        }
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#c8ad79] hover:bg-[#fcfaf4] hover:text-[#7d5d31]"
                      >
                        {quoteWorkspaceSections.pricingWorkbench ? "Collapse" : "Expand"}
                      </button>
                    </div>

                    {quoteWorkspaceSections.pricingWorkbench && (
                      <div className="mt-5 space-y-5">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          {[
                            { label: "Revenue", value: money(totalTourBudget) },
                            { label: "Costs", value: money(estimatedCost) },
                            { label: "Margin", value: `${money(grossProfit)} · ${(marginPercent * 100).toFixed(1)}%` },
                            { label: "Fuel", value: money(fuelTotal) },
                            { label: "Hotels", value: money(hotelTotal) },
                            { label: "Driver Pay", value: money(driverTotal) },
                            { label: "Taxes", value: "$0.00" },
                            { label: "Grand Total", value: money(totalTourBudget) },
                          ].map((metric) => (
                            <article key={metric.label} className={`rounded-lg border px-3 py-2 shadow-sm ${metric.label === "Grand Total" ? "border-[#d5bf90] bg-[#f6efe2]" : metric.label === "Margin" ? "border-[#e7dcc4] bg-[#faf7f0]" : "border-slate-200 bg-slate-50"}`}>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                              <p className={`mt-1 font-bold ${metric.label === "Grand Total" ? "text-2xl text-[#7d5d31]" : metric.label === "Margin" ? "text-xl text-slate-900" : "text-lg text-slate-900"}`}>{metric.value}</p>
                            </article>
                          ))}
                        </div>

                        <div>
                          <h4 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4">Pricing Controls</h4>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <label className="block font-semibold mb-1">Total Miles</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.miles || ""} onChange={(e) => updateQuote("miles", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Bus Day Rate</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.busDayRate || ""} onChange={(e) => updateQuote("busDayRate", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Driver Day Rate</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.driverDayRate || ""} onChange={(e) => updateQuote("driverDayRate", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Fuel Rate</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.fuelRate || ""} onChange={(e) => updateQuote("fuelRate", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Per Diem Rate</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.perDiemRate || ""} onChange={(e) => updateQuote("perDiemRate", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Main Engine Service Rate</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.mainEngineServiceRate || ""} onChange={(e) => updateQuote("mainEngineServiceRate", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Generator Rate / Week</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.generatorWeeklyRate || ""} onChange={(e) => updateQuote("generatorWeeklyRate", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Wireless Rate / Day</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.wirelessDailyRate || ""} onChange={(e) => updateQuote("wirelessDailyRate", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Hotel Buyout Qty</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.hotelQty || ""} onChange={(e) => updateQuote("hotelQty", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Hotel Buyout Rate</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.hotelRate || ""} onChange={(e) => updateQuote("hotelRate", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Payroll Fee</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.payrollFee || ""} onChange={(e) => updateQuote("payrollFee", e.target.value)} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Admin Fee</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.adminFee || ""} onChange={(e) => updateQuote("adminFee", e.target.value)} />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <label className="flex items-center gap-2 font-bold mb-4">
                            <input type="checkbox" checked={quote.useDeadhead} onChange={(e) => updateQuote("useDeadhead", e.target.checked)} />
                            Include Deadhead Days
                          </label>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <label className="font-semibold">Bus DH Before</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.busDHF} onChange={(e) => updateQuote("busDHF", e.target.value)} disabled={!quote.useDeadhead} />
                            </div>
                            <div>
                              <label className="font-semibold">Bus DH After</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.busDHR} onChange={(e) => updateQuote("busDHR", e.target.value)} disabled={!quote.useDeadhead} />
                            </div>
                            <div>
                              <label className="font-semibold">Driver DH Before</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.driverDHF} onChange={(e) => updateQuote("driverDHF", e.target.value)} disabled={!quote.useDeadhead} />
                            </div>
                            <div>
                              <label className="font-semibold">Driver DH After</label>
                              <input type="number" className="border p-3 rounded w-full" value={quote.driverDHR} onChange={(e) => updateQuote("driverDHR", e.target.value)} disabled={!quote.useDeadhead} />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4">Auto Calculated Fields</h4>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <label className="font-semibold">Tour Days</label>
                              <input className="border p-3 rounded bg-slate-100 w-full" value={tourDays} readOnly />
                            </div>
                            <div>
                              <label className="font-semibold">Billed Bus Days</label>
                              <input className="border p-3 rounded bg-slate-100 w-full" value={billedDays} readOnly />
                            </div>
                            <div>
                              <label className="font-semibold">Driver Days</label>
                              <input className="border p-3 rounded bg-slate-100 w-full" value={driverDays} readOnly />
                            </div>
                            <div>
                              <label className="font-semibold">Billed Months</label>
                              <input className="border p-3 rounded bg-slate-100 w-full" value={billedMonths.toFixed(2)} readOnly />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4">Charge Lines</h4>
                          <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-slate-50">
                                  <th className="border-b p-2 text-left text-sm">Charge</th>
                                  <th className="border-b p-2 text-left text-sm">Qty</th>
                                  <th className="border-b p-2 text-left text-sm">Rate</th>
                                  <th className="border-b p-2 text-left text-sm">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoiceLines.map((line) => (
                                  <tr key={line.description} className="bg-white">
                                    <td className="border-b p-2 text-sm">{line.description}</td>
                                    <td className="border-b p-2 text-sm">{line.qty.toFixed(2)}</td>
                                    <td className="border-b p-2 text-sm">{money(line.rate)}</td>
                                    <td className="border-b p-2 text-sm font-semibold">{money(line.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:pl-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">Workflow</h3>
                        <p className="text-sm text-slate-600 mt-1">Current stage, recent activity, and internal notes.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setQuoteWorkspaceSections((previousState) => ({
                            ...previousState,
                            workflowRail: !previousState.workflowRail,
                          }))
                        }
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#c8ad79] hover:bg-[#fcfaf4] hover:text-[#7d5d31]"
                      >
                        {quoteWorkspaceSections.workflowRail ? "Collapse" : "Expand"}
                      </button>
                    </div>

                    {quoteWorkspaceSections.workflowRail && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500 mb-3">Workflow</h4>
                          <div className="space-y-1">
                            {quoteWorkspaceWorkflowStages.map((stage, index) => {
                              const isCurrentStage = stage === quoteWorkspaceCurrentStage;
                              const currentStageIndex = quoteWorkspaceWorkflowStages.indexOf(quoteWorkspaceCurrentStage);
                              const stageIndex = quoteWorkspaceWorkflowStages.indexOf(stage);
                              const isCompletedStage = stageIndex < currentStageIndex;

                              return (
                                <div key={stage} className="space-y-1">
                                  <div
                                    className={`rounded-lg border px-3 py-1.5 ${
                                      isCurrentStage
                                        ? "border-[#b89552] bg-[#f6efe2]"
                                        : isCompletedStage
                                        ? "border-slate-200 bg-slate-100"
                                        : "border-slate-200 bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <p className={`text-sm font-semibold ${isCurrentStage ? "text-[#7d5d31]" : isCompletedStage ? "text-slate-500" : "text-slate-700"}`}>
                                        {stage}
                                      </p>
                                      {isCompletedStage ? (
                                        <span className="text-xs font-semibold text-slate-500">✓</span>
                                      ) : isCurrentStage ? (
                                        <span className="text-xs font-semibold text-[#7d5d31]">Current</span>
                                      ) : null}
                                    </div>
                                  </div>
                                  {index < quoteWorkspaceWorkflowStages.length - 1 && (
                                    <div className="flex justify-center text-slate-300 text-xs">↓</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Activity Timeline</h4>
                          <div className="space-y-1.5">
                            {quoteWorkspaceActivityTimeline.slice(0, 4).map((item) => (
                              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Internal Notes</h4>
                          <textarea className="min-h-24 w-full rounded border p-3" placeholder="Internal notes" />
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: "operationsNotes" as const,
                      title: "Operations Notes",
                      content: (
                        <textarea className="min-h-24 w-full rounded border p-3" placeholder="Operations notes" />
                      ),
                    },
                    {
                      key: "salesNotes" as const,
                      title: "Sales Notes",
                      content: (
                        <textarea className="min-h-24 w-full rounded border p-3" placeholder="Sales notes" />
                      ),
                    },
                    {
                      key: "attachments" as const,
                      title: "Attachments",
                      content: (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-sm text-slate-600">
                          No attachments.
                        </div>
                      ),
                    },
                    {
                      key: "documents" as const,
                      title: "Documents",
                      content: (
                        <div className="space-y-3">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Invoice Preview</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{invoiceLines.length} charge lines · {money(totalTourBudget)}</p>
                          </div>
                          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-sm text-slate-600">
                            No documents.
                          </div>
                        </div>
                      ),
                    },
                  ].map((section) => (
                    <section key={section.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold">{section.title}</h3>
                        <button
                          type="button"
                          onClick={() =>
                            setQuoteWorkspaceSections((previousState) => ({
                              ...previousState,
                              [section.key]: !previousState[section.key],
                            }))
                          }
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#c8ad79] hover:bg-[#fcfaf4] hover:text-[#7d5d31]"
                        >
                          {quoteWorkspaceSections[section.key] ? "Collapse" : "Expand"}
                        </button>
                      </div>

                      {quoteWorkspaceSections[section.key] && <div className="mt-4">{section.content}</div>}
                    </section>
                  ))}
                </div>
              </div>
            )}
          </PageShell>
        )}

        {activePage === "Coaches" && (
          <PageShell>
            <PageHeader
              title="Coach Management"
              subtitle="Coach availability, utilization, and coach records."
              action={
                <ActionButton
                  variant="primary"
                  onClick={() => {
                    setNewCoach({
                      id: 0,
                      coachName: "",
                      vin: "",
                      year: "",
                      model: "",
                      coachType: "Star Coach",
                      baseStatus: "Available",
                      licensePlate: "",
                      currentLocation: "",
                      notes: "",
                      soldDate: "",
                      isArchived: false,
                    });
                    setShowAddCoachModal(true);
                  }}
                  className="self-start md:self-auto"
                >
                  Add Coach
                </ActionButton>
              }
            />

            {showAddCoachModal && (
              <ModalShell
                title="Add Coach"
                className="max-w-3xl"
                onClose={() => setShowAddCoachModal(false)}
                footer={
                  <>
                    <ActionButton onClick={addCoach} variant="save">
                      Save Coach
                    </ActionButton>
                    <ActionButton
                      onClick={() => setShowAddCoachModal(false)}
                      variant="cancel"
                    >
                      Cancel
                    </ActionButton>
                  </>
                }
              >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="border p-3 rounded"
                      placeholder="Coach Name"
                      value={newCoach.coachName}
                      onChange={(e) => updateNewCoach("coachName", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="VIN"
                      value={newCoach.vin}
                      onChange={(e) => updateNewCoach("vin", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Year"
                      value={newCoach.year}
                      onChange={(e) => updateNewCoach("year", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Model"
                      value={newCoach.model}
                      onChange={(e) => updateNewCoach("model", e.target.value)}
                    />

                    <select
                      className="border p-3 rounded"
                      value={newCoach.coachType}
                      onChange={(e) =>
                        updateNewCoach(
                          "coachType",
                          e.target.value as
                            | "Star Coach"
                            | "Crew Coach"
                            | "Entertainer Coach"
                            | "Sleeper Coach"
                        )
                      }
                    >
                      <option>Star Coach</option>
                      <option>Crew Coach</option>
                      <option>Entertainer Coach</option>
                      <option>Sleeper Coach</option>
                    </select>

                    <select
                      className="border p-3 rounded"
                      value={newCoach.baseStatus === "Sold" ? "Sold / Archived" : newCoach.baseStatus}
                      onChange={(e) =>
                        updateNewCoach(
                          "baseStatus",
                          e.target.value === "Sold / Archived"
                            ? "Sold"
                            : (e.target.value as "Available" | "Maintenance")
                        )
                      }
                    >
                      <option>Available</option>
                      <option>Maintenance</option>
                      <option>Sold / Archived</option>
                    </select>

                    <input
                      className="border p-3 rounded"
                      placeholder="Trailer"
                      value={newCoach.licensePlate || ""}
                      onChange={(e) => updateNewCoach("licensePlate", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Location / Home Base"
                      value={newCoach.currentLocation || ""}
                      onChange={(e) => updateNewCoach("currentLocation", e.target.value)}
                    />

                    <textarea
                      className="border p-3 rounded md:col-span-2 min-h-24"
                      placeholder="Notes"
                      value={newCoach.notes || ""}
                      onChange={(e) => updateNewCoach("notes", e.target.value)}
                    />
                  </div>

              </ModalShell>
            )}

            <SectionCard title="Coach List">

              <div className="bl-kpi-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-4">
                <MetricCard label="Total Coaches" value={totalCoachesCount} />
                <MetricCard label="Available" value={availableCoachesCount} tone="success" />
                <MetricCard label="On Tour" value={onTourCoachesCount} tone="premium" />
                <MetricCard
                  label="Maintenance"
                  value={maintenanceCoachesCount}
                  tone="warning"
                />
                <MetricCard
                  label="Sold / Archived"
                  value={soldArchivedCoachesCount}
                  tone="archived"
                />
                <MetricCard
                  label="Coach Utilization"
                  value={`${coachUtilizationPercent}%`}
                  subtitle={`${onTourCoachesCount} on tour / ${activeCoachesCount} active`}
                  tone={
                    coachUtilizationPercent >= 85
                      ? "success"
                      : coachUtilizationPercent >= 70
                      ? "warning"
                      : "danger"
                  }
                />
              </div>

              <FilterBar>

              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  "All",
                  "Available",
                  "On Tour",
                  "Maintenance",
                  "Sold / Archived",
                ].map((quickFilter) => {
                  const isSelected = coachStatusFilter === quickFilter;

                  return (
                    <button
                      key={quickFilter}
                      onClick={() =>
                        updateCoachStatusFilter(
                          quickFilter as
                            | "All"
                            | "Available"
                            | "On Tour"
                            | "Maintenance"
                            | "Sold / Archived"
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                        isSelected
                          ? "bg-slate-700 text-white border-[#b89552]"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {quickFilter}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                <input
                  className="border p-3 rounded w-full"
                  placeholder="Search coaches by name, VIN, model, trailer, location, or status..."
                  value={coachSearchTerm}
                  onChange={(e) => setCoachSearchTerm(e.target.value)}
                />

                <select
                  className="border p-3 rounded w-full"
                  value={coachStatusFilter}
                  onChange={(e) =>
                    updateCoachStatusFilter(
                      e.target.value as
                        | "All"
                        | "Available"
                        | "On Tour"
                        | "Maintenance"
                        | "Sold / Archived"
                    )
                  }
                >
                  <option>All</option>
                  <option>Available</option>
                  <option>On Tour</option>
                  <option>Maintenance</option>
                  <option>Sold / Archived</option>
                </select>

                <select
                  className="border p-3 rounded w-full"
                  value={coachRowLimit}
                  onChange={(e) =>
                    setCoachRowLimit(e.target.value as "25" | "50" | "100" | "All")
                  }
                >
                  <option value="25">Show 25</option>
                  <option value="50">Show 50</option>
                  <option value="100">Show 100</option>
                  <option value="All">Show All</option>
                </select>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 px-3 py-2 rounded border border-slate-300 bg-slate-50">
                  <input
                    type="checkbox"
                    checked={showArchivedCoaches}
                    onChange={(e) => setShowArchivedCoaches(e.target.checked)}
                  />
                  Show Sold / Archived
                </label>
              </div>

                <p className="text-sm text-slate-600 mb-3">
                  Showing {limitedDisplayedCoaches.length} of {displayedCoaches.length} coaches
                </p>
                <p className="text-xs text-slate-500">
                  {showArchivedCoaches || coachStatusFilter === "Sold / Archived"
                    ? "Including archived"
                    : "Archived hidden"}
                </p>
              </FilterBar>

              <div className="lux-scroll-panel min-h-[360px] max-h-[calc(100vh-420px)] overflow-y-auto rounded-lg border">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#e6e1d8] px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "coach", label: "Coach" },
                      { key: "operationalStatus", label: "Operational Status" },
                      { key: "baseStatus", label: "Base Status" },
                      { key: "currentTour", label: "Current Tour" },
                      { key: "upcomingTours", label: "Upcoming Tours" },
                      { key: "location", label: "Location" },
                    ].map((option) => {
                      const isActive = coachListSort.key === option.key;
                      const arrow =
                        isActive && coachListSort.direction === "asc"
                          ? "↑"
                          : isActive
                          ? "↓"
                          : "";

                      return (
                        <ActionButton
                          key={option.key}
                          variant="secondary"
                          onClick={() => toggleCoachListSort(option.key as CoachListSortKey)}
                          className={`px-3 py-1.5 text-sm border transition-colors ${
                            isActive
                              ? "bg-slate-700 text-white border-[#b89552]"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {option.label} {arrow}
                        </ActionButton>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 p-2">
                  {limitedDisplayedCoaches.map((coach) => {
                  const coachStatus = getCoachOperationalStatus(coach);
                  const coachTourSummary = getCoachTourSummary(coach);

                  return (
                    <ListRow key={coach.id}>
                      <div className="min-w-0 xl:w-72">
                        <p className="font-semibold text-slate-900 truncate">{coach.coachName || "-"}</p>
                        <p className="text-xs text-slate-600 truncate">VIN: {coach.vin || "-"}</p>
                        <p className="text-xs text-slate-600 truncate">
                          Trailer: {coach.licensePlate || "Not set"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-1.5 text-xs text-slate-700 xl:flex-1">
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Operational</p>
                          <StatusBadge
                            tone={
                              coachStatus === "Available"
                                ? "success"
                                : coachStatus === "On Tour"
                                ? "info"
                                : coachStatus === "Maintenance"
                                ? "warning"
                                : "archived"
                            }
                          >
                            {coachStatus}
                          </StatusBadge>
                        </div>
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Base Status</p>
                          <p className="font-semibold mt-1">{coach.baseStatus || "-"}</p>
                        </div>
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Current Tour</p>
                          <p className="font-semibold mt-1 truncate">
                            {coachTourSummary.currentTour?.tripName || "-"}
                          </p>
                        </div>
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Upcoming Tours</p>
                          <p className="font-semibold mt-1">{coachTourSummary.upcomingToursCount}</p>
                        </div>
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Location</p>
                          <p className="font-semibold mt-1 truncate">{coach.currentLocation || "-"}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ActionButton onClick={() => openCoachDetails(coach)} variant="details">
                          Details
                        </ActionButton>
                      </div>
                    </ListRow>
                  );
                })}

                  {displayedCoaches.length === 0 && (
                    <EmptyState title="No coaches match this view." />
                  )}
                </div>
              </div>
            </SectionCard>

            {selectedCoach && selectedCoachTourSummary && (
              <ModalShell
                title="Coach Details"
                onClose={() => {
                  setSelectedCoachId(null);
                  setIsEditingCoach(false);
                  setEditedCoach(null);
                }}
                footer={
                  isEditingCoach ? (
                    <>
                      <ActionButton onClick={saveCoachDetails} variant="save">
                        Save
                      </ActionButton>
                      <ActionButton onClick={cancelCoachDetailsEdit} variant="cancel">
                        Cancel
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton onClick={startEditingCoachDetails} variant="edit">
                        Edit
                      </ActionButton>

                      {getCoachOperationalStatus(selectedCoach) === "Sold / Archived" ? (
                        <StatusBadge tone="archived">Sold / Archived</StatusBadge>
                      ) : (
                        <ActionButton
                          onClick={() => markCoachSold(selectedCoach.id)}
                          variant="secondary"
                          className="bg-slate-700 text-white border-[#b89552]"
                        >
                          Archive
                        </ActionButton>
                      )}

                      <ActionButton
                        onClick={() => {
                          setSelectedCoachId(null);
                          setIsEditingCoach(false);
                          setEditedCoach(null);
                        }}
                        variant="cancel"
                      >
                        Close
                      </ActionButton>
                    </>
                  )
                }
              >

                  <div className="space-y-5 text-sm">
                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">
                        Coach Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-slate-700">Coach Name</span>
                          {isEditingCoach ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedCoach?.coachName || ""}
                              onChange={(e) =>
                                updateEditedCoach("coachName", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">{selectedCoach.coachName || "-"}</p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">VIN</span>
                          {isEditingCoach ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedCoach?.vin || ""}
                              onChange={(e) => updateEditedCoach("vin", e.target.value)}
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">{selectedCoach.vin || "-"}</p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Year</span>
                          {isEditingCoach ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedCoach?.year || ""}
                              onChange={(e) => updateEditedCoach("year", e.target.value)}
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">{selectedCoach.year || "-"}</p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Model</span>
                          {isEditingCoach ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedCoach?.model || ""}
                              onChange={(e) => updateEditedCoach("model", e.target.value)}
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">{selectedCoach.model || "-"}</p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Coach Type / Style</span>
                          {isEditingCoach ? (
                            <select
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedCoach?.coachType || "Star Coach"}
                              onChange={(e) =>
                                updateEditedCoach("coachType", e.target.value)
                              }
                            >
                              <option>Star Coach</option>
                              <option>Crew Coach</option>
                              <option>Entertainer Coach</option>
                              <option>Sleeper Coach</option>
                            </select>
                          ) : (
                            <p className="mt-1 text-slate-900">{selectedCoach.coachType || "-"}</p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">
                        Status / Utilization
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-slate-700">Operational Status</span>
                          <p className="mt-1 text-slate-900">
                            {getCoachOperationalStatus(selectedCoach)}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Base Status</span>
                          {isEditingCoach ? (
                            <select
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedCoach?.baseStatus === "Sold" ? "Sold / Archived" : editedCoach?.baseStatus || "Available"}
                              onChange={(e) =>
                                updateEditedCoach(
                                  "baseStatus",
                                  e.target.value === "Sold / Archived"
                                    ? "Sold"
                                    : e.target.value
                                )
                              }
                            >
                              <option>Available</option>
                              <option>Maintenance</option>
                              <option>Sold / Archived</option>
                            </select>
                          ) : (
                            <p className="mt-1 text-slate-900">{selectedCoach.baseStatus || "-"}</p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Current Tour</span>
                          <p className="mt-1 text-slate-900">
                            {selectedCoachTourSummary.currentTour
                              ? selectedCoachTourSummary.currentTour.tripName
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Upcoming Tours</span>
                          <p className="mt-1 text-slate-900">
                            {selectedCoachTourSummary.upcomingToursCount}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Last Tour Date</span>
                          <p className="mt-1 text-slate-900">
                            {selectedCoachTourSummary.lastTourDate || "N/A"}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">
                        Assignment Info
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-slate-700">Trailer</span>
                          {isEditingCoach ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedCoach?.licensePlate || ""}
                              onChange={(e) =>
                                updateEditedCoach("licensePlate", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">{selectedCoach.licensePlate || "-"}</p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">
                            Location / Home Base
                          </span>
                          {isEditingCoach ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedCoach?.currentLocation || ""}
                              onChange={(e) =>
                                updateEditedCoach("currentLocation", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">{selectedCoach.currentLocation || "-"}</p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">Notes</h4>
                      <div>
                        {isEditingCoach ? (
                          <textarea
                            className="border border-slate-300 p-2 rounded w-full mt-1 min-h-24"
                            value={editedCoach?.notes || ""}
                            onChange={(e) => updateEditedCoach("notes", e.target.value)}
                          />
                        ) : (
                          <p className="text-slate-900 whitespace-pre-wrap">
                            {selectedCoach.notes || "-"}
                          </p>
                        )}
                      </div>
                    </section>
                  </div>

              </ModalShell>
            )}
          </PageShell>
        )}

        {activePage === "Drivers" && (
          <PageShell>
            <PageHeader
              title="Driver Management"
              subtitle="Driver availability, utilization, and driver records."
              action={
                <ActionButton
                  variant="primary"
                  onClick={() => {
                    setNewDriver({
                      id: 0,
                      firstName: "",
                      lastName: "",
                      phone: "",
                      email: "",
                      address: "",
                      baseStatus: "Active",
                      emergencyContactName: "",
                      emergencyContactPhone: "",
                      homeBase: "",
                      notes: "",
                    });
                    setShowAddDriverModal(true);
                  }}
                  className="self-start md:self-auto"
                >
                  Add Driver
                </ActionButton>
              }
            />

            {showAddDriverModal && (
              <ModalShell
                title="Add Driver"
                className="max-w-3xl"
                onClose={() => setShowAddDriverModal(false)}
                footer={
                  <>
                    <ActionButton onClick={addDriver} variant="save">
                      Save Driver
                    </ActionButton>
                    <ActionButton
                      onClick={() => setShowAddDriverModal(false)}
                      variant="cancel"
                    >
                      Cancel
                    </ActionButton>
                  </>
                }
              >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="border p-3 rounded"
                      placeholder="First Name"
                      value={newDriver.firstName}
                      onChange={(e) => updateNewDriver("firstName", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Last Name"
                      value={newDriver.lastName}
                      onChange={(e) => updateNewDriver("lastName", e.target.value)}
                    />

                    <select
                      className="border p-3 rounded"
                      value={newDriver.baseStatus}
                      onChange={(e) =>
                        updateNewDriver(
                          "baseStatus",
                          e.target.value as "Active" | "Inactive" | "Vacation"
                        )
                      }
                    >
                      <option>Active</option>
                      <option>Vacation</option>
                      <option>Inactive</option>
                    </select>

                    <input
                      className="border p-3 rounded"
                      placeholder="Phone"
                      value={newDriver.phone}
                      onChange={(e) => updateNewDriver("phone", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Email"
                      value={newDriver.email}
                      onChange={(e) => updateNewDriver("email", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Address"
                      value={newDriver.address}
                      onChange={(e) => updateNewDriver("address", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Emergency Contact Name"
                      value={newDriver.emergencyContactName || ""}
                      onChange={(e) =>
                        updateNewDriver("emergencyContactName", e.target.value)
                      }
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Emergency Contact Phone"
                      value={newDriver.emergencyContactPhone || ""}
                      onChange={(e) =>
                        updateNewDriver("emergencyContactPhone", e.target.value)
                      }
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Home Base"
                      value={newDriver.homeBase || ""}
                      onChange={(e) => updateNewDriver("homeBase", e.target.value)}
                    />

                    <textarea
                      className="border p-3 rounded md:col-span-2 min-h-24"
                      placeholder="Notes"
                      value={newDriver.notes || ""}
                      onChange={(e) => updateNewDriver("notes", e.target.value)}
                    />
                  </div>

              </ModalShell>
            )}

            <SectionCard title="Driver List">

              <div className="bl-kpi-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-4">
                <MetricCard label="Total Drivers" value={totalDriversCount} />
                <MetricCard label="Available" value={availableDriversCount} tone="success" />
                <MetricCard label="On Tour" value={onTourDriversCount} tone="premium" />
                <MetricCard label="Vacation" value={vacationDriversCount} tone="warning" />
                <MetricCard label="Inactive" value={inactiveDriversCount} tone="archived" />
                <MetricCard
                  label="Driver Utilization"
                  value={`${driverUtilizationPercent}%`}
                  subtitle={`${onTourDriversCount} on tour / ${activeDriversCount} active`}
                  tone={
                    driverUtilizationPercent >= 85
                      ? "success"
                      : driverUtilizationPercent >= 70
                      ? "warning"
                      : "danger"
                  }
                />
              </div>

              <FilterBar>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(["All", "Available", "On Tour", "Vacation", "Inactive"] as const).map(
                    (quickFilter) => {
                      const isSelected = driverStatusFilter === quickFilter;

                      return (
                        <button
                          key={quickFilter}
                          onClick={() => updateDriverStatusFilter(quickFilter)}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                            isSelected
                              ? "bg-slate-700 text-white border-[#b89552]"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {quickFilter}
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                  <input
                    className="border p-3 rounded w-full"
                    placeholder="Search drivers by name, phone, email, or status..."
                    value={driverSearchTerm}
                    onChange={(e) => setDriverSearchTerm(e.target.value)}
                  />

                  <select
                    className="border p-3 rounded w-full"
                    value={driverStatusFilter}
                    onChange={(e) =>
                      updateDriverStatusFilter(
                        e.target.value as
                          | "All"
                          | "Available"
                          | "On Tour"
                          | "Active"
                          | "Vacation"
                          | "Inactive"
                      )
                    }
                  >
                    <option>All</option>
                    <option>Available</option>
                    <option>On Tour</option>
                    <option>Active</option>
                    <option>Vacation</option>
                    <option>Inactive</option>
                  </select>

                  <select
                    className="border p-3 rounded w-full"
                    value={driverRowLimit}
                    onChange={(e) =>
                      setDriverRowLimit(e.target.value as "25" | "50" | "100" | "All")
                    }
                  >
                    <option value="25">Show 25</option>
                    <option value="50">Show 50</option>
                    <option value="100">Show 100</option>
                    <option value="All">Show All</option>
                  </select>

                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 px-3 py-2 rounded border border-slate-300 bg-slate-50">
                    <input
                      type="checkbox"
                      checked={showArchivedDrivers}
                      onChange={(e) => setShowArchivedDrivers(e.target.checked)}
                    />
                    Show Archived / Inactive
                  </label>
                </div>

                <p className="text-sm text-slate-600 mb-3">
                  Showing {limitedDisplayedDrivers.length} of {displayedDrivers.length} drivers
                </p>
                <p className="text-xs text-slate-500">
                  {showArchivedDrivers || driverStatusFilter === "Inactive"
                    ? "Including archived"
                    : "Archived hidden"}
                </p>
              </FilterBar>

              <div className="lux-scroll-panel min-h-[360px] max-h-[calc(100vh-420px)] overflow-y-auto rounded-lg border">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#e6e1d8] px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "driver", label: "Driver" },
                      { key: "operationalStatus", label: "Operational Status" },
                      { key: "baseStatus", label: "Base Status" },
                      { key: "currentTour", label: "Current Tour" },
                      { key: "upcomingTours", label: "Upcoming Tours" },
                      { key: "homeBase", label: "Home Base" },
                    ].map((option) => {
                      const isActive = driverListSort.key === option.key;
                      const arrow =
                        isActive && driverListSort.direction === "asc"
                          ? "↑"
                          : isActive
                          ? "↓"
                          : "";

                      return (
                        <ActionButton
                          key={option.key}
                          variant="secondary"
                          onClick={() => toggleDriverListSort(option.key as DriverListSortKey)}
                          className={`px-3 py-1.5 text-sm border transition-colors ${
                            isActive
                              ? "bg-slate-700 text-white border-[#b89552]"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {option.label} {arrow}
                        </ActionButton>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 p-2">
                  {limitedDisplayedDrivers.map((driver) => {
                  const status = getDriverOperationalStatus(driver);
                  const driverTourSummary = getDriverTourSummary(driver);

                  return (
                    <ListRow key={driver.id}>
                      <div className="min-w-0 xl:w-72">
                        <p className="font-semibold text-slate-900 leading-tight truncate">
                          {getDriverFullName(driver)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{driver.phone || "-"}</p>
                        <p className="text-xs text-slate-500 truncate">{driver.email || "-"}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-1.5 text-xs text-slate-700 xl:flex-1">
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Operational</p>
                          <StatusBadge
                            tone={
                              status === "Available"
                                ? "success"
                                : status === "On Tour"
                                ? "info"
                                : "danger"
                            }
                          >
                            {status}
                          </StatusBadge>
                        </div>
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Base Status</p>
                          <p className="font-semibold mt-1">{driver.baseStatus}</p>
                        </div>
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Current Tour</p>
                          <p className="font-semibold mt-1 truncate">
                            {driverTourSummary.currentTour?.tripName || "-"}
                          </p>
                        </div>
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Upcoming Tours</p>
                          <p className="font-semibold mt-1">{driverTourSummary.upcomingToursCount}</p>
                        </div>
                        <div className="bg-slate-50 border rounded px-2 py-1">
                          <p className="text-[11px] text-slate-500">Home Base</p>
                          <p className="font-semibold mt-1 truncate">{driver.homeBase || "-"}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ActionButton onClick={() => openDriverDetails(driver)} variant="details">
                          Details
                        </ActionButton>
                      </div>
                    </ListRow>
                  );
                })}

                  {displayedDrivers.length === 0 && (
                    <EmptyState title="No drivers match this view." />
                  )}
                </div>
              </div>
            </SectionCard>

            {selectedDriverDetails && selectedDriverTourSummary && (
              <ModalShell
                title="Driver Details"
                onClose={() => setSelectedDriverForDetails(null)}
                footer={
                  isEditingDriverDetails ? (
                    <>
                      <ActionButton onClick={saveDriverDetails} variant="save">
                        Save
                      </ActionButton>
                      <ActionButton onClick={cancelDriverDetailsEdit} variant="cancel">
                        Cancel
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton onClick={startEditingDriverDetails} variant="edit">
                        Edit
                      </ActionButton>

                      {selectedDriverDetails.baseStatus === "Inactive" ? (
                        <StatusBadge tone="archived">Archived</StatusBadge>
                      ) : (
                        <ActionButton
                          onClick={() => archiveDriver(selectedDriverDetails.id)}
                          variant="secondary"
                          className="bg-slate-700 text-white border-[#b89552]"
                        >
                          Archive
                        </ActionButton>
                      )}

                      <ActionButton
                        onClick={() => setSelectedDriverForDetails(null)}
                        variant="cancel"
                      >
                        Close
                      </ActionButton>
                    </>
                  )
                }
              >

                  <div className="space-y-5 text-sm">
                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">
                        Driver Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-slate-700">Full Name</span>
                          <p className="mt-1 text-slate-900">
                            {getDriverFullName(selectedDriverDetails)}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">
                            Operational Status
                          </span>
                          <p className="mt-1 text-slate-900">
                            {getDriverOperationalStatus(selectedDriverDetails)}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">First Name</span>
                          {isEditingDriverDetails ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.firstName || ""}
                              onChange={(e) =>
                                updateEditedDriverDetails("firstName", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.firstName || "-"}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Last Name</span>
                          {isEditingDriverDetails ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.lastName || ""}
                              onChange={(e) =>
                                updateEditedDriverDetails("lastName", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.lastName || "-"}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">
                        Contact Info
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-slate-700">Phone</span>
                          {isEditingDriverDetails ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.phone || ""}
                              onChange={(e) =>
                                updateEditedDriverDetails("phone", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.phone || "-"}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Email</span>
                          {isEditingDriverDetails ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.email || ""}
                              onChange={(e) =>
                                updateEditedDriverDetails("email", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.email || "-"}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-semibold text-slate-700">Address</span>
                          {isEditingDriverDetails ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.address || ""}
                              onChange={(e) =>
                                updateEditedDriverDetails("address", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.address || "-"}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">
                        Compliance / Status
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-slate-700">Base Status</span>
                          {isEditingDriverDetails ? (
                            <select
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.baseStatus || "Active"}
                              onChange={(e) =>
                                updateEditedDriverDetails("baseStatus", e.target.value)
                              }
                            >
                              <option>Active</option>
                              <option>Vacation</option>
                              <option>Inactive</option>
                            </select>
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.baseStatus}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Home Base</span>
                          {isEditingDriverDetails ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.homeBase || ""}
                              onChange={(e) =>
                                updateEditedDriverDetails("homeBase", e.target.value)
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.homeBase || "-"}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Current Tour</span>
                          <p className="mt-1 text-slate-900">
                            {selectedDriverTourSummary.currentTour
                              ? selectedDriverTourSummary.currentTour.tripName
                              : "None"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Upcoming Tours</span>
                          <p className="mt-1 text-slate-900">
                            {selectedDriverTourSummary.upcomingToursCount}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Last Tour Date</span>
                          <p className="mt-1 text-slate-900">
                            {selectedDriverTourSummary.lastTourDate || "N/A"}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">
                        Emergency Contact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-slate-700">
                            Contact Name
                          </span>
                          {isEditingDriverDetails ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.emergencyContactName || ""}
                              onChange={(e) =>
                                updateEditedDriverDetails(
                                  "emergencyContactName",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.emergencyContactName || "-"}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">
                            Contact Phone
                          </span>
                          {isEditingDriverDetails ? (
                            <input
                              className="border border-slate-300 p-2 rounded w-full mt-1"
                              value={editedDriverDetails?.emergencyContactPhone || ""}
                              onChange={(e) =>
                                updateEditedDriverDetails(
                                  "emergencyContactPhone",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <p className="mt-1 text-slate-900">
                              {selectedDriverDetails.emergencyContactPhone || "-"}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="border border-slate-200 rounded-lg p-4">
                      <h4 className="text-base font-semibold text-slate-900 mb-3">Notes</h4>
                      <div>
                        {isEditingDriverDetails ? (
                          <textarea
                            className="border border-slate-300 p-2 rounded w-full mt-1 min-h-24"
                            value={editedDriverDetails?.notes || ""}
                            onChange={(e) =>
                              updateEditedDriverDetails("notes", e.target.value)
                            }
                          />
                        ) : (
                          <p className="text-slate-900 whitespace-pre-wrap">
                            {selectedDriverDetails.notes || "-"}
                          </p>
                        )}
                      </div>
                    </section>
                  </div>

              </ModalShell>
            )}
          </PageShell>
        )}

        {activePage === "Customers" && (
          <PageShell>
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h2 className="text-3xl font-bold">Customer Workspace</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Customer relationships, booking history, and account attention.
                </p>
              </div>
              <ActionButton
                onClick={() => setShowAddCustomer(true)}
                variant="primary"
                className="self-start md:self-auto"
              >
                Add Customer
              </ActionButton>
            </div>

            {showAddCustomer && (
              <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-[92vw] max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-2xl font-bold">Add Customer</h3>
                    <button
                      onClick={cancelAddCustomerModal}
                      className="border border-slate-300 px-4 py-2 rounded text-sm font-semibold"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-6">
                    <section className="border rounded-lg p-4">
                      <h4 className="text-lg font-bold mb-3">Customer Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Artist</p>
                          <input
                            className="border p-2 rounded w-full"
                            value={addCustomerModalDraft.artistName}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("artistName", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Company</p>
                          <input
                            className="border p-2 rounded w-full"
                            value={addCustomerModalDraft.companyName}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("companyName", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Status</p>
                          <select
                            className="border p-2 rounded w-full"
                            value={addCustomerModalDraft.status}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("status", e.target.value)
                            }
                          >
                            <option>Prospect</option>
                            <option>Active</option>
                            <option>Inactive</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Company Address</p>
                          <input
                            className="border p-2 rounded w-full"
                            value={addCustomerModalDraft.companyAddress}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("companyAddress", e.target.value)
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs font-semibold text-slate-600 mb-1">Notes</p>
                          <textarea
                            className="border p-2 rounded w-full"
                            rows={3}
                            value={addCustomerModalDraft.notes}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("notes", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </section>

                    <section className="border rounded-lg p-4">
                      <h4 className="text-lg font-bold mb-3">Primary Manager Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Name</p>
                          <input
                            className="border p-2 rounded w-full"
                            value={addCustomerModalDraft.managerName}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("managerName", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Email</p>
                          <input
                            className="border p-2 rounded w-full"
                            type="email"
                            value={addCustomerModalDraft.managerEmail}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("managerEmail", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Phone</p>
                          <input
                            className="border p-2 rounded w-full"
                            value={addCustomerModalDraft.managerPhone}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("managerPhone", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </section>

                    <section className="border rounded-lg p-4">
                      <h4 className="text-lg font-bold mb-3">Primary AP Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Name</p>
                          <input
                            className="border p-2 rounded w-full"
                            value={addCustomerModalDraft.apName}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("apName", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Email</p>
                          <input
                            className="border p-2 rounded w-full"
                            type="email"
                            value={addCustomerModalDraft.apEmail}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("apEmail", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Phone</p>
                          <input
                            className="border p-2 rounded w-full"
                            value={addCustomerModalDraft.apPhone}
                            onChange={(e) =>
                              updateAddCustomerModalDraft("apPhone", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="mt-6 flex justify-end items-center gap-2">
                    <button
                      onClick={addCustomer}
                      className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                      Save Customer
                    </button>
                    <button
                      onClick={cancelAddCustomerModal}
                      className="border border-slate-300 px-4 py-2 rounded text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2.15fr)_minmax(360px,1.08fr)] items-start">
              <section className="bg-white rounded-xl shadow border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex flex-col gap-4">
                  <div>
                    <h3 className="text-[2.05rem] leading-tight font-bold">Customer Relationship Queue</h3>
                    <p className="text-sm text-slate-600 mt-1">One clean queue for the active relationship stage.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        className="border p-3 rounded w-full"
                        placeholder="Search customers by artist, company, email, or status..."
                        value={customerDirectorySearchTerm}
                        onFocus={() => setShowCustomerDirectoryDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowCustomerDirectoryDropdown(false), 120);
                        }}
                        onChange={(e) => {
                          setCustomerDirectorySearchTerm(e.target.value);
                          setShowCustomerDirectoryDropdown(true);
                        }}
                      />

                      {showCustomerDirectoryDropdown && (
                        <div className="absolute left-0 right-0 mt-2 border rounded bg-white shadow-lg max-h-64 overflow-auto z-20">
                          {filteredCustomerDirectoryCustomers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              className="block w-full text-left px-3 py-2 hover:bg-slate-100"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                openCustomerDetails(customer.id);
                                setCustomerDirectorySearchTerm(getCustomerDisplayName(customer));
                                setShowCustomerDirectoryDropdown(false);
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {getCustomerDisplayName(customer)}
                                  </p>
                                  <p className="text-xs text-slate-600 truncate mt-0.5">
                                    {customer.companyName || "-"}
                                  </p>
                                  <p className="text-xs text-slate-600 truncate">
                                    {customer.managerEmail || "No manager email"}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <StatusBadge
                                    tone={
                                      customer.status === "Active"
                                        ? "success"
                                        : customer.status === "Prospect"
                                        ? "info"
                                        : "archived"
                                    }
                                  >
                                    {customer.status}
                                  </StatusBadge>
                                  {customerTotalQuoteValueById.get(customer.id) ? (
                                    <p className="text-xs text-slate-700 mt-1">
                                      {money(customerTotalQuoteValueById.get(customer.id) || 0)}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-slate-500 mt-1">No quote value</p>
                                  )}
                                  <p className="text-[11px] text-[#8c6a3e] font-semibold mt-1">Details</p>
                                </div>
                              </div>
                            </button>
                          ))}

                          {filteredCustomerDirectoryCustomers.length === 0 && (
                            <p className="px-3 py-2 text-slate-600">No matching customers found.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 px-3 py-2 rounded border border-slate-300 bg-slate-50">
                        <input
                          type="checkbox"
                          checked={showArchivedCustomers}
                          onChange={(e) => setShowArchivedCustomers(e.target.checked)}
                        />
                        Show Archived / Inactive
                      </label>
                      <p className="text-xs text-slate-500">
                        {showArchivedCustomers ? "Including archived" : "Archived hidden"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {([
                      { label: "All", filter: "All" as const, count: customerWorkspaceQueueRows.length },
                      {
                        label: "Prospects",
                        filter: "Prospects" as const,
                        count: customerQueueCounts["Prospect"],
                      },
                      {
                        label: "Follow Up Needed",
                        filter: "Follow Up" as const,
                        count: customerQueueCounts["Follow Up Needed"],
                      },
                      {
                        label: "High Value",
                        filter: "High Value" as const,
                        count: customerQueueCounts["High Value Customer"],
                      },
                      {
                        label: "Repeat Customers",
                        filter: "Repeat" as const,
                        count: customerQueueCounts["Repeat Customer"],
                      },
                      {
                        label: "Dormant",
                        filter: "Dormant" as const,
                        count: customerQueueCounts["Dormant Customer"],
                      },
                    ] as const).map((tab) => {
                      const isActive = customerIntelligenceFilter === tab.filter;

                      return (
                        <button
                          key={tab.label}
                          type="button"
                          onClick={() => setCustomerIntelligenceFilter(tab.filter)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            isActive
                              ? "border-[#b89552] bg-[#f6efe2] text-[#7d5d31] shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-[#c8ad79] hover:bg-[#fcfaf4]"
                          }`}
                        >
                          {tab.label} <span className="ml-1 text-[10px] opacity-75">{tab.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[1020px]">
                    <div className="grid grid-cols-[1.2fr_1.1fr_1.05fr_0.95fr_0.95fr_1.25fr_32px] gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-800 border-b border-slate-200 bg-slate-50/80 font-semibold">
                      <div>Customer</div>
                      <div>Company</div>
                      <div>Relationship Type</div>
                      <div>Lifetime Revenue</div>
                      <div>Last Activity</div>
                      <div>Reason</div>
                      <div className="text-right">Chevron</div>
                    </div>

                    <div className="max-h-[calc(100vh-270px)] overflow-y-auto">
                      {customerWorkspaceRowsForActiveFilter.length === 0 && (
                        <div className="px-4 py-5 text-sm text-slate-600">No customer relationship items in this view.</div>
                      )}

                      {customerWorkspaceRowsForActiveFilter.length > 0 &&
                        customerWorkspaceRowsForActiveFilter.map((row) => {
                          const relationshipTypeLabel =
                            row.groupKey === "Follow Up Needed"
                              ? "Follow Up Needed"
                              : row.groupKey === "High Value Customer"
                              ? "High Value"
                              : row.groupKey === "Repeat Customer"
                              ? "Repeat Customer"
                              : row.groupKey === "Dormant Customer"
                              ? "Dormant"
                              : row.groupKey;
                          const lifetimeRevenue = customerTotalQuoteValueById.get(row.customerId) || 0;

                          return (
                            <button
                              key={row.id}
                              type="button"
                              onClick={row.onOpen}
                              className="grid w-full grid-cols-[1.2fr_1.1fr_1.05fr_0.95fr_0.95fr_1.25fr_32px] items-center gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-[#fcfaf4] hover:shadow-[inset_0_1px_0_rgba(184,149,82,0.08)] cursor-pointer min-h-[68px]"
                            >
                              <div className="min-w-0">
                                <p className="text-[15px] font-semibold text-slate-900 truncate">{row.customer}</p>
                              </div>
                              <div className="min-w-0 text-[14px] font-semibold text-slate-800 truncate">{row.company}</div>
                              <div className="min-w-0 text-[13px] font-semibold text-[#7d5d31] truncate">{relationshipTypeLabel}</div>
                              <div className="min-w-0 text-[13px] font-semibold text-slate-900 truncate">{money(lifetimeRevenue)}</div>
                              <div className="min-w-0 text-[13px] text-slate-700 truncate">{row.lastActivity}</div>
                              <div className="min-w-0 text-[13px] text-slate-600 truncate">{row.reason}</div>
                              <div className="text-right text-slate-400 text-lg">›</div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </section>

              <div className="space-y-3.5">
                <section className="bg-white p-3.5 rounded-xl shadow border border-slate-200">
                  <h3 className="text-xl font-bold mb-3">Customer Snapshot</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Total Customers", value: totalCustomersCount },
                      { label: "Long Term", value: longTermCustomersCount },
                      { label: "Short Term", value: shortTermCustomersCount },
                      { label: "Repeat", value: repeatCustomersCount },
                      { label: "Dormant", value: dormantCustomersCount },
                    ].map((metric) => (
                      <article key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                        <p className="text-[11px] tracking-[0.12em] text-slate-600 font-semibold uppercase">{metric.label}</p>
                        <p className="mt-2 text-[1.8rem] leading-none font-bold text-slate-900">{metric.value}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-3.5 rounded-xl shadow border border-slate-200">
                  <h3 className="text-xl font-bold mb-3">Top Customers</h3>
                  {topCustomersByValue.length === 0 ? (
                    <p className="text-sm text-slate-600">No customer activity yet.</p>
                  ) : (
                    <div className="max-h-[18rem] overflow-y-auto space-y-1.5 pr-1">
                      {topCustomersByValue.map((row) => (
                        <button
                          key={row.customer.id}
                          type="button"
                          onClick={() => openCustomerDetails(row.customer.id)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-[#c8ad79] hover:bg-[#fcfaf4]"
                        >
                          <p className="text-sm font-semibold text-slate-900 truncate">{row.customer.artistName || "-"}</p>
                          <p className="text-xs text-slate-600 truncate">{row.customer.companyName || "-"}</p>
                          <p className="text-xs font-semibold text-[#8c6a3e] mt-1">{money(row.totalQuoteValue)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                <section className="bg-white p-3.5 rounded-xl shadow border border-slate-200">
                  <h3 className="text-xl font-bold mb-3">Dormant Customers</h3>
                  {dormantCustomerRows.length === 0 ? (
                    <p className="text-sm text-slate-600">No dormant customers right now.</p>
                  ) : (
                    <div className="max-h-[18rem] overflow-y-auto space-y-1.5 pr-1">
                      {dormantCustomerRows.map((row) => (
                        <button
                          key={row.customer.id}
                          type="button"
                          onClick={() => openCustomerDetails(row.customer.id)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-[#c8ad79] hover:bg-[#fcfaf4]"
                        >
                          <p className="text-sm font-semibold text-slate-900 truncate">{row.customer.artistName || "-"}</p>
                          <p className="text-xs text-slate-600 truncate">
                            Last activity: {row.lastActivityDate ? row.lastActivityDate.toISOString().slice(0, 10) : "Not tracked yet"}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>

            {showCustomerDetailsModal && selectedCustomer && (
              <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
                <div className="bg-[#f6f2e9] rounded-lg shadow-2xl w-[90vw] max-w-6xl p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-[#c7d0de]">
                  <div className="sticky top-0 z-30 bg-[#0b172b] text-[#f3f6fb] border-b border-[#334867] -mx-6 md:-mx-8 px-6 md:px-8 pb-3 mb-5">
                    <div className="pt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold truncate">
                          {(isEditingCustomerDetails
                            ? editedCustomerDetails?.artistName
                            : selectedCustomer.artistName) ||
                            (isEditingCustomerDetails
                              ? editedCustomerDetails?.companyName
                              : selectedCustomer.companyName) ||
                            "-"}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-slate-100">
                            {(isEditingCustomerDetails
                              ? editedCustomerDetails?.companyName
                              : selectedCustomer.companyName) || "-"}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              (isEditingCustomerDetails
                                ? editedCustomerDetails?.status
                                : selectedCustomer.status) === "Active"
                                ? "bg-emerald-600 text-white"
                                : (isEditingCustomerDetails
                                    ? editedCustomerDetails?.status
                                    : selectedCustomer.status) === "Prospect"
                                    ? "bg-slate-700 text-white"
                                : "bg-slate-500 text-white"
                            }`}
                          >
                            {(isEditingCustomerDetails
                              ? editedCustomerDetails?.status
                              : selectedCustomer.status) || "Prospect"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${customerHealthBadgeClass}`}
                          >
                            {customerHealthScore}% {customerHealthLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditingCustomerDetails ? (
                          <>
                            <button
                              onClick={saveCustomerDetails}
                              className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelCustomerDetailsEdit}
                              className="border border-slate-300 px-4 py-2 rounded text-sm font-semibold"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={startEditingCustomerDetails}
                              className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setShowCustomerDetailsModal(false);
                                setIsEditingCustomerDetails(false);
                                setEditedCustomerDetails(null);
                              }}
                              className="border border-slate-300 px-4 py-2 rounded text-sm font-semibold"
                            >
                              Close
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 overflow-x-auto">
                      <div className="flex gap-2 min-w-max pr-1">
                        {([
                          "Overview",
                          "Contacts",
                          "Quotes",
                          "Tours",
                          "Financials",
                          "Documents",
                          "Timeline",
                          "Notes",
                        ] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setCustomerDetailsTab(tab)}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-semibold whitespace-nowrap transition-colors ${
                              customerDetailsTab === tab
                                ? "bg-slate-700 text-white border-[#b89552]"
                                : "bg-[#f6f2e9] text-slate-700 border-[#c7d0de] hover:bg-[#efe8dc]"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {customerDetailsTab === "Overview" && (
                      <section className="bg-[#f8f6f2] border border-[#E5E7EB] rounded-lg p-4 md:p-5 shadow-sm">
                        <h4 className="text-base font-bold mb-2">Profile Summary</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm mt-2">
                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Artist</p>
                          {isEditingCustomerDetails ? (
                            <input
                              className="border p-2 rounded w-full mt-1"
                              value={editedCustomerDetails?.artistName || ""}
                              onChange={(e) =>
                                updateEditedCustomerDetails("artistName", e.target.value)
                              }
                            />
                          ) : (
                            <p className="font-semibold mt-1">{selectedCustomer.artistName || "-"}</p>
                          )}
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Company</p>
                          {isEditingCustomerDetails ? (
                            <input
                              className="border p-2 rounded w-full mt-1"
                              value={editedCustomerDetails?.companyName || ""}
                              onChange={(e) =>
                                updateEditedCustomerDetails("companyName", e.target.value)
                              }
                            />
                          ) : (
                            <p className="font-semibold mt-1">{selectedCustomer.companyName || "-"}</p>
                          )}
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Status / Type</p>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            {isEditingCustomerDetails ? (
                              <select
                                className="border p-1.5 rounded"
                                value={editedCustomerDetails?.status || "Prospect"}
                                onChange={(e) =>
                                  updateEditedCustomerDetails("status", e.target.value)
                                }
                              >
                                <option>Prospect</option>
                                <option>Active</option>
                                <option>Inactive</option>
                              </select>
                            ) : (
                              <span className="font-semibold">{selectedCustomer.status}</span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                              {customerTypeLabel}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Primary Manager</p>
                          <p className="font-semibold mt-1">{primaryManagerContact?.name || "Not set"}</p>
                          <p className="text-slate-700">{isEditingCustomerDetails ? (
                            <input
                              className="border p-1.5 rounded w-full mt-1"
                              value={editedCustomerDetails?.managerEmail || ""}
                              onChange={(e) =>
                                updateEditedCustomerDetails("managerEmail", e.target.value)
                              }
                            />
                          ) : (
                            selectedCustomer.managerEmail || "-"
                          )}</p>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Primary AP</p>
                          <p className="font-semibold mt-1">{primaryAPContact?.name || "Not set"}</p>
                          <p className="text-slate-700">{isEditingCustomerDetails ? (
                            <input
                              className="border p-1.5 rounded w-full mt-1"
                              value={editedCustomerDetails?.apEmail || ""}
                              onChange={(e) =>
                                updateEditedCustomerDetails("apEmail", e.target.value)
                              }
                            />
                          ) : (
                            selectedCustomer.apEmail || "-"
                          )}</p>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Company Address</p>
                          {isEditingCustomerDetails ? (
                            <input
                              className="border p-2 rounded w-full mt-1"
                              value={editedCustomerDetails?.companyAddress || ""}
                              onChange={(e) =>
                                updateEditedCustomerDetails("companyAddress", e.target.value)
                              }
                            />
                          ) : (
                            <p className="font-semibold mt-1">{selectedCustomer.companyAddress || "-"}</p>
                          )}
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Last Quote</p>
                          <p className="font-semibold mt-1">
                            {mostRecentQuote
                              ? `${mostRecentQuote.quoteNumber} (${(mostRecentQuote.savedAt || "").slice(0, 10)})`
                              : "Not tracked yet"}
                          </p>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Last Tour</p>
                          <p className="font-semibold mt-1">{customerLastTourDate || "Not tracked yet"}</p>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 shadow-sm">
                          <p className="text-xs text-slate-600">Customer Since</p>
                          <p className="font-semibold mt-1">Not tracked yet</p>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-md p-2.5 md:col-span-2 lg:col-span-1 shadow-sm">
                          <p className="text-xs text-slate-600">Notes</p>
                          {isEditingCustomerDetails ? (
                            <textarea
                              className="border p-2 rounded w-full mt-1 min-h-16"
                              value={editedCustomerDetails?.notes || ""}
                              onChange={(e) =>
                                updateEditedCustomerDetails("notes", e.target.value)
                              }
                            />
                          ) : (
                            <p className="font-semibold mt-1 line-clamp-3">{selectedCustomer.notes || "-"}</p>
                          )}
                        </div>
                      </div>
                      </section>
                    )}

                    {customerDetailsTab === "Overview" && (
                      <section className="bg-[#f8f6f2] border border-[#E5E7EB] rounded-lg p-4 md:p-5 shadow-sm">
                        <h4 className="text-base font-bold mb-2">Business KPIs</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
                          <div className="border border-[#E5E7EB] rounded-lg p-3 bg-white shadow-sm">
                            <p className="text-xs font-semibold text-slate-600">Lifetime Revenue</p>
                            <p className="text-lg font-bold mt-1 break-words">{money(totalAcceptedRevenue)}</p>
                          </div>
                          <div className="border border-[#E5E7EB] rounded-lg p-3 bg-white shadow-sm">
                            <p className="text-xs font-semibold text-slate-600">Open Quotes</p>
                            <p className="text-lg font-bold mt-1">{activeCustomerQuotes.length}</p>
                          </div>
                          <div className="border border-[#E5E7EB] rounded-lg p-3 bg-white shadow-sm">
                            <p className="text-xs font-semibold text-slate-600">Active Tours</p>
                            <p className="text-lg font-bold mt-1">{customerActiveToursOnly.length}</p>
                          </div>
                          <div className="border border-[#E5E7EB] rounded-lg p-3 bg-white shadow-sm">
                            <p className="text-xs font-semibold text-slate-600">Average Tour Length</p>
                            <p className="text-lg font-bold mt-1">
                              {averageTourLengthDays === null
                                ? "-"
                                : `${averageTourLengthDays.toFixed(1)}d`}
                            </p>
                          </div>
                          <div className="border border-[#E5E7EB] rounded-lg p-3 bg-white shadow-sm">
                            <p className="text-xs font-semibold text-slate-600">Average Revenue / Tour</p>
                            <p className="text-lg font-bold mt-1 break-words">
                              {customerAverageRevenuePerTour === null
                                ? "-"
                                : money(customerAverageRevenuePerTour)}
                            </p>
                          </div>
                          <div className="border border-[#E5E7EB] rounded-lg p-3 bg-white shadow-sm">
                            <p className="text-xs font-semibold text-slate-600">Outstanding AR</p>
                            <p className="text-lg font-bold mt-1">Not tracked yet</p>
                          </div>
                        </div>
                      </section>
                    )}

                    {customerDetailsTab === "Overview" && (
                      <section className="bg-[#f8f6f2] border border-[#E5E7EB] rounded-lg p-4 md:p-5 space-y-3 shadow-sm">
                        <div>
                          <h4 className="text-base font-bold mb-2">Profile Snapshot</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5 shadow-sm">
                              <p className="text-xs text-slate-600">Customer Type</p>
                              <p className="font-semibold mt-1">{customerTypeLabel}</p>
                            </div>
                            <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5 shadow-sm">
                              <p className="text-xs text-slate-600">Most Common Tour Type</p>
                              <p className="font-semibold mt-1">{mostCommonTourType}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-bold mb-2">Current Open Quotes</h4>
                          {activeCustomerQuotes.length === 0 ? (
                            <p className="text-sm text-slate-600">No open quotes.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {activeCustomerQuotes.slice(0, 5).map((savedQuote) => (
                                <div
                                  key={savedQuote.id ?? savedQuote.quoteNumber}
                                  className="bg-white border border-[#E5E7EB] rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-sm"
                                >
                                  <div className="text-sm min-w-0">
                                    <p className="font-semibold truncate">
                                      {savedQuote.quoteNumber} - {savedQuote.tourName || "-"}
                                    </p>
                                    <p className="text-slate-600">
                                      {savedQuote.startDate || "-"} - {savedQuote.endDate || "-"}
                                    </p>
                                  </div>
                                  <p className="font-semibold shrink-0">{money(savedQuote.totalTourBudget)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold mb-2">Active / Upcoming Tours</h4>
                          {customerActiveTours.length === 0 ? (
                            <p className="text-sm text-slate-600">No tours matched yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                              {[...customerActiveToursOnly, ...customerUpcomingTours]
                                .slice(0, 6)
                                .map((trip) => (
                                  <div key={trip.id} className="bg-white border border-[#E5E7EB] rounded-lg p-2.5 text-sm shadow-sm">
                                    <p className="font-semibold">{trip.tripName || "-"}</p>
                                    <p className="text-slate-600">
                                      {trip.startDate || "-"} - {trip.endDate || "-"}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold mb-2">Key Risks or Missing Data</h4>
                          {customerRiskItems.length === 0 ? (
                            <p className="text-sm text-emerald-700">No immediate risks detected.</p>
                          ) : (
                            <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                              {customerRiskItems.map((riskItem) => (
                                <li key={riskItem}>{riskItem}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold mb-2">Recent Activity Preview</h4>
                          {customerRecentActivityPreview.length === 0 ? (
                            <p className="text-sm text-slate-600">No recent activity yet.</p>
                          ) : (
                            <ul className="text-sm text-slate-700 space-y-1">
                              {customerRecentActivityPreview.map((activityItem) => (
                                <li key={activityItem}>- {activityItem}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold mb-2">Fix Next</h4>
                          {customerFixNextCards.length === 0 ? (
                            <p className="text-sm text-emerald-700">No immediate customer fixes needed.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                              {customerFixNextCards.map((card) => (
                                <article key={card.reason} className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-sm">
                                  <p className="text-sm font-semibold text-slate-900">{card.reason}</p>
                                  <p className="text-xs text-slate-600 mt-1">{card.action}</p>

                                  {card.targetTab && (
                                    <button
                                      type="button"
                                      onClick={() => setCustomerDetailsTab(card.targetTab)}
                                      className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                                    >
                                      {card.buttonLabel}
                                    </button>
                                  )}
                                </article>
                              ))}
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {customerDetailsTab === "Contacts" && (
                      <section className="bg-[#f2ece2] border border-[#c9d2df] rounded-lg p-5 md:p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-bold">Contacts</h4>
                          {!isEditingCustomerDetails && (
                            <button
                              type="button"
                              onClick={() => {
                                resetNewCustomerContact();
                                setShowAddCustomerContactForm(!showAddCustomerContactForm);
                              }}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold"
                            >
                              {showAddCustomerContactForm ? "Cancel" : "Add Contact"}
                            </button>
                          )}
                        </div>

                        {!isEditingCustomerDetails && showAddCustomerContactForm && (
                          <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <input
                              className="border p-2 rounded"
                              placeholder="Name"
                              value={newCustomerContact.name}
                              onChange={(e) =>
                                setNewCustomerContact({
                                  ...newCustomerContact,
                                  name: e.target.value,
                                })
                              }
                            />

                            <select
                              className="border p-2 rounded"
                              value={newCustomerContact.role}
                              onChange={(e) =>
                                setNewCustomerContact({
                                  ...newCustomerContact,
                                  role: e.target.value as CustomerContact["role"],
                                })
                              }
                            >
                              <option>Manager</option>
                              <option>AP</option>
                              <option>Tour Manager</option>
                              <option>Assistant</option>
                              <option>Billing</option>
                              <option>Operations</option>
                              <option>Other</option>
                            </select>

                            <input
                              className="border p-2 rounded"
                              placeholder="Email"
                              value={newCustomerContact.email}
                              onChange={(e) =>
                                setNewCustomerContact({
                                  ...newCustomerContact,
                                  email: e.target.value,
                                })
                              }
                            />

                            <input
                              className="border p-2 rounded"
                              placeholder="Phone"
                              value={newCustomerContact.phone}
                              onChange={(e) =>
                                setNewCustomerContact({
                                  ...newCustomerContact,
                                  phone: e.target.value,
                                })
                              }
                            />

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={newCustomerContact.isPrimaryBilling}
                                onChange={(e) =>
                                  setNewCustomerContact({
                                    ...newCustomerContact,
                                    isPrimaryBilling: e.target.checked,
                                  })
                                }
                              />
                              Primary Billing
                            </label>

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={newCustomerContact.isPrimaryOperations}
                                onChange={(e) =>
                                  setNewCustomerContact({
                                    ...newCustomerContact,
                                    isPrimaryOperations: e.target.checked,
                                  })
                                }
                              />
                              Primary Operations
                            </label>

                            <div className="md:col-span-2">
                              <button
                                type="button"
                                onClick={addCustomerContact}
                                className="bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
                              >
                                Save Contact
                              </button>
                            </div>
                          </div>
                        )}

                        {(isEditingCustomerDetails
                          ? editedCustomerDetails?.contacts ?? []
                          : customerContacts
                        ).length === 0 ? (
                          <p className="text-sm text-slate-600">No contacts yet.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {(isEditingCustomerDetails
                              ? editedCustomerDetails?.contacts ?? []
                              : customerContacts
                            ).map((contact) => (
                              <div
                                key={contact.id}
                                className="border rounded-lg px-3 py-2 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                              >
                                {isEditingCustomerDetails ? (
                                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                                    <input
                                      className="border p-2 rounded"
                                      placeholder="Name"
                                      value={contact.name}
                                      onChange={(e) =>
                                        updateEditedCustomerContact(
                                          contact.id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                    />

                                    <select
                                      className="border p-2 rounded"
                                      value={contact.role}
                                      onChange={(e) =>
                                        updateEditedCustomerContact(
                                          contact.id,
                                          "role",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option>Manager</option>
                                      <option>AP</option>
                                      <option>Tour Manager</option>
                                      <option>Assistant</option>
                                      <option>Billing</option>
                                      <option>Operations</option>
                                      <option>Other</option>
                                    </select>

                                    <input
                                      className="border p-2 rounded"
                                      placeholder="Email"
                                      value={contact.email}
                                      onChange={(e) =>
                                        updateEditedCustomerContact(
                                          contact.id,
                                          "email",
                                          e.target.value
                                        )
                                      }
                                    />

                                    <input
                                      className="border p-2 rounded"
                                      placeholder="Phone"
                                      value={contact.phone}
                                      onChange={(e) =>
                                        updateEditedCustomerContact(
                                          contact.id,
                                          "phone",
                                          e.target.value
                                        )
                                      }
                                    />

                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={contact.isPrimaryBilling}
                                        onChange={(e) =>
                                          updateEditedCustomerContact(
                                            contact.id,
                                            "isPrimaryBilling",
                                            e.target.checked
                                          )
                                        }
                                      />
                                      Primary Billing
                                    </label>

                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={contact.isPrimaryOperations}
                                        onChange={(e) =>
                                          updateEditedCustomerContact(
                                            contact.id,
                                            "isPrimaryOperations",
                                            e.target.checked
                                          )
                                        }
                                      />
                                      Primary Operations
                                    </label>
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-sm">
                                      <p className="font-semibold">{contact.name || "-"}</p>
                                      <p className="text-xs text-slate-600">{contact.role}</p>
                                      <p className="text-xs text-slate-700">{contact.email || "-"}</p>
                                      <p className="text-xs text-slate-700">{contact.phone || "-"}</p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                      {contact.isPrimaryBilling && (
                                        <span className="bg-slate-700 text-white px-2 py-1 rounded text-xs font-semibold">
                                          Primary Billing
                                        </span>
                                      )}
                                      {contact.isPrimaryOperations && (
                                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">
                                          Primary Operations
                                        </span>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => deleteCustomerContact(contact.id)}
                                        className="border border-slate-300 px-2.5 py-1 rounded text-xs font-semibold"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}

                    {customerDetailsTab === "Quotes" && (
                      <section className="bg-[#f2ece2] border border-[#c9d2df] rounded-lg p-5 md:p-6 space-y-4">
                        {[
                          { label: "Draft", rows: customerDraftQuotes },
                          { label: "Sent", rows: customerSentQuotes },
                          { label: "Accepted", rows: acceptedCustomerQuotes },
                          { label: "Rejected", rows: rejectedCustomerQuotes },
                        ].map((group) => (
                          <div key={group.label}>
                            <h4 className="text-lg font-bold mb-2">{group.label}</h4>
                            {group.rows.length === 0 ? (
                              <p className="text-sm text-slate-600">No {group.label.toLowerCase()} quotes.</p>
                            ) : (
                              <div className="space-y-2">
                                {group.rows.map((savedQuote) => (
                                  <div
                                    key={`${group.label}-${savedQuote.id ?? savedQuote.quoteNumber}`}
                                    className="bg-white border rounded-lg p-3 flex items-center justify-between gap-3"
                                  >
                                    <div className="text-sm min-w-0">
                                      <p className="font-semibold truncate">
                                        {savedQuote.quoteNumber} - {savedQuote.tourName || "-"}
                                      </p>
                                      <p className="text-slate-600">
                                        {savedQuote.startDate || "-"} - {savedQuote.endDate || "-"} | {savedQuote.quoteStatus}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="font-semibold">{money(savedQuote.totalTourBudget)}</p>
                                      <button
                                        onClick={() => {
                                          setShowCustomerDetailsModal(false);
                                          setActivePage("Quotes");
                                          editQuote(savedQuote);
                                        }}
                                        className="mt-1 bg-yellow-500 text-white px-3 py-1 rounded text-xs font-semibold"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </section>
                    )}

                    {customerDetailsTab === "Tours" && (
                      <section className="bg-[#f2ece2] border border-[#c9d2df] rounded-lg p-5 md:p-6 space-y-4">
                        {[
                          { label: "Active", rows: customerActiveToursOnly },
                          { label: "Upcoming", rows: customerUpcomingTours },
                          { label: "Completed", rows: customerCompletedTours },
                        ].map((group) => (
                          <div key={group.label}>
                            <h4 className="text-lg font-bold mb-2">{group.label}</h4>
                            {group.rows.length === 0 ? (
                              <p className="text-sm text-slate-600">No {group.label.toLowerCase()} tours.</p>
                            ) : (
                              <div className="space-y-2">
                                {group.rows.map((trip) => (
                                  <div
                                    key={`${group.label}-${trip.id}`}
                                    className="bg-white border rounded-lg p-3 text-sm"
                                  >
                                    <p className="font-semibold">{trip.tripName || "-"}</p>
                                    <p className="text-slate-600">
                                      {trip.startDate || "-"} - {trip.endDate || "-"}
                                    </p>
                                    <p className="text-slate-600">
                                      Coach: {trip.coachName || "Unassigned"} | Driver: {trip.driverName || "Unassigned"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </section>
                    )}

                    {customerDetailsTab === "Financials" && (
                      <section className="bg-[#f2ece2] border border-[#c9d2df] rounded-lg p-5 md:p-6">
                        <h4 className="text-lg font-bold mb-3">Financials</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="bg-white border rounded-lg p-4">
                            <p className="text-xs text-slate-600">Current Balance</p>
                            <p className="text-xl font-semibold mt-1">Not tracked yet</p>
                          </div>
                          <div className="bg-white border rounded-lg p-4">
                            <p className="text-xs text-slate-600">Open Invoices</p>
                            <p className="text-xl font-semibold mt-1">Not tracked yet</p>
                          </div>
                          <div className="bg-white border rounded-lg p-4">
                            <p className="text-xs text-slate-600">Past Due</p>
                            <p className="text-xl font-semibold mt-1">Not tracked yet</p>
                          </div>
                          <div className="bg-white border rounded-lg p-4">
                            <p className="text-xs text-slate-600">Average Days to Pay</p>
                            <p className="text-xl font-semibold mt-1">Not tracked yet</p>
                          </div>
                          <div className="bg-white border rounded-lg p-4">
                            <p className="text-xs text-slate-600">Total Revenue</p>
                            <p className="text-xl font-semibold mt-1">{money(totalAcceptedRevenue)}</p>
                          </div>
                          <div className="bg-white border rounded-lg p-4">
                            <p className="text-xs text-slate-600">Last Payment</p>
                            <p className="text-xl font-semibold mt-1">Not tracked yet</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-4">No invoices yet.</p>
                      </section>
                    )}

                    {customerDetailsTab === "Documents" && (
                      <section className="bg-[#f2ece2] border border-[#c9d2df] rounded-lg p-4">
                        <h4 className="text-lg font-bold mb-3">Documents</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[
                            "MSA",
                            "Insurance",
                            "W9",
                            "Credit Application",
                            "ACH Form",
                            "Rate Sheet",
                            "Contracts",
                            "Riders",
                            "Tour Documents",
                          ].map((docLabel) => (
                            <div key={docLabel} className="bg-white border rounded-lg p-4">
                              <p className="text-xs text-slate-600">{docLabel}</p>
                              <p className="text-sm font-semibold mt-2">No file</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 mt-4">No documents uploaded yet.</p>
                      </section>
                    )}

                    {customerDetailsTab === "Timeline" && (
                      <section className="bg-[#f2ece2] border border-[#c9d2df] rounded-lg p-4">
                        <h4 className="text-lg font-bold mb-3">Timeline</h4>

                        <div className="space-y-2">
                          <div className="bg-white border rounded-lg p-3">
                            <p className="text-sm font-semibold">Customer profile created</p>
                            <p className="text-xs text-slate-600">Date not tracked yet</p>
                          </div>

                          {customerTimelineItems.map((timelineItem, index) => (
                            <div key={`${timelineItem.title}-${index}`} className="bg-white border rounded-lg p-3">
                              <p className="text-sm font-semibold">{timelineItem.title}</p>
                              <p className="text-xs text-slate-600">{timelineItem.detail}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(timelineItem.timestamp).toISOString().slice(0, 10)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {customerTimelineItems.length === 0 && (
                          <p className="text-sm text-slate-600 mt-3">No timeline activity yet.</p>
                        )}
                      </section>
                    )}

                    {customerDetailsTab === "Notes" && (
                      <section className="bg-[#f2ece2] border border-[#c9d2df] rounded-lg p-4">
                        <h4 className="text-lg font-bold mb-3">Customer Notes</h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Existing notes: {selectedCustomer.notes || "-"}
                        </p>
                        <textarea
                          className="border p-3 rounded w-full min-h-24 bg-white"
                          value={customerNotesDraft}
                          onChange={(e) => setCustomerNotesDraft(e.target.value)}
                        />
                        <div className="mt-3">
                          <button
                            onClick={saveCustomerNotes}
                            className="bg-emerald-600 text-white px-4 py-2 rounded font-semibold"
                          >
                            Save Notes
                          </button>
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            )}
          </PageShell>
        )}
        {activePage === "Active Tours" && (
          <div className={pageLayoutClass}>
            <h2 className="text-4xl font-bold mb-6">Active Tours</h2>

            <div className={focusCardClass + " mb-8"}>
              <h3 className="text-2xl font-bold mb-4">Add New Trip</h3>

              <div className="grid grid-cols-3 gap-4">
                <input
                  className="border p-3 rounded"
                  placeholder="Trip Name"
                  value={newTrip.tripName}
                  onChange={(e) => updateNewTrip("tripName", e.target.value)}
                />

                <input
                  type="date"
                  className="border p-3 rounded"
                  value={newTrip.startDate}
                  onChange={(e) => updateNewTrip("startDate", e.target.value)}
                />

                <input
                  type="date"
                  className="border p-3 rounded"
                  value={newTrip.endDate}
                  onChange={(e) => updateNewTrip("endDate", e.target.value)}
                />

                <select
                  className="border p-3 rounded"
                  value={newTrip.coachName}
                  onChange={(e) => updateNewTrip("coachName", e.target.value)}
                >
                  <option value="">Select Coach</option>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.coachName}>
                      {coach.coachName}
                    </option>
                  ))}
                </select>

                <select
                  className="border p-3 rounded"
                  value={newTrip.driverName}
                  onChange={(e) => updateNewTrip("driverName", e.target.value)}
                >
                  <option value="">Select Driver</option>
                  {drivers
                    .filter((driver) => driver.baseStatus === "Active")
                    .map((driver) => (
                      <option key={driver.id} value={getDriverFullName(driver)}>
                        {getDriverFullName(driver)}
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={addTrip}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded font-semibold"
              >
                Add Trip
              </button>
            </div>

            <div className={workAreaClass}>
              <h3 className="text-2xl font-bold mb-4">Trip List</h3>

              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2 text-left">Trip Name</th>
                    <th className="border p-2 text-left">Start Date</th>
                    <th className="border p-2 text-left">End Date</th>
                    <th className="border p-2 text-left">Coach</th>
                    <th className="border p-2 text-left">Driver</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="border p-2">{trip.tripName}</td>
                      <td className="border p-2">{trip.startDate}</td>
                      <td className="border p-2">{trip.endDate}</td>
                      <td className="border p-2">{trip.coachName}</td>
                      <td className="border p-2">{trip.driverName}</td>
                      <td className="border p-2">
                        {isTodayBetween(trip.startDate, trip.endDate)
                          ? "Active"
                          : "Scheduled/Completed"}
                      </td>
                        <td className="border p-2">
                        <button
                          onClick={() => {
                            const customer = customers.find(
                              (customer) =>
                                customer.artistName === trip.tripName ||
                                customer.companyName === trip.tripName
                            );

                            if (customer) {
                              setSelectedCustomerId(customer.id);
                            }

                            setActivePage("Customers");
                            setActiveCustomerTab("Invoices");
                          }}
                          className="bg-slate-700 text-white px-3 py-1 rounded"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}

                  {trips.length === 0 && (
                    <tr>
                      <td className="border p-4 text-center" colSpan={7}>
                        No trips created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activePage === "Calendar" && (
          <div className={pageLayoutClass}>
            <h2 className="text-4xl font-bold">Tour Calendar</h2>
            <p className="text-slate-600 mt-2 mb-6">
              Coach schedule, tour assignments, and availability by day.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-slate-600">Coaches Out Today</h3>
                <p className="text-2xl font-bold mt-1">{coachesOutTodayCount}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-slate-600">Coaches Available Today</h3>
                <p className="text-2xl font-bold mt-1">{coachesAvailableCount}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-slate-600">Tours Starting This Week</h3>
                <p className="text-2xl font-bold mt-1">{toursStartingThisWeekCount}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-semibold text-slate-600">Missing Assignments</h3>
                <p className="text-2xl font-bold mt-1">{missingAssignmentsCount}</p>
              </div>
            </div>

            <div className={filterBarClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={calendarSearchTerm}
                  onChange={(e) => setCalendarSearchTerm(e.target.value)}
                  placeholder="Search tour, coach, or driver..."
                  className="border p-3 rounded w-full"
                />

                <select
                  value={calendarStatusFilter}
                  onChange={(e) =>
                    setCalendarStatusFilter(
                      e.target.value as
                        | "All"
                        | "On Tour"
                        | "Scheduled / Completed"
                        | "Missing Assignment"
                    )
                  }
                  className="border p-3 rounded w-full"
                >
                  <option>All</option>
                  <option>On Tour</option>
                  <option>Scheduled / Completed</option>
                  <option>Missing Assignment</option>
                </select>
              </div>
            </div>

            <div className={workAreaClass + " mb-6"}>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {[
                  "All Coaches",
                  "Coaches Out",
                  "Available Coaches",
                  "Missing Assignment",
                ].map((view) => (
                  <button
                    key={view}
                    onClick={() =>
                      setCalendarCoachView(
                        view as
                          | "All Coaches"
                          | "Coaches Out"
                          | "Available Coaches"
                          | "Missing Assignment"
                      )
                    }
                    className={`px-3 py-1.5 rounded text-sm font-semibold border ${
                      calendarCoachView === view
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">{calendarCoachResultCountText}</p>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600" htmlFor="calendar-row-limit">
                    Row Limit
                  </label>
                  <select
                    id="calendar-row-limit"
                    value={calendarRowLimit}
                    onChange={(e) =>
                      setCalendarRowLimit(
                        e.target.value as "25" | "50" | "100" | "All"
                      )
                    }
                    className="border p-2 rounded text-sm"
                  >
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="All">All</option>
                  </select>
                </div>
              </div>
            </div>

            {calendarHasVisibleData ? (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="px-4 pt-4 pb-2 border-b bg-slate-50">
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-700">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#8c6a3e] border border-[#8c6a3e]" />
                      Gold = On Tour
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-slate-700 border border-slate-700" />
                      Gray = Scheduled / Completed
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-red-700 border border-red-700" />
                      Red = Missing Assignment / Conflict
                    </span>
                  </div>
                </div>

                {shouldShowCalendarGridRows ? (
                <div className="lux-scroll-panel overflow-auto min-h-[360px] max-h-[calc(100vh-420px)]">
                  <table className="min-w-[1200px] w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="sticky top-0 left-0 z-30 bg-[#e7ecf5] border p-2 text-left text-xs font-semibold min-w-[220px]">
                          Coach / Trailer
                        </th>
                        {calendarDays.map(({ date }) => (
                          <th
                            key={`calendar-head-${date.toISOString()}`}
                            className={`sticky top-0 z-20 border p-2 text-center text-xs font-semibold min-w-[120px] ${
                              date.toDateString() === today.toDateString()
                                ? "bg-[#f3e8c8]"
                                : "bg-[#edf1f7]"
                            }`}
                          >
                            <div>
                              {date.toLocaleDateString(undefined, { weekday: "short" })}
                            </div>
                            <div className="text-slate-600 font-medium">
                              {date.toLocaleDateString(undefined, {
                                month: "numeric",
                                day: "numeric",
                              })}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {limitedCalendarCoaches.map((coach) => (
                        <tr key={coach.id} className="align-top">
                          <td className="sticky left-0 z-10 bg-[#fffdfa] border p-2">
                            <p className="text-sm font-semibold leading-tight">{coach.coachName}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Trailer: TBD</p>
                          </td>

                          {calendarDays.map(({ date }) => {
                            const coachTripsForDay = assignedCalendarTrips.filter(
                              (trip) =>
                                trip.coachName === coach.coachName &&
                                isTripActiveOnDate(trip, date)
                            );

                            const hasConflict = coachTripsForDay.length > 1;
                            const isTodayColumn =
                              date.toDateString() === today.toDateString();

                            return (
                              <td
                                key={`${coach.id}-${date.toISOString()}`}
                                className={`border p-0.5 ${
                                  hasConflict
                                    ? "bg-[#fff0f1] border-red-300"
                                    : isTodayColumn
                                    ? "bg-[#fbf4df]"
                                    : "bg-[#f9f7f2]"
                                }`}
                              >
                                {coachTripsForDay.length === 0 ? (
                                  <div className="h-10 rounded-sm bg-[#fffdfa]" />
                                ) : (
                                  <div className="space-y-0.5">
                                    {hasConflict && (
                                      <div className="rounded text-[11px] font-semibold px-1.5 py-0.5 bg-red-700 text-white border border-red-700">
                                        Conflict
                                      </div>
                                    )}
                                    {coachTripsForDay.map((trip) => {
                                      const tripStatus = getCalendarTripStatus(trip);
                                      const blockClass = !trip.driverName
                                        ? "bg-red-700 border-red-700 text-white"
                                        : tripStatus === "On Tour"
                                        ? "bg-[#8c6a3e] border-[#8c6a3e] text-white"
                                        : "bg-slate-700 border-slate-700 text-white";

                                      return (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedCalendarTrip(trip)}
                                          key={`${coach.id}-${date.toISOString()}-${trip.id}`}
                                          className={`border rounded-md px-1.5 py-1 text-[11px] leading-tight text-left w-full ${blockClass}`}
                                        >
                                          <p className="font-semibold truncate">{trip.tripName}</p>
                                          <p className="truncate">
                                            {trip.driverName || "Driver Unassigned"}
                                          </p>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                ) : (
                  <div className="p-4 text-sm text-slate-600">
                    Coach grid hidden in Missing Assignment view.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-slate-600">
                  {shouldShowCalendarGridRows
                    ? "No coaches match this view."
                    : "No tours found for this view."}
                </p>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Unassigned Tours</h3>

              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2 text-left">Tour</th>
                    <th className="border p-2 text-left">Dates</th>
                    <th className="border p-2 text-left">Driver</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {unassignedCalendarTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="border p-2">{trip.tripName}</td>
                      <td className="border p-2">
                        {trip.startDate} - {trip.endDate}
                      </td>
                      <td className="border p-2">{trip.driverName || "Unassigned"}</td>
                      <td className="border p-2">
                        <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-red-700 text-white">
                          {getCalendarTripStatus(trip)}
                        </span>
                      </td>
                      <td className="border p-2">
                        <button
                          type="button"
                          onClick={() => openAssignmentModal(trip)}
                          className="text-xs font-semibold text-white bg-blue-600 rounded px-2.5 py-1"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}

                  {unassignedCalendarTrips.length === 0 && (
                    <tr>
                      <td className="border p-4 text-center text-slate-600" colSpan={5}>
                        No unassigned tours.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedCalendarTrip && (
              <div className="fixed inset-0 z-40 pointer-events-none">
                <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white border-l shadow-2xl p-5 overflow-y-auto pointer-events-auto">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">Tour Details</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {!selectedCalendarTrip.coachName && !selectedCalendarTrip.driverName
                        ? "Needs coach and driver assignment"
                        : !selectedCalendarTrip.coachName
                        ? "Needs coach assignment"
                        : !selectedCalendarTrip.driverName
                        ? "Needs driver assignment"
                        : "Ready"}
                    </p>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {(!selectedCalendarTrip.coachName || !selectedCalendarTrip.driverName) && (
                      <button
                        type="button"
                        onClick={() => {
                          openAssignmentModal(selectedCalendarTrip);
                          setSelectedCalendarTrip(null);
                        }}
                        className="text-sm font-semibold text-white bg-emerald-600 rounded px-3 py-1.5"
                      >
                        Assign Missing Info
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage("Active Tours");
                        setSelectedCalendarTrip(null);
                      }}
                      className="text-sm font-semibold text-white bg-blue-600 rounded px-3 py-1.5"
                    >
                      View in Active Tours
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarTrip(null)}
                      className="text-sm font-semibold text-slate-700 border border-slate-300 rounded px-3 py-1.5"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold">Tour name:</span>{" "}
                      {selectedCalendarTrip.tripName}
                    </p>
                    <p>
                      <span className="font-semibold">Coach:</span>{" "}
                      {selectedCalendarTrip.coachName ? (
                        selectedCalendarTrip.coachName
                      ) : (
                        <span className="text-red-700 font-semibold">Missing coach</span>
                      )}
                    </p>
                    <p>
                      <span className="font-semibold">Driver:</span>{" "}
                      {selectedCalendarTrip.driverName ? (
                        selectedCalendarTrip.driverName
                      ) : (
                        <span className="text-red-700 font-semibold">Missing driver</span>
                      )}
                    </p>
                    <p>
                      <span className="font-semibold">Start Date:</span>{" "}
                      {selectedCalendarTrip.startDate}
                    </p>
                    <p>
                      <span className="font-semibold">End Date:</span>{" "}
                      {selectedCalendarTrip.endDate}
                    </p>
                    <p>
                      <span className="font-semibold">Days Out:</span>{" "}
                      {Math.max(
                        Math.ceil(
                          (new Date(selectedCalendarTrip.endDate).getTime() -
                            new Date(selectedCalendarTrip.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1,
                        0
                      )}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {getCalendarTripStatus(selectedCalendarTrip)}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
        {activePage !== "Home" &&
  activePage !== "Calendar" &&
  activePage !== "Leasing Dashboard" &&
  activePage !== "Dispatcher Dashboard" &&
  activePage !== "Quotes" &&
  activePage !== "Coaches" &&
  activePage !== "Drivers" &&
  activePage !== "Customers" &&
  activePage !== "Active Tours" &&
  activePage !== "Reports" && (
    <h2 className="text-4xl font-bold">{activePage}</h2>
  )}

        {assignmentTrip && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-5">
              <h3 className="text-xl font-bold">Assign Tour</h3>

              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Tour name:</span> {assignmentTrip.tripName}
                </p>
                <p>
                  <span className="font-semibold">Date range:</span> {assignmentTrip.startDate} - {assignmentTrip.endDate}
                </p>
                <p>
                  <span className="font-semibold">Current coach:</span>{" "}
                  {assignmentTrip.coachName || "Missing coach"}
                </p>
                <p>
                  <span className="font-semibold">Current driver:</span>{" "}
                  {assignmentTrip.driverName || "Missing driver"}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-semibold">Coach dropdown</label>
                  <select
                    value={assignmentCoachName}
                    onChange={(e) => setAssignmentCoachName(e.target.value)}
                    className="border p-2 rounded w-full mt-1"
                  >
                    <option value="">Unassigned</option>
                    {assignableCalendarCoaches.map((coach) => (
                      <option key={coach.id} value={coach.coachName}>
                        {coach.coachName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Driver dropdown</label>
                  <select
                    value={assignmentDriverName}
                    onChange={(e) => setAssignmentDriverName(e.target.value)}
                    className="border p-2 rounded w-full mt-1"
                  >
                    <option value="">Unassigned</option>
                    {assignableCalendarDrivers.map((driver) => (
                      <option key={driver.id} value={getDriverFullName(driver)}>
                        {getDriverFullName(driver)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={saveTripAssignment}
                  className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold"
                >
                  Save Assignment
                </button>
                <button
                  type="button"
                  onClick={closeAssignmentModal}
                  className="border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
