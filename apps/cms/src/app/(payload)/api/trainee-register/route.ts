import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Type for the request body
interface TraineeRegistrationBody {
  firstName: string
  lastName: string
  middleName?: string
  nameExtension?: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  civilStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'separated'
  nationality: string
  birthDate: string
  placeOfBirth: string
  completeAddress: string
  email: string
  phoneNumber: string
  username: string
  password: string
  srn: string
  couponCode?: string
  emergencyFirstName: string
  emergencyMiddleName?: string
  emergencyLastName: string
  emergencyContactNumber: string
  emergencyRelationship: 'parent' | 'spouse' | 'sibling' | 'child' | 'guardian' | 'friend' | 'relative' | 'other'
  emergencyCompleteAddress: string
}

// CORS headers for all responses
const getAllowedOrigins = () => {
  const localOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
  ]

  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : []

  return [...localOrigins, ...envOrigins].filter(Boolean)
}

const getCorsHeaders = (origin?: string | null) => {
  const allowedOrigins = getAllowedOrigins()

  // If no origin (direct API call) or origin is allowed, use the origin
  // Otherwise, use the first allowed origin as fallback
  let allowedOrigin = allowedOrigins[0] // Default fallback

  if (origin && allowedOrigins.includes(origin)) {
    allowedOrigin = origin
  }

  console.log(`CORS: Request from origin: ${origin}, Allowing: ${allowedOrigin}`)

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin', // Important for caching with multiple origins
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  let body: TraineeRegistrationBody = {} as TraineeRegistrationBody // Declare body outside try block for error logging

  try {
    const payload = await getPayload({ config: configPromise })
    body = await request.json()

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'password', 'srn',
      'emergencyFirstName', 'emergencyLastName', // emergencyMiddleName is not required from form
      'emergencyContactNumber', 'emergencyRelationship', 'emergencyCompleteAddress'
    ]

    for (const field of requiredFields) {
      const fieldValue = (body as unknown as Record<string, unknown>)[field]
      if (!fieldValue) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Step 1: Create user account (trigger will automatically create trainee record)
    const user = await payload.create({
      collection: 'users',
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName || '',
        nameExtension: body.nameExtension || '',
        gender: body.gender,
        civilStatus: body.civilStatus,
        nationality: body.nationality,
        birthDate: body.birthDate,
        placeOfBirth: body.placeOfBirth,
        completeAddress: body.completeAddress,
        email: body.email,
        phone: body.phoneNumber, // Form sends phoneNumber, PayloadCMS expects phone
        username: body.username,
        password: body.password,
        role: 'trainee'
      }
    })

    // Step 2: Find the trainee record created by the trigger and update it with SRN
    const traineeRecords = await payload.find({
      collection: 'trainees',
      where: {
        user: {
          equals: user.id
        }
      }
    })

    if (traineeRecords.docs.length === 0) {
      throw new Error('Trainee record was not created by trigger')
    }

    const trainee = await payload.update({
      collection: 'trainees',
      id: traineeRecords.docs[0].id,
      data: {
        srn: body.srn,
        couponCode: body.couponCode || '',
        enrollmentDate: new Date().toISOString(),
        currentLevel: 'beginner'
      }
    })

    // Step 3: Create emergency contact
    const emergencyContact = await payload.create({
      collection: 'emergency-contacts',
      data: {
        user: user.id,
        firstName: body.emergencyFirstName,
        middleName: body.emergencyMiddleName || 'N/A', // Required field, use N/A if empty
        lastName: body.emergencyLastName,
        contactNumber: body.emergencyContactNumber,
        relationship: body.emergencyRelationship,
        completeAddress: body.emergencyCompleteAddress,
        isPrimary: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Trainee registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        trainee: {
          id: trainee.id,
          srn: trainee.srn
        },
        emergencyContact: {
          id: emergencyContact.id,
          firstName: emergencyContact.firstName,
          lastName: emergencyContact.lastName
        }
      }
    }, { headers: corsHeaders })

  } catch (error: unknown) {
    console.error('Trainee registration error:', error)

    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    // Log the full error object
    console.error('Full error object:', JSON.stringify(error, null, 2))

    // Log the request body for debugging (without sensitive data)
    console.error('Request body (sanitized):', {
      ...body,
      password: '[REDACTED]',
      confirmPassword: '[REDACTED]'
    })

    // Handle specific PayloadCMS validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: (error as { data?: unknown; message: string }).data || error.message
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Handle duplicate key errors (email, username, SRN already exists)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      let field = 'field'
      const detail = 'detail' in error ? String(error.detail) : ''
      if (detail.includes('email')) field = 'email'
      else if (detail.includes('username')) field = 'username'
      else if (detail.includes('srn')) field = 'SRN'

      return NextResponse.json(
        { error: `This ${field} is already registered` },
        { status: 409, headers: corsHeaders }
      )
    }

    // Return more detailed error information in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        error: 'Registration failed. Please try again.',
        ...(isDevelopment && {
          details: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.name : typeof error
        })
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
