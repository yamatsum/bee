import {
  ActionHandler,
  Command,
} from "https://deno.land/x/cliffy@v0.25.4/command/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";
import { parse } from "https://deno.land/std@0.166.0/encoding/toml.ts";
import { copySync, existsSync } from "https://deno.land/std@0.87.0/fs/mod.ts";

const _XDG_CONFIG_HOME = Deno.env.get("XDG_CONFIG_HOME");
const _HOME = Deno.env.get("HOME");
const _ICLOUD_DRIVE = _HOME + "/Library/Mobile Documents/com~apple~CloudDocs";
const _CONFIG = _XDG_CONFIG_HOME + "/bee/config.toml";

type Application = {
  name: string;
  files?: File[];
};

type Config = {
  applications: Application[];
};

async function getToml(filePath: string) {
  try {
    return parse(await Deno.readTextFile(filePath));
  } catch (e) {
    log.error(filePath + ": " + e.message);
    Deno.exit(1);
  }
}

const backup: ActionHandler = async (options, ...args) => {
  const { applications }: Config = await getToml(_CONFIG);

  applications.map((application) => {
    // all config of application
    if (!application.files) {
      const _FROM = `${_XDG_CONFIG_HOME}/${application.name}`;
      const _TO = `${_ICLOUD_DRIVE}/.config/${application.name}`;
      // check exists
      if (!existsSync(_FROM)) {
        log.warning(`original file [${application.name}] is not exist`);
        return;
      }

      if (existsSync(_TO)) {
        log.warning(`copy file [${application.name}] already exists`);
        return;
      } else {
        // cp ~/.config/hoge ~/iCloud/.config/hoge
        copySync(_FROM, _TO);
        log.info(`copy file [${application.name}]`);

        // remove original file
        Deno.removeSync(_FROM, { recursive: true });
        log.info(`remove original file [${application.name}]`);

        // symlink
        Deno.symlink(_TO, _FROM);
        log.info(`symlink [${application.name}]`);
      }
    }
  });
};

await new Command()
  // Main command.
  .name("bee")
  .version("0.1.0")
  .description(
    "Keep your application settings in sync according to the XDG Base Directory Specification",
  )
  .globalOption("-d, --debug", "Enable debug output.")
  .action((options, ...args) => console.log("Main command called."))
  // Child command 1.
  .command("backup", "Foo sub-command.")
  .option("-f, --foo", "Foo option.")
  .arguments("<value:string>")
  .action(backup)
  //
  .parse(Deno.args);
