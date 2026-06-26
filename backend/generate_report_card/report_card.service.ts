import { Injectable } from "@nestjs/common";
import { supabaseService } from "supabase_service/supabase.service";
import { uuidSwapService } from "pipes/transformuuid.pipe";
import { subjectAttendanceService } from "attendance/subject/subject_attendance.service";
import PDFDocument from "pdfkit";
import { InternalServerErrorException, BadRequestException } from "@nestjs/common";

@Injectable()
export class ReportCardService {
    constructor(
        private readonly supabase: supabaseService,
        private readonly swap: uuidSwapService,
        private readonly subjectAttendance: subjectAttendanceService,
    ) {}

    async isGradesEndpointOpen(school_id: string, term: number) {
        const { data, error } = await this.supabase.db
            .from('Grade_Endpoint_Status')
            .select('is_open')
            .eq('school_id', school_id)
            .eq('term_number', term)
            .maybeSingle()

        if (error) throw new InternalServerErrorException (error.message)
        return data?.is_open ?? false
    }

    async setGradesEndpointStatus(school_id: string, term: number, is_open: boolean) {
        const { data, error } = await this.supabase.db
            .from('Grade_Endpoint_Status')
            .upsert({ school_id, term_number: term, is_open }, { onConflict: 'school_id, term_number' })

        if (error) throw new InternalServerErrorException (error.message)
        return data
    }

    async submitGrades(school_id: string, class_subject_id: string, teacher_id: string, term: number, records: { student_id: string, grade: number, comment?: string }[]) {
        const isOpen = await this.isGradesEndpointOpen(school_id, term)
        if (!isOpen) throw new InternalServerErrorException ('Grade submission is closed for this term')

        const rows = records.map(({ student_id, grade, comment }) => ({
            school_id,
            class_subject_id,
            teacher_id,
            student_id,
            grade,
            term,
            comment: comment ?? null
        }))

        const { data, error } = await this.supabase.db
            .from('Grades')
            .upsert(rows, {
                onConflict: 'student_id, class_subject_id, term',
                ignoreDuplicates: false
            })

        if (error) throw new InternalServerErrorException (error.message)
        return data
    }

    async getStudentGradeSheet(school_id: string, class_id: string, student_id: string, term: number) {
        const isOpen = await this.isGradesEndpointOpen(school_id, term)

        const { data: subjects, error } = await this.supabase.db
            .from('Class_Subjects')
            .select('id, name')
            .eq('school_id', school_id)
            .eq('class_id', class_id)

        if (error) throw new InternalServerErrorException(error.message)

        const subjectIds = (subjects ?? []).map((s) => s.id)

        const { data: grades, error: gerror } = await this.supabase.db
            .from('Grades')
            .select('class_subject_id, grade, comment')
            .eq('school_id', school_id)
            .eq('student_id', student_id)
            .eq('term', term)
            .in('class_subject_id', subjectIds.length > 0 ? subjectIds : [''])

        if (gerror) throw new InternalServerErrorException(gerror.message)

        const bySubject = new Map((grades ?? []).map((g) => [g.class_subject_id, g]))

        return {
            is_open: isOpen,
            subjects: (subjects ?? []).map((s) => ({
                class_subject_id: s.id,
                subject_name: s.name,
                grade: bySubject.get(s.id)?.grade ?? null,
                comment: bySubject.get(s.id)?.comment ?? null,
            })),
        }
    }

    async submitStudentGrades(school_id: string, student_id: string, teacher_id: string, term: number, records: { class_subject_id: string, grade: number, comment?: string }[]) {
        const isOpen = await this.isGradesEndpointOpen(school_id, term)
        if (!isOpen) throw new InternalServerErrorException('Grade submission is closed for this term')

        const rows = records.map(({ class_subject_id, grade, comment }) => ({
            school_id,
            class_subject_id,
            teacher_id,
            student_id,
            grade,
            term,
            comment: comment ?? null,
        }))

        const { data, error } = await this.supabase.db
            .from('Grades')
            .upsert(rows, { onConflict: 'student_id, class_subject_id, term', ignoreDuplicates: false })

        if (error) throw new InternalServerErrorException(error.message)
        return data
    }

