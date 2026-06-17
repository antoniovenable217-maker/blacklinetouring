"use client";

import { useState } from "react";

type QuoteInput = {
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

export default function Home() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [activeQuoteTab, setActiveQuoteTab] = useState("Pricing Info");

  const [quote, setQuote] = useState<QuoteInput>({
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
  });

  function updateQuote(field: keyof QuoteInput, value: string | boolean) {
    setQuote({
      ...quote,
      [field]:
        typeof value === "boolean" ||
        field === "startDate" ||
        field === "endDate" ||
        field === "coachName" ||
        field === "driverName"
          ? value
          : Number(value),
    });
  }

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

  const invoiceLines = [
    {
      qty: billedDays,
      uom: "Days",
      description: `${quote.coachName || "Bus / Trailer"} (${quote.startDate || "Start"} - ${quote.endDate || "End"})`,
      rate: quote.busDayRate,
      total: busTotal,
    },
    {
      qty: driverDays,
      uom: "Days",
      description: `${quote.driverName || "Driver"} (${quote.startDate || "Start"} - ${quote.endDate || "End"})`,
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
        <h1 className="text-2xl font-bold mb-8">BusOps</h1>

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
                <h3 className="font-semibold">Available Coaches</h3>
                <p className="text-3xl mt-2">42</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold">Booked Coaches</h3>
                <p className="text-3xl mt-2">18</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold">Open Quotes</h3>
                <p className="text-3xl mt-2">12</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold">Trips This Week</h3>
                <p className="text-3xl mt-2">37</p>
              </div>
            </div>
          </>
        )}

        {activePage === "Quotes" && (
          <>
            <h2 className="text-4xl font-bold mb-6">Tour Quote Builder</h2>

            <div className="flex gap-3 mb-6">
              {[
                "Customer Info",
                "Pricing Info",
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

            {activeQuoteTab === "Pricing Info" && (
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-3 bg-white p-6 rounded-lg shadow">
                  <h3 className="text-2xl font-bold mb-4">Quote Inputs</h3>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <input
                      type="date"
                      className="border p-3 rounded"
                      value={quote.startDate}
                      onChange={(e) => updateQuote("startDate", e.target.value)}
                    />

                    <input
                      type="date"
                      className="border p-3 rounded"
                      value={quote.endDate}
                      onChange={(e) => updateQuote("endDate", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Coach / Bus Name"
                      value={quote.coachName}
                      onChange={(e) => updateQuote("coachName", e.target.value)}
                    />

                    <input
                      className="border p-3 rounded"
                      placeholder="Driver Name"
                      value={quote.driverName}
                      onChange={(e) => updateQuote("driverName", e.target.value)}
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Total Miles"
                      onChange={(e) => updateQuote("miles", e.target.value)}
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Bus Day Rate"
                      onChange={(e) => updateQuote("busDayRate", e.target.value)}
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Driver Day Rate"
                      onChange={(e) =>
                        updateQuote("driverDayRate", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Fuel Rate"
                      onChange={(e) => updateQuote("fuelRate", e.target.value)}
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Per Diem Rate"
                      onChange={(e) => updateQuote("perDiemRate", e.target.value)}
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Generator Rate / Week"
                      onChange={(e) =>
                        updateQuote("generatorWeeklyRate", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Wireless Rate / Day"
                      onChange={(e) =>
                        updateQuote("wirelessDailyRate", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Hotel Buyout Qty"
                      onChange={(e) => updateQuote("hotelQty", e.target.value)}
                    />

                    <input
                      type="number"
                      className="border p-3 rounded"
                      placeholder="Hotel Buyout Rate"
                      onChange={(e) => updateQuote("hotelRate", e.target.value)}
                    />
                  </div>

                  <div className="border p-4 rounded bg-slate-50 mb-8">
                    <label className="flex items-center gap-2 font-bold mb-4">
                      <input
                        type="checkbox"
                        checked={quote.useDeadhead}
                        onChange={(e) =>
                          updateQuote("useDeadhead", e.target.checked)
                        }
                      />
                      Include Deadhead Days
                    </label>

                    <div className="grid grid-cols-4 gap-4">
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
                          onChange={(e) =>
                            updateQuote("driverDHF", e.target.value)
                          }
                          disabled={!quote.useDeadhead}
                        />
                      </div>

                      <div>
                        <label className="font-semibold">Driver DH After</label>
                        <input
                          type="number"
                          className="border p-3 rounded w-full"
                          value={quote.driverDHR}
                          onChange={(e) =>
                            updateQuote("driverDHR", e.target.value)
                          }
                          disabled={!quote.useDeadhead}
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4">
                    Auto Calculated Fields
                  </h3>

                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div>
                      <label className="font-semibold">Tour Days</label>
                      <input
                        className="border p-3 rounded bg-slate-100 w-full"
                        value={tourDays}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-semibold">Bus DH Before</label>
                      <input
                        className="border p-3 rounded bg-slate-100 w-full"
                        value={busDHF}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-semibold">Bus DH After</label>
                      <input
                        className="border p-3 rounded bg-slate-100 w-full"
                        value={busDHR}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-semibold">Billed Bus Days</label>
                      <input
                        className="border p-3 rounded bg-slate-100 w-full"
                        value={billedDays}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-semibold">Driver DH Before</label>
                      <input
                        className="border p-3 rounded bg-slate-100 w-full"
                        value={driverDHF}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-semibold">Driver DH After</label>
                      <input
                        className="border p-3 rounded bg-slate-100 w-full"
                        value={driverDHR}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-semibold">Driver Days</label>
                      <input
                        className="border p-3 rounded bg-slate-100 w-full"
                        value={driverDays}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-semibold">Billed Months</label>
                      <input
                        className="border p-3 rounded bg-slate-100 w-full"
                        value={billedMonths.toFixed(2)}
                        readOnly
                      />
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

            {activeQuoteTab !== "Pricing Info" &&
              activeQuoteTab !== "Invoice Preview" && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-2xl font-bold">{activeQuoteTab}</h3>
                </div>
              )}
          </>
        )}

        {activePage !== "Dashboard" && activePage !== "Quotes" && (
          <h2 className="text-4xl font-bold">{activePage}</h2>
        )}
      </section>
    </main>
  );
}