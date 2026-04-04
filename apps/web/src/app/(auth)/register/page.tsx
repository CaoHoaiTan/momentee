import type { Metadata } from 'next';
import RegisterForm from './register-form';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your Momentee account and start your love story.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
