import * as dotenv from "dotenv";

dotenv.config();

const {
    GATHER_MAP_ID,
    GATHER_SPACE_ID,
    GATHER_API_KEY
  } = process.env;

const config = Object.freeze({
    gather: {
        SPACE_ID: GATHER_SPACE_ID,
        API_KEY: GATHER_API_KEY,
        MAP_ID: GATHER_MAP_ID,
    },
});

export default config;