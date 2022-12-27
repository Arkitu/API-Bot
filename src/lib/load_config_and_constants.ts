import { JsonDB } from "node-json-db";

const configModel = {
  token: "string",
  adminServerId: "string",
  appId: "string",
  adminIds: "object"
}

export default function loadConfigAndConstants() {
  global.config = new JsonDB("config", false, true)
  global.constants = new JsonDB("constants", true, true);
  for (const [key, type] of Object.entries(configModel)) {
    if (typeof config.getData("/"+key) !== type) {
      throw new Error(`Config key ${key} is not of type ${type} but instead is of type ${typeof config.getData("/"+key)}`);
    }
  }
}