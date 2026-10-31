// Runs the Android Gradle wrapper with JAVA_HOME taken from android/local.properties
// (`java.home=...`, kept out of git), so builds work from any terminal without
// setting environment variables. An existing JAVA_HOME always wins.
// Usage: node scripts/gradle.mjs assembleDebug
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const android = join(dirname(fileURLToPath(import.meta.url)), "..", "android");
const localProps = join(android, "local.properties");
const props = existsSync(localProps) ? readFileSync(localProps, "utf8") : "";
const javaHome = (props.match(/^java\.home=(.+)$/m) || [])[1]?.trim().replace(/\\\\/g, "\\");
const env = { ...process.env, ...(javaHome && !process.env.JAVA_HOME ? { JAVA_HOME: javaHome } : {}) };

const wrapper = join(android, process.platform === "win32" ? "gradlew.bat" : "gradlew");
const result = spawnSync(wrapper, process.argv.slice(2), { cwd: android, env, stdio: "inherit", shell: process.platform === "win32" });
process.exit(result.status ?? 1);
