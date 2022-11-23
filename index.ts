import {
  ActionHandler,
  Command,
} from "https://deno.land/x/cliffy@v0.25.4/command/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

async function getJson(filePath: string) {
  try {
    return JSON.parse(await Deno.readTextFile(filePath));
  } catch (e) {
    log.error(filePath + ": " + e.message);
    Deno.exit(1);
  }
}

const backup: ActionHandler = async (options, ...args) => {
  const json = await getJson("/Users/yamatsum/.config/bee/config.jsona");
  console.log(json);
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
