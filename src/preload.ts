import { contextBridge, ipcRenderer } from 'electron'

const saveFile = (filePath: string, data: string) =>
  ipcRenderer.invoke('electron:save:file', filePath, data)

const readFile = async (filePath: string) => {
  return ipcRenderer.invoke('electron:read:file', filePath)
}

const exportExcel = async (
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

contextBridge.exposeInMainWorld('electron', {
  saveFile,
  readFile,
  exportExcel,
  getExoportList,
  openExportExplorer,
})
