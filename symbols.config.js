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
    "bug_report",
    "calendar_today",
    "call",
    "call_end",
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
    "delete_sweep",
    "download",
    "edit",
    "edit_square",
    "error",
    "exercise",
    "help",
    "home",
    "join",
    "keyboard_arrow_down",
    "keyboard_arrow_left",
    "keyboard_arrow_right",
    "keyboard_arrow_up",
    "lab_panel",
    "line_end_circle",
    "link",
    "lock",
    "lock_open",
    "loyalty",
    "medical_services",
    "menu",
    "menu_open",
    "nutrition",
    "open_in_new",
    "pending",
    "print",
    "radiology",
    "report",
    "save",
    "search",
    "send",
    "settings",
    "share",
    "spa",
    "today",
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
    writeFileSync(
      `./dist/fonts/${output}.woff2`,
      ttf2woff2(readFileSync(`./dist/fonts/${output}.ttf`)),
    );
    unlinkSync(`./dist/fonts/${output}.ttf`);
  }
  console.log(
    chalk.greenBright(
      `\n${output}.${woff2 ? "woff2" : "ttf"} has been successfully updated!\n`,
    ),
  );
} catch (error) {
  console.log(error);
  console.log(
    chalk.redBright(
      `\n${output}.${woff2 ? "woff2" : "ttf"} could not updated.\n`,
    ),
  );
}
