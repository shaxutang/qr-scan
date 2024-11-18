import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { Workbook } from 'exceljs'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join } from 'node:path'
import os from 'os'
import { DataType } from './types'
import dayjs from './utils/dayjs'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const isDev = process.env.NODE_ENV === 'development'

if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1080,
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  isDev && mainWindow.webContents.openDevTools()
}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/**
 * 保存文件
 */
ipcMain.handle('electron:save:file', async (event, filePath, data) => {
  const path = join(os.homedir(), filePath)
  try {
    const fileDir = dirname(path)
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true })
    }
    writeFileSync(path, data)
    return true
  } catch (error) {
    throw new Error('文件保存失败: ' + error.message)
  }
})

/**
 * 读取文件
 */
ipcMain.handle('electron:read:file', async (event, filePath) => {
  const path = join(os.homedir(), filePath)
  try {
    return readFileSync(path, 'utf-8')
  } catch (error) {
    return null
  }
})

/**
 * 导出到excel
 */
ipcMain.handle('electron:export:scan:excel', async (event, data, filePath) => {
  const path = join(os.homedir(), filePath)
  try {
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('导出数据')
    const products = data as DataType[]

    worksheet.columns = [
      { header: '产品名称', key: 'productName', width: 20 },
      { header: '产品编码', key: 'qrcode', width: 30 },
      { header: '测试状态', key: 'state', width: 20 },
      { header: '扫码时间', key: 'date', width: 20 },
    ]

    products
      .map((product) => ({
        productName: product.productName,
        qrcode: product.qrcode,
        state: '测试通过',
        date: dayjs(product.date).format('YYYY/MM/DD HH:mm:ss'),
      }))
      .forEach((item) => {
        worksheet.addRow(item)
      })

    const dir = dirname(path)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    const buffer = await workbook.xlsx.writeBuffer()
    writeFileSync(path, new Uint8Array(buffer))
    return { success: true, message: '导出成功', path }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return { success: false, message: 'Error exporting to Excel.', path: null }
  }
})

/**
 * 获取 wk/qr-scan/product/xx/xx/data.json的列表
 */
ipcMain.handle('electron:get:export:list', async (event, productValue) => {
  const path = join(os.homedir(), `wk/qr-scan/product/${productValue}`)
  return readdirSync(path)
    .map((name) => join(path, name))
    .filter((filePath) => statSync(filePath).isDirectory())
    .filter((filePath) => {
      const dirs = readdirSync(filePath)
      return dirs.some((dir) => dir === 'data.json')
    })
    .map((filePath) => ({
      name: basename(filePath),
      path: filePath.replace(os.homedir(), ''),
    }))
})

/**
 * 打开资源管理器
 */
ipcMain.handle(
  'electron:open:export:explorer',
  async (event, productName, date) => {
    const dir = join(os.homedir(), `wk\\qr-scan\\downloads\\${productName}`)
    shell.openPath(dir)
    shell.openPath(join(dir, `${date}.xlsx`))
  },
)
