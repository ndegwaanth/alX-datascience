const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, PageBreak, TableOfContents,
  Header, Footer, PageNumber, LevelFormat, VerticalAlign,
} = require("docx");

// ---------- palette ----------
const NAVY = "0B2E4F";
const NAVY_DARK = "081D33";
const TEAL = "12939A";
const ORANGE = "E8622C";
const GRAY = "6B7580";
const LIGHT_GRAY = "F2F4F6";
const WHITE = "FFFFFF";
const TEXT = "2A2E33";

const FONT = "Calibri";
const HEAD_FONT = "Calibri";

// ---------- helpers ----------
function h1(text, num) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    border: { bottom: { color: TEAL, space: 6, style: BorderStyle.SINGLE, size: 8 } },
    children: [
      ...(num ? [new TextRun({ text: `${num}  `, color: ORANGE, bold: true, font: HEAD_FONT })] : []),
      new TextRun({ text, color: NAVY, bold: true, font: HEAD_FONT }),
    ],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, color: TEAL, bold: true, font: HEAD_FONT })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, color: NAVY_DARK, bold: true, font: HEAD_FONT })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 140, line: 276 },
    children: [new TextRun({ text, color: TEXT, font: FONT, size: 21, ...opts })],
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "main-bullets", level },
    spacing: { after: 60 },
    children: [new TextRun({ text, color: TEXT, font: FONT, size: 21 })],
  });
}
function quoteLine(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    indent: { left: 360 },
    border: { left: { color: ORANGE, space: 8, style: BorderStyle.SINGLE, size: 18 } },
    children: [new TextRun({ text, italics: true, color: NAVY, font: FONT, size: 22 })],
  });
}
function flowChain(steps, chunkSize = 6) {
  // Break a long linear flow into readable chevron chunks
  const paras = [];
  for (let i = 0; i < steps.length; i += chunkSize) {
    const chunk = steps.slice(i, i + chunkSize);
    paras.push(quoteLine(chunk.join("  →  ") + (i + chunkSize < steps.length ? "  →" : "")));
  }
  return paras;
}
function cell(text, { fill, color = TEXT, bold = false, width, align = AlignmentType.LEFT, size = 20 } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, color, font: FONT, size })],
    })],
  });
}
function simpleTable(headerRow, dataRows, widths, boldFirstCol = true) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headerRow.map((t, ci) => cell(t, { width: widths[ci], fill: NAVY, color: WHITE, bold: true })),
      }),
      ...dataRows.map((r, i) => new TableRow({
        children: r.map((t, ci) => cell(t, {
          width: widths[ci],
          fill: i % 2 === 0 ? LIGHT_GRAY : WHITE,
          bold: boldFirstCol && ci === 0,
        })),
      })),
    ],
  });
}
function gridTable(items, cols, colWidth) {
  // numbered grid, e.g. the 38 core system areas
  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    const rowItems = items.slice(i, i + cols);
    while (rowItems.length < cols) rowItems.push("");
    const rowIdx = i / cols;
    rows.push(new TableRow({
      children: rowItems.map((t, ci) => {
        const n = i + ci + 1;
        return new TableCell({
          width: { size: colWidth, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: rowIdx % 2 === 0 ? LIGHT_GRAY : WHITE },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 90, bottom: 90, left: 110, right: 110 },
          children: [new Paragraph({
            children: t ? [
              new TextRun({ text: `${n.toString().padStart(2, "0")}  `, bold: true, color: ORANGE, font: FONT, size: 18 }),
              new TextRun({ text: t, color: TEXT, font: FONT, size: 18 }),
            ] : [],
          })],
        });
      }),
    }));
  }
  return new Table({
    width: { size: colWidth * cols, type: WidthType.DXA },
    columnWidths: Array(cols).fill(colWidth),
    rows,
  });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }
function sectionDivider() {
  return new Paragraph({ spacing: { before: 60, after: 300 }, border: { bottom: { color: LIGHT_GRAY, space: 1, style: BorderStyle.SINGLE, size: 4 } }, children: [] });
}
function layerBox(label, content) {
  return new Table({
    width: { size: 9200, type: WidthType.DXA },
    columnWidths: [9200],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9200, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      children: [
        new Paragraph({ children: [new TextRun({ text: label, bold: true, color: ORANGE, font: FONT, size: 19 })] }),
        new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: content, color: WHITE, font: FONT, size: 20 })] }),
      ],
    })] })],
  });
}
function arrowDown() {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "↓", color: TEAL, bold: true, size: 26 })] });
}

