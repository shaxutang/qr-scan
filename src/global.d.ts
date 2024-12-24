import { DataType } from './types'

declare global {
  interface Window extends Window {
    electron: {
      saveProducts: <T>(data: T) => Promise<boolean>
      readProducts: <T>() => Promise<T>
      saveRules: <T>(data: T) => Promise<boolean>
      readRules: <T>() => Promise<T>
      saveScans: (
        productName: string,
        date: string,
        data: DataType[],
      ) => Promise<boolean>
      readScans: (productValue: string, date: string) => Promise<DataType[]>
      exportScanDataExcel: (
        data: DataType[],
        name: string,
        date: string,
      ) => Promise<{ success: boolean; message: string; path: string }>
      getExoportList: (productValue: string) => Promise<
        {
          name: string
          path: string
        }[]
      >
      openExportExplorer: (productName: string) => void
      renameFolder: (
        oldPath: string,
        newPath: string,
      ) => Promise<{ success: boolean; message: string; path: string }>
      selectFolder: () => Promise<string>
      exportDatasource: () => Promise<{
        success: boolean
        message: string
      }>
    }
  }
}

export {}
