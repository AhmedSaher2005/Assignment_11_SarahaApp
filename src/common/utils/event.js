import { EventEmitter } from "events";
export const eventEmitter = new EventEmitter();

eventEmitter.on("cofirm_email",async (fn) => {
    fn()
})