// src/utils/html-template.ts

function esc(input: any) {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildHtml(data: any, invoices: any[], logoFileUrl: string | null) {
  // Pre-build the invoice rows (reused for both pages)
  const invoiceRows = invoices.map((inv, i) => `
    <tr>
      <td class="col-sno">${esc(inv.sno ?? i+1)}</td>
      <td class="col-inv">${esc(inv.invoiceNo)}</td>
      <td class="col-date">${esc(inv.invoiceDate)}</td>
      <td class="col-val">${esc(inv.invoiceValueRs)}</td>
      <td class="col-cases">${esc(inv.noOfCases)}</td>
      <td class="col-weight">${esc(inv.actualWeightT)}</td>
    </tr>
  `).join("");

  const logoImg = `<img src="${logoFileUrl}" width="140" />`;
  // const logoImg = logoFileUrl ? `<img class="logo" src="${logoFileUrl}" />` : "";

  // Helper function to render a single page with a specific label
  const renderPage = (copyLabel: string) => `
  <div class="page">
    ${logoImg}

    <!-- Dynamic Copy Label (HO Copy / Driver Copy) -->
    <div class="copy-label">${copyLabel}</div>

    <div class="header-title">CONSIGNMENT NOTE</div>
    <div class="header-sub">
        (Head Office Address Line Here)
    </div>

    <!-- TOP GRID -->
    <div class="top-grid">
      <div class="top-row">
        <div class="tcell"><div class="lbl">CNote No</div><div class="val">${esc(data.cnoteNo)}</div></div>
        <div class="tcell"><div class="lbl">Bkg. Date</div><div class="val">${esc(data.bookingDate)}</div></div>
        <div class="tcell"><div class="lbl">CNote Entry Dt</div><div class="val">${esc(data.cnoteEntryDate)}</div></div>
        <div class="tcell"><div class="lbl">ESD</div><div class="val">${esc(data.esdDate)}</div></div>
      </div>
      <div class="top-row">
        <div class="tcell"><div class="lbl">Billing Party</div><div class="val">${esc(data.billingParty)}</div></div>
        <div class="tcell"><div class="lbl">Entered By</div><div class="val">${esc(data.enteredBy)}</div></div>
        <div class="tcell"><div class="lbl">From</div><div class="val">${esc(data.fromLocation)}</div></div>
        <div class="tcell"><div class="lbl">To</div><div class="val">${esc(data.toLocation)}</div></div>
      </div>
    </div>

    <!-- CONSIGNOR/CONSIGNEE -->
    <div class="party-box">
      <div class="party-left">
        <div class="party-title">CONSIGNOR</div>
        ${esc(data.consignor.name)}<br/>
        ${esc(data.consignor.addressLine1)}<br/>
        ${esc(data.consignor.addressLine2)}
      </div>
      <div class="party-right">
        <div class="party-title">CONSIGNEE</div>
        ${esc(data.consignee.name)}<br/>
        ${esc(data.consignee.addressLine1)}<br/>
        ${esc(data.consignee.addressLine2)}
      </div>
    </div>

    <!-- INVOICE -->
    <div class="inv-title">INVOICE DETAILS</div>
    <table class="invoice">
      <thead>
        <tr>
          <th>S.No</th><th>Invoice No</th><th>Invoice Dt</th><th>Invoice Value</th><th>No. of Cases</th><th>Actual WT (T)</th>
        </tr>
      </thead>
      <tbody>${invoiceRows}</tbody>
    </table>

    <!-- PERMIT GRID -->
    <div class="permit-grid">
      <div class="pcell">Total Charged Weight:<br><b>${esc(data.totalChargedWeight)}</b></div>
      <div class="pcell">Import Permit No:<br>${esc(data.importPermitNo)}</div>
      <div class="pcell">Export Permit No:<br>${esc(data.exportPermitNo)}</div>
      <div class="pcell">E-Way Bill No:<br>${esc(data.ewayBillNo)}</div>
      <div class="pcell">Add Tax Invoice No:<br>${esc(data.addlTaxInvoiceNo)}</div>
      <div class="pcell">Manual LR No:<br>${esc(data.manualLrNo)}</div>
    </div>

    <!-- INSURANCE -->
    <div class="insurance">
      Insurance: Customer has stated that:- &nbsp;&nbsp; 
      <input type="checkbox" ${data.isInsured ? "" : "checked"}> He has not insured the consignment &nbsp;&nbsp;
      <input type="checkbox" ${data.isInsured ? "checked" : ""}> He has insured the consignment
    </div>

    <!-- CONSIGNMENT DETAILS -->
    <div class="cd-box">
      <div class="cd-title">CONSIGNMENT DETAILS</div>

      <!-- ROW 1 -->
      <div class="cd-row4">
        <div class="cd-label">Risk Type</div><div class="cd-value">${esc(data.riskType)}</div>
        <div class="cd-label">Linfox Vendor Code</div><div class="cd-value">${esc(data.linfoxVendorCode)}</div>
        <div class="cd-label">Packaging Type</div><div class="cd-value">${esc(data.packagingType)}</div>
        <div class="cd-label">Said To Contain</div><div class="cd-value">${esc(data.saidToContain)}</div>
      </div>

      <!-- ROW 2 -->
      <div class="cd-row1">
        <div class="cd-label">Owner</div><div class="cd-value">${esc(data.owner)}</div>
      </div>

      <!-- ROW 3 -->
      <div class="cd-row4">
        <div class="cd-label">Type Of CNote</div><div class="cd-value">${esc(data.typeOfCnote)}</div>
        <div class="cd-label">VHC No</div><div class="cd-value">${esc(data.vhcNo)}</div>
        <div class="cd-label">Vehicle No</div><div class="cd-value">${esc(data.vehicleNo)}</div>
        <div class="cd-label">Vehicle Type</div><div class="cd-value">${esc(data.vehicleType)}</div>
      </div>

      <!-- ROW 4 -->
      <div class="cd-row4">
        <div class="cd-label">Forward</div><div class="cd-value">${esc(data.forward)}</div>
        <div class="cd-label">Shipment No</div><div class="cd-value">${esc(data.shipmentNo)}</div>
        <div class="cd-label">Special Inst</div><div class="cd-value">${esc(data.specialInstructions)}</div>
        <div class="cd-label">Remarks</div><div class="cd-value">${esc(data.remarks)}</div>
      </div>
    </div>

    <!-- SIGNATURE & POD -->
    <div class="sign-block">
      <div class="sign-box">
        <b>Consignor's Signature</b><br><br>
        Stamp ___________<br> Date _________
      </div>
      <div class="sign-box">
        <b>Proof of Delivery</b><br>
        Consignment Acknowledged by Consignee:<br>
        Received the Shipment as Per Consignment Note<br><br>
        Received By: _____________________
      </div>
    </div>

    <!-- FOOTER -->
    <div class="caution">
      CAUTION: This consignment will not be detained, diverted, re-routed or re-booked without Consignee Bank's written
      permission. Will be delivered at the destination.
    </div>
  </div>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Consignment Note</title>

<style>
/*** PAGE SETUP ***/
@page { size: A4; margin: 10mm 12mm; }
html,body { margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; color:#000; }

/* The page container handles breaks */
.page { 
  width: 100%; 
  position: relative; 
  page-break-after: always; /* Forces a new page after this div */
}
.page:last-child {
  page-break-after: avoid; /* No blank page after the last one */
}

/*** LOGO & HEADER ***/
.logo {
  position: absolute;
  top: 8mm;
  left: 10mm;
  width: 45mm;
}

/* TOP RIGHT COPY LABEL (HO Copy / Driver Copy) */
.copy-label {
  position: absolute;
  top: 0mm;
  right: 0mm;
  font-size: 10px;
  font-weight: 400;
}

.header-title {
  text-align:center;
  font-size: 15px;
  font-weight: 700;
  margin-top: 3mm;
}
.header-sub {
  text-align:center;
  font-size: 10px;
  margin-bottom: 5mm;
}

/*** TOP GRID ***/
.top-grid {
  border:1px solid #000;
  margin-bottom:5mm;
  font-size:10px;
}
.top-row {
  display:flex;
  border-bottom:1px solid #000;
}
.top-row:last-child { border-bottom:none; }
.tcell {
  border-right:1px solid #000;
  padding:3px 5px;
  width:25%;
}
.tcell:last-child { border-right:none; }
.lbl { font-size:9px; color:#333; }
.val { font-weight:600; margin-top:3px; }

/*** CONSIGNOR / CONSIGNEE ***/
.party-box {
  border:1px solid #000;
  margin-bottom:5mm;
  display:flex;
}
.party-left {
  width:55%;
  border-right:1px solid #000;
  padding:5px 8px;
  font-size:10px;
}
.party-right {
  width:45%;
  padding:5px 8px;
  font-size:10px;
}
.party-title {
  font-weight:700;
  font-size:11px;
  margin-bottom:3px;
}

/*** INVOICE TABLE ***/
.inv-title { font-weight:700; margin-bottom:4px; font-size:11px; }
table.invoice {
  border-collapse: collapse;
  width:100%;
  font-size:10px;
}
table.invoice th, table.invoice td {
  border:1px solid #000;
  padding:5px;
}
table.invoice th {
  text-align:center;
  font-weight:700;
}
.col-sno { width:6%; text-align:center; }
.col-inv { width:28%; }
.col-date { width:16%; text-align:center; }
.col-val { width:18%; text-align:right; }
.col-cases { width:10%; text-align:center; }
.col-weight { width:12%; text-align:right; }

/*** PERMIT + TOTAL GRID ***/
.permit-grid {
  display:flex;
  gap:4px;
  margin-top:5mm;
}
.pcell {
  border:1px solid #000;
  padding:5px;
  font-size:9px;
  width:20%;
}

/*** INSURANCE BLOCK ***/
.insurance {
  border:1px solid #000;
  padding:3px 8px;
  margin-top:3mm;
  font-size:9px;
}

/*** CONSIGNMENT DETAILS (PIXEL PERFECT) ***/
.cd-box {
  border:1px solid #000;
  margin-top:5mm;
  font-size:10px;
}
.cd-title {
  text-align:center;
  font-weight:700;
  border-bottom:1px solid #000;
  padding:4px 0;
  font-size:11px;
}

.cd-row4 {
  display:grid;
  grid-template-columns: 14% 12% 18% 12% 16% 10% 14% 14%;
  border-bottom:1px solid #000;
  min-height:7mm;
}
.cd-row1 {
  display:grid;
  grid-template-columns: 14% 86%;
  border-bottom:1px solid #000;
  min-height:7mm;
}

.cd-label {
  padding:4px 3px;
  font-weight:600;
  border-right:1px solid #000;
}
.cd-value {
  padding:4px 3px;
  border-right:1px solid #000;
  border-bottom:0.7px dotted #444;
}
.cd-row4 div:last-child,
.cd-row1 div:last-child {
  border-right:none;
}

/*** SIGNATURE & POD ***/
.sign-block {
  display:flex;
  margin-top:6mm;
  border:1px solid #000; 
  border-right:none; /* Box specific borders used below */
}
.sign-box {
  border-right:1px solid #000;
  flex:1;
  min-height:28mm;
  padding:5px;
  font-size:10px;
}

/*** FOOTER CAUTION ***/
.caution {
  margin-top:5mm;
  border-top:1px solid #000;
  padding-top:4px;
  font-size:9px;
}
</style>
</head>

<body>
  ${renderPage("HO Copy")}
  ${renderPage("Driver Copy")}
</body>
</html>
`;
}