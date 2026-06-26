import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from "@nestjs/common";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { supabaseService } from "supabase_service/supabase.service";
import { termsService } from "terms/terms.service";

@Injectable()
export class assignmentService {


    constructor(
        private readonly supabase: supabaseService,
        private readonly swap: uuidSwapService
    ){}

    async createAssingment(name: string, school_id: string, due_date: string, content: string, subject_id: string, teacher_id: string, attatchment?: Express.Multer.File) {
        if(attatchment) {
            const path = `${school_id}/assignments/${subject_id}/${crypto.randomUUID()}`
            const {data: fdata, error: ferror} = await this.supabase.db.storage
            .from('assignments')
            .upload(path, attatchment.buffer, {contentType: attatchment.mimetype})

            if(ferror) {
                throw new InternalServerErrorException(ferror.message)
            } else {
                const {data, error} = await this.supabase.db
                .from('Assignments')
                .insert({
                    name: name,
                    description: content,
                    due_date: due_date,
                    teacher_id: teacher_id,
                    subject_id: subject_id,
                    school_id: school_id,
                    file_path: path,
                })

                if(error) throw new InternalServerErrorException(error.message)
                return data && fdata
            }

        } else {
            const {data: ndata, error: nerror} = await this.supabase.db
            .from('Assignments')
            .insert({
                name: name,
                description: content,
                due_date: due_date,
                teacher_id: teacher_id,
                subject_id: subject_id,
                school_id: school_id,
            })

            if(nerror) throw new InternalServerErrorException(nerror.message)
            return ndata
        }
    }

    async deleteAssignment (school_id: string, assignment_id: string) {
        const path = await this.getFilePathIfExists(school_id, assignment_id)
        if(path) {
            const{error: ferror} = await this.supabase.db.storage
            .from('assignments')
            .remove(path as any)
            if(ferror) throw new InternalServerErrorException(ferror.message)

            const{data: sdata, error: serror} = await this.supabase.db
            .from('Submissions')
            .select('file_path')
            .eq('school_id', school_id)
            .eq('assignment_id', assignment_id)

            const paths = (sdata ?? []).map(s => s.file_path).filter((p): p is string => !!p)

            if(paths.length) {
                const {error: terror} = await this.supabase.db.storage
                .from('submissions')
                .remove(paths)
                if(terror) throw new InternalServerErrorException(terror.message)
            }

            if(serror) throw new InternalServerErrorException(serror.message)
            
            const {error} = await this.supabase.db
            .from('Assignments')
            .delete()
            .eq('school_id', school_id)
            .eq('id', assignment_id)

            if(error) throw new InternalServerErrorException(error.message)

        } else {

            const{data: sdata, error: serror} = await this.supabase.db
            .from('Submissions')
            .select('file_path')
            .eq('school_id', school_id)
            .eq('assignment_id', assignment_id)

            const paths = (sdata ?? []).map(s => s.file_path).filter((p): p is string => !!p)

            if(paths.length) {
                const {error: terror} = await this.supabase.db.storage
                .from('submissions')
                .remove(paths)
                if(terror) throw new InternalServerErrorException(terror.message)
            }

            if(serror) throw new InternalServerErrorException(serror.message)
            
            const {error} = await this.supabase.db
            .from('Assignments')
            .delete()
            .eq('school_id', school_id)
            .eq('id', assignment_id)

            if(error) throw new InternalServerErrorException(error.message)
            
        }
    }

    async getAllAssignmentsForAdmins(school_id: string, filters: { subject_id?: string, teacher_id?: string, status?: string }) {
        let query = this.supabase.db.from('Assignments').select('*').eq('school_id', school_id)

        if (filters.subject_id) query = query.eq('subject_id', filters.subject_id)
        if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id)
        if (filters.status === 'current') query = query.gte('due_date', new Date().toISOString())
        if (filters.status === 'past') query = query.lte('due_date', new Date().toISOString())

