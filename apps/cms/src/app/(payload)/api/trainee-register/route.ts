import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'password', 'srn',
      'emergencyFirstName', 'emergencyMiddleName', 'emergencyLastName',
      'emergencyContactNumber', 'emergencyRelationship', 'emergencyCompleteAddress'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Step 1: Create user account (trigger will NOT create trainee record)
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
        phone: body.phoneNumber,
        username: body.username,
        password: body.password,
        role: 'trainee'
      }
    })

    // Step 2: Create trainee record with SRN (trigger skipped this)
    const trainee = await payload.create({
      collection: 'trainees',
      data: {
        user: user.id,
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
        middleName: body.emergencyMiddleName || '',
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
    })

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

    // Handle specific PayloadCMS validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: (error as { data?: unknown; message: string }).data || error.message
        },
        { status: 400 }
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
        { status: 409 }
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
      { status: 500 }
    )
  }
}
