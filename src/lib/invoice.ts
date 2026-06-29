'use client';

import jsPDF from 'jspdf';

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

interface InvoiceData {
  orderNumber: number;
  restaurantName: string;
  restaurantSlug: string;
  date: Date;
  items: InvoiceItem[];
  total: number;
  customerName?: string;
  tableName?: string;
  carNumber?: string;
}

/**
 * Generate and download a PDF invoice for an order.
 */
export function downloadInvoice(data: InvoiceData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Colors (Dokan warm/receipt theme)
  // RGB triplets — jsPDF takes literal channel values, not hex/CSS vars.
  const ink    = [43, 33, 24];     // #2B2118 — warm ink (headings, totals)
  const muted  = [107, 93, 79];    // #6B5D4F — warm gray (secondary text)
  const spice  = [194, 84, 12];    // #C2540C — primary brand color
  const paper  = [251, 246, 238];  // #FBF6EE — warm paper background
  const hairline = [226, 216, 200]; // #E2D8C8 — subtle divider lines

  // ── Background ──
  // A light, warm paper background — print-friendly (unlike a full dark
  // fill, which burns through ink/toner) and consistent with the
  // receipt-paper identity used throughout the rest of the app.
  doc.setFillColor(paper[0], paper[1], paper[2]);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F');

  // ── Header ──
  doc.setTextColor(spice[0], spice[1], spice[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Dokan', pageW / 2, 30, { align: 'center' });

  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.restaurantName, pageW / 2, 42, { align: 'center' });

  // ── Divider ──
  doc.setDrawColor(hairline[0], hairline[1], hairline[2]);
  doc.line(20, 50, pageW - 20, 50);

  // ── Invoice Info ──
  doc.setFontSize(10);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.setFont('helvetica', 'bold');
  const labels = [
    [`رقم الفاتورة: #${String(data.orderNumber).padStart(5, '0')}`, `التاريخ: ${data.date.toLocaleDateString('ar-BH')}`],
  ];
  if (data.tableName) labels.push([`طاولة: ${data.tableName}`, '']);
  if (data.carNumber) labels.push([`سيارة: #${data.carNumber}`, '']);
  if (data.customerName) labels.push([`العميل: ${data.customerName}`, '']);

  let y = 60;
  for (const [l, r] of labels) {
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text(l, 20, y);
    if (r) {
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.text(r, pageW - 20, y, { align: 'right' });
    }
    y += 8;
  }

  // ── Table Header ──
  y += 8;
  doc.setFillColor(hairline[0], hairline[1], hairline[2]);
  doc.rect(20, y - 5, pageW - 40, 10, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(spice[0], spice[1], spice[2]);
  doc.text('الصنف', 25, y + 1);
  doc.text('الكمية', pageW / 2 - 10, y + 1);
  doc.text('السعر', pageW - 70, y + 1, { align: 'right' });
  doc.text('الإجمالي', pageW - 25, y + 1, { align: 'right' });

  // ── Items ──
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFontSize(9);

  for (const item of data.items) {
    if (y > 260) break; // page overflow
    doc.text(item.name, 25, y);
    doc.text(String(item.qty), pageW / 2 - 10, y, { align: 'center' });
    doc.text(`${item.price.toFixed(3)}`, pageW - 70, y, { align: 'right' });
    doc.text(`${(item.qty * item.price).toFixed(3)}`, pageW - 25, y, { align: 'right' });

    // subtle divider
    doc.setDrawColor(hairline[0], hairline[1], hairline[2]);
    doc.line(20, y + 3, pageW - 20, y + 3);
    y += 10;
  }

  // ── Total ──
  y += 8;
  doc.setDrawColor(spice[0], spice[1], spice[2]);
  doc.line(20, y - 5, pageW - 20, y - 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(spice[0], spice[1], spice[2]);
  doc.text('الإجمالي:', pageW - 70, y + 5, { align: 'right' });
  doc.text(`${data.total.toFixed(3)} د.ب`, pageW - 25, y + 5, { align: 'right' });

  // ── Footer ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(muted[0], muted[1], muted[2]);
  doc.text(`Dokan · ${data.restaurantSlug}`, pageW / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
  doc.text('شكراً لزيارتك', pageW / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  // ── Save ──
  doc.save(`invoice-${data.orderNumber}.pdf`);
}