        const { data, error } = await query
        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    /* this is for plain fetching with no queries. because the above is unfetchable by students
    so there must be one that they can fetch
    */
    async getAllAssignmentsForSubject(school_id: string, subject_id: string) {
        const {data, error} = await this.supabase.db
        .from('Assignments')
        .select('*')
        .eq('school_id', school_id)
        .eq('subject_id', subject_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }


    /// lets teachers see assignments within THEIR scope
    async getAllAssignmentsForTeachers(school_id: string, teacher_id: string, filters: { subject_id?: string, status?: string }) {
        let query = this.supabase.db.from('Assignments').select('*').eq('school_id', school_id).eq('teacher_id', teacher_id)

        if (filters.subject_id) query = query.eq('subject_id', filters.subject_id)
        if (filters.status === 'current') query = query.gte('due_date', new Date().toISOString())
        if (filters.status === 'past') query = query.lte('due_date', new Date().toISOString())

        const { data, error } = await query
        if (error) throw new InternalServerErrorException(error.message)
        return data
    }





    //SUBMISSIONS

    /// lets students see within THEIR scope
    async getAllAssignmentSubmissionsForStudents(school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Submissions')
        .select('*')
        .eq('school_id', school_id)
        .eq('students_id', student_id)


        if (error) throw new InternalServerErrorException(error.message)
        return data
    }


    async uploadSubmission (school_id: string, assignment_id: string, student_id: string, upload: Express.Multer.File) {
        const now = new Date()
        const {data: cdata, error: cerror} = await this.supabase.db
        .from('Assignments')
        .select('due_date')
        .eq('school_id', school_id)
        .eq('id', assignment_id)
        .maybeSingle()

        const {data: ndata, error: nerror} = await this.supabase.db
        .from('Assignment_Extension_Student')
        .select('due_date')
        .eq('assignment_id', assignment_id)
        .eq('student_id', student_id)
        .maybeSingle()

        if(cerror || nerror) {
            throw new InternalServerErrorException(cerror?.message || nerror?.message)
        } else {
            const dueDate = cdata?.due_date ? new Date(cdata.due_date) : null
            const extendedDueDate = ndata?.due_date ? new Date(ndata.due_date) : null

            const pastOriginalDueDate = dueDate ? now > dueDate : false
            const hasValidExtension = extendedDueDate ? now <= extendedDueDate : false

            if(pastOriginalDueDate && !hasValidExtension) {
                throw new BadRequestException("Pass due date")
            } else {
                const path = `${school_id}/assignment/${assignment_id}/upload/${student_id}/${crypto.randomUUID()}`
                const {data: fdata, error: ferror} = await this.supabase.db.storage
                .from('submissions')
                .upload(path, upload.buffer, {contentType: upload.mimetype})

                if(ferror) {
                    throw new InternalServerErrorException(ferror.message)
                } else {
                    const {data, error} = await this.supabase.db
                    .from('Submissions')
                    .insert({
                        file_path: path,
                        students_id: student_id,
                        assignment_id: assignment_id,
                        school_id: school_id,
                    })

                    if(error) throw new InternalServerErrorException(error.message)
                    return data && fdata
                }   
            }
        }
    }


    async getSubmissionsForAssignment(school_id: string, assignment_id: string) {
        const {data, error} = await this.supabase.db
        .from('Submissions')
        .select('*')
        .eq('school_id', school_id)
        .eq('assignment_id', assignment_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async extendAssignment (school_id: string, assignment_id: string, due_date: string) {
        const {data, error} = await this.supabase.db
        .from('Assignments')
        .update({
            due_date: due_date
        })
        .eq('school_id', school_id)
        .eq('id', assignment_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async extendAssignmentForStudent (school_id: string, assignment_id: string, due_date: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Assignment_Extension_Student')
        .insert({
            due_date: due_date,
            assignment_id: assignment_id,
            student_id: student_id,
            school_id: school_id
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getFilePathIfExists (school_id: string, assignment_id: string) {
        const {data, error} = await this.supabase.db
        .from('Assignments')
        .select('file_path')
        .eq('id', assignment_id)
        .eq('school_id', school_id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        return data?.file_path

    }

    async getFilePathIfExistsForSubmissions (school_id: string, assignment_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Submissions')
        .select('file_path')
        .eq('assignment_id', assignment_id)
        .eq('school_id', school_id)
        .eq('students_id', student_id)
        .single()

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.file_path) throw new NotFoundException('Submission file not found')
        return data.file_path ?? null

    }

    async addStudentGradeForAssignment (school_id: string, student_id: string, assignment_id: string, grade: string, message?: string) {
        if(message) {
            const {data, error} = await this.supabase.db
            .from('Assignments_Grades')
            .upsert({
                student_id: student_id,
                assignment_id: assignment_id,
                grade: grade,
                message: message,
                school_id: school_id
            },{
                onConflict: 'school_id, assignment_id, student_id', 
                ignoreDuplicates: true
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        } else {
            const {data, error} = await this.supabase.db
            .from('Assignments_Grades')
            .insert({
                student_id: student_id,
                assignment_id: assignment_id,
                grade: grade,
                school_id: school_id
            })

            if(error) throw new InternalServerErrorException(error.message)
            return data
        }
    }

    async deleteStudentGradeForAssignment (school_id: string, student_id: string, assignment_id: string) {
        const {data, error} = await this.supabase.db
        .from('Assignments_Grades')
        .delete()
        .eq('school_id', school_id)
        .eq('assignment_id', assignment_id)
        .eq('student_id', student_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async changeStudentGradeForAssignment (school_id: string, student_id: string, assignment_id: string, grade: string, message?: string) {
        if(message) {
            const {data, error} = await this.supabase.db
            .from('Assignments_Grades')
            .update({
                grade: grade,
                message: message
            })
            .eq('school_id', school_id)
            .eq('assignment_id', assignment_id)
            .eq('student_id', student_id)

            if(error) throw new InternalServerErrorException(error.message)
            return data

        } else {
            const {data: ndata, error: nerror} = await this.supabase.db
            .from('Assignments_Grades')
            .update({
                grade: grade
            })
            .eq('school_id', school_id)
            .eq('assignment_id', assignment_id)
            .eq('student_id', student_id)

            if(nerror) throw new InternalServerErrorException(nerror.message)
            return ndata
        }

    }

    async getAssignmentGrade(school_id: string, assignment_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Assignments_Grades')
        .select('grade')
        .eq('school_id', school_id)
        .eq('assignment_id', assignment_id)
        .eq('student_id', student_id)
        .maybeSingle()

        if(error) throw new InternalServerErrorException(error.message)
        return data?.grade
    }

    async getAssignmentViews (school_id: string, assignment_id: string) {
        const {data, error} = await this.supabase.db
        .from('Assignment_Views')
        .select('*')
        .eq('assignment_id', assignment_id)
        .eq('school_id', school_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getSignedUrlForAssignments (school_id: string, id: string) {
        const path = await this.getFilePathIfExists(school_id, id)
        if(!path) return null
        const {data, error} = await this.supabase.db.storage
        .from('assignments')
        .createSignedUrl(path, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new InternalServerErrorException('Failed to generate signed URL for assignment file')
        return data.signedUrl
    }

    async insertStudentViewedAssignment (school_id: string, assignment_id: string, student_id: string) {
        const user_id = await this.swap.swapUUID(school_id, student_id)
        const {data, error} = await this.supabase.db
        .from('Assignment_Views')
        .insert({
            school_id: school_id,
            assignment_id: assignment_id,
            student_id: user_id
        })

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getSignedUrlForASubmission(school_id: string, id: string, student_id: string) {
        const path = await this.getFilePathIfExistsForSubmissions(school_id, id, student_id)
        const {data, error} = await this.supabase.db.storage
        .from('submissions')
        .createSignedUrl(path as string, 3600)

        if(error) throw new InternalServerErrorException(error.message)
        if(!data?.signedUrl) throw new InternalServerErrorException('Failed to generate signed URL for submission file')
        return data.signedUrl
    }

    async downloadSubmission (school_id: string, assignment_id: string, student_id: string) {
        const path = await this.getFilePathIfExistsForSubmissions(school_id, assignment_id, student_id)
        const {data, error} = await this.supabase.db.storage
        .from('submissions')
        .download(path)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getAllGradesForStudentAssignmets (school_id: string, student_id: string) {
        const {data, error} = await this.supabase.db
        .from('Assignments_Grades')
        .select('*')
        .eq('school_id', school_id)
        .eq('student_id', student_id)

        if(error) throw new InternalServerErrorException(error.message)
        return data
    }








}