// ================= CONTENT =================
function buildMainContent() {
  const c = [];

  // 1. SYSTEM OVERVIEW
  c.push(h1("System Overview", "1."));
  c.push(body("The Logistics Management System is an integrated platform designed to manage the movement, storage, fulfillment, delivery, documentation, financial activity, and overall coordination of goods from suppliers to customers. It connects the major logistics functions rather than treating transportation, warehousing, orders, freight, and delivery as independent systems."));
  c.push(h2("Overall Operational Flow"));
  c.push(...flowChain(["Customer / Demand", "Quotation", "Order", "Planning", "Inventory / Procurement", "Warehouse", "Fulfillment", "Shipment", "Transportation / Freight", "Dispatch", "Last-Mile Delivery", "Proof of Delivery", "Billing", "Payment", "Reporting & Analytics"], 5));
  c.push(body("The system maintains a common data foundation so information entered once can be reused throughout the entire logistics lifecycle."));

  // 2. OBJECTIVES
  c.push(pageBreak());
  c.push(h1("System Objectives", "2."));
  const objectives = [
    ["Operational Management", "Manage day-to-day logistics operations"],
    ["Visibility", "Into orders, inventory, shipments, vehicles, deliveries, warehouses and customers"],
    ["Coordination", "Connect departments and operational activities"],
    ["Automation", "Reduce manual administrative processes"],
    ["Control", "Ensure logistics activities follow approved processes"],
    ["Financial Management", "Connect logistics activity with billing, expenses and payments"],
    ["Customer Service", "Let customers receive information about orders and shipments"],
    ["Analytics", "Provide management with information for decision-making"],
    ["Auditability", "Maintain records of who performed important activities and when"],
  ];
  c.push(simpleTable(["Objective", "Description"], objectives, [2600, 6600]));

  // 3. CORE SYSTEM AREAS
  c.push(pageBreak());
  c.push(h1("Core System Areas", "3."));
  c.push(body("The complete platform consists of 38 major domains, working together as a single connected ecosystem."));
  const areas = ["Identity & Access Management","Organization Management","Customer Management","Supplier Management",
    "Product & Cargo Management","Quotation Management","Contract Management","Pricing Management","Order Management",
    "Procurement","Warehouse Management","Inventory Management","Fulfillment","Transportation","Fleet Management",
    "Driver Management","Route Management","Dispatch Management","Shipment Management","Freight Forwarding",
    "Customs Management","Container Management","Delivery Management","Returns Management","Billing","Payments",
    "Expense Management","Document Management","Tracking & Visibility","Notifications","Customer Portal",
    "Supplier Portal","Analytics & Reporting","Forecasting","Optimization","Audit & Compliance","Administration",
    "System Integration"];
  c.push(gridTable(areas, 2, 4600));

  // 4. SYSTEM ACTORS
  c.push(pageBreak());
  c.push(h1("System Actors", "4."));
  c.push(body("The system supports distinct user types, each with a defined operational responsibility."));
  const actors = [
    ["System Administrator", "System configuration, user management, permissions, master data, security, audit monitoring"],
    ["Management", "Performance monitoring, financial oversight, strategic decisions, reports, analytics"],
    ["Sales / Commercial Team", "Customers, leads, quotations, pricing, contracts, commercial relationships"],
    ["Operations Team", "Orders, shipments, planning, dispatch, transportation, deliveries"],
    ["Warehouse Team", "Receiving, put-away, storage, picking, packing, transfers, stock counts"],
    ["Procurement Team", "Supplier management, purchase requests / orders, procurement coordination"],
    ["Drivers", "Assigned trips, vehicle inspections, delivery tasks, status updates, proof of delivery"],
    ["Finance Team", "Invoices, payments, expenses, customer balances, supplier payments, reconciliation"],
    ["Customers", "Orders, quotations, shipments, tracking, delivery status, documents, invoices, support"],
  ];
  c.push(simpleTable(["Actor", "Responsibilities"], actors, [2600, 6600]));

  // 5. IDENTITY & ACCESS
  c.push(pageBreak());
  c.push(h1("Identity & Access Management", "5."));
  c.push(body("Controls who can access the system and what they are allowed to do."));
  c.push(h2("User Management")); c.push(body("Name, email, phone, department, position, organization, account status."));
  c.push(h2("Authentication")); ["Login / logout", "Password management & account recovery", "Multi-factor authentication where required"].forEach(t => c.push(bullet(t)));
  c.push(h2("Role Management")); ["Administrator", "Manager", "Operations Officer", "Warehouse Officer", "Dispatcher", "Driver", "Finance Officer", "Procurement Officer", "Customer"].forEach(t => c.push(bullet(t)));
  c.push(h2("Permissions")); ["View", "Create", "Edit", "Approve", "Cancel", "Delete", "Export", "Financial access", "Administrative access"].forEach(t => c.push(bullet(t)));

  // 6. ORGANIZATION MANAGEMENT
  c.push(pageBreak());
  c.push(h1("Organization Management", "6."));
  c.push(body("Supports the organizational structure across multiple locations."));
  const org = [
    ["Organization", "Company, branches, departments, warehouses, operating locations"],
    ["Branches", "Address, contact information, manager, operational status"],
    ["Departments", "Operations, Finance, Sales, Warehouse, Procurement, Transport, Customer Service"],
  ];
  c.push(simpleTable(["Level", "Contains"], org, [2600, 6600]));

  // 7. CUSTOMER MANAGEMENT
  c.push(pageBreak());
  c.push(h1("Customer Management", "7."));
  c.push(body("Customers are central to the logistics system; the customer record becomes the reference point for every related transaction."));
  c.push(h2("Customer Profile")); ["Customer name & company", "Contacts & addresses", "Billing information & delivery locations", "Customer type & account status"].forEach(t => c.push(bullet(t)));
  c.push(h2("Customer Locations")); c.push(body("A customer may have multiple warehouses, stores, offices, or delivery locations."));
  c.push(h2("Customer Relationships")); ["Contracts & pricing agreements", "Orders, shipments & deliveries", "Invoices & payments", "Complaints & returns"].forEach(t => c.push(bullet(t)));

  // 8. SUPPLIER MANAGEMENT
  c.push(h1("Supplier Management", "8."));
  c.push(body("Suppliers provide goods, transportation, services, or other resources."));
  c.push(h2("Supplier Profile")); ["Supplier details, contacts & locations", "Services, contracts & payment terms", "Performance information"].forEach(t => c.push(bullet(t)));
  c.push(h2("Supplier Types")); ["Product supplier", "Transport provider", "Freight carrier", "Warehouse provider", "Customs agent", "Packaging supplier", "Maintenance provider"].forEach(t => c.push(bullet(t)));
  c.push(h2("Supplier Performance")); ["Delivery performance", "Quality", "Cost", "Reliability", "Compliance"].forEach(t => c.push(bullet(t)));

  // 9. PRODUCT & CARGO
  c.push(pageBreak());
  c.push(h1("Product & Cargo Management", "9."));
  c.push(body("A standardized way to describe what is being moved or stored."));
  c.push(h2("Product Master")); ["Product code, name & category", "Unit of measure, weight, dimensions, volume", "Barcode / SKU & handling requirements"].forEach(t => c.push(bullet(t)));
  c.push(h2("Cargo Information")); ["Cargo type, quantity, weight, volume", "Packaging & value", "Special handling requirements"].forEach(t => c.push(bullet(t)));
  c.push(h2("Special Cargo")); ["Fragile", "Perishable", "Temperature-sensitive", "Hazardous", "High-value", "Restricted"].forEach(t => c.push(bullet(t)));

  // 10. COMMERCIAL MANAGEMENT
  c.push(pageBreak());
  c.push(h1("Commercial Management — Quotations, Contracts & Pricing", "10."));

  c.push(h2("10.1  Quotation Management"));
  c.push(body("Handles the commercial process before an order is created. A customer provides the required service, origin, destination, cargo, quantity, weight, volume, timeline and special requirements; the company then determines service, route, resources, cost, markup, price, taxes and terms."));
  c.push(flowChain(["Draft", "Prepared", "Sent", "Customer Review", "Accepted / Rejected"], 6)[0]);
  c.push(body("An accepted quotation can become an order or contract."));

  c.push(h2("10.2  Contract Management"));
  ["Customer / supplier & contract number", "Start date, end date & services", "Pricing terms & payment terms", "Service-level requirements"].forEach(t => c.push(bullet(t)));
  c.push(body("Contracts are monitored for expiration, renewal, performance, pricing and SLA compliance, and should influence pricing and operational rules where appropriate."));

  c.push(h2("10.3  Pricing Management"));
  c.push(h3("Pricing Components")); ["Distance, weight & volume", "Cargo type & service type", "Vehicle type & fuel", "Handling & storage duration", "Customs, delivery location & urgency"].forEach(t => c.push(bullet(t)));
  c.push(h3("Pricing Models")); ["Per kilometer", "Per kilogram", "Per shipment", "Per pallet", "Per cubic meter", "Per delivery", "Per day", "Contract pricing"].forEach(t => c.push(bullet(t)));
  c.push(flowChain(["Cost Calculation", "Markup", "Customer Price", "Quotation", "Order"], 6)[0]);

  // 11. ORDER MANAGEMENT
  c.push(pageBreak());
  c.push(h1("Order Management", "11."));
  c.push(body("The order is the central operational transaction, originating from the customer, sales team, customer portal, API, or internal operation."));
  c.push(h2("Order Information")); ["Customer, order number & order date", "Items, quantity, origin & destination", "Required date & service type", "Special instructions"].forEach(t => c.push(bullet(t)));
  c.push(h2("Order Lifecycle"));
  c.push(flowChain(["Draft", "Confirmed", "Planned", "Processing", "Fulfilled", "Shipped", "Delivered", "Closed"], 8)[0]);
  c.push(body("Orders may also be cancelled, placed on hold, or partially fulfilled."));

  // 12. PROCUREMENT
  c.push(h1("Procurement", "12."));
  c.push(body("Handles the acquisition of goods or services required by the organization."));
  c.push(flowChain(["Requirement", "Purchase Request", "Approval", "Supplier", "Purchase Order", "Delivery", "Receiving", "Invoice", "Payment"], 5)[0]);
  c.push(flowChain(["Requirement", "Purchase Request", "Approval", "Supplier", "Purchase Order", "Delivery", "Receiving", "Invoice", "Payment"], 5)[1]);

  // 13. WAREHOUSE MANAGEMENT
  c.push(pageBreak());
  c.push(h1("Warehouse Management", "13."));
  c.push(body("Controls physical movement inside warehouses."));
  c.push(h2("Warehouse Structure"));
  c.push(quoteLine("Warehouse  →  Zones  →  Aisles  →  Bins / Locations"));
  const whFlow = [
    ["Receiving", "Verify shipment, check documents, count goods, inspect condition, record receipt"],
    ["Put-Away", "Goods are assigned to appropriate storage locations"],
    ["Storage", "The system tracks where inventory is located"],
    ["Picking", "Orders generate picking requirements"],
    ["Packing", "Picked goods are prepared for shipment"],
    ["Dispatch", "Packed goods leave the warehouse"],
  ];
  c.push(simpleTable(["Stage", "Description"], whFlow, [2200, 7000]));

  // 14. INVENTORY MANAGEMENT
  c.push(pageBreak());
  c.push(h1("Inventory Management", "14."));
  c.push(body("Maintains the organization's stock position. Inventory should never simply change without a traceable transaction."));
  c.push(h2("Inventory States")); ["Available", "Reserved", "Allocated", "In transit", "Damaged", "Expired", "Quarantined"].forEach(t => c.push(bullet(t)));
  c.push(h2("Inventory Transactions")); ["Receiving", "Put-away", "Picking", "Transfer", "Adjustment", "Dispatch", "Return", "Damage"].forEach(t => c.push(bullet(t)));
  c.push(h2("Inventory Flow"));
  c.push(flowChain(["Supplier", "Receiving", "Warehouse", "Available Stock", "Allocation", "Picking", "Dispatch", "Customer"], 8)[0]);

  // 15. FULFILLMENT
  c.push(h1("Fulfillment", "15."));
  c.push(body("Connects orders with warehouse operations."));
  c.push(flowChain(["Customer Order", "Inventory Check", "Inventory Reservation", "Picking List", "Picking", "Packing", "Shipment Preparation", "Dispatch"], 8)[0]);
  c.push(body("The system supports full fulfillment, partial fulfillment, backorders, and order cancellation."));

  // 16. TRANSPORTATION & FLEET
  c.push(pageBreak());
  c.push(h1("Transportation, Fleet, Drivers, Routes & Dispatch", "16."));

  c.push(h2("16.1  Transportation Planning"));
  ["Origin, destination & cargo", "Vehicle, driver & route", "Schedule & cost"].forEach(t => c.push(bullet(t)));
  c.push(body("Transportation types: Road, Rail, Air, Sea, Multimodal.", { italics: true, color: GRAY }));
  c.push(body("A trip contains: vehicle, driver, route, cargo, start location, destination, planned departure, expected arrival, actual arrival, and status."));

  c.push(h2("16.2  Fleet Management"));
  c.push(h3("Vehicle Profile")); ["Registration, vehicle type & capacity", "Model, ownership & fuel type"].forEach(t => c.push(bullet(t)));
  c.push(h3("Vehicle Status")); ["Available", "Assigned", "In Transit", "Maintenance", "Out of Service"].forEach(t => c.push(bullet(t)));
  c.push(h3("Vehicle Maintenance")); ["Service schedules & repairs", "Maintenance costs & mileage", "Inspection & maintenance history"].forEach(t => c.push(bullet(t)));

  c.push(h2("16.3  Driver Management"));
  ["Name, contact & license information / expiry", "Employment status & assigned vehicle", "Performance"].forEach(t => c.push(bullet(t)));
  c.push(body("Driver activities: accept assignments, start trips, update status, confirm pickup / delivery, upload proof of delivery, report incidents.", { italics: true, color: GRAY }));

  c.push(h2("16.4  Route Management"));
  ["Origin, destination & waypoints", "Distance & estimated duration", "Restrictions & toll information"].forEach(t => c.push(bullet(t)));
  c.push(body("Route planning considers distance, traffic, vehicle capacity, delivery windows, road restrictions and customer priorities, and is connected to the trip and delivery schedule."));

  c.push(h2("16.5  Dispatch Management"));
  c.push(flowChain(["Order / Shipment Ready", "Transport Requirement", "Vehicle Selection", "Driver Selection", "Route Assignment", "Dispatch Approval", "Trip Started"], 7)[0]);
  c.push(body("The dispatcher should see available vehicles, available drivers, pending shipments, scheduled deliveries, active trips, and delayed trips."));

  // 17. SHIPMENT, FREIGHT, CUSTOMS, CONTAINERS
  c.push(pageBreak());
  c.push(h1("Shipment, Freight, Customs & Containers", "17."));

  c.push(h2("17.1  Shipment Management"));
  ["Shipment number, customer & order", "Cargo, origin & destination", "Transport mode, carrier, vehicle & driver", "Planned dates & status"].forEach(t => c.push(bullet(t)));
  c.push(flowChain(["Created", "Prepared", "Dispatched", "In Transit", "Arrived", "Delivered", "Closed"], 7)[0]);

  c.push(h2("17.2  Freight Forwarding"));
  c.push(body("Manages complex cargo movement, especially international shipments."));
  c.push(flowChain(["Customer Request", "Quotation", "Booking", "Cargo Preparation", "Carrier Coordination", "Documentation", "Customs", "Transportation", "Arrival", "Final Delivery"], 5)[0]);
  c.push(flowChain(["Customer Request", "Quotation", "Booking", "Cargo Preparation", "Carrier Coordination", "Documentation", "Customs", "Transportation", "Arrival", "Final Delivery"], 5)[1]);
  c.push(body("Freight records connect to shipments, containers, customs, documents, carriers, customers and billing."));

  c.push(h2("17.3  Customs Management"));
  ["Declaration & shipment reference", "Import / export type & customs value", "Duties, taxes & tariff classification", "Origin, destination & required documents"].forEach(t => c.push(bullet(t)));
  c.push(flowChain(["Shipment", "Documentation", "Declaration", "Review", "Customs Clearance", "Release", "Transportation"], 7)[0]);

  c.push(h2("17.4  Container Management"));
  ["Container number, type & size", "Carrier, status, shipment & location"].forEach(t => c.push(bullet(t)));
  c.push(flowChain(["Available", "Booked", "Loaded", "In Transit", "Arrived", "Unloaded", "Returned"], 7)[0]);

  // 18. DELIVERY, POD, FAILED DELIVERY, RETURNS
  c.push(pageBreak());
  c.push(h1("Delivery, Proof of Delivery, Failed Delivery & Returns", "18."));

  c.push(h2("18.1  Delivery Management"));
  ["Customer, shipment & delivery location", "Driver, vehicle & scheduled date", "Delivery window & status"].forEach(t => c.push(bullet(t)));
  c.push(flowChain(["Scheduled", "Assigned", "Dispatched", "Out for Delivery", "Delivered", "Confirmed"], 6)[0]);

  c.push(h2("18.2  Proof of Delivery"));
  c.push(body("Captures evidence that a delivery occurred:"));
  ["Customer / digital signature", "Photograph & timestamp", "Delivery code & GPS location", "Receiver name"].forEach(t => c.push(bullet(t)));

  c.push(h2("18.3  Failed Delivery Management"));
  c.push(body("Possible reasons: customer unavailable, wrong address, damaged goods, vehicle problem, customer rejection, access restrictions, weather, other operational issues."));
  c.push(body("Recorded data: failure reason, date, driver, delivery, customer, action required. Outcomes: reschedule, return, redelivery, or cancellation."));

  c.push(h2("18.4  Returns Management"));
  c.push(body("Treated as a controlled reverse-logistics process."));
  c.push(flowChain(["Customer", "Return Request", "Approval", "Pickup", "Warehouse", "Inspection", "Resolution"], 7)[0]);
  c.push(body("Resolution outcomes: restock, repair, replace, dispose, or refund.", { italics: true, color: GRAY }));

  // 19. FINANCIAL OPERATIONS
  c.push(pageBreak());
  c.push(h1("Financial Operations — Billing, Payments & Expenses", "19."));

  c.push(h2("19.1  Billing"));
  c.push(body("Converts completed logistics services into financial charges."));
  ["Transportation, storage & handling", "Fulfillment & freight", "Customs coordination & delivery", "Additional services"].forEach(t => c.push(bullet(t)));
  c.push(body("An invoice contains: customer, services, quantity, unit price, taxes, discounts, total, payment terms, and due date."));
  c.push(flowChain(["Completed Service", "Billable Activity", "Invoice", "Customer", "Payment"], 6)[0]);

  c.push(h2("19.2  Payments"));
  c.push(h3("Customer Payments")); ["Invoice, amount & payment date", "Payment method, reference & status"].forEach(t => c.push(bullet(t)));
  c.push(h3("Supplier Payments")); ["Supplier invoice, amount & payment", "Reference & status"].forEach(t => c.push(bullet(t)));
  c.push(body("Payments should be matched against invoices through reconciliation."));

  c.push(h2("19.3  Expense Management"));
  ["Fuel, tolls & vehicle maintenance", "Driver expenses & freight charges", "Warehouse costs & handling", "Customs charges & outsourced transportation"].forEach(t => c.push(bullet(t)));
  c.push(body("Expenses should link to a trip, vehicle, shipment, order, warehouse or department to enable profitability analysis."));

  // 20. DOCUMENTS, TRACKING, NOTIFICATIONS
  c.push(pageBreak());
  c.push(h1("Documents, Tracking & Notifications", "20."));

  c.push(h2("20.1  Document Management"));
  ["Quotation, Contract & Purchase Order", "Sales Order & Invoice", "Packing List & Delivery Note", "Proof of Delivery & Bill of Lading", "Air Waybill & Customs Declaration", "Certificates & transport documents"].forEach(t => c.push(bullet(t)));
  c.push(body("Documents should be associated with the appropriate business transaction."));

  c.push(h2("20.2  Tracking & Visibility"));
  c.push(body("Trackable objects: orders, shipments, vehicles, deliveries, containers."));
  c.push(flowChain(["Created", "Processing", "Dispatched", "In Transit", "Arrived", "Out for Delivery", "Delivered"], 7)[0]);
  c.push(body("Every major status change records a timestamp, the responsible user/system, location where available, and the related transaction."));

  c.push(h2("20.3  Notifications"));
  c.push(h3("Customer Notifications")); ["Order confirmed / shipment dispatched", "In transit / delivery scheduled", "Out for delivery / delivered", "Delivery failed / invoice issued"].forEach(t => c.push(bullet(t)));
  c.push(h3("Internal Notifications")); ["Order requires attention / low inventory", "Vehicle unavailable / maintenance due", "Delivery delayed / contract expiring", "Shipment exception"].forEach(t => c.push(bullet(t)));
  c.push(body("Channels: email, SMS, push notifications, in-system notifications, and WhatsApp where integrated.", { italics: true, color: GRAY }));

  // 21. PORTALS
  c.push(pageBreak());
  c.push(h1("Customer & Supplier Portals", "21."));
  c.push(h2("Customer Portal"));
  c.push(body("Customers should only see their own data. They can:"));
  const portalCols = [
    ["View", "Orders, shipments, deliveries, quotations, invoices, documents"],
    ["Track", "Shipment status and delivery status"],
    ["Request", "Quote, service, return, support"],
    ["Download", "Invoices, delivery documents, shipment documents"],
  ];
  c.push(simpleTable(["Capability", "Includes"], portalCols, [2200, 7000]));
  c.push(h2("Supplier Portal"));
  c.push(body("Suppliers access only what is relevant to them: purchase orders, delivery requirements, shipment information, required documents, and delivery confirmations."));

  // 22. ANALYTICS & REPORTING
  c.push(pageBreak());
  c.push(h1("Analytics & Reporting", "22."));
  c.push(body("The analytics layer combines information from every operational module."));
  const analytics = [
    ["Orders", "Orders received, completed, pending, cancelled"],
    ["Shipments", "In transit, delayed, delivered, shipment volumes"],
    ["Deliveries", "On-time deliveries, failed deliveries, success rate"],
    ["Warehouse", "Stock levels, utilization, receiving & dispatch volume"],
    ["Transportation", "Trips, vehicle utilization, distance, fuel, cost"],
  ];
  c.push(simpleTable(["Area", "Metrics"], analytics, [2200, 7000]));

  c.push(h2("Financial Reporting"));
  ["Revenue & expenses", "Outstanding invoices & payments", "Customer, shipment, route & service profitability"].forEach(t => c.push(bullet(t)));

  c.push(h2("Customer & Supplier Performance"));
  ["Orders / revenue per customer & delivery performance", "Service usage, outstanding balances, returns, complaints", "Supplier delivery reliability, cost, quality, lead time"].forEach(t => c.push(bullet(t)));

  c.push(pageBreak());
  c.push(h2("KPI Dashboard"));
  const kpis = [
    ["Operational", "Orders processed · Active shipments · Deliveries completed · On-time rate · Failed rate"],
    ["Warehouse", "Inventory value · Stock accuracy · Utilization · Fulfillment rate"],
    ["Transportation", "Vehicle utilization · Trip completion · Cost per km · Fuel consumption"],
    ["Financial", "Revenue · Expenses · Profitability · Outstanding invoices · Collection rate"],
    ["Customer", "Active customers · Retention · Complaints · Returns"],
  ];
  c.push(simpleTable(["Category", "Key Indicators"], kpis, [2200, 7000]));

  // 23. FORECASTING & OPTIMIZATION
  c.push(pageBreak());
  c.push(h1("Forecasting & Optimization", "23."));
  c.push(h2("Forecasting"));
  c.push(body("Uses historical information to predict future requirements, clearly distinguishing predictions from actual values."));
  ["Demand — future order volumes", "Inventory — future stock requirements", "Transportation — future transport requirements", "Warehouse — future storage demand", "Revenue — logistics revenue forecast", "Capacity — future vehicle & warehouse requirements"].forEach(t => c.push(bullet(t)));

  c.push(h2("Optimization"));
  c.push(body("Introduced once sufficient operational data exists."));
  ["Route optimization — find efficient routes", "Vehicle assignment — match vehicles with shipments", "Load optimization — improve capacity utilization", "Warehouse optimization — improve storage allocation", "Delivery scheduling — improve sequence and timing", "Cost optimization — identify lower-cost alternatives"].forEach(t => c.push(bullet(t)));

  // 24. AUDIT, EXCEPTIONS, SUPPORT
  c.push(pageBreak());
  c.push(h1("Audit, Exception Management & Customer Support", "24."));

  c.push(h2("24.1  Audit & Compliance"));
  c.push(body("Important activities record: user, action, date/time, previous value, new value, transaction, and reason where required — creating accountability for order modification, price changes, invoice cancellation, inventory adjustment, delivery status change, payment modification, and permission changes."));

  c.push(h2("24.2  Exception Management"));
  c.push(body("A mature system handles problems, not only successful operations:"));
  ["Delayed shipment / failed delivery", "Damaged or lost goods", "Stock shortage", "Vehicle breakdown / driver unavailability", "Customs delay / incorrect address", "Customer rejection / supplier delay", "Invoice discrepancy"].forEach(t => c.push(bullet(t)));
  c.push(quoteLine("Issue  →  Owner  →  Action  →  Resolution  →  Closure"));

  c.push(h2("24.3  Customer Support"));
  c.push(body("Support cases originate from complaints, delivery problems, shipment delays, damaged goods, billing disputes, or missing documents. Each case contains: customer, related order/shipment, issue, priority, assigned employee, status, and resolution."));

  // 25. MASTER DATA & CORE DATA RELATIONSHIPS
  c.push(pageBreak());
  c.push(h1("Master Data & Core Data Relationships", "25."));
  c.push(body("Master data is controlled because every operational transaction depends on it."));
  const master = ["Customers","Suppliers","Products","Locations","Warehouses","Vehicles","Drivers","Routes",
    "Services","Pricing","Taxes","Payment terms","Units of measurement","Shipment modes","Statuses","Document types"];
  c.push(gridTable(master, 4, 2300));

  c.push(h2("Core Business Relationship"));
  c.push(flowChain(["Customer", "Quotes", "Contracts", "Orders", "Shipments", "Deliveries", "Invoices", "Payments"], 8)[0]);
  ["A customer may have many orders", "An order may contain multiple products", "An order may produce one or multiple shipments", "A shipment may result in one or multiple deliveries", "A completed service can generate an invoice", "An invoice can receive one or multiple payments"].forEach(t => c.push(bullet(t)));

  c.push(h2("Inventory Data Relationship"));
  c.push(flowChain(["Product", "Warehouse", "Location", "Stock", "Inventory Transaction"], 5)[0]);
  c.push(body("Every inventory transaction must explain why the quantity changed — for example:"));
  const invExample = [
    ["Purchase Receipt", "+100 units"],
    ["Customer Order Allocation", "−20 units"],
    ["Picking", "−20 units"],
    ["Shipment", "−20 units"],
    ["Resulting Available Inventory", "80 units"],
  ];
  c.push(simpleTable(["Transaction", "Effect"], invExample, [4600, 4600]));

  // 26. END-TO-END DATA FLOWS
  c.push(pageBreak());
  c.push(h1("End-to-End Data Flows", "26."));

  c.push(h2("26.1  Order-to-Delivery Flow"));
  c.push(flowChain(["Customer", "Quote Request", "Quotation", "Customer Accepts", "Order"], 5)[0]);
  c.push(body("The order splits into two paths that reconverge:"));
  bulletBranch(c, "Inventory Check", ["Stock available → proceeds directly to Inventory", "Stock unavailable → Procurement → Receiving → Inventory"]);
  c.push(flowChain(["Inventory", "Fulfillment", "Picking", "Packing", "Shipment", "Transport Planning", "Vehicle + Driver", "Dispatch", "In Transit", "Last-Mile Delivery", "Proof of Delivery", "Completed Service", "Invoice", "Payment", "Closed"], 5)[0]);
  c.push(flowChain(["Inventory", "Fulfillment", "Picking", "Packing", "Shipment", "Transport Planning", "Vehicle + Driver", "Dispatch", "In Transit", "Last-Mile Delivery", "Proof of Delivery", "Completed Service", "Invoice", "Payment", "Closed"], 5)[1]);
  c.push(flowChain(["Inventory", "Fulfillment", "Picking", "Packing", "Shipment", "Transport Planning", "Vehicle + Driver", "Dispatch", "In Transit", "Last-Mile Delivery", "Proof of Delivery", "Completed Service", "Invoice", "Payment", "Closed"], 5)[2]);

  c.push(h2("26.2  Procurement-to-Inventory Flow"));
  c.push(flowChain(["Department Requirement", "Purchase Request", "Approval", "Supplier Selection", "Purchase Order", "Supplier Shipment", "Warehouse Receiving", "Inspection"], 4)[0]);
  c.push(flowChain(["Department Requirement", "Purchase Request", "Approval", "Supplier Selection", "Purchase Order", "Supplier Shipment", "Warehouse Receiving", "Inspection"], 4)[1]);
  bulletBranch(c, "Inspection Outcome", ["Accepted → Put-Away → Inventory", "Rejected → Return to Supplier"]);

  c.push(h2("26.3  Warehouse-to-Customer Flow"));
  c.push(flowChain(["Customer Order", "Inventory Reservation", "Picking", "Packing", "Staging", "Shipment Created", "Dispatch", "Transport", "Last-Mile", "Customer", "Proof of Delivery"], 6)[0]);
  c.push(flowChain(["Customer Order", "Inventory Reservation", "Picking", "Packing", "Staging", "Shipment Created", "Dispatch", "Transport", "Last-Mile", "Customer", "Proof of Delivery"], 6)[1]);

  c.push(h2("26.4  International Freight Flow"));
  c.push(flowChain(["Customer", "Freight Request", "Quotation", "Booking", "Cargo Preparation", "Documentation"], 6)[0]);
  c.push(flowChain(["Container / Carrier", "Origin Transport", "Customs Export", "International Transport", "Destination", "Customs Clearance"], 6)[0]);
  c.push(flowChain(["Cargo Release", "Local Transport", "Final Delivery"], 6)[0]);

  c.push(h2("26.5  Returns Data Flow"));
  c.push(flowChain(["Customer", "Return Request", "Return Approval", "Pickup", "Warehouse Receiving", "Inspection"], 6)[0]);
  bulletBranch(c, "Inspection Resolution", ["Restock", "Repair", "Replace", "Refund", "Disposal"]);

  c.push(h2("26.6  Financial Data Flow"));
  c.push(flowChain(["Service", "Billable Event", "Charge Calculation", "Invoice", "Customer", "Payment", "Reconciliation", "Customer Balance", "Financial Reporting"], 5)[0]);
  c.push(flowChain(["Service", "Billable Event", "Charge Calculation", "Invoice", "Customer", "Payment", "Reconciliation", "Customer Balance", "Financial Reporting"], 5)[1]);
  c.push(body("Expenses flow separately:"));
  c.push(flowChain(["Operation", "Expense", "Approval", "Payment", "Cost Allocation", "Profitability"], 6)[0]);

  // 27. CENTRAL SYSTEM DATA FLOW
  c.push(pageBreak());
  c.push(h1("Central System Data Flow", "27."));
  c.push(body("The system operates around shared data rather than isolated modules — every domain feeds into a single operational and financial picture."));
  [
    "Customers", "Quotations", "Orders",
  ].forEach((t, i) => { c.push(quoteLine(t)); if (i < 2) c.push(arrowDown()); });
  c.push(arrowDown());
  bulletBranch(c, "Orders branch into", ["Procurement", "Inventory", "Fulfillment"]);
  c.push(arrowDown());
  c.push(quoteLine("Shipment"));
  c.push(arrowDown());
  bulletBranch(c, "Shipment branches into", ["Transportation", "Freight", "Tracking"]);
  c.push(arrowDown());
  ["Dispatch", "Delivery", "Proof of Delivery", "Billing", "Payment", "Analytics / KPI"].forEach((t) => { c.push(quoteLine(t)); c.push(arrowDown()); });

  // 28. BUSINESS STATUS MODEL
  c.push(pageBreak());
  c.push(h1("Business Status Model", "28."));
  c.push(body("Each major business object has a controlled status sequence, making reporting and workflow automation far easier."));
  const statuses = [
    ["Order", "Draft → Confirmed → Processing → Fulfilled → Closed"],
    ["Shipment", "Created → Prepared → Dispatched → In Transit → Delivered → Closed"],
    ["Delivery", "Scheduled → Assigned → Out for Delivery → Delivered"],
    ["Invoice", "Draft → Issued → Partially Paid → Paid / Overdue"],
    ["Purchase Order", "Draft → Approved → Sent → Partially Received → Fully Received → Closed"],
  ];
  c.push(simpleTable(["Object", "Status Sequence"], statuses, [2200, 7000]));

  // 29. SYSTEM INTEGRATIONS
  c.push(pageBreak());
  c.push(h1("System Integrations", "29."));
  const integrations = [
    ["Payment Providers", "Customer payments"],
    ["Mapping Services", "Locations, distance, routes, estimated travel time"],
    ["GPS / Telematics", "Vehicle location, driver location, trip tracking"],
    ["SMS / Email", "Notifications"],
    ["Accounting Systems", "Invoices, payments, expenses, financial records"],
    ["Customs / Government Systems", "Where APIs are available"],
    ["Carrier Systems", "Freight booking and shipment information"],
    ["E-commerce Platforms", "Online stores, marketplaces, order platforms"],
  ];
  c.push(simpleTable(["Integration", "Purpose"], integrations, [2600, 6600]));
  c.push(h2("API & External Data Flow"));
  c.push(flowChain(["External System", "Integration Layer", "Validation", "Business Rules", "Logistics System", "Transaction", "Status / Response", "External System"], 4)[0]);
  c.push(flowChain(["External System", "Integration Layer", "Validation", "Business Rules", "Logistics System", "Transaction", "Status / Response", "External System"], 4)[1]);
  c.push(body("External data should never directly modify critical operational records without validation."));

  // 30. BUSINESS RULES & DATA QUALITY
  c.push(pageBreak());
  c.push(h1("Business Rules & Data Quality Controls", "30."));
  c.push(h2("Business Rules"));
  ["Orders cannot be fulfilled without sufficient inventory unless backorders are permitted",
    "Vehicles cannot be assigned if unavailable; drivers cannot be assigned if not eligible",
    "Shipments cannot be dispatched without required information",
    "Deliveries cannot be marked completed without appropriate confirmation",
    "Cancelled orders cannot proceed to fulfillment",
    "Paid invoices cannot be arbitrarily modified",
    "Inventory adjustments and financial transactions require authorization",
    "Expired contracts trigger warnings; expired driver licenses prevent relevant assignments",
    "Vehicles under maintenance should not be dispatched"].forEach(t => c.push(bullet(t)));

  c.push(h2("Data Quality Controls"));
  const dq = [
    ["Validation", "Ensure information is valid"],
    ["Uniqueness", "Prevent duplicate customers, products, orders, shipments, invoices"],
    ["Referential Integrity", "Ensure transactions reference valid records"],
    ["Required Information", "Critical transactions cannot proceed with missing data"],
    ["Auditability", "Important changes are recorded"],
  ];
  c.push(simpleTable(["Control", "Purpose"], dq, [2600, 6600]));

  // 31. SECURITY & CONTINUITY
  c.push(pageBreak());
  c.push(h1("Security, Governance & Business Continuity", "31."));
  c.push(h2("Security & Governance"));
  const sec = [
    ["Authentication", "Verify users"],
    ["Authorization", "Control what users can access"],
    ["Data Isolation", "Customers and suppliers only access their own information"],
    ["Audit Trail", "Track sensitive changes"],
    ["Encryption", "Protect sensitive information"],
    ["Backup", "Maintain reliable recovery mechanisms"],
    ["Session Management", "Control active user sessions"],
    ["File Security", "Secure uploaded documents"],
  ];
  c.push(simpleTable(["Control", "Purpose"], sec, [2600, 6600]));

  c.push(h2("Business Continuity"));
  ["Database & file backups", "Disaster recovery & system monitoring", "Error logging & recovery procedures", "Data retention & operational continuity"].forEach(t => c.push(bullet(t)));
  c.push(body("A logistics system is operationally critical — prolonged downtime can directly affect deliveries and customers.", { italics: true, color: GRAY }));

  // 32. MODULE RELATIONSHIP / ARCHITECTURE
  c.push(pageBreak());
  c.push(h1("Layered System Architecture", "32."));
  c.push(body("The complete logistics platform operates as one connected ecosystem, structured in layers."));
  const layers = [
    ["Commercial Layer", "Customers → Quotations → Contracts → Pricing"],
    ["Order Layer", "Orders → Fulfillment"],
    ["Supply Layer", "Procurement → Suppliers → Inventory"],
    ["Warehouse Layer", "Receiving → Storage → Picking → Packing → Dispatch"],
    ["Transportation Layer", "Fleet → Drivers → Routes → Dispatch → Trips"],
    ["Freight Layer", "Freight → Containers → Customs → International Transport"],
    ["Delivery Layer", "Shipments → Last Mile → Delivery → Proof of Delivery → Returns"],
    ["Financial Layer", "Billing → Payments → Expenses → Profitability"],
    ["Intelligence Layer", "Analytics → KPIs → Forecasting → Optimization"],
    ["Governance Layer", "Security → Permissions → Audit → Compliance"],
  ];
  layers.forEach((l, i) => {
    c.push(layerBox(l[0], l[1]));
    if (i < layers.length - 1) c.push(arrowDown());
  });

  // 33. DESIGN PRINCIPLE
  c.push(pageBreak());
  c.push(h1("Most Important Design Principle", "33."));
  c.push(body("The system should be designed around business transactions and their lifecycle, rather than around individual screens. An order is not simply an \"Order page\" — it is a business object that connects:"));
  c.push(flowChain(["Customer", "Order", "Inventory", "Fulfillment", "Shipment", "Transportation", "Delivery", "Invoice", "Payment", "Analytics"], 5)[0]);
  c.push(body("Likewise, a shipment connects:"));
  c.push(flowChain(["Order", "Cargo", "Warehouse", "Transport", "Driver", "Vehicle", "Route", "Tracking", "Delivery", "Proof of Delivery"], 5)[0]);
  c.push(body("And inventory connects:"));
  c.push(flowChain(["Supplier", "Purchase Order", "Receiving", "Warehouse", "Stock", "Order", "Picking", "Shipment", "Customer"], 5)[0]);
  c.push(body("This interconnected approach is what turns the project from a collection of CRUD screens into a genuine Logistics Management System.", { bold: true, color: NAVY }));

  // 34. DEVELOPMENT PHASING
  c.push(pageBreak());
  c.push(h1("Recommended Development Phasing", "34."));
  c.push(body("Building the complete system simultaneously would be unnecessarily risky. A practical implementation sequence is:"));
  const phases = [
    ["Phase 1 — Foundation", "Accounts, organizations, customers, suppliers, products, locations, administration, audit"],
    ["Phase 2 — Commercial & Orders", "Quotations, contracts, pricing, orders"],
    ["Phase 3 — Warehouse & Inventory", "Warehouses, receiving, inventory, fulfillment, picking, packing, dispatch prep"],
    ["Phase 4 — Transportation", "Fleet, drivers, routes, transportation, dispatch, trips"],
    ["Phase 5 — Shipment & Delivery", "Shipments, tracking, delivery, proof of delivery, returns, notifications"],
    ["Phase 6 — International Logistics", "Freight, containers, customs, documentation"],
    ["Phase 7 — Finance", "Billing, payments, expenses, financial reporting"],
    ["Phase 8 — Intelligence", "Analytics, dashboards, forecasting, optimization"],
    ["Phase 9 — External Ecosystem", "Customer portal, supplier portal, APIs, GPS, maps, payment gateways, accounting & e-commerce integration"],
  ];
  c.push(simpleTable(["Phase", "Deliverables"], phases, [2800, 6400]));

  // 35. FINAL SCOPE
  c.push(pageBreak());
  c.push(h1("Final Scope", "35."));
  c.push(body("The complete logistics system ultimately covers:"));
  const scopeItems = ["Customers","Commercial","Orders","Procurement","Inventory","Warehouses","Fulfillment",
    "Transportation","Fleet","Drivers","Routes","Dispatch","Shipments","Freight","Customs","Containers",
    "Tracking","Delivery","Returns","Billing","Payments","Expenses","Documents","Notifications","Analytics",
    "Forecasting","Optimization","Audit & Compliance","Administration"];
  c.push(gridTable(scopeItems, 3, 3000));

  c.push(sectionDivider());
  c.push(h2("Guiding Principle"));
  c.push(body("All of these components must exchange information through clearly defined business relationships and transaction lifecycles. That is the foundation for building the Django system correctly: first define what the business does, what information is created, where that information moves, who is responsible for it, what decisions change its state, and what downstream processes depend on it. Only after that should the technical implementation and database design be created.", { bold: true, color: NAVY }));

  return c;
}

