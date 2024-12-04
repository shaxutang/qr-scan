import { DataType, Product } from '../types'
import dayjs from '../utils/dayjs'

export const saveProducts = (products: Product[]) => {
  window.electron.saveFile(
    'wk/qr-scan/product/products.json',
    JSON.stringify(products),
  )
}
export const readProducts = async () => {
  const content = await window.electron.readFile(
    'wk/qr-scan/product/products.json',
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

export const openExportExplorer = (productName: string, date: string) => {
  window.electron.openExportExplorer(productName, date)
}

export const renameFolder = (oldPath: string, newPath: string) => {
  return window.electron.renameFolder(oldPath, newPath)
}
