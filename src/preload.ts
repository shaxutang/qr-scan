import { contextBridge, ipcRenderer } from 'electron'
import { DataType } from './types'

const saveProducts = <T>(data: T): Promise<boolean> =>
  ipcRenderer.invoke('electron:save:products', data)

const readProducts = async <T>() => {
  return ipcRenderer.invoke('electron:read:products') as Promise<T>
}

const saveRules = (data: string) =>
  ipcRenderer.invoke('electron:save:rules', data)

const readRules = async () => {
  return ipcRenderer.invoke('electron:read:rules')
}

const saveScans = (
  productValue: string,
  date: string,
  data: DataType[],
): Promise<boolean> =>
  ipcRenderer.invoke('electron:save:scans', productValue, date, data)

const readScans = async (
  productValue: string,
  date: string,
): Promise<DataType[]> => {
  return ipcRenderer.invoke('electron:read:scans', productValue, date)
}

const exportScanDataExcel = async (
  data: string,
  name: string,
  date: string,
): Promise<{
  success: boolean
  message: string
}> => ipcRenderer.invoke('electron:export:scan:excel', data, name, date)

const getExoportList = async (productValue: string) => {
  return ipcRenderer.invoke('electron:get:export:list', productValue)
}

const openExportExplorer = (product: string, date: string) => {
  ipcRenderer.invoke('electron:open:export:explorer', product, date)
}

const renameFolder = async (oldPath: string, newPath: string) => {
  return ipcRenderer.invoke('electron:rename:product:folder', oldPath, newPath)
}

const selectFolder = async () => {
  return ipcRenderer.invoke('electron:select:folder')
}

const exportDatasource = async () => {
  return ipcRenderer.invoke('electron:export:datasource')
}

const api = {
  saveProducts,
  readProducts,
  saveRules,
  readRules,
  saveScans,
  readScans,
  exportScanDataExcel,
  getExoportList,
  openExportExplorer,
  renameFolder,
  selectFolder,
  exportDatasource,
}

contextBridge.exposeInMainWorld('electron', api)
