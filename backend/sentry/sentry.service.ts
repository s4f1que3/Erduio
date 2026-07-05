import * as sentry from "@sentry/nestjs"
import { Injectable } from "@nestjs/common"

type errors = "fatal" | "error" | "warning" | "log" | "debug" | "info"

@Injectable()
export class sentryService {

    async sentryException (exception: any) {
        await sentry.captureException(exception)
    }

    async sentryMessage (message: string, level: errors) {
       await sentry.captureMessage(message, level)
    }
}