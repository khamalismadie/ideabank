# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Ideabank, please report it responsibly.

**DO NOT** open a public GitHub issue for security vulnerabilities.

### How to Report

Email: [your-email@domain.com] with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment | 48 hours |
| Initial assessment | 7 days |
| Fix for critical issues | 14 days |
| Fix for high issues | 30 days |
| Fix for medium/low | Next release |

### Scope

**In scope:**
- API endpoints
- Authentication/authorization
- Data exposure
- Injection vulnerabilities
- Dependency vulnerabilities

**Out of scope:**
- Denial of service attacks
- Social engineering
- Issues in third-party services

### Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x | ✅ Yes |
| < 0.1 | ❌ No |

## Security Best Practices

When contributing, please:

1. Never commit API keys, secrets, or credentials
2. Use environment variables for configuration
3. Validate all user input
4. Use parameterized queries (Prisma handles this)
5. Follow OWASP guidelines

## Dependencies

We use Dependabot to monitor dependencies for vulnerabilities. All dependencies are audited in CI.
