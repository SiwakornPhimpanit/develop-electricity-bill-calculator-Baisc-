const form = document.querySelector("#billForm");
const resetButton = document.querySelector("#resetButton");
const unitsInput = document.querySelector("#units");
const ftRateInput = document.querySelector("#ftRate");
const serviceFeeInput = document.querySelector("#serviceFee");
const vatRateInput = document.querySelector("#vatRate");

const totalAmount = document.querySelector("#totalAmount");
const baseAmount = document.querySelector("#baseAmount");
const ftAmount = document.querySelector("#ftAmount");
const serviceAmount = document.querySelector("#serviceAmount");
const vatAmount = document.querySelector("#vatAmount");
const usedUnits = document.querySelector("#usedUnits");
const breakdownBody = document.querySelector("#breakdownBody");

const tiers = [
  { from: 1, to: 15, limit: 15, rate: 2.3488 },
  { from: 16, to: 25, limit: 10, rate: 2.9882 },
  { from: 26, to: 35, limit: 10, rate: 3.2405 },
  { from: 36, to: 100, limit: 65, rate: 3.6237 },
  { from: 101, to: 150, limit: 50, rate: 3.7171 },
  { from: 151, to: 400, limit: 250, rate: 4.2218 },
  { from: 401, to: null, limit: Infinity, rate: 4.4217 }
];

const money = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function calculateBaseCharge(units) {
  let remaining = units;
  const rows = [];

  for (const tier of tiers) {
    if (remaining <= 0) break;

    const unitsInTier = Math.min(remaining, tier.limit);
    const amount = unitsInTier * tier.rate;

    rows.push({
      range: tier.to ? `${tier.from} - ${tier.to}` : `${tier.from} ขึ้นไป`,
      units: unitsInTier,
      rate: tier.rate,
      amount
    });

    remaining -= unitsInTier;
  }

  return {
    rows,
    total: rows.reduce((sum, row) => sum + row.amount, 0)
  };
}

function renderBreakdown(rows) {
  if (rows.length === 0) {
    breakdownBody.innerHTML = '<tr><td colspan="4" class="empty">ยังไม่มีหน่วยที่นำมาคำนวณ</td></tr>';
    return;
  }

  breakdownBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.range}</td>
          <td>${money.format(row.units)} kWh</td>
          <td>${money.format(row.rate)} บาท</td>
          <td>${money.format(row.amount)} บาท</td>
        </tr>
      `
    )
    .join("");
}

function updateBill(event) {
  event?.preventDefault();

  const units = Math.max(Number(unitsInput.value) || 0, 0);
  const ftRate = Number(ftRateInput.value) || 0;
  const serviceFee = Math.max(Number(serviceFeeInput.value) || 0, 0);
  const vatRate = Math.max(Number(vatRateInput.value) || 0, 0);

  const base = calculateBaseCharge(units);
  const ft = units * ftRate;
  const beforeVat = base.total + ft + serviceFee;
  const vat = beforeVat * (vatRate / 100);
  const total = beforeVat + vat;

  baseAmount.textContent = money.format(base.total);
  ftAmount.textContent = money.format(ft);
  serviceAmount.textContent = money.format(serviceFee);
  vatAmount.textContent = money.format(vat);
  totalAmount.textContent = `${money.format(total)} บาท`;
  usedUnits.textContent = `${money.format(units)} kWh`;

  renderBreakdown(base.rows);
}

function resetForm() {
  form.reset();
  totalAmount.textContent = "0.00 บาท";
  baseAmount.textContent = "0.00";
  ftAmount.textContent = "0.00";
  serviceAmount.textContent = "0.00";
  vatAmount.textContent = "0.00";
  usedUnits.textContent = "0 kWh";
  breakdownBody.innerHTML = '<tr><td colspan="4" class="empty">กรอกจำนวนหน่วยแล้วกดคำนวณ</td></tr>';
  unitsInput.focus();
}

form.addEventListener("submit", updateBill);
resetButton.addEventListener("click", resetForm);

[unitsInput, ftRateInput, serviceFeeInput, vatRateInput].forEach((input) => {
  input.addEventListener("input", updateBill);
});