function bulletBranch(c, label, items) {
  c.push(new Paragraph({
    numbering: { reference: "main-bullets", level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text: label, bold: true, color: NAVY_DARK, font: FONT, size: 21 })],
  }));
  items.forEach(t => c.push(bullet(t, 1)));
}

// ---------- COVER PAGE ----------
const cover = [
  new Paragraph({ spacing: { before: 2200 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "CUSTOMER  →  ORDER  →  WAREHOUSE  →  TRANSPORT  →  DELIVERY  →  BILLING", color: TEAL, bold: true, font: FONT, size: 16 })],
  }),
  new Paragraph({ spacing: { before: 260 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "LOGISTICS MANAGEMENT SYSTEM", color: NAVY, bold: true, font: HEAD_FONT, size: 54 })] }),
  new Paragraph({ spacing: { before: 120 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Complete Business, Functional & Data Flow Specification", color: TEXT, font: FONT, size: 27 })] }),
  new Paragraph({ spacing: { before: 500 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "An End-to-End Logistics & Supply Chain Platform  |  Django Implementation", color: ORANGE, bold: true, font: FONT, size: 21 })] }),
  new Paragraph({
    spacing: { before: 900 }, alignment: AlignmentType.CENTER,
    border: { top: { color: TEAL, space: 14, style: BorderStyle.SINGLE, size: 10 } },
    children: [],
  }),
  new Paragraph({ spacing: { before: 260 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Prepared for:  Logistics & Supply Chain Company", color: GRAY, font: FONT, size: 20 })] }),
  new Paragraph({ spacing: { before: 80 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Document Type:  Functional & System Specification", color: GRAY, font: FONT, size: 20 })] }),
  new Paragraph({ spacing: { before: 80 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "August 2026", color: GRAY, font: FONT, size: 20 })] }),
];

const tocPage = [
  h1("Table of Contents"),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
];

// ================= BUILD DOC =================
const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 21, color: TEXT } } } },
  numbering: {
    config: [
      {
        reference: "main-bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "●", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 260 } }, run: { color: TEAL } } },
          { level: 1, format: LevelFormat.BULLET, text: "○", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 820, hanging: 260 } }, run: { color: ORANGE } } },
        ],
      },
    ],
  },
  sections: [
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children: cover },
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Logistics Management System — Specification", color: GRAY, size: 16, font: FONT })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], color: GRAY, size: 16, font: FONT })] })] }) },
      children: tocPage,
    },
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Logistics Management System — Specification", color: GRAY, size: 16, font: FONT })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], color: GRAY, size: 16, font: FONT })] })] }) },
      children: buildMainContent(),
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  require("fs").writeFileSync("/home/claude/lms_docx/Logistics_Management_System_Specification.docx", buf);
  console.log("done");
});