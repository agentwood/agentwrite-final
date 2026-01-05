import { redirect } from 'next/navigation';

// ALWAYS redirect to /home - same design for logged in and logged out users
// The design should NEVER change under any circumstance
export default function RootPage() {
  redirect('/home');
}
