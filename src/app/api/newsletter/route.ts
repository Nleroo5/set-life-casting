import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, phone, city, state } = await request.json();

    // Validate required fields
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Call MailerLite API
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        fields: {
          name: firstName,
          last_name: lastName,
          phone: phone,
          city: city,
          state: state,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MailerLite error:', data);

      // Handle duplicate email gracefully
      if (response.status === 422 && data.message?.includes('already exists')) {
        return NextResponse.json(
          { message: 'You are already subscribed!' },
          { status: 200 }
        );
      }

      // Handle subscriber limit error
      if (response.status === 422 && data.message?.toLowerCase().includes('subscriber limit')) {
        return NextResponse.json(
          { message: 'Thank you for your interest! Please contact us directly to join our mailing list.' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: data.message || 'Failed to subscribe' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
