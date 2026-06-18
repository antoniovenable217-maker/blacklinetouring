"use client";

import { useEffect, useState } from "react";

type Coach = {
  id: number;
  coachName: string;
  vin: string;
  year: string;
  model: string;
  assetOwner: string;
  coachType: "Star Coach" | "Crew Coach";
};

type Driver = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  baseStatus: "Active" | "Inactive";
};

type Trip = {
  id: number;
  tripName: string;
  startDate: string;
  endDate: string;
  coachName: string;
  driverName: string;
};

type QuoteInput = {
  id: number | null;
  quoteNumber: string;
  quoteStatus: "Draft" | "Sent" | "Approved" | "Rejected";
  customerName: string;
  tourName: string;
  startDate: string;
  endDate: string;
  coachName: string;
  driverName: string;
  miles: number;
  busDayRate: number;
  driverDayRate: number;
  fuelRate: number;
  perDiemRate: number;
  generatorWeeklyRate: number;
  wirelessDailyRate: number;
  hotelQty: number;
  hotelRate: number;
  useDeadhead: boolean;
  busDHF: number;
  busDHR: number;
  driverDHF: number;
  driverDHR: number;
};

type SavedQuote = QuoteInput & {
  totalTourBudget: number;
  savedAt: string;
};

type SortDirection = "asc" | "desc";

