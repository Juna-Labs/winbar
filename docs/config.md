# Configuration Guide

Winbar uses a simple `config.yaml` file located in the same directory as the executable. If it doesn't exist, Winbar will create a default one automatically when it starts.

You can quickly open the config file by right-clicking the Winbar system tray icon and selecting **Open Config**. After making changes, click **Reload** in the system tray to apply them.

## File Structure

The `config.yaml` file consists of sections for customizing the bar layout, enabling modules, and adding specific settings (like the Prometheus URL or Launcher applications).

Here is an example configuration:

```yaml
theme: default
left:
- power
- overlay
- theme_toggle
- overlay_toggle
- workspace
center:
- day
right:
- music
- volume
- battery
- wifi
- notification
modules:
- yamw
- sysinfo
- todo
- notepad
- drawing
- companion
- control
- serverinfo
- container
- terminal
- launcher
prometheus_url: http://localhost:9090/
launcher_apps:
- name: steam
  path: C:\Program Files (x86)\Steam\steam.exe
```

## Widgets (Bar Layout)

You can place widgets on the `left`, `center`, or `right` sections of the top bar. Just list the widget names under the corresponding section in your `config.yaml`.

Available widgets:
- `power`: A power menu button.
- `overlay`: The main button to toggle the overlay command center. *(Note: If this is removed, all modules and the overlay feature will be disabled)*.
- `theme_toggle`: A quick toggle to switch between themes.
- `overlay_toggle`: A button to toggle the overlay transparency.
- `workspace`: Displays the current active workspace. The workspace widget uses [Space](https://github.com/Arjuna-Ragil/Space) as the default workspace manager, other workspace manager (like GlazeWM) will not work.
- `day`: Displays the current day, date, time, temperature, and weather.
- `music`: A mini music controller/display for the yamw module.
- `volume`: Displays the current volume.
- `battery`: Displays laptop battery percentage and status.
- `wifi`: Displays network connection status.
- `notification`: Displays recent notifications.

## Modules (Overlay Features)

Modules are the feature panels that appear when you open the Winbar overlay (command center). List the modules you want to enable under the `modules` key.

Available modules:
- `yamw`: This module uses [YAMW](https://github.com/Arjuna-Ragil/YAMW) or Yet Another Music Widget (Subsonic and Lrclib integration) for the music media player.
- `sysinfo`: Displays system resources (CPU, RAM, etc.).
- `launcher`: Quick app launcher.
- `control`: System controls and toggles.

---
- `todo`: A simple task and todo list manager.
- `notepad`: A quick place to jot down notes.
- `drawing`: A drawing board powered by Excalidraw.

---
> This module is experimental and may lead to future error
- `companion`: An AI chat companion. 

---
> The following module is for tech enthusiast that has access to a server, including this module without a correct server address may lead to other error 
- `serverinfo`: Server monitoring integration.
- `container`: Docker/container monitoring.
- `terminal`: A CLI terminal launcher that can automatically launch your server terminal (The server private key is needed to work)

---
- `timehub`: Time suite containing a Countdown Timer, Pomodoro focus mode, Stopwatch with lap timing, and persistent Alarms.
- `calculator`: Fast desktop calculator with calculation history and quick multi-unit converter (Programmer bases, Storage, CSS rem/px, and physical units).

## Additional Settings

- `theme`: Set the active theme name (e.g., `default`).
- `prometheus_url`: If using the `serverinfo` or `container` modules, provide the URL to your Prometheus instance here.
- `launcher_apps`: Define the applications for the `launcher` module. It is recommended to add apps directly through the launcher module in the UI instead of editing this file manually. However, the format is a list of objects with a `name` and `path`.
