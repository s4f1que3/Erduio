import * as nodemailer from 'nodemailer'
import { Injectable } from '@nestjs/common'
import type { Transporter } from 'nodemailer'

@Injectable()
export class Email {

    private transporter: Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
    }
    
    get mail(): Transporter {
        return this.transporter
    }
}

    