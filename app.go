package main

import (
	"bufio"
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
	"unsafe"

	yamwHelper "winbar/internal/modules/yamw/helpers"
	"winbar/internal/services"

	"github.com/getlantern/systray"
	"github.com/lxn/win"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sys/windows/registry"
)

//go:embed build/windows/icon.ico
var iconData []byte

const (
	ABM_NEW      = 0
	ABM_QUERYPOS = 2
	ABM_SETPOS   = 3
	ABE_TOP      = 1
)

type APPBARDATA struct {
	cbSize           uint32
	hwnd             win.HWND
	uCallbackMessage uint32
	uEdge            uint32
	rc               win.RECT
	lparam           uintptr
}

type App struct {
	ctx  context.Context
	hwnd win.HWND
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	services.RegisterHotkey(ctx)

	exePath, _ := os.Executable()
	pwd := filepath.Dir(exePath)
	themesPath := filepath.Join(pwd, "themes")
	if _, err := os.Stat(themesPath); os.IsNotExist(err) {
		err := os.MkdirAll(themesPath, 0755)
		if err != nil {
			log.Printf("error creating themes directory: %v\n", err)
		}
	}

	configPath := filepath.Join(pwd, "config.yaml")
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		err := os.WriteFile(configPath, []byte(""), 0644)
		if err != nil {
			log.Printf("error creating config file: %v\n", err)
		}
	}
	shell32 := syscall.NewLazyDLL("shell32.dll")

	title, err := syscall.UTF16PtrFromString("winbar")
	if err != nil {
		return
	}
	hwnd := win.FindWindow(nil, title)
	if hwnd == 0 {
		return
	}
	a.hwnd = hwnd
	proc := shell32.NewProc("SHAppBarMessage")
	if proc == nil {
		fmt.Println("Failed to find SHAppBarMessage")
		return
	}
	screenWidth := win.GetSystemMetrics(win.SM_CXSCREEN)
	abb := APPBARDATA{
		cbSize:           uint32(unsafe.Sizeof(APPBARDATA{})),
		hwnd:             hwnd,
		uCallbackMessage: win.WM_USER + 1,
		uEdge:            ABE_TOP,
		rc: win.RECT{
			Left:   0,
			Top:    0,
			Right:  screenWidth,
			Bottom: 50,
		},
	}
	_, _, _ = proc.Call(uintptr(ABM_NEW), uintptr(unsafe.Pointer(&abb)))
	_, _, _ = proc.Call(uintptr(ABM_QUERYPOS), uintptr(unsafe.Pointer(&abb)))
	_, _, _ = proc.Call(uintptr(ABM_SETPOS), uintptr(unsafe.Pointer(&abb)))

	style := win.GetWindowLong(hwnd, win.GWL_STYLE)
	style = style &^ (win.WS_BORDER | win.WS_THICKFRAME)
	win.SetWindowLong(hwnd, win.GWL_STYLE, style)

	exStyle := win.GetWindowLong(hwnd, win.GWL_EXSTYLE)
	exStyle = exStyle | win.WS_EX_TOOLWINDOW
	exStyle = exStyle &^ win.WS_EX_APPWINDOW
	win.SetWindowLong(hwnd, win.GWL_EXSTYLE, exStyle)

	win.SetWindowPos(
		hwnd,
		win.HWND_NOTOPMOST,
		0,
		0,
		screenWidth,
		40,
		win.SWP_NOACTIVATE|win.SWP_FRAMECHANGED,
	)

	go func() {
		isOffline := false
		for {
			select {
			case <-ctx.Done():
				return
			default:
			}

			conn, err := os.OpenFile(`\\.\pipe\SpaceWorkspace`, os.O_RDWR, 0)
			if err != nil {
				if !isOffline {
					runtime.EventsEmit(ctx, "workspace_changed", "offline")
					isOffline = true
				}
				select {
				case <-ctx.Done():
					return
				case <-time.After(2 * time.Second):
				}
				continue
			}

			isOffline = false
			scanner := bufio.NewScanner(conn)
			for scanner.Scan() {
				ws := strings.TrimSpace(scanner.Text())
				runtime.EventsEmit(ctx, "workspace_changed", ws)
			}

			if err := scanner.Err(); err != nil {
				fmt.Println("Error scanning pipe:", err)
			}

			err = conn.Close()
			if err != nil {
				log.Printf("error closing connection: %v\n", err)
			}

			if !isOffline {
				runtime.EventsEmit(ctx, "workspace_changed", "offline")
				isOffline = true
			}
		}
	}()

	go systray.Run(a.onReady, a.onExit)
}

