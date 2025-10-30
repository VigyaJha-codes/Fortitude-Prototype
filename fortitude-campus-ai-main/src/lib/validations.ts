import { z } from 'zod';

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().trim().min(1, 'Full name is required').max(100, 'Name too long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Student validation schema
export const studentSchema = z.object({
  student_id: z.string()
    .trim()
    .regex(/^STU\d{5}$/, 'Student ID must be in format STU12345')
    .max(20, 'Student ID too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  department: z.string().trim().min(1, 'Department is required').max(100, 'Department name too long'),
  year: z.number().int().min(1, 'Year must be at least 1').max(5, 'Year cannot exceed 5'),
  semester: z.number().int().min(1, 'Semester must be at least 1').max(10, 'Semester cannot exceed 10'),
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  address: z.string().trim().max(500, 'Address too long').optional(),
  date_of_birth: z.string().optional(),
});

// Faculty validation schema
export const facultySchema = z.object({
  faculty_id: z.string()
    .trim()
    .regex(/^FAC\d{5}$/, 'Faculty ID must be in format FAC12345')
    .max(20, 'Faculty ID too long'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  department: z.string().trim().min(1, 'Department is required').max(100, 'Department name too long'),
  designation: z.string().trim().min(1, 'Designation is required').max(100, 'Designation too long'),
  phone: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  office_location: z.string().trim().max(200, 'Office location too long').optional(),
  specialization: z.string().trim().max(200, 'Specialization too long').optional(),
  joining_date: z.string().optional(),
});

// Course validation schema
export const courseSchema = z.object({
  course_code: z.string()
    .trim()
    .regex(/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be in format like CS101 or MATH1001')
    .max(20, 'Course code too long'),
  course_name: z.string().trim().min(1, 'Course name is required').max(200, 'Course name too long'),
  department: z.string().trim().min(1, 'Department is required').max(100, 'Department name too long'),
  credits: z.number().int().min(1, 'Credits must be at least 1').max(10, 'Credits cannot exceed 10'),
  semester: z.number().int().min(1, 'Semester must be at least 1').max(10, 'Semester cannot exceed 10'),
  description: z.string().trim().max(1000, 'Description too long').optional(),
});

// Marks validation schema
export const marksSchema = z.object({
  marks_obtained: z.number()
    .min(0, 'Marks cannot be negative')
    .max(1000, 'Marks too high'),
  total_marks: z.number()
    .min(1, 'Total marks must be at least 1')
    .max(1000, 'Total marks too high'),
  exam_type: z.string().trim().min(1, 'Exam type is required').max(100, 'Exam type too long'),
  exam_date: z.string().min(1, 'Exam date is required'),
}).refine((data) => data.marks_obtained <= data.total_marks, {
  message: "Marks obtained cannot exceed total marks",
  path: ["marks_obtained"],
});

// Attendance validation schema
export const attendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late'], {
    errorMap: () => ({ message: 'Status must be present, absent, or late' })
  }),
  date: z.string().min(1, 'Date is required'),
});

// Search input sanitization
export const sanitizeSearchInput = (input: string): string => {
  return input
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[<>]/g, ''); // Remove potential XSS characters
};
