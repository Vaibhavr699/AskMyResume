import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API called with headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.json();
    const { resumeId, question } = body;

    console.log('Chat API request body:', { resumeId, question });

    if (!resumeId || !question) {
      console.error('Missing required fields:', { resumeId, question });
      return NextResponse.json(
        { error: 'Resume ID and question are required' },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    console.log('Forwarding request to backend:', `${backendUrl}/rag/chat`);
    
    const response = await fetch(`${backendUrl}/rag/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ resumeId, question }),
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return NextResponse.json(
        { error: errorData.message || `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error in chat API:', {
      error: error,
      message: errorMessage,
      stack: errorStack
    });
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 