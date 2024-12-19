import { DataType, Product, Rule } from '../types'
import dayjs from '../utils/dayjs'

export const saveProducts = (products: Product[]) => {
  window.electron.saveFile(
    'wk/qr-scan/product/products.json',
    JSON.stringify(products),
  )
}
export const readProducts = async (): Promise<Product[]> => {
  const content = await window.electron.readFile(
    'wk/qr-scan/product/products.json',
  )
  return content ? JSON.parse(content) : []
}

export const saveRules = (products: Rule[]) => {
  window.electron.saveFile(
    'wk/qr-scan/product/rules.json',
    JSON.stringify(products),
  )
}
export const readRules = async (): Promise<Rule[]> => {
  const content = await window.electron.readFile(
    'wk/qr-scan/product/rules.json',
  )
  return content ? JSON.parse(content) : []
}

export const saveScanData = (
  productName: string,
  data: DataType[],
  date?: string,
) => {
  window.electron.saveFile(
    `wk/qr-scan/product/${productName}/${date ?? dayjs().format('YYYY-MM-DD')}/data.json`,
    JSON.stringify(data),
  )
}

export const readScanData = async (productValue: string, date?: string) => {
  const content = await window.electron.readFile(
    `wk/qr-scan/product/${productValue}/${
      date ?? dayjs().format('YYYY-MM-DD')
    }/data.json`,
  )
  return content ? JSON.parse(content) : []
}

export const exportScanDataExcel = (
  name: string,
  date: string,
  data: DataType[],
) => {
  return window.electron.exportScanDataExcel(
    data,
    `wk/qr-scan/downloads/${name}/${date}.xlsx`,
  )
}

export const getExoportList = async (productValue: string) => {
  return window.electron.getExoportList(productValue)
}

export const openExportExplorer = (productName: string) => {
  window.electron.openExportExplorer(productName)
}

export const renameFolder = (oldPath: string, newPath: string) => {
  return window.electron.renameFolder(oldPath, newPath)
}

export const selectFolder = () => {
  return window.electron.selectFolder()
}

export const exportDatasource = () => {
  return window.electron.exportDatasource()
}
