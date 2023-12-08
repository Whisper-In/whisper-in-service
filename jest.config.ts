import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
    transform: {
        '\\.[jt]sx?$': 'ts-jest'
    },
    testPathIgnorePatterns: ["/node_modules/", "./__tests__/setup.ts", "./__tests__/mocks"],
    setupFilesAfterEnv: ["./__tests__/setup.ts"],
    resolver: "jest-ts-webcompat-resolver"
}

export default config;