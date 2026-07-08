export const GST_SLABS = [0, 5, 12, 18, 28]

export const STATE_CODES: Record<string, string> = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
  "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana", "07": "Delhi",
  "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim",
  "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
  "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chattisgarh", "23": "Madhya Pradesh",
  "24": "Gujarat", "25": "Daman and Diu (legacy)",
  "26": "Dadra and Nagar Haveli and Daman and Diu", "27": "Maharashtra",
  "28": "Andhra Pradesh (legacy, pre-2014)", "29": "Karnataka", "30": "Goa",
  "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman and Nicobar Islands", "36": "Telangana",
  "37": "Andhra Pradesh", "38": "Ladakh",
}

export function validateGSTIN(gstin: string): boolean {
  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return pattern.test(gstin)
}

export function getStateFromGSTIN(gstin: string): string {
  return STATE_CODES[gstin.slice(0, 2)] || 'Unknown'
}

export function getStateCodeFromGSTIN(gstin: string): string {
  return gstin.slice(0, 2)
}

export function isInterstate(sellerGSTIN: string, buyerGSTIN: string): boolean {
  return getStateCodeFromGSTIN(sellerGSTIN) !== getStateCodeFromGSTIN(buyerGSTIN)
}

export interface LineItemCalc {
  base_amount: number
  cgst: number
  sgst: number
  igst: number
  cess_amount: number
  line_total: number
}

export function calculateLineItem(
  price: number,
  quantity: number,
  taxSlab: number,
  interstate: boolean,
  cessRate: number = 0
): LineItemCalc {
  const base = Math.round(price * quantity * 100) / 100
  const gst = Math.round(base * taxSlab) / 100
  const cess = Math.round(base * cessRate) / 100

  let cgst = 0, sgst = 0, igst = 0
  if (interstate) {
    igst = gst
  } else {
    cgst = Math.round(gst / 2 * 100) / 100
    sgst = Math.round(gst / 2 * 100) / 100
  }

  return {
    base_amount: base,
    cgst, sgst, igst,
    cess_amount: cess,
    line_total: Math.round((base + gst + cess) * 100) / 100
  }
}

export interface InvoiceTotals {
  base_amount: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  total_tax: number
  grand_total: number
  tax_label: string
  tax_collected: boolean
}

export function calculateInvoiceTotals(
  items: LineItemCalc[],
  isReverseCharge: boolean,
  isExport: boolean,
  isSEZ: boolean,
  supplyType: string
): InvoiceTotals {
  let base = items.reduce((s, i) => s + i.base_amount, 0)
  let cgst = items.reduce((s, i) => s + i.cgst, 0)
  let sgst = items.reduce((s, i) => s + i.sgst, 0)
  let igst = items.reduce((s, i) => s + i.igst, 0)
  let cess = items.reduce((s, i) => s + i.cess_amount, 0)

  base = Math.round(base * 100) / 100
  cgst = Math.round(cgst * 100) / 100
  sgst = Math.round(sgst * 100) / 100
  igst = Math.round(igst * 100) / 100
  cess = Math.round(cess * 100) / 100

  let taxLabel = 'Forward Charge'
  let taxCollected = true

  if ((isExport || isSEZ) && supplyType === 'Without Payment') {
    cgst = 0; sgst = 0; igst = 0; cess = 0
    taxLabel = 'Export/SEZ - Without Payment (LUT)'
    taxCollected = false
  } else if (isExport || isSEZ) {
    taxLabel = 'Export/SEZ - With Payment of IGST'
  } else if (isReverseCharge) {
    taxLabel = 'RCM - Tax payable by recipient'
    taxCollected = false
  }

  const totalTax = Math.round((cgst + sgst + igst + cess) * 100) / 100
  const grandTotal = Math.round((base + (taxCollected ? totalTax : 0)) * 100) / 100

  return { base_amount: base, cgst, sgst, igst, cess, total_tax: totalTax, grand_total: grandTotal, tax_label: taxLabel, tax_collected: taxCollected }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount)
}

export function generateInvoiceNumber(): string {
  return `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}
