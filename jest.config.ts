import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
    transform: {
        '\\.[jt]sx?$': 'ts-jest'
    },
    setupFilesAfterEnv: ["./tests/setup.js"],
    resolver: "jest-ts-webcompat-resolver"
}

export default config;