    async getClassCompletion(school_id: string, class_id: string, term: number) {
        const { data: students, error: serror } = await this.supabase.db
            .from('Students')
            .select('id, name')
            .eq('school_id', school_id)
            .eq('class_id', class_id)
            .eq('status', 'active')

        if (serror) throw new InternalServerErrorException(serror.message)

        const { data: subjects, error: subError } = await this.supabase.db
            .from('Class_Subjects')
            .select('id, name')
            .eq('school_id', school_id)
            .eq('class_id', class_id)

        if (subError) throw new InternalServerErrorException(subError.message)

        const studentIds = (students ?? []).map((s) => s.id)
        const subjectIds = (subjects ?? []).map((s) => s.id)
        const expected = studentIds.length * subjectIds.length

        const { data: grades, error: gerror } = await this.supabase.db
            .from('Grades')
            .select('student_id, class_subject_id, grade')
            .eq('school_id', school_id)
            .eq('term', term)
            .in('student_id', studentIds.length > 0 ? studentIds : [''])
            .in('class_subject_id', subjectIds.length > 0 ? subjectIds : [''])

        if (gerror) throw new InternalServerErrorException(gerror.message)

        const entered = new Set(
            (grades ?? []).filter((g) => g.grade !== null).map((g) => `${g.student_id}:${g.class_subject_id}`)
        )

        const missing: { student_id: string, student_name: string, class_subject_id: string, subject_name: string }[] = []
        for (const s of students ?? []) {
            for (const sub of subjects ?? []) {
                if (!entered.has(`${s.id}:${sub.id}`)) {
                    missing.push({ student_id: s.id, student_name: s.name ?? '', class_subject_id: sub.id, subject_name: sub.name ?? '' })
                }
            }
        }

        return {
            total_students: studentIds.length,
            total_subjects: subjectIds.length,
            entered: entered.size,
            complete: missing.length === 0 && expected > 0,
            missing,
        }
    }

    async generateClassReportCards(school_id: string, class_id: string, term: number) {
        const completion = await this.getClassCompletion(school_id, class_id, term)
        if (!completion.complete) {
            throw new BadRequestException(`Grades are incomplete: ${completion.missing.length} of ${completion.total_students * completion.total_subjects} are missing`)
        }

        const { data: students, error } = await this.supabase.db
            .from('Students')
            .select('id')
            .eq('school_id', school_id)
            .eq('class_id', class_id)
            .eq('status', 'active')

        if (error) throw new InternalServerErrorException(error.message)

        const results: { file_path: string }[] = []
        for (const s of students ?? []) {
            results.push(await this.sendReportCard(school_id, s.id, term))
        }
        return { generated: results.length }
    }

    async getReportCard(school_id: string, student_id: string, term: number) {
        const { data: grades, error } = await this.supabase.db
            .from('Grades')
            .select('grade, comment, Class_Subjects(id, name, class_id, Classes(name))')
            .eq('school_id', school_id)
            .eq('student_id', student_id)
            .eq('term', term)

        if (error) throw new InternalServerErrorException (error.message)
        if (!grades || grades.length === 0) throw new InternalServerErrorException ('No grades found for this student this term')

        const { data: student, error: studentError } = await this.supabase.db
            .from('Students')
            .select('name')
            .eq('id', student_id)
            .single()

        if (studentError) throw new InternalServerErrorException (studentError.message)

        const classSubject = grades[0].Class_Subjects as any
        const class_id = classSubject?.class_id
        const class_name = classSubject?.Classes?.name

        const total = grades.reduce((sum: number, g: any) => sum + g.grade, 0)
        const average = Math.round(total / grades.length)

        const { data: classSubjectIds, error: csError } = await this.supabase.db
            .from('Class_Subjects')
            .select('id')
            .eq('class_id', class_id)
            .eq('school_id', school_id)

        if (csError) throw new InternalServerErrorException (csError.message)

        const ids = (classSubjectIds ?? []).map((cs: any) => cs.id)

        const { data: allGrades, error: allError } = await this.supabase.db
            .from('Grades')
            .select('student_id, grade')
            .eq('school_id', school_id)
            .eq('term', term)
            .in('class_subject_id', ids)

        if (allError) throw new InternalServerErrorException (allError.message)

        const studentAverages: Record<string, number[]> = {}
        for (const g of allGrades ?? []) {
            if (!g.student_id || g.grade === null) continue
            if (!studentAverages[g.student_id]) studentAverages[g.student_id] = []
            studentAverages[g.student_id].push(g.grade)
        }

        const ranked = Object.entries(studentAverages)
            .map(([sid, g]) => ({ student_id: sid, average: Math.round(g.reduce((a, b) => a + b, 0) / g.length) }))
            .sort((a, b) => b.average - a.average)

        const rank = ranked.findIndex(r => r.student_id === student_id) + 1

        const { data: schoolRow, error: schoolError } = await this.supabase.db
            .from('Schools')
            .select('name, logo_path')
            .eq('id', school_id)
            .maybeSingle()

        if (schoolError) throw new InternalServerErrorException (schoolError.message)

        const { data: classRow, error: classError } = await this.supabase.db
            .from('Classes')
            .select('class_teacher_id')
            .eq('id', class_id)
            .maybeSingle()

        if (classError) throw new InternalServerErrorException (classError.message)

        let class_teacher_name: string | null = null
        if (classRow?.class_teacher_id) {
            const { data: teacherRow, error: teacherError } = await this.supabase.db
                .from('Teachers')
                .select('name')
                .eq('id', classRow.class_teacher_id)
                .maybeSingle()

            if (teacherError) throw new InternalServerErrorException (teacherError.message)
            class_teacher_name = teacherRow?.name ?? null
        }

        const attendanceAverages = await this.subjectAttendance.getStudentAverage(school_id, student_id)
        const attendanceBySubject = new Map(attendanceAverages.map((a) => [a.subject_id, a.average]))

        return {
            student_name: (student as any).name,
            class_name,
            class_id,
            class_teacher_name,
            school_name: schoolRow?.name ?? null,
            school_logo_path: schoolRow?.logo_path ?? null,
            term,
            average,
            rank,
            total_students: ranked.length,
            subjects: grades.map((g: any) => ({
                class_subject_id: g.Class_Subjects?.id,
                subject_name: g.Class_Subjects?.name,
                grade: g.grade,
                comment: g.comment ?? null,
                attendance_average: attendanceBySubject.get(g.Class_Subjects?.id) ?? null
            }))
        }
    }

