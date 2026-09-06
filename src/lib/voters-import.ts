import * as XLSX from 'xlsx'
import { formatPhoneNumber } from './utils'

export interface ParsedVoterRow {
  student_id: string
  full_name: string
  phone: string
  email?: string
  programme?: string
  study_center?: string
  year_group?: string
  error?: string
}

export function parseVotersFile(buffer: Buffer | ArrayBuffer): {
  voters: ParsedVoterRow[]
  errors: string[]
} {
  const errors: string[] = []
  const voters: ParsedVoterRow[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
      return { voters: [], errors: ['No sheet found in workbook'] }
    }

    const worksheet = workbook.Sheets[firstSheetName]
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' })

    if (!rawData || rawData.length === 0) {
      return { voters: [], errors: ['File contains no data'] }
    }

    rawData.forEach((row, index) => {
      const rowNum = index + 2 // 1-indexed header is line 1

      // Find field names with case-insensitive matching
      const keys = Object.keys(row)
      const findVal = (names: string[]) => {
        const key = keys.find((k) => names.includes(k.trim().toLowerCase()))
        return key ? String(row[key]).trim() : ''
      }

      const student_id = findVal(['student_id', 'studentid', 'index_number', 'indexno', 'id', 'student id'])
      const full_name = findVal(['full_name', 'fullname', 'name', 'student_name', 'student name'])
      const phone = findVal(['phone', 'phone_number', 'mobile', 'telephone', 'contact'])
      const email = findVal(['email', 'email_address', 'mail'])
      const programme = findVal(['programme', 'program', 'course', 'department'])
      const study_center = findVal(['study_center', 'center', 'centre', 'campus', 'study center'])
      const year_group = findVal(['year_group', 'year', 'level', 'class'])

      if (!student_id) {
        errors.push(`Row ${rowNum}: Missing Student ID`)
        return
      }
      if (!full_name) {
        errors.push(`Row ${rowNum} (${student_id}): Missing Full Name`)
        return
      }
      if (!phone) {
        errors.push(`Row ${rowNum} (${student_id}): Missing Phone Number`)
        return
      }

      voters.push({
        student_id,
        full_name,
        phone: formatPhoneNumber(phone),
        email: email || undefined,
        programme: programme || undefined,
        study_center: study_center || undefined,
        year_group: year_group || undefined,
      })
    })

    return { voters, errors }
  } catch (err: any) {
    return { voters: [], errors: [`Failed to parse file: ${err.message || err}`] }
  }
}
