import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { Workbook } from 'exceljs'
import { copy } from 'fs-extra'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import os from 'os'
import { DataType } from './types'
import dayjs from './utils/dayjs'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const isDev = process.env.NODE_ENV === 'development'
const BASE_DIR = os.homedir()

if (require('electron-squirrel-startup')) {
  app.quit()
}

interface InitConfig {
  path: string
  data: any
}

const initConfigs: InitConfig[] = [
  {
    path: join(BASE_DIR, 'wk/qr-scan/product/products.json'),
    data: [
      { productName: '气压阀', productValue: 'qì_yā_fá' },
      {
        productName: 'SC下壳-气密测试',
        productValue: 'SC_xià_ké_-_qì_mì_cè_shì',
      },
      {
        productName: 'SC下壳-漏水测试',
        productValue: 'SC_xià_ké_-_lòu_shuǐ_cè_shì',
      },
      {
        productName: 'PSC清洁液箱成品气密测试',
        productValue: 'PSC_qīng_jié_yè_xiāng_chéng_pǐn_qì_mì_cè_shì',
      },
      {
        productName: 'O5清洁液箱成品气密测试',
        productValue: 'O5_qīng_jié_yè_xiāng_chéng_pǐn_qì_mì_cè_shì',
      },
    ],
  },
  {
    path: join(BASE_DIR, 'wk/qr-scan/product/rules.json'),
    data: [
      {
        ruleName: '产线18位条码',
        ruleValue: '^\\d{7}W\\d{10}$',
        isDefault: true,
      },
    ],
  },
]

const init = async () => {
  initConfigs.forEach(({ path, data }) => {
    const dir = dirname(path)

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    if (!existsSync(path)) {
      writeFileSync(path, JSON.stringify(data))
    }
  })
}

let mainWindow: BrowserWindow = null

const createWindow = (): void => {
  init()
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1080,
    autoHideMenuBar: !isDev,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })
  mainWindow.maximize()
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  isDev && mainWindow.webContents.openDevTools()
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  app.on('ready', () => {
    createWindow()
    const { Menu } = require('electron')
    Menu.setApplicationMenu(null) // 隐藏菜单栏
  })
}

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

app.whenReady().then(() => {
  app.setLoginItemSettings({
    openAtLogin: true,
  })
})

/**
 * 保存文件
 */
ipcMain.handle('electron:save:file', async (event, filePath, data) => {
  const path = join(BASE_DIR, filePath)
  try {
    const fileDir = dirname(path)
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true })
    }
    writeFile(path, data)
    return true
  } catch (error) {
    throw new Error('文件保存失败: ' + error.message)
  }
})

/**
 * 读取文件
 */
ipcMain.handle('electron:read:file', async (event, filePath) => {
  const path = join(BASE_DIR, filePath)
  if (!existsSync(path)) {
    return null
  }
  try {
    return readFile(path, 'utf-8')
  } catch (error) {
    return null
  }
})

/**
 * 导出到excel
 */
ipcMain.handle('electron:export:scan:excel', async (event, data, filePath) => {
  const path = join(BASE_DIR, filePath)
  try {
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('导出数据')
    const products = data as DataType[]

    worksheet.columns = [
      { header: '扫码对象名称', key: 'productName', width: 20 },
      { header: '扫码对象条码', key: 'qrcode', width: 30 },
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
    writeFile(path, new Uint8Array(buffer))
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
  const path = join(BASE_DIR, `wk/qr-scan/product/${productValue}`)
  try {
    return readdirSync(path)
      .map((name) => join(path, name))
      .filter((filePath) => statSync(filePath).isDirectory())
      .filter((filePath) => {
        const dirs = readdirSync(filePath)
        return dirs.some((dir) => dir === 'data.json')
      })
      .map((filePath) => ({
        name: basename(filePath),
        path: filePath.replace(BASE_DIR, ''),
      }))
  } catch (error) {
    return []
  }
})

/**
 * 打开资源管理器
 */
ipcMain.handle('electron:open:export:explorer', async (event, productName) => {
  const dir = join(BASE_DIR, `wk\\qr-scan\\downloads\\${productName}`)
  shell.openPath(dir)
})

/**
 * 修改文件夹名称
 */
ipcMain.handle(
  'electron:rename:product:folder',
  async (event, oldPath, newPath) => {
    const baseOldPath = join(BASE_DIR, 'wk/qr-scan/product', oldPath)
    const baseNewPath = join(BASE_DIR, 'wk/qr-scan/product', newPath)

    try {
      // 检查旧路径是否存在
      if (!existsSync(baseOldPath)) {
        console.error('旧文件夹不存在')
        return { success: false, message: '旧文件夹不存在' }
      }

      // 检查新路径是否已存在
      if (existsSync(baseNewPath)) {
        console.error('新文件夹已存在')
        return { success: false, message: '新文件夹已存在' }
      }

      // 重命名文件夹
      rename(baseOldPath, baseNewPath)

      return { success: true, message: '文件夹重命名成功' }
    } catch (error) {
      console.error('Error renaming folder:', error)
      return { success: false, message: '文件夹重命名失败: ' + error.message }
    }
  },
)

ipcMain.handle('electron:select:folder', async () => {
  const paths = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  return paths.filePaths[0]
})

ipcMain.handle('electron:export:datasource', async () => {
  const paths = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  if (paths.canceled) {
    return { success: true, message: '操作取消' }
  }
  const selectPath = join(paths.filePaths[0], 'wk')
  const sourcePath = join(BASE_DIR, 'wk')
  try {
    await copy(sourcePath, selectPath)
    return { success: true, message: '数据源导出成功' }
  } catch (err) {
    console.log(err)
    return { success: false, message: '数据源导出失败' }
  }
})
