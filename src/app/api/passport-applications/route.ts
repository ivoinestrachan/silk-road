import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create applications directory if it doesn't exist
    const applicationsDir = path.join(process.cwd(), 'passport-applications');
    if (!fs.existsSync(applicationsDir)) {
      fs.mkdirSync(applicationsDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const filename = `application-${timestamp}.txt`;
    const filepath = path.join(applicationsDir, filename);

    // Format the application data
    const applicationText = `
===========================================
PASSPORT APPLICATION
===========================================
Submitted: ${new Date().toLocaleString()}

Name: ${data.name}
Phone Number: ${data.number}
Email: ${data.email}
Profession: ${data.profession}
LinkedIn: ${data.linkedin}
Twitter: ${data.twitter}
Advocate Email: ${data.advocateEmail}

===========================================
`;

    // Write to file
    fs.writeFileSync(filepath, applicationText, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      filename
    });
  } catch (error) {
    console.error('Error saving passport application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save application' },
      { status: 500 }
    );
  }
}
