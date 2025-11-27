export interface Discount {
  _id: string
  code: string
  description: string
  percentage: number
  validFrom: string
  validTo: string
  active: boolean
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
}
