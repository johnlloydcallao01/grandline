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
  confirmPassword?: string // Optional for logging purposes
  srn: string
  couponCode?: string
  emergencyFirstName: string
  emergencyMiddleName?: string
  emergencyLastName: string
  emergencyContactNumber: string
  emergencyRelationship: 'parent' | 'spouse' | 'sibling' | 'child' | 'guardian' | 'friend' | 'relative' | 'other'
  emergencyCompleteAddress: string
}

// Simple CORS headers - allow all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  let body: TraineeRegistrationBody = {} as TraineeRegistrationBody // Declare body outside try block for error logging

  try {
    console.log('🚀 === TRAINEE REGISTRATION STARTED ===')

    console.log('🔧 Initializing PayloadCMS...')
    const payload = await getPayload({ config: configPromise })
    console.log('✅ PayloadCMS initialized successfully')

    console.log('📥 Parsing request body...')
    body = await request.json()
    console.log('✅ Request body parsed successfully')

    console.log('📋 Registration request received:', {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      username: body.username,
      srn: body.srn,
      emergencyFirstName: body.emergencyFirstName,
      emergencyLastName: body.emergencyLastName,
      emergencyMiddleName: body.emergencyMiddleName || 'N/A',
      hasPassword: !!body.password,
      hasConfirmPassword: !!body.confirmPassword
    })

    // Validate required fields with detailed logging
    const requiredFields = [
      'firstName', 'lastName', 'email', 'password', 'srn', 'username',
      'emergencyFirstName', 'emergencyLastName', // emergencyMiddleName is optional
      'emergencyContactNumber', 'emergencyRelationship', 'emergencyCompleteAddress'
    ]

    console.log('🔍 Validating required fields...')
    for (const field of requiredFields) {
      const fieldValue = (body as unknown as Record<string, unknown>)[field]
      if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        console.error(`❌ Missing required field: ${field}`)
        return NextResponse.json(
          {
            error: `Missing required field: ${field}`,
            field: field,
            received: fieldValue
          },
          { status: 400, headers: corsHeaders }
        )
      }
      console.log(`✅ Field ${field}: OK`)
    }
    console.log('✅ All required fields validated successfully')

    // Step 1: Create user account
    console.log('👤 Creating user account...')

    // Only include fields that are confirmed to exist in the current schema
    const userData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      role: 'trainee' as const,
      // Optional fields that exist in the current schema
      ...(body.middleName && { middleName: body.middleName }),
      ...(body.nameExtension && { nameExtension: body.nameExtension }),
      ...(body.gender && { gender: body.gender }),
      ...(body.civilStatus && { civilStatus: body.civilStatus }),
      ...(body.nationality && { nationality: body.nationality }),
      ...(body.birthDate && { birthDate: body.birthDate }),
      ...(body.placeOfBirth && { placeOfBirth: body.placeOfBirth }),
      ...(body.completeAddress && { completeAddress: body.completeAddress }),
      ...(body.phoneNumber && { phone: body.phoneNumber }),
      ...(body.username && { username: body.username }),
    }

    console.log('📋 User data to create:', {
      ...userData,
      password: '[HIDDEN]'
    })

    console.log('🔍 User data field analysis:', {
      totalFields: Object.keys(userData).length,
      requiredFields: ['firstName', 'lastName', 'email', 'password', 'role'],
      optionalFields: Object.keys(userData).filter(key => !['firstName', 'lastName', 'email', 'password', 'role'].includes(key)),
      hasAllRequired: ['firstName', 'lastName', 'email', 'password', 'role'].every(field => userData[field as keyof typeof userData])
    })

    let user;
    try {
      console.log('🔄 Attempting to create user...')
      user = await payload.create({
        collection: 'users',
        data: userData
      })

      console.log('✅ User created successfully:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      })
    } catch (userCreationError) {
      console.error('💥 USER CREATION FAILED:', userCreationError)
      console.error('📋 Data that failed:', {
        ...userData,
        password: '[HIDDEN]'
      })

      // Check if it's a duplicate key error and handle it specifically
      if (typeof userCreationError === 'object' && userCreationError !== null && 'code' in userCreationError && userCreationError.code === '23505') {
        console.error('🔍 USER CREATION - DUPLICATE KEY ERROR DETECTED')
        // Re-throw to be handled by the main error handler
        throw userCreationError
      }

      // Re-throw with more context for other errors
      throw new Error(`User creation failed: ${userCreationError instanceof Error ? userCreationError.message : String(userCreationError)}`)
    }

    // Step 2: Create trainee record manually (trigger is disabled for trainees)
    console.log('🎓 Creating trainee record...')
    const traineeData = {
      user: user.id,
      srn: body.srn,
      couponCode: body.couponCode || '',
      enrollmentDate: new Date().toISOString(),
      currentLevel: 'beginner' as const
    }

    console.log('📋 Trainee data to create:', traineeData)

    let trainee;
    try {
      console.log('🔄 Attempting to create trainee...')
      trainee = await payload.create({
        collection: 'trainees',
        data: traineeData
      })

      console.log('✅ Trainee created successfully:', {
        id: trainee.id,
        srn: trainee.srn,
        userId: trainee.user
      })
    } catch (traineeCreationError) {
      console.error('💥 TRAINEE CREATION FAILED:', traineeCreationError)
      console.error('📋 Data that failed:', traineeData)

      // Check if it's a duplicate key error and handle it specifically
      if (typeof traineeCreationError === 'object' && traineeCreationError !== null && 'code' in traineeCreationError && traineeCreationError.code === '23505') {
        console.error('🔍 TRAINEE CREATION - DUPLICATE KEY ERROR DETECTED')
        // Re-throw to be handled by the main error handler
        throw traineeCreationError
      }

      // Re-throw with more context for other errors
      throw new Error(`Trainee creation failed: ${traineeCreationError instanceof Error ? traineeCreationError.message : String(traineeCreationError)}`)
    }

    // Step 3: Create emergency contact
    console.log('🚨 Creating emergency contact...')
    const emergencyData = {
      user: user.id,
      firstName: body.emergencyFirstName,
      middleName: body.emergencyMiddleName || 'N/A', // Database requires this field, use N/A if empty
      lastName: body.emergencyLastName,
      contactNumber: body.emergencyContactNumber,
      relationship: body.emergencyRelationship,
      completeAddress: body.emergencyCompleteAddress,
      isPrimary: true
    }

    console.log('📋 Emergency contact data to create:', emergencyData)

    let emergencyContact;
    try {
      console.log('🔄 Attempting to create emergency contact...')
      emergencyContact = await payload.create({
        collection: 'emergency-contacts',
        data: emergencyData
      })

      console.log('✅ Emergency contact created successfully:', {
        id: emergencyContact.id,
        firstName: emergencyContact.firstName,
        lastName: emergencyContact.lastName,
        userId: emergencyContact.user
      })
    } catch (emergencyCreationError) {
      console.error('💥 EMERGENCY CONTACT CREATION FAILED:', emergencyCreationError)
      console.error('📋 Data that failed:', emergencyData)

      // Re-throw with more context
      throw new Error(`Emergency contact creation failed: ${emergencyCreationError instanceof Error ? emergencyCreationError.message : String(emergencyCreationError)}`)
    }

    console.log('🎉 === TRAINEE REGISTRATION COMPLETED SUCCESSFULLY ===')

    const successResponse = {
      success: true,
      message: 'Trainee registration successful! Welcome to Grandline Maritime Training Center.',
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
    }

    console.log('📤 Sending success response:', successResponse)

    return NextResponse.json(successResponse, { headers: corsHeaders })

  } catch (error: unknown) {
    console.error('💥 === TRAINEE REGISTRATION ERROR ===')
    console.error('❌ Trainee registration failed:', error)

    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)

      // Check for specific error types
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        console.error('🔍 DUPLICATE KEY ERROR DETECTED')
      }
      if (error.message.includes('validation')) {
        console.error('🔍 VALIDATION ERROR DETECTED')
      }
    }

    // Log the full error object with better formatting
    try {
      console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    } catch (jsonError) {
      console.error('❌ Could not stringify error object:', error)
    }

    // Log the request body for debugging (without sensitive data)
    console.error('📋 Request body (sanitized):', {
      ...body,
      password: '[REDACTED]',
      confirmPassword: '[REDACTED]'
    })

    console.error('💥 === END REGISTRATION ERROR ===')


    // Handle specific PayloadCMS validation errors
    if (error instanceof Error && (error.name === 'ValidationError' || error.message.includes('validation'))) {
      console.error('🔍 HANDLING VALIDATION ERROR')
      const errorData = (error as { data?: unknown; message: string }).data
      return NextResponse.json(
        {
          error: 'Registration validation failed',
          message: 'Please check your form data and try again.',
          details: errorData || error.message,
          type: 'validation'
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Handle duplicate key errors (email, username, SRN already exists)
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      console.error('🔍 HANDLING DUPLICATE KEY ERROR')
      let field = 'field'
      let friendlyField = 'field'
      let userMessage = 'This information is already registered'
      const detail = 'detail' in error ? String(error.detail) : ''
      const constraint = 'constraint' in error ? String(error.constraint) : ''

      console.error('🔍 Duplicate key details:', { detail, constraint })

      // Check for specific constraint names and details
      if (detail.includes('email') || constraint.includes('users_email_idx') || constraint.includes('email')) {
        field = 'email'
        friendlyField = 'email address'
        userMessage = 'This email address is already registered. Please use a different email address or try signing in instead.'
      } else if (detail.includes('username') || constraint.includes('users_username_idx') || constraint.includes('username')) {
        field = 'username'
        friendlyField = 'username'
        userMessage = 'This username is already taken. Please choose a different username.'
      } else if (detail.includes('srn') || constraint.includes('trainees_srn_idx') || constraint.includes('srn')) {
        field = 'srn'
        friendlyField = 'Student Registration Number (SRN)'
        userMessage = 'This Student Registration Number (SRN) is already in use. Please check your SRN or contact support if you believe this is an error.'
      } else if (detail.includes('user_id') || constraint.includes('trainees_user_idx') || constraint.includes('user')) {
        field = 'user_account'
        friendlyField = 'user account'
        userMessage = 'This user account is already associated with a trainee profile. Please contact support if you need assistance.'
      }

      return NextResponse.json(
        {
          error: userMessage,
          message: userMessage,
          field: field,
          type: 'duplicate',
          details: {
            constraint: constraint,
            detail: detail,
            friendlyField: friendlyField
          }
        },
        { status: 409, headers: corsHeaders }
      )
    }

    // Handle PayloadCMS specific errors
    if (typeof error === 'object' && error !== null && 'data' in error) {
      console.error('🔍 HANDLING PAYLOADCMS ERROR')
      const payloadError = error as { data?: unknown; message?: string; status?: number }
      return NextResponse.json(
        {
          error: 'Registration failed due to data validation',
          message: payloadError.message || 'Please check your form data and try again.',
          details: payloadError.data,
          type: 'payload'
        },
        { status: payloadError.status || 400, headers: corsHeaders }
      )
    }

    // Return more detailed error information in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    console.error('🔍 HANDLING GENERIC ERROR - Development mode:', isDevelopment)

    return NextResponse.json(
      {
        error: 'Registration failed due to an unexpected error',
        message: 'We encountered an unexpected error while processing your registration. Please try again in a few moments.',
        type: 'server_error',
        ...(isDevelopment && {
          details: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