func (a *App) ExpandWindow() {
	if a.hwnd == 0 {
		return
	}
	screenWidth := win.GetSystemMetrics(win.SM_CXSCREEN)
	screenHeight := win.GetSystemMetrics(win.SM_CYSCREEN)
	win.SetWindowPos(a.hwnd, win.HWND_TOPMOST, 0, 0, screenWidth, screenHeight, win.SWP_NOACTIVATE)
}

func (a *App) ShrinkWindow() {
	if a.hwnd == 0 {
		return
	}
	screenWidth := win.GetSystemMetrics(win.SM_CXSCREEN)
	win.SetWindowPos(a.hwnd, win.HWND_NOTOPMOST, 0, 0, screenWidth, 40, win.SWP_NOACTIVATE)
}

func (a *App) HasConfig() bool {
	path, err := yamwHelper.GetConfigPath()
	if err != nil {
		return false
	}
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	}
	return true
}

func (a *App) SaveConfig(serverURL, username, password string) error {
	path, err := yamwHelper.GetConfigPath()
	if err != nil {
		return err
	}

	config := yamwHelper.Config{
		ServerURL: serverURL,
		Username:  username,
		Password:  password,
	}

	data, err := json.Marshal(config)
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}

func (a *App) onReady() {
	systray.SetIcon(iconData)
	systray.SetTitle("Winbar")
	systray.SetTooltip("Winbar")

	mConfig := systray.AddMenuItem("Open Config", "Open Configuration")

	systray.AddSeparator()
	mRunOnLaunch := systray.AddMenuItemCheckbox("Run on Launch", "Run Winbar on system startup", a.isRunOnLaunchEnabled())
	mReload := systray.AddMenuItem("Reload", "Reload Winbar")

	systray.AddSeparator()
	mQuit := systray.AddMenuItem("Quit", "Quit Winbar")

	go func() {
		for {
			select {
			case <-mConfig.ClickedCh:
				exePath, _ := os.Executable()
				pwd := filepath.Dir(exePath)
				err := exec.Command("explorer", "/select,", filepath.Join(pwd, "config.yaml")).Start()
				if err != nil {
					log.Printf("error opening config file: %v\n", err)
				}
			case <-mRunOnLaunch.ClickedCh:
				if mRunOnLaunch.Checked() {
					err := a.toggleRunOnLaunch(false)
					if err != nil {
						log.Printf("error toggling run on launch: %v\n", err)
					}
					mRunOnLaunch.Uncheck()
				} else {
					err := a.toggleRunOnLaunch(true)
					if err != nil {
						log.Printf("error toggling run on launch: %v\n", err)
					}
					mRunOnLaunch.Check()
				}
			case <-mReload.ClickedCh:
				runtime.WindowReload(a.ctx)
			case <-mQuit.ClickedCh:
				systray.Quit()
			}
		}
	}()
}

func (a *App) toggleRunOnLaunch(enabled bool) error {
	exePath, err := os.Executable()
	if err != nil {
		return err
	}
	key, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.ALL_ACCESS)
	if err != nil {
		return err
	}
	defer func() {
		err := key.Close()
		if err != nil {
			log.Printf("error closing key: %v\n", err)
		}
	}()

	if enabled {
		return key.SetStringValue("Winbar", exePath)
	} else {
		return key.DeleteValue("Winbar")
	}
}

func (a *App) isRunOnLaunchEnabled() bool {
	key, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer func() {
		err := key.Close()
		if err != nil {
			log.Printf("error closing key: %v\n", err)
		}
	}()
	_, _, err = key.GetStringValue("Winbar")
	return err == nil
}

func (a *App) onExit() {
	runtime.Quit(a.ctx)
}
