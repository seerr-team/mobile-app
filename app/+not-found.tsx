import ErrorPage from '@/components/ErrorPage';

export default function NotFound() {
  return <ErrorPage statusCode={404} />;
}