const blankQuote: QuoteInput = {
  id: null,
  quoteNumber: "",
  quoteStatus: "Draft",
  customerName: "",
  tourName: "",
  startDate: "",
  endDate: "",
  coachName: "",
  driverName: "",
  miles: 0,
  busDayRate: 0,
  driverDayRate: 0,
  fuelRate: 0,
  perDiemRate: 0,
  generatorWeeklyRate: 0,
  wirelessDailyRate: 0,
  hotelQty: 0,
  hotelRate: 0,
  useDeadhead: true,
  busDHF: 2,
  busDHR: 2,
  driverDHF: 2,
  driverDHR: 2,
};

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [activeQuoteTab, setActiveQuoteTab] = useState("Quote List");

  const [coaches, setCoaches] = useState<Coach[]>([
    {
      id: 1,
      coachName: "Raptor",
      vin: "TBD",
      year: "2020",
      model: "Prevost",
      assetOwner: "Encore",
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

  const [newCoach, setNewCoach] = useState<Coach>({
    id: 0,
    coachName: "",
    vin: "",
    year: "",
    model: "",
    assetOwner: "",
    coachType: "Star Coach",
  });

  const [newDriver, setNewDriver] = useState<Driver>({
    id: 0,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    baseStatus: "Active",
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

  useEffect(() => {
    const savedCoaches = localStorage.getItem("blackline_coaches");
    const savedDrivers = localStorage.getItem("blackline_drivers");
    const savedTrips = localStorage.getItem("blackline_trips");
    const savedQuoteRecords = localStorage.getItem("blackline_quotes");

    if (savedCoaches) setCoaches(JSON.parse(savedCoaches));
    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    if (savedTrips) setTrips(JSON.parse(savedTrips));
    if (savedQuoteRecords) setSavedQuotes(JSON.parse(savedQuoteRecords));
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

  function getDriverFullName(driver: Driver) {
    return `${driver.firstName} ${driver.lastName}`;
  }

  function getDriverOperationalStatus(driver: Driver) {
    if (driver.baseStatus === "Inactive") return "Inactive";

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
        field === "startDate" ||
        field === "endDate" ||
        field === "coachName" ||
        field === "driverName"
          ? value
          : Number(value),
    });
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

  function addCoach() {
    if (!newCoach.coachName.trim()) {
      alert("Coach Name is required.");
      return;
    }

    setCoaches([...coaches, { ...newCoach, id: Date.now() }]);

    setNewCoach({
      id: 0,
      coachName: "",
      vin: "",
      year: "",
      model: "",
      assetOwner: "",
      coachType: "Star Coach",
    });
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
    });
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

  function deleteCoach(id: number) {
    setCoaches(coaches.filter((coach) => coach.id !== id));
  }

  function deleteDriver(id: number) {
    setDrivers(drivers.filter((driver) => driver.id !== id));
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
  const generatorTotal = generatorWeeks * quote.generatorWeeklyRate;
  const wirelessTotal = wirelessDays * quote.wirelessDailyRate;
  const hotelTotal = quote.hotelQty * quote.hotelRate;

  const totalTourBudget =
    busTotal +
    driverTotal +
    fuelTotal +
    perDiemTotal +
    generatorTotal +
    wirelessTotal +
    hotelTotal;

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
    setActiveQuoteTab("Pricing Info");
  }

  function saveQuote() {
    if (!quote.customerName.trim()) {
      alert("Customer Name is required.");
      return;
    }

    if (!quote.tourName.trim()) {
      alert("Tour Name is required.");
      return;
    }

    const quoteToSave: SavedQuote = {
      ...quote,
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

    setQuote(quoteToSave);
    setActiveQuoteTab("Quote List");
  }

  function editQuote(savedQuote: SavedQuote) {
    setQuote(savedQuote);
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
        q.id === savedQuote.id ? { ...q, quoteStatus: "Approved" } : q
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
  ];

  const menuItems = [
    "Dashboard",
    "Quotes",
    "Trips",
    "Calendar",
    "Coaches",
    "Drivers",
    "Customers",
    "Reports",
    "Settings",
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-black flex">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">BlackLine</h1>

        <nav className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`block w-full text-left px-4 py-2 rounded ${
                activePage === item ? "bg-blue-600" : "hover:bg-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex-1 p-8 overflow-auto">
        {activePage === "Dashboard" && (
          <>
            <h2 className="text-4xl font-bold mb-8">Dashboard</h2>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold">Total Coaches</h3>
                <p className="text-3xl mt-2">{coaches.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold">Available Drivers</h3>
                <p className="text-3xl mt-2">{availableDrivers.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold">Saved Quotes</h3>
                <p className="text-3xl mt-2">{savedQuotes.length}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold">Active Trips</h3>
                <p className="text-3xl mt-2">
                  {
                    trips.filter((trip) =>
                      isTodayBetween(trip.startDate, trip.endDate)
                    ).length
                  }
                </p>
              </div>
            </div>
          </>
        )}

        {activePage === "Quotes" && (
          <>
            <h2 className="text-4xl font-bold mb-6">Tour Quote Builder</h2>

            <div className="flex gap-3 mb-6">
              {[
                "Quote List",
                "Pricing Info",
                "Customer Info",
                "Pickup / Drop Off",
                "Payment Schedule",
                "Quote Footer",
                "Invoice Preview",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveQuoteTab(tab)}
                  className={`px-4 py-2 rounded border font-semibold ${
                    activeQuoteTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeQuoteTab === "Quote List" && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Saved Quotes</h3>

                  <button
                    onClick={newQuote}
                    className="bg-blue-600 text-white px-6 py-3 rounded font-semibold"
                  >
                    Create New Quote
                  </button>
                </div>

                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-2 text-left">Quote #</th>
                      <th className="border p-2 text-left">Customer</th>
                      <th className="border p-2 text-left">Tour Name</th>
                      <th className="border p-2 text-left">Status</th>
                      <th className="border p-2 text-left">Coach</th>
                      <th className="border p-2 text-left">Driver</th>
                      <th className="border p-2 text-left">Total</th>
                      <th className="border p-2 text-left">Saved At</th>
                      <th className="border p-2 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {savedQuotes.map((savedQuote) => (
                      <tr key={savedQuote.id ?? savedQuote.quoteNumber}>
                        <td className="border p-2">{savedQuote.quoteNumber}</td>
                        <td className="border p-2">{savedQuote.customerName}</td>
                        <td className="border p-2">{savedQuote.tourName}</td>
                        <td className="border p-2">{savedQuote.quoteStatus}</td>
                        <td className="border p-2">{savedQuote.coachName}</td>
                        <td className="border p-2">{savedQuote.driverName}</td>
                        <td className="border p-2">
                          {money(savedQuote.totalTourBudget)}
                        </td>
                        <td className="border p-2">{savedQuote.savedAt}</td>
                        <td className="border p-2 space-x-2">
                          <button
                            onClick={() => editQuote(savedQuote)}
                            className="bg-slate-700 text-white px-3 py-1 rounded"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => convertQuoteToTrip(savedQuote)}
                            className="bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Convert
                          </button>

                          <button
                            onClick={() => deleteQuote(savedQuote.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {savedQuotes.length === 0 && (
                      <tr>
                        <td className="border p-4 text-center" colSpan={9}>
                          No quotes saved yet. Click Create New Quote.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeQuoteTab === "Pricing Info" && (
  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
    <div className="xl:col-span-3 bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Quote Inputs</h3>

        <button
          onClick={saveQuote}
          className="bg-blue-600 text-white px-6 py-3 rounded font-semibold"
        >
          Save Quote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="col-span-1 md:col-span-2 xl:col-span-4">
          <h4 className="text-xl font-bold border-b pb-2">
            Quote Information
          </h4>
        </div>

        <div>
          <label className="block font-semibold mb-1">Quote Number</label>
          <input
            className="border p-3 rounded bg-slate-100 w-full"
            value={quote.quoteNumber}
            readOnly
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select
            className="border p-3 rounded w-full"
            value={quote.quoteStatus}
            onChange={(e) =>
              updateQuote(
                "quoteStatus",
                e.target.value as QuoteInput["quoteStatus"]
              )
            }
          >
            <option>Draft</option>
            <option>Sent</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Customer Name</label>
          <input
            className="border p-3 rounded w-full"
            value={quote.customerName}
            onChange={(e) => updateQuote("customerName", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Tour Name</label>
          <input
            className="border p-3 rounded w-full"
            value={quote.tourName}
            onChange={(e) => updateQuote("tourName", e.target.value)}
          />
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-4 mt-6">
          <h4 className="text-xl font-bold border-b pb-2">Tour Details</h4>
        </div>

        <div>
          <label className="block font-semibold mb-1">Start Date</label>
          <input
            type="date"
            className="border p-3 rounded w-full"
            value={quote.startDate}
            onChange={(e) => updateQuote("startDate", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">End Date</label>
          <input
            type="date"
            className="border p-3 rounded w-full"
            value={quote.endDate}
            onChange={(e) => updateQuote("endDate", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Coach</label>
          <select
            className="border p-3 rounded w-full"
            value={quote.coachName}
            onChange={(e) => updateQuote("coachName", e.target.value)}
          >
            <option value="">Select Coach</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.coachName}>
                {coach.coachName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Driver</label>
          <select
            className="border p-3 rounded w-full"
            value={quote.driverName}
            onChange={(e) => updateQuote("driverName", e.target.value)}
          >
            <option value="">Select Available Driver</option>
            {availableDrivers.map((driver) => (
              <option key={driver.id} value={getDriverFullName(driver)}>
                {getDriverFullName(driver)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-4 mt-6">
          <h4 className="text-xl font-bold border-b pb-2">Pricing Inputs</h4>
        </div>

        <div>
          <label className="block font-semibold mb-1">Total Miles</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.miles || ""}
            onChange={(e) => updateQuote("miles", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Bus Day Rate</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.busDayRate || ""}
            onChange={(e) => updateQuote("busDayRate", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Driver Day Rate</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.driverDayRate || ""}
            onChange={(e) => updateQuote("driverDayRate", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Fuel Rate</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.fuelRate || ""}
            onChange={(e) => updateQuote("fuelRate", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Per Diem Rate</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.perDiemRate || ""}
            onChange={(e) => updateQuote("perDiemRate", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Generator Rate / Week</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.generatorWeeklyRate || ""}
            onChange={(e) => updateQuote("generatorWeeklyRate", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Wireless Rate / Day</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.wirelessDailyRate || ""}
            onChange={(e) => updateQuote("wirelessDailyRate", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Hotel Buyout Qty</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.hotelQty || ""}
            onChange={(e) => updateQuote("hotelQty", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Hotel Buyout Rate</label>
          <input
            type="number"
            className="border p-3 rounded w-full"
            value={quote.hotelRate || ""}
            onChange={(e) => updateQuote("hotelRate", e.target.value)}
          />
        </div>
      </div>

      <div className="border p-4 rounded bg-slate-50 mb-8">
        <label className="flex items-center gap-2 font-bold mb-4">
          <input
            type="checkbox"
            checked={quote.useDeadhead}
            onChange={(e) => updateQuote("useDeadhead", e.target.checked)}
          />
          Include Deadhead Days
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="font-semibold">Bus DH Before</label>
            <input
              type="number"
              className="border p-3 rounded w-full"
              value={quote.busDHF}
              onChange={(e) => updateQuote("busDHF", e.target.value)}
              disabled={!quote.useDeadhead}
            />
          </div>

          <div>
            <label className="font-semibold">Bus DH After</label>
            <input
              type="number"
              className="border p-3 rounded w-full"
              value={quote.busDHR}
              onChange={(e) => updateQuote("busDHR", e.target.value)}
              disabled={!quote.useDeadhead}
            />
          </div>

          <div>
            <label className="font-semibold">Driver DH Before</label>
            <input
              type="number"
              className="border p-3 rounded w-full"
              value={quote.driverDHF}
              onChange={(e) => updateQuote("driverDHF", e.target.value)}
              disabled={!quote.useDeadhead}
            />
          </div>

          <div>
            <label className="font-semibold">Driver DH After</label>
            <input
              type="number"
              className="border p-3 rounded w-full"
              value={quote.driverDHR}
              onChange={(e) => updateQuote("driverDHR", e.target.value)}
              disabled={!quote.useDeadhead}
            />
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-4">Auto Calculated Fields</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
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

      <h3 className="text-2xl font-bold mb-4">Charge Lines</h3>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2 text-left">Charge</th>
            <th className="border p-2 text-left">Qty</th>
            <th className="border p-2 text-left">Rate</th>
            <th className="border p-2 text-left">Total</th>
          </tr>
        </thead>

        <tbody>
          {invoiceLines.map((line) => (
            <tr key={line.description}>
              <td className="border p-2">{line.description}</td>
              <td className="border p-2">{line.qty.toFixed(2)}</td>
              <td className="border p-2">{money(line.rate)}</td>
              <td className="border p-2">{money(line.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="bg-white p-6 rounded-lg shadow h-fit">
      <h3 className="text-2xl font-bold mb-4">Quote Totals</h3>

      <p className="font-semibold">Included In Contract</p>
      <p className="text-2xl mb-4">{money(totalTourBudget)}</p>

      <p className="font-semibold">Driver Collect</p>
      <p className="text-2xl mb-4">$0.00</p>

      <p className="font-semibold">Client Responsibility</p>
      <p className="text-2xl mb-4">$0.00</p>

      <div className="border-t pt-4">
        <p className="font-bold">Total Tour Budget</p>
        <p className="text-3xl font-bold text-blue-600">
          {money(totalTourBudget)}
        </p>
      </div>
    </div>
  </div>
)}

            {activeQuoteTab === "Invoice Preview" && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-2xl font-bold mb-4">Invoice Preview</h3>

                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-2 text-left">Qty</th>
                      <th className="border p-2 text-left">UoM</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Tax</th>
                      <th className="border p-2 text-left">Rate</th>
                      <th className="border p-2 text-left">Rate Est.</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoiceLines.map((line) => (
                      <tr key={line.description}>
                        <td className="border p-2">{line.qty.toFixed(2)}</td>
                        <td className="border p-2">{line.uom}</td>
                        <td className="border p-2">{line.description}</td>
                        <td className="border p-2">N</td>
                        <td className="border p-2">{money(line.rate)}</td>
                        <td className="border p-2">{money(line.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right mt-6">
                  <p className="text-xl font-bold">
                    Total: {money(totalTourBudget)}
                  </p>
                </div>
              </div>
            )}

            {activeQuoteTab !== "Quote List" &&
              activeQuoteTab !== "Pricing Info" &&
              activeQuoteTab !== "Invoice Preview" && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-2xl font-bold">{activeQuoteTab}</h3>
                </div>
              )}
          </>
        )}

        {activePage === "Coaches" && (
          <>
            <h2 className="text-4xl font-bold mb-6">Coach Management</h2>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-2xl font-bold mb-4">Add New Coach</h3>

              <div className="grid grid-cols-3 gap-4">
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
                      e.target.value as "Star Coach" | "Crew Coach"
                    )
                  }
                >
                  <option>Star Coach</option>
                  <option>Crew Coach</option>
                </select>
              </div>

              <button
                onClick={addCoach}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded font-semibold"
              >
                Add Coach
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-2xl font-bold mb-4">Coach List</h3>

              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-slate-100">
                    <th
                      onClick={() => sortCoaches("coachName")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Coach Name ↕
                    </th>
                    <th
                      onClick={() => sortCoaches("vin")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      VIN ↕
                    </th>
                    <th
                      onClick={() => sortCoaches("year")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Year ↕
                    </th>
                    <th
                      onClick={() => sortCoaches("model")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Model ↕
                    </th>
                    <th
                      onClick={() => sortCoaches("coachType")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Type ↕
                    </th>
                    <th className="border p-2 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedCoaches.map((coach) => (
                    <tr key={coach.id}>
                      <td className="border p-2">{coach.coachName}</td>
                      <td className="border p-2">{coach.vin}</td>
                      <td className="border p-2">{coach.year}</td>
                      <td className="border p-2">{coach.model}</td>
                      <td className="border p-2">{coach.assetOwner}</td>
                      <td className="border p-2">{coach.coachType}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => deleteCoach(coach.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "Drivers" && (
          <>
            <h2 className="text-4xl font-bold mb-6">Driver Management</h2>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-2xl font-bold mb-4">Add New Driver</h3>

              <div className="grid grid-cols-3 gap-4">
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
                      e.target.value as "Active" | "Inactive"
                    )
                  }
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>

                <input
                  className="border p-3 rounded"
                  placeholder="Phone #"
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
              </div>

              <button
                onClick={addDriver}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded font-semibold"
              >
                Add Driver
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-2xl font-bold mb-4">Driver List</h3>

              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-slate-100">
                    <th
                      onClick={() => sortDrivers("firstName")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      First Name ↕
                    </th>
                    <th
                      onClick={() => sortDrivers("lastName")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Last Name ↕
                    </th>
                    <th className="border p-2 text-left">
                      Operational Status
                    </th>
                    <th
                      onClick={() => sortDrivers("baseStatus")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Base Status ↕
                    </th>
                    <th
                      onClick={() => sortDrivers("phone")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Phone ↕
                    </th>
                    <th
                      onClick={() => sortDrivers("email")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Email ↕
                    </th>
                    <th
                      onClick={() => sortDrivers("address")}
                      className="border p-2 text-left cursor-pointer"
                    >
                      Address ↕
                    </th>
                    <th className="border p-2 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedDrivers.map((driver) => {
                    const status = getDriverOperationalStatus(driver);

                    return (
                      <tr key={driver.id}>
                        <td className="border p-2">{driver.firstName}</td>
                        <td className="border p-2">{driver.lastName}</td>
                        <td className="border p-2">
                          <span
                            className={`px-3 py-1 rounded-full text-white text-sm ${
                              status === "Available"
                                ? "bg-green-600"
                                : status === "On Tour"
                                ? "bg-blue-600"
                                : "bg-red-600"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="border p-2">{driver.baseStatus}</td>
                        <td className="border p-2">{driver.phone}</td>
                        <td className="border p-2">{driver.email}</td>
                        <td className="border p-2">{driver.address}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => deleteDriver(driver.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "Trips" && (
          <>
            <h2 className="text-4xl font-bold mb-6">Trips</h2>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
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

            <div className="bg-white p-6 rounded-lg shadow">
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
                          onClick={() => deleteTrip(trip.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
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
          </>
        )}
        {activePage === "Calendar" && (
  <>
    <h2 className="text-4xl font-bold mb-6">Tour Calendar</h2>

    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h3 className="text-2xl font-bold mb-4">Scheduled Tours</h3>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2 text-left">Tour Name</th>
            <th className="border p-2 text-left">Bus / Coach</th>
            <th className="border p-2 text-left">Driver</th>
            <th className="border p-2 text-left">Start Date</th>
            <th className="border p-2 text-left">End Date</th>
            <th className="border p-2 text-left">Days Out</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((trip) => {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const daysOut =
              Math.max(
                Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                ) + 1,
                0
              );

            return (
              <tr key={trip.id}>
                <td className="border p-2">{trip.tripName}</td>
                <td className="border p-2">{trip.coachName}</td>
                <td className="border p-2">{trip.driverName}</td>
                <td className="border p-2">{trip.startDate}</td>
                <td className="border p-2">{trip.endDate}</td>
                <td className="border p-2">{daysOut}</td>
                <td className="border p-2">
                  {isTodayBetween(trip.startDate, trip.endDate)
                    ? "On Tour"
                    : "Scheduled / Completed"}
                </td>
              </tr>
            );
          })}

          {trips.length === 0 && (
            <tr>
              <td className="border p-4 text-center" colSpan={7}>
                No tours scheduled.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-2xl font-bold mb-4">Available Coaches</h3>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2 text-left">Coach Name</th>
            <th className="border p-2 text-left">VIN</th>
            <th className="border p-2 text-left">Year</th>
            <th className="border p-2 text-left">Model</th>
            <th className="border p-2 text-left">Type</th>
          </tr>
        </thead>

        <tbody>
          {coaches
            .filter((coach) => {
              const coachIsOnTour = trips.some(
                (trip) =>
                  trip.coachName === coach.coachName &&
                  isTodayBetween(trip.startDate, trip.endDate)
              );

              return !coachIsOnTour;
            })
            .map((coach) => (
              <tr key={coach.id}>
                <td className="border p-2">{coach.coachName}</td>
                <td className="border p-2">{coach.vin}</td>
                <td className="border p-2">{coach.year}</td>
                <td className="border p-2">{coach.model}</td>
                <td className="border p-2">{coach.coachType}</td>
              </tr>
            ))}

          {coaches.filter((coach) => {
            const coachIsOnTour = trips.some(
              (trip) =>
                trip.coachName === coach.coachName &&
                isTodayBetween(trip.startDate, trip.endDate)
            );

            return !coachIsOnTour;
          }).length === 0 && (
            <tr>
              <td className="border p-4 text-center" colSpan={6}>
                No available coaches.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </>
)}
        {activePage !== "Calendar" &&
          activePage !== "Dashboard" &&
          activePage !== "Quotes" &&
          activePage !== "Coaches" &&
          activePage !== "Drivers" &&
          activePage !== "Trips" && (
            <h2 className="text-4xl font-bold">{activePage}</h2>
          )}
      </section>
    </main>
  );
}