import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { InventoryItem, Distribution, StockEntry } from '@/types/inventory';

// PDF Export
export const exportInventoryToPDF = (items: InventoryItem[], title = 'RTB Inventory Report') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text('Rwanda TVET Board', 14, 15);
  doc.setFontSize(14);
  doc.text(title, 14, 25);
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 32);

  // Table
  autoTable(doc, {
    startY: 40,
    head: [['Item Name', 'Category', 'Quantity', 'Unit Price (RWF)', 'Total Value (RWF)']],
    body: items.map(item => [
      item.name,
      item.category?.name || 'Uncategorized',
      item.quantity_in_stock.toString(),
      item.unit_price.toLocaleString(),
      (item.quantity_in_stock * item.unit_price).toLocaleString(),
    ]),
    headStyles: { fillColor: [37, 99, 235] },
    footStyles: { fillColor: [37, 99, 235] },
    foot: [[
      'TOTAL',
      '',
      items.reduce((sum, i) => sum + i.quantity_in_stock, 0).toString(),
      '',
      items.reduce((sum, i) => sum + (i.quantity_in_stock * i.unit_price), 0).toLocaleString(),
    ]],
  });

  doc.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportDistributionsToPDF = (distributions: Distribution[], title = 'RTB Distribution Report') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text('Rwanda TVET Board', 14, 15);
  doc.setFontSize(14);
  doc.text(title, 14, 25);
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 32);

  // Table
  autoTable(doc, {
    startY: 40,
    head: [['Date', 'Item', 'Department', 'Quantity', 'Unit Price', 'Total', 'Received By']],
    body: distributions.map(d => [
      new Date(d.distribution_date).toLocaleDateString('en-GB'),
      d.item?.name || 'Unknown',
      d.department?.name || 'Unknown',
      d.quantity.toString(),
      d.unit_price.toLocaleString(),
      (d.total_price || d.quantity * d.unit_price).toLocaleString(),
      d.received_by || '-',
    ]),
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 18 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
    },
    footStyles: { fillColor: [37, 99, 235] },
    foot: [[
      'TOTAL',
      '',
      '',
      distributions.reduce((sum, d) => sum + d.quantity, 0).toString(),
      '',
      distributions.reduce((sum, d) => sum + (d.total_price || d.quantity * d.unit_price), 0).toLocaleString(),
      '',
    ]],
  });

  doc.save(`distribution-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportStockEntriesToPDF = (entries: StockEntry[], title = 'RTB Stock Entries Report') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text('Rwanda TVET Board', 14, 15);
  doc.setFontSize(14);
  doc.text(title, 14, 25);
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 32);

  // Table
  autoTable(doc, {
    startY: 40,
    head: [['Date', 'Item', 'Quantity', 'Unit Price (RWF)', 'Total (RWF)', 'Notes']],
    body: entries.map(e => [
      new Date(e.date_entered).toLocaleDateString('en-GB'),
      e.item?.name || 'Unknown',
      e.quantity.toString(),
      e.unit_price.toLocaleString(),
      (e.total_price || e.quantity * e.unit_price).toLocaleString(),
      e.notes || '-',
    ]),
    headStyles: { fillColor: [37, 99, 235] },
    footStyles: { fillColor: [37, 99, 235] },
    foot: [[
      'TOTAL',
      '',
      entries.reduce((sum, e) => sum + e.quantity, 0).toString(),
      '',
      entries.reduce((sum, e) => sum + (e.total_price || e.quantity * e.unit_price), 0).toLocaleString(),
      '',
    ]],
  });

  doc.save(`stock-entries-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Excel Export
export const exportInventoryToExcel = (items: InventoryItem[]) => {
  const data = items.map(item => ({
    'Item Name': item.name,
    'Description': item.description || '',
    'Category': item.category?.name || 'Uncategorized',
    'Quantity in Stock': item.quantity_in_stock,
    'Unit Price (RWF)': item.unit_price,
    'Total Value (RWF)': item.quantity_in_stock * item.unit_price,
    'Minimum Stock Level': item.minimum_stock_level,
    'Date Entered': new Date(item.date_entered).toLocaleDateString('en-GB'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  XLSX.writeFile(wb, `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportDistributionsToExcel = (distributions: Distribution[]) => {
  const data = distributions.map(d => ({
    'Date': new Date(d.distribution_date).toLocaleDateString('en-GB'),
    'Item': d.item?.name || 'Unknown',
    'Department': d.department?.name || 'Unknown',
    'Quantity': d.quantity,
    'Unit Price (RWF)': d.unit_price,
    'Total (RWF)': d.total_price || d.quantity * d.unit_price,
    'Purpose': d.purpose || '',
    'Received By': d.received_by || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Distributions');
  XLSX.writeFile(wb, `distribution-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportStockEntriesToExcel = (entries: StockEntry[]) => {
  const data = entries.map(e => ({
    'Date': new Date(e.date_entered).toLocaleDateString('en-GB'),
    'Item': e.item?.name || 'Unknown',
    'Quantity': e.quantity,
    'Unit Price (RWF)': e.unit_price,
    'Total (RWF)': e.total_price || e.quantity * e.unit_price,
    'Notes': e.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Entries');
  XLSX.writeFile(wb, `stock-entries-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};
