import { DataType, Product, Rule } from '../types'

export const saveProducts = async (products: Product[]) => {
  return window.electron.saveProducts(products)
}
export const readProducts = async (): Promise<Product[]> => {
  return window.electron.readProducts()
}

export const saveRules = async (rules: Rule[]) => {
  return window.electron.saveRules(rules)
}
export const readRules = async (): Promise<Rule[]> => {
  return window.electron.readRules()
}

export const saveScanData = async (
  productValue: string,
  data: DataType[],
  date?: string,
) => {
  return window.electron.saveScans(productValue, date, data)
}

export const readScanData = async (productValue: string, date: string) => {
  return window.electron.readScans(productValue, date)
}

export const exportScanDataExcel = (
  name: string,
  date: string,
  data: DataType[],
) => {
  return window.electron.exportScanDataExcel(data, name, date)
}

export const getExoportList = async (productValue: string) => {
  return window.electron.getExoportList(productValue)
}

export const openExportExplorer = async (productName: string) => {
  window.electron.openExportExplorer(productName)
}

export const renameFolder = async (oldPath: string, newPath: string) => {
  return window.electron.renameFolder(oldPath, newPath)
}

export const selectFolder = async () => {
  return window.electron.selectFolder()
}

export const exportDatasource = async () => {
  return window.electron.exportDatasource()
}
