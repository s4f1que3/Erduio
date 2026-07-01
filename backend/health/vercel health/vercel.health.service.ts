import { Injectable } from "@nestjs/common";


@Injectable()
export class vercelHealthService {

    async getHealth() {
        const results: Record <any, boolean> = {}
        // check 1 - Public api endpoit
        try {
            const res = await fetch('https://www.vercel-status.com/api/v2/status.json')
            const json = await res.json()
            results.platform = json.status?.indicator === 'none'
        } catch {
            results.platform = false
        }

        // checl 2 - frontend ping
        try {
            const res = await fetch(process.env.FRONTEND_URL + '/api/health', {
                signal: AbortSignal.timeout(5000)
            })
            results.frontend = res.ok
        } catch {
            results.frontend = false
        }

        return {
            status: Object.values(results).every(Boolean) ? 'Running' : 'Down',
            checks: results,
            timestamp: `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US')}`
        }
    }
}