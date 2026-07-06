import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('ExceptionsHandler')

    catch(exception: unknown, host: ArgumentsHost) {

        const ctx = host.switchToHttp()
        const req = ctx.getRequest<Request>()
        const res = ctx.getResponse<Response>()

        const isHttpException = exception instanceof HttpException
        const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
        const body = isHttpException ? exception.getResponse() : { message: 'Internal server error', error: 'Internal Server Error', statusCode: status }

        const stack = exception instanceof Error ? exception.stack : undefined
        this.logger.error(`${req.method} ${req.originalUrl} -> ${status}: ${exception instanceof Error ? exception.message : String(exception)}`, stack)

        res.status(status).json(body)
    }
}
