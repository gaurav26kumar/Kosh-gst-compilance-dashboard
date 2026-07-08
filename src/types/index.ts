export interface Profile {
  id: string
  business_name: string | null
  gstin: string | null
  address: string | null
  state: string | null
  state_code: string | null
  created_at: string
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  item_name: string
  hsn_code: string
  quantity: number
  unit_price: number
  tax_slab: number
  cess_rate: number
  base_amount?: number
  cgst?: number
  sgst?: number
  igst?: number
  cess_amount?: number
  line_total?: number
}

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  buyer_name: string
  buyer_gstin: string
  place_of_supply: string | null
  is_interstate: boolean
  is_reverse_charge: boolean
  is_export: boolean
  is_sez: boolean
  supply_type: string
  lut_number: string | null
  base_amount: number
  cgst: number
  sgst: number
  igst: number
  cess: number
  total_tax: number
  grand_total: number
  tax_label: string
  status: string
  created_at: string
  invoice_items?: InvoiceItem[]
}

export interface GSTReturn {
  id: string
  user_id: string
  return_type: string
  period: string
  due_date: string
  filed_date: string | null
  status: 'pending' | 'filed' | 'overdue'
  tax_liability: number
  created_at: string
}
