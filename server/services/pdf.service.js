const puppeteer = require('puppeteer');
const puppeteerCore = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const path = require('path');
const fs = require('fs');
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArray) return;
    let str = '';
    str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
    str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
    str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
    str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
    str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
    return str.trim();
  };
  const strNum = num.toString().split('.');
  let rupees = inWords(parseInt(strNum[0]));
  let paise = '';
  if (strNum[1] && parseInt(strNum[1]) > 0) {
    const decimalPart = strNum[1].padEnd(2, '0').substring(0, 2);
    paise = ' and ' + inWords(parseInt(decimalPart)) + ' Paise';
  }
  return rupees + ' Rupees' + paise + ' Only';
}

function buildInvoiceHTML(invoice) {
  const logoPath = path.join(__dirname, '../../client/public/atlas_logo.png');
  let logoBase64 = '';
  if (fs.existsSync(logoPath)) {
    const imgBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
  }

  const statusColors = {
    PAID: { bg: '#dcfce7', color: '#166534' },
    PENDING: { bg: '#fef9c3', color: '#854d0e' },
    OVERDUE: { bg: '#fee2e2', color: '#991b1b' },
  };
  const sc = statusColors[invoice.paymentStatus] || statusColors.PENDING;

  let planPrice = invoice.amount || 0;
  let discountVal = 0;
  if (invoice.discount > 0) {
    if (invoice.discountType === 'PERCENTAGE') {
      planPrice = invoice.amount / (1 - (invoice.discount / 100));
      discountVal = planPrice * (invoice.discount / 100);
    } else {
      discountVal = invoice.discount;
      planPrice = invoice.amount + invoice.discount;
    }
  }

  const discountRow = invoice.discount > 0 ? `
        <tr>
            <td style="padding:6px 0;color:#16a34a;">
                Discount ${invoice.discountType === 'PERCENTAGE' ? `(${invoice.discount}%)` : '(Fixed)'}
            </td>
            <td style="padding:6px 0;color:#16a34a;text-align:right;font-weight:600;">
                − ${formatCurrency(discountVal)}
            </td>
        </tr>` : '';

  const gstRow = invoice.gstAmount > 0 ? `
        <tr>
            <td style="padding:6px 0;color:#555;">GST (18%)</td>
            <td style="padding:6px 0;color:#222;text-align:right;font-weight:600;">${formatCurrency(invoice.gstAmount)}</td>
        </tr>` : '';

  const lateFeeRow = invoice.lateFee > 0 ? `
        <tr>
            <td style="padding:6px 0;color:#dc2626;">Late Fee</td>
            <td style="padding:6px 0;color:#dc2626;text-align:right;font-weight:600;">${formatCurrency(invoice.lateFee)}</td>
        </tr>` : '';

  const paidRow = invoice.paymentStatus === 'PAID' ? `
        <tr>
            <td style="padding:4px 0;color:#16a34a;font-weight:700;">✔ Amount Paid</td>
            <td style="padding:4px 0;color:#16a34a;text-align:right;font-weight:700;">${formatCurrency(invoice.totalAmount)}</td>
        </tr>` : '';

  const txnRow = invoice.razorpayPaymentId ? `
        <p style="margin:4px 0 0;font-size:10px;color:#888;">
            Transaction ID: <span style="font-family:monospace;">${invoice.razorpayPaymentId}</span>
        </p>` : '';

  const rules = [
    { n: '1', label: 'General', text: 'Members must follow all gym policies, maintain discipline, and use equipment responsibly at all times. Entry is allowed only with a valid membership. Proper gym attire and shoes are mandatory.' },
    { n: '2', label: 'Equipment', text: 'All members are required to re-rack weights, dumbbells, and plates after use and avoid dropping equipment. Machines must be used correctly, and any damage must be reported immediately. Sharing equipment during peak hours is expected.' },
    { n: '3', label: 'Hygiene', text: 'Maintain strict hygiene. Carry a personal towel, wipe machines after use, and keep the gym clean. Dispose of waste properly and avoid leaving sweat on benches or machines.' },
    { n: '4', label: 'Safety', text: 'Always warm up and cool down. Use proper techniques and seek trainer guidance when needed. Avoid lifting beyond your capacity without assistance. The gym is not responsible for injuries caused by negligence.' },
    { n: '5', label: 'Conduct', text: 'Respect all members and staff. No fighting, arguments, abusive language, or misconduct will be tolerated. Any violation may result in immediate termination of membership without refund.' },
    { n: '6', label: 'Belongings & Fees', text: 'Personal belongings must be stored in lockers. Management is not responsible for any loss or damage. Lockers must be cleared after each session. Membership fees are non-refundable and non-transferable. No extensions or pauses unless approved by management.' },
  ];

  const rulesHTML = rules.map(r => `
        <div style="display:flex;gap:8px;align-items:flex-start;">
            <div style="min-width:20px;height:20px;background:#c0001a;color:#fff;border-radius:50%;
                        font-size:9px;font-weight:800;display:flex;align-items:center;
                        justify-content:center;flex-shrink:0;margin-top:1px;">${r.n}</div>
            <div style="font-size:10.5px;color:#444;line-height:1.55;">
                <span style="font-weight:800;color:#111;">${r.label}: </span>${r.text}
            </div>
        </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a1a; }
  .page { width: 794px; min-height: 1123px; background: #fff; position: relative; }
  .red-bar-top    { height: 7px; background: linear-gradient(90deg,#c0001a,#e8002a); }
  .red-bar-bottom { height: 5px; background: linear-gradient(90deg,#c0001a,#e8002a); }
  .content { padding: 36px 44px; }
  table { border-collapse: collapse; }

  /* ── TERMS PAGE ── */
  .page2 { page-break-before: always; }
</style>
</head>
<body>

<!-- ══ PAGE 1: INVOICE ══ -->
<div class="page">
  <div class="red-bar-top"></div>
  <div class="content">

    <!-- HEADER -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
      <!-- Left: Brand -->
      <div>
        ${logoBase64 ? `<img src="${logoBase64}" style="width:90px;height:auto;object-fit:contain;display:block;margin-bottom:8px;" />` : ''}
        <div style="font-size:24px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">
          <span style="color:#111;">ATLAS</span><span style="color:#c0001a;margin-left:5px;">FITNESS</span>
        </div>
        <div style="font-size:10px;color:#777;margin-top:6px;line-height:1.7;">
          <div>3-4-98/4/204, New Narsina Nagar, Mallapur,</div>
          <div>Hyderabad, Telangana – 500076</div>
          <div>📞 +91 99882 29441 &nbsp;|&nbsp; +91 83175 29757</div>
          <div>✉ atlasfitnesselite@gmail.com</div>
          <div style="font-weight:700;color:#444;margin-top:4px;">GSTIN: 36BNEPV0615C1ZA &nbsp;|&nbsp; HSN: 9506</div>
        </div>
      </div>
      <!-- Right: Invoice label -->
      <div style="text-align:right;">
        <div style="font-size:34px;font-weight:900;color:#c0001a;letter-spacing:2px;">INVOICE</div>
        <div style="font-size:13px;color:#555;font-weight:600;margin-top:4px;"># ${invoice.invoiceNumber}</div>
        <table style="margin-left:auto;margin-top:14px;font-size:11px;">
          <tr>
            <td style="padding:3px 12px 3px 0;color:#888;">Invoice Date</td>
            <td style="font-weight:700;color:#222;">${formatDate(invoice.createdAt)}</td>
          </tr>
          <tr>
            <td style="padding:3px 12px 3px 0;color:#888;">Valid Upto</td>
            <td style="font-weight:700;color:#222;">${formatDate(invoice.dueDate)}</td>
          </tr>
          <tr>
            <td style="padding:3px 12px 3px 0;color:#888;">Status</td>
            <td>
              <span style="background:${sc.bg};color:${sc.color};padding:2px 10px;border-radius:20px;
                           font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;">
                ${invoice.paymentStatus}
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- DIVIDER -->
    <div style="border-top:2px solid #f0f0f0;margin-bottom:16px;"></div>

    <!-- BILL TO -->
    <div style="margin-bottom:16px;">
      <div style="font-size:9px;font-weight:800;color:#c0001a;letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;">BILL TO</div>
      <div style="background:#fafafa;border:1px solid #f0f0f0;border-left:4px solid #c0001a;border-radius:6px;padding:12px 16px;">
        <div style="font-size:17px;font-weight:800;color:#111;margin-bottom:5px;">${(invoice.member && invoice.member.name) ? invoice.member.name : 'Unknown Member'}</div>
        <div style="display:flex;gap:24px;flex-wrap:wrap;font-size:11px;color:#555;">
          <span><b style="color:#333;">Member ID:</b> ${(invoice.member && (invoice.member.memberId || invoice.memberId)) || '—'}</span>
          ${(invoice.member && invoice.member.phone) ? `<span><b style="color:#333;">Phone:</b> ${invoice.member.phone}</span>` : ''}
          ${(invoice.member && invoice.member.email) ? `<span><b style="color:#333;">Email:</b> ${invoice.member.email}</span>` : ''}
        </div>
        ${(invoice.memberGstNumber || invoice.memberPanNumber) ? `
        <div style="display:flex;gap:24px;flex-wrap:wrap;font-size:11px;color:#555;margin-top:6px;">
          ${invoice.memberGstNumber ? `<span><b style="color:#333;">GSTIN:</b> ${invoice.memberGstNumber}</span>` : ''}
          ${invoice.memberPanNumber ? `<span><b style="color:#333;">PAN:</b> ${invoice.memberPanNumber}</span>` : ''}
        </div>` : ''}
        ${invoice.memberAddress ? `<div style="font-size:11px;color:#555;margin-top:6px;"><b style="color:#333;">Address:</b> ${invoice.memberAddress}</div>` : ''}
      </div>
    </div>

    <!-- LINE ITEMS TABLE -->
    <table style="width:100%;margin-bottom:12px;font-size:12px;">
      <thead>
        <tr style="background:#1a1a1a;color:#fff;">
          <th style="text-align:left;padding:10px 14px;font-weight:700;letter-spacing:0.4px;border-radius:4px 0 0 4px;">Description</th>
          <th style="text-align:center;padding:10px 14px;font-weight:700;width:110px;">Duration</th>
          <th style="text-align:right;padding:10px 14px;font-weight:700;width:130px;border-radius:0 4px 4px 0;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#fff;border-bottom:1px solid #f0f0f0;">
          <td style="padding:13px 14px;">
            <div style="font-weight:700;color:#111;margin-bottom:3px;">
              Gym Membership — ${invoice.plan?.name || 'Standard Plan'}
            </div>
            <div style="font-size:10px;color:#888;">
              Period: ${formatDate(invoice.createdAt)} → ${formatDate(invoice.dueDate)}
            </div>
          </td>
          <td style="padding:13px 14px;text-align:center;color:#555;">
            ${invoice.plan?.duration || 1} Month${(invoice.plan?.duration || 1) > 1 ? 's' : ''}
          </td>
          <td style="padding:13px 14px;text-align:right;font-weight:700;color:#111;">
            ${formatCurrency(invoice.amount)}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- TOTALS -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;gap:20px;">
      <!-- AMOUNT IN WORDS BOX -->
      <div style="width:360px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #334155;border-radius:6px;padding:12px 16px;margin-bottom:10px;">
          <div style="font-size:9px;font-weight:800;color:#64748b;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">TOTAL AMOUNT (IN WORDS)</div>
          <div style="font-size:13px;font-weight:700;color:#1e293b;text-transform:capitalize;">
              ${numberToWords(Math.round(invoice.totalAmount))}
          </div>
      </div>

      <div style="width:280px;background:#fafafa;border:1px solid #ebebeb;border-radius:8px;padding:14px 18px;font-size:12px;">
        <table style="width:100%;">
          <tr>
            <td style="padding:6px 0;color:#555;">Plan Price</td>
            <td style="padding:6px 0;color:#222;text-align:right;font-weight:600;">${formatCurrency(planPrice)}</td>
          </tr>
          ${discountRow}
          <tr><td colspan="2"><div style="border-top:1px dashed #ddd;margin:4px 0;"></div></td></tr>
          <tr>
            <td style="padding:6px 0;color:#555;font-weight:600;">Taxable Value</td>
            <td style="padding:6px 0;color:#222;text-align:right;font-weight:600;">${formatCurrency(invoice.amount)}</td>
          </tr>
          ${gstRow}
          ${lateFeeRow}
          <tr><td colspan="2"><div style="border-top:2px solid #1a1a1a;margin:6px 0 4px;"></div></td></tr>
          <tr>
            <td style="padding:4px 0;font-size:15px;font-weight:800;color:#111;">Total Payable</td>
            <td style="padding:4px 0;font-size:15px;font-weight:800;color:#c0001a;text-align:right;">${formatCurrency(invoice.totalAmount)}</td>
          </tr>
          ${paidRow}
        </table>
      </div>
    </div>

    <!-- MEMBERSHIP TERMS -->
    <div style="border-top:2.5px solid #1a1a1a;padding-top:16px;margin-bottom:20px;">
      <div style="text-align:center;margin-bottom:10px;">
        <div style="font-size:14px;font-weight:900;letter-spacing:3px;color:#111;text-transform:uppercase;">ATLAS FITNESS</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#c0001a;text-transform:uppercase;margin-top:3px;">Membership Terms &amp; Gym Rules</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 26px;">
        ${rulesHTML}
      </div>
    </div>

    <!-- FOOTER -->
    <div style="border-top:1px solid #eee;padding-top:18px;display:flex;justify-content:space-between;align-items:flex-end;">
      <div style="font-size:11px;color:#555;max-width:300px;">
        <div style="font-weight:700;color:#333;margin-bottom:4px;">Note:</div>
        <div>Thank you for choosing <b>Atlas Fitness</b>! Stay strong and keep pushing! 💪</div>
        ${txnRow}
      </div>
      <div style="text-align:center;">
        <div style="height:50px;width:130px;border-bottom:1.5px solid #555;margin-bottom:6px;"></div>
        <div style="font-size:9px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1.5px;">Authorized Signatory</div>
      </div>
    </div>

  </div><!-- /content -->
  <div class="red-bar-bottom"></div>
</div>

</body>
</html>`;
}

async function generateInvoicePDF(invoice) {
  const html = buildInvoiceHTML(invoice);

  let browser;

  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  } else {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  try {
    const page = await browser.newPage();

    // Set viewport to A4 width (794px at 96dpi)
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Measure full content height so everything fits on one page
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);

    const pdfBuffer = await page.pdf({
      width: '794px',
      height: `${bodyHeight + 2}px`,   // +2px to avoid any rounding cut-off
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generateInvoicePDF, buildInvoiceHTML };
