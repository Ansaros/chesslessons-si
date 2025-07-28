# Chess Lessons Admin Panel

## Overview

This project contains a chess lessons platform with an admin panel and user profile management that has been updated to use real API endpoints instead of mock data.

## API Integration

### Admin Service Endpoints

The admin service provides the following endpoints:

- `GET /admin/videos/` - Fetch all videos
- `POST /admin/videos/` - Upload a new video
- `PUT /admin/videos/{video_id}` - Update video by ID
- `DELETE /admin/videos/{video_id}` - Delete video by ID
- `GET /admin/attribute/types` - Get all attribute types
- `POST /admin/attribute/types` - Create a new attribute type
- `POST /admin/attribute/values` - Create a new attribute value
- `DELETE /admin/attribute/types/{id}` - Delete attribute type by ID
- `DELETE /admin/attribute/values/{id}` - Delete attribute value by ID

### Profile Service Endpoints

The profile service provides the following endpoints:

- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile (chess level)
- `PUT /profile/password` - Update user password

### Frontend Integration

The application has been updated to:

1. **Replace mock data with real API calls** - All video management and profile management now use real services
2. **Add proper authentication** - Uses the auth service to get and set tokens
3. **Implement real CRUD operations** - Create, read, update, and delete videos and profiles
4. **Add loading states** - Shows loading indicators during API calls
5. **Error handling** - Displays error messages for failed operations
6. **File upload functionality** - Drag and drop support for video and image files
7. **Toast notifications** - Uses Sonner for user-friendly notifications
8. **Profile management** - Real profile data with chess level selection and password changes

### Key Features

- **Video Management**: Upload, view, edit, and delete videos
- **Real-time Data**: Fetches data from the backend API
- **Authentication**: Proper token-based authentication
- **File Upload**: Support for video and preview file uploads with drag & drop
- **Analytics**: View purchase history and platform statistics
- **Toast Notifications**: User-friendly success and error messages
- **Profile Management**: View and edit user profile, change chess level, update password

### File Upload Features

The admin panel includes enhanced file upload functionality:

- **Drag and Drop**: Users can drag video and image files directly onto the upload areas
- **Click to Select**: Clicking the upload areas opens the file picker
- **File Type Validation**: Only accepts video files for videos and image files for thumbnails
- **Visual Feedback**: Shows selected file names and success indicators
- **Hover Effects**: Visual feedback when dragging files over upload areas

### Profile Management Features

The profile page includes comprehensive user management:

- **Profile Display**: Shows user email and current chess level
- **Chess Level Selection**: Dropdown to change user's chess level (Beginner, Amateur, Master, Grandmaster)
- **Password Management**: Secure password change functionality
- **Real-time Updates**: Profile changes are immediately reflected
- **Loading States**: Visual feedback during API operations

### Toast Notifications

The application uses Sonner for toast notifications:

- **Success Messages**: Green notifications for successful operations
- **Error Messages**: Red notifications for failed operations
- **User-Friendly**: Clear, concise messages in Russian

### File Structure

```
frontend/src/
├── services/
│   ├── admin/
│   │   └── admin-service.ts      # Admin API service
│   ├── auth/
│   │   └── auth-service.ts       # Authentication service
│   └── profile/
│       └── profile-service.ts    # Profile API service
├── modules/
│   ├── admin/
│   │   └── ui/views/
│   │       ├── admin-view.tsx    # Main admin panel
│   │       └── admin-analytics-view.tsx  # Analytics page
│   └── profile/
│       └── ui/views/
│           └── profile-view.tsx  # Profile management page
├── components/
│   └── ui/
│       └── sonner.tsx           # Toast notification component
└── app/
    ├── layout.tsx               # Root layout with Toaster
    ├── admin/
    │   ├── page.tsx              # Admin page
    │   └── analytics/
    │       └── page.tsx          # Analytics page
    └── profile/
        └── page.tsx              # Profile page
```

### Usage

1. **Authentication**: Users must be logged in to access protected pages
2. **Admin Panel**: Use the admin panel to manage videos and view analytics
3. **File Upload**: 
   - Drag video files to the video upload area
   - Drag image files to the thumbnail upload area
   - Or click the areas to open file picker
4. **Profile Management**: 
   - View current profile information
   - Change chess level from dropdown
   - Update password securely
5. **Analytics**: Use the "Аналитика" tab to view platform statistics
6. **Notifications**: Toast messages will appear for all operations

### Environment Variables

Make sure to set the following environment variables:

```
NEXT_PUBLIC_API_BACKEND_URL=http://localhost:8000
```

### Development

To run the project:

1. Start the backend server
2. Start the frontend development server
3. Navigate to `/admin` to access the admin panel or `/profile` for user profile

The application now fully integrates with the backend API, replacing all mock data with real functionality and providing comprehensive user management features. 