    private buildPDF(report: Awaited<ReturnType<ReportCardService['getReportCard']>>, logoBuffer: Buffer | null): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'letter', margin: 0 })
            const chunks: Buffer[] = []

            doc.on('data', chunk => chunks.push(chunk))
            doc.on('end', () => resolve(Buffer.concat(chunks)))
            doc.on('error', reject)

            const left = 60
            const right = 552
            const contentWidth = right - left

            // double-line border frame
            doc.rect(24, 24, 564, 744).lineWidth(1.5).stroke('#222222')
            doc.rect(32, 32, 548, 728).lineWidth(0.75).stroke('#222222')

            // logo
            if (logoBuffer) {
                try {
                    doc.image(logoBuffer, left, 50, { width: 80, height: 80, fit: [80, 80] })
                } catch {
                    // malformed/unsupported image — skip rather than fail the whole report card
                }
            }

            // title block
            doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000')
                .text('OFFICIAL REPORT CARD', 160, 55, { width: 260, align: 'center' })
            doc.fontSize(15).font('Helvetica')
                .text(report.school_name ?? 'School', 160, 82, { width: 260, align: 'center' })

            // student info block, top right
            const infoX = 432
            doc.fontSize(10).font('Helvetica')
                .text(`Student name: ${report.student_name ?? ''}`, infoX, 58, { width: 120 })
                .text(`Class: ${report.class_name ?? ''}`, infoX, 76, { width: 120 })
                .text(`Term: ${report.term}`, infoX, 94, { width: 120 })

            doc.moveTo(left, 145).lineTo(right, 145).lineWidth(1).stroke('#222222')

            // position / average / class teacher row
            doc.fontSize(11).font('Helvetica')
                .text(`Position: ${report.rank} of ${report.total_students}`, left, 158, { width: 220 })
                .text(`No in class: ${report.total_students}`, left + 240, 158, { width: 220 })
                .text(`Average: ${report.average}%`, left, 176, { width: 220 })
                .text(`Class teacher: ${report.class_teacher_name ?? 'Not assigned'}`, left + 240, 176, { width: 220 })

            // table
            const colSubject = left
            const colGrade = left + 110
            const colAttendance = left + 190
            const colRemarks = left + 320
            const tableRight = right
            const headerY = 210
            const headerHeight = 24

            doc.rect(colSubject, headerY, tableRight - colSubject, headerHeight).fill('#e5e5e5')
            doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold')
                .text('Subject', colSubject + 6, headerY + 7, { width: colGrade - colSubject - 10 })
                .text('Grade', colGrade + 6, headerY + 7, { width: colAttendance - colGrade - 10 })
                .text('Attendance Average', colAttendance + 6, headerY + 7, { width: colRemarks - colAttendance - 10 })
                .text("Teacher's remarks", colRemarks + 6, headerY + 7, { width: tableRight - colRemarks - 10 })

            let rowY = headerY + headerHeight
            doc.font('Helvetica').fontSize(10)

            for (const s of report.subjects) {
                const remarksText = s.comment ?? '—'
                const remarksWidth = tableRight - colRemarks - 12
                const remarksHeight = doc.heightOfString(remarksText, { width: remarksWidth })
                const rowHeight = Math.max(24, remarksHeight + 10)

                doc.text(s.subject_name ?? '', colSubject + 6, rowY + 6, { width: colGrade - colSubject - 10 })
                doc.text(s.grade !== null ? `${s.grade}%` : '—', colGrade + 6, rowY + 6, { width: colAttendance - colGrade - 10 })
                doc.text(s.attendance_average !== null ? `${s.attendance_average}%` : '—', colAttendance + 6, rowY + 6, { width: colRemarks - colAttendance - 10 })
                doc.text(remarksText, colRemarks + 6, rowY + 6, { width: remarksWidth })

                rowY += rowHeight
                doc.moveTo(colSubject, rowY).lineTo(tableRight, rowY).lineWidth(0.5).stroke('#bbbbbb')
            }

            const tableBottom = rowY
            // vertical grid lines
            for (const x of [colSubject, colGrade, colAttendance, colRemarks, tableRight]) {
                doc.moveTo(x, headerY).lineTo(x, tableBottom).lineWidth(0.5).stroke('#bbbbbb')
            }
            doc.moveTo(colSubject, headerY).lineTo(tableRight, headerY).lineWidth(0.5).stroke('#bbbbbb')

            // footer disclaimer
            doc.fontSize(9).font('Helvetica-Oblique').fillColor('#444444')
                .text(
                    `This is an official report card from ${report.school_name ?? 'the school'}. However, please contact the school to confirm validity of data displayed if needed.`,
                    left, 730, { width: contentWidth, align: 'center' }
                )

            doc.end()
        })
    }

    private async downloadLogo(logoPath: string | null): Promise<Buffer | null> {
        if (!logoPath) return null

        const { data, error } = await this.supabase.db.storage
            .from('logos')
            .download(logoPath)

        if (error || !data) return null

        const arrayBuffer = await data.arrayBuffer()
        return Buffer.from(arrayBuffer)
    }

    async sendReportCard(school_id: string, student_id: string, term: number) {
        const report = await this.getReportCard(school_id, student_id, term)
        const logoBuffer = await this.downloadLogo(report.school_logo_path)

        const pdfBuffer = await this.buildPDF(report, logoBuffer)

        const filePath = `${school_id}/${student_id}/term_${term}_report_card.pdf`

        const { error: uploadError } = await this.supabase.db.storage
            .from('report_cards')
            .upload(filePath, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            })

        if (uploadError) throw new InternalServerErrorException (uploadError.message)

        const { error: deleteError } = await this.supabase.db
            .from('Report_Cards')
            .delete()
            .eq('school_id', school_id)
            .eq('file_path', filePath)

        if (deleteError) throw new InternalServerErrorException (deleteError.message)

        const { error: tableError } = await this.supabase.db
            .from('Report_Cards')
            .insert({
                school_id,
                student_id,
                class_id: report.class_id,
                file_path: filePath,
                title: `Term ${term} Report Card`
            })

        if (tableError) throw new InternalServerErrorException (tableError.message)

        const subjectLines = report.subjects
            .map((s: any) => `${s.subject_name}: ${s.grade}%${s.comment ? ` — ${s.comment}` : ''}`)
            .join('\n')

        const content = `Student: ${report.student_name}\nClass: ${report.class_name}\nTerm: ${report.term}\nAverage: ${report.average}%\nRank: ${report.rank} of ${report.total_students}\n\n${subjectLines}`

        const auth_id = await this.swap.swapUUIDFromIdToAuth(school_id, student_id)

        const { error: announcementError } = await this.supabase.db
            .from('Announcement_personal')
            .insert({
                school_id,
                target_id: auth_id,
                title: `Term ${term} Report Card`,
                content
            })

        if (announcementError) throw new InternalServerErrorException (announcementError.message)

        return { file_path: filePath }
    }
}
