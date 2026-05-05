import { Buffer } from "node:buffer";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import ttf2woff2 from "ttf2woff2";
import chalk from "chalk";

const appearance = {
    style: "Rounded",
    weight: 400,
    filled: false,
  },
  symbols = [
    "account_circle",
    "add",
    "analytics",
    "arrow_upload_progress",
    "arrow_upload_ready",
    "browser_updated",
    "bug_report",
    "call",
    "call_end",
    "cancel",
    "chat",
    "check_circle",
    "close",
    "cloud",
    "cloud_alert",
    "cloud_done",
    "cloud_download",
    "cloud_lock",
    "cloud_off",
    "cloud_upload",
    "delete",
    "download",
    "edit",
    "error",
    "experiment",
    "help",
    "home",
    "info",
    "join",
    "keyboard_arrow_down",
    "keyboard_arrow_left",
    "keyboard_arrow_right",
    "keyboard_arrow_up",
    "link",
    "lock",
    "lock_open",
    "login",
    "logout",
    "menu",
    "menu_open",
    "offline_pin",
    "open_in_new",
    "pending",
    "print",
    "print_disabled",
    "publish",
    "report",
    "save",
    "schedule",
    "search",
    "send",
    "settings",
    "share",
    "sync",
    "sync_disabled",
    "sync_problem",
    "system_update_alt",
    "task_alt",
    "today",
    "troubleshoot",
    "upload",
    "update",
    "warning",
  ].sort(),
  output = "material-symbols",
  woff2 = true;

try {
  console.log(chalk.yellow(`\nUpdating ${symbols.length} symbols...`));
  let res = await fetch(
    `https://fonts.googleapis.com/css2?family=Material+Symbols+${appearance.style}:opsz,wght,FILL,GRAD@24,${appearance.weight},${appearance.filled ? 1 : 0},0&icon_names=${symbols}`,
  );
  res = await res.text();
  res = await fetch(res.split("url(")[1].split(") format")[0]);
  res = await res.arrayBuffer();
  writeFileSync(`./dist/fonts/${output}.ttf`, Buffer.from(res));
  if (woff2) {
    writeFileSync(`./dist/fonts/${output}.woff2`, ttf2woff2(readFileSync(`./dist/fonts/${output}.ttf`)));
    unlinkSync(`./dist/fonts/${output}.ttf`);
  }
  console.log(chalk.greenBright(`\n${output}.${woff2 ? "woff2" : "ttf"} has been successfully updated!\n`));
} catch (error) {
  console.log(error);
  console.log(chalk.redBright(`\n${output}.${woff2 ? "woff2" : "ttf"} could not updated.\n`));
}
