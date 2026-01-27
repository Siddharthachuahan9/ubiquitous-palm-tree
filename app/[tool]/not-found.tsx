import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
        Tool Not Found
      </h2>
      <p style={{ marginBottom: '24px', color: 'var(--text-tertiary)' }}>
        The tool you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          padding: '12px 24px',
          background: 'var(--interactive-primary)',
          color: 'var(--text-on-brand)',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Go to Home
      </Link>
    </div>
  );
}
