import { BadRequestException } from "@nestjs/common"

// if the role is owner (me) pull the school id from params because i dont have one
// else, pull from metadata

export function resolveSchoolId(req) {
    if (req.role === 'owner') {
        const override = req.query.school_id
        if(!override) throw new BadRequestException('School ID needed')
        return override
    }
    return req.user.app_metadata.school_id
}