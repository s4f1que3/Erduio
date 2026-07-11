import { BrevoClient } from "@getbrevo/brevo";
import { Injectable } from "@nestjs/common";

@Injectable()
export class brevoClient {
    private brevo: BrevoClient;

    constructor() {
        const apiKey = process.env.BREVO_API;
        if (!apiKey) {
            throw new Error("BREVO_API environment variable is not set");
        }

        this.brevo = new BrevoClient({
            apiKey
        })
    }

    get mail(): BrevoClient {
        return this.brevo
    }
}