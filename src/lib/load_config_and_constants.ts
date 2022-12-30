import { JsonDB } from "node-json-db";

const configModel = {
  apiKeys: {
    discord: "abc",
    rapidApi: "abc",
    nasa: "abc",
    trefle: "abc"
  },
  appId: "abc",
  adminServerId: "abc",
  adminIds: ["abc"],
};

export default function loadConfigAndConstants() {
  global.config = new JsonDB("config", false, true)
  global.constants = new JsonDB("constants", true, true);
  // Check if config is valid
  for (const [key, val] of Object.entries(configModel)) {
    if (typeof val === "object") {
      for (const [subKey, subVal] of Object.entries(val as Record<string, string>)) {
        if (typeof config.getData("/"+key+"/"+subKey) !== typeof subVal) {
          throw new Error(`Config key ${key}/${subKey} is not of type ${typeof subVal} but instead is of type ${typeof config.getData("/"+key+"/"+subKey)}`);
        }
      }
    } else if (typeof config.getData("/"+key) !== typeof val) {
      throw new Error(`Config key ${key} is not of type ${typeof val} but instead is of type ${typeof config.getData("/"+key)}`);
    }
  }
}