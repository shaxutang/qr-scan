import { contextBridge, ipcRenderer } from 'electron'

const saveFile = (filePath: string, data: string) =>
  ipcRenderer.invoke('electron:save:file', filePath, data)

const readFile = async (filePath: string) => {
  return ipcRenderer.invoke('electron:read:file', filePath)
}

const exportScanDataExcel = async (
  data: string,
  filePath: string,
): Promise<{
  success: boolean
  message: string
}> => ipcRenderer.invoke('electron:export:scan:excel', data, filePath)

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

contextBridge.exposeInMainWorld('electron', {
  saveFile,
  readFile,
  exportScanDataExcel,
  getExoportList,
  openExportExplorer,
  renameFolder,
  selectFolder,
  exportDatasource,
})
