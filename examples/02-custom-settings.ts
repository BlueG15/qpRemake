import { AutoInputOption, DefaultSetting } from "../index";

export function customSettingsExample() {
  const setting = new DefaultSetting();

  setting.auto_input = AutoInputOption.first;
  setting.mods = ["fruit"];
  setting.parser_modules = ["qpOriginal", "expression"];
  setting.display_default_gamerules = true;

  return setting;
}
