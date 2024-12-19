import { DataType } from './types'

declare global {
  interface Window extends Window {
    electron: {
      saveFile: (filePath: string, data: string) => void
      readFile: (filePath: string) => Promise<string>
      exportScanDataExcel: (
        data: DataType[],
        filePath: string,
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
    }
  }
}

export {}
