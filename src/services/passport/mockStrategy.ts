import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import passport from "passport";

export default class MockStrategy extends passport.Strategy {
    cb: (done: (error: any, user: any, ...args: any) => void) => {}
    user: any;

    constructor(name: string, cb: (done: (error: any, user: any, ...args: any) => void) => {}) {
        super();

        if (!name?.length) {
            throw new TypeError('MockStrategy requires a name.');
        }

        passport.Strategy.call(this);

        this.name = name;
        this.cb = cb;
    }
}

MockStrategy.prototype.authenticate = function () {
    this.cb((error: any, user: any) => {
        if (error) {
            this.fail(error);
        } else if (!user) {
            this.fail("Unauthorized")
        } else {
            this.user = user;
            this.success(user);
        }
    })
}