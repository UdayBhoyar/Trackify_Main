# Security Guidelines for Trackify Pro

## ⚠️ IMPORTANT: Before Deploying to Production

### 1. JWT Secret Key
The JWT secret key in `api/appsettings.json` **MUST** be changed before production deployment.

**Current (Development Only):**
```json
"Key": "please-change-this-key-to-a-long-random-secret-value-for-production-use-minimum-32-characters"
```

**Production Recommendation:**
- Generate a strong random key (minimum 32 characters, preferably 64+)
- Use environment variables instead of hardcoding
- Example: `openssl rand -base64 64`

### 2. MongoDB Configuration
**Development:**
```json
"ConnectionString": "mongodb://localhost:27017"
```

**Production:**
- Use MongoDB Atlas or secured MongoDB instance
- Enable authentication
- Use strong passwords
- Enable SSL/TLS
- Restrict IP access
- Example: `mongodb+srv://username:password@cluster.mongodb.net/trackify_pro?retryWrites=true&w=majority`

### 3. CORS Configuration
**Current (Development):**
```csharp
policy.WithOrigins("http://localhost:4200")
```

**Production:**
- Update CORS to allow only your production domain
- Never use `AllowAnyOrigin()` in production
- Example: `policy.WithOrigins("https://yourdomain.com")`

### 4. Admin Credentials
**Development Default:**
- Email: admin@trackify.com
- Password: Pass@123

**Production:**
- Change default admin credentials immediately after first deployment
- Use strong password (12+ characters, mixed case, numbers, symbols)
- Consider implementing 2FA for admin accounts

### 5. HTTPS Configuration
- **Always** use HTTPS in production
- Update `appsettings.json` to enforce HTTPS
- Configure SSL certificates properly
- Enable HSTS (HTTP Strict Transport Security)

### 6. Environment Variables
Store sensitive configuration in environment variables:

```bash
# Example .env file (NOT committed to git)
MONGODB_CONNECTION_STRING=mongodb+srv://...
JWT_SECRET_KEY=your-super-secret-key-here
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourStrongPassword123!
```

### 7. API Rate Limiting
Consider implementing rate limiting to prevent abuse:
- Login attempts: 5 per 15 minutes
- API calls: 100 per minute per user
- Use packages like `AspNetCoreRateLimit`

### 8. Input Validation
✅ Already implemented:
- Data annotations on DTOs
- Email validation
- Password length requirements
- Amount range validation
- String length limits

### 9. Security Headers
Add security headers in production:
```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "no-referrer");
    await next();
});
```

### 10. Logging and Monitoring
- Enable comprehensive logging
- Monitor failed login attempts
- Track API errors
- Set up alerts for suspicious activity
- Use services like Application Insights or Serilog

### 11. Database Backups
- Set up automated daily backups
- Test restoration procedures
- Keep backups encrypted
- Store backups in separate location

### 12. Code Review Checklist
Before deployment:
- [ ] JWT secret key changed
- [ ] MongoDB credentials secured
- [ ] CORS configured for production domain
- [ ] Admin password changed
- [ ] HTTPS enabled
- [ ] Environment variables configured
- [ ] Security headers added
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Backup strategy in place

## Password Security
- Passwords are hashed using BCrypt
- Never store plain text passwords
- BCrypt automatically salts passwords
- Cost factor: Default (10 rounds)

## Token Management
- JWT tokens expire after 4 hours (configurable)
- Tokens stored in localStorage (client-side)
- Consider implementing refresh tokens for better security
- Implement token blacklisting for logout

## Data Privacy
- User data is isolated by userId
- Admin users can access all data
- Categories and expenses are user-specific
- Implement GDPR compliance if needed

## Regular Maintenance
- Keep dependencies updated
- Monitor security advisories
- Perform regular security audits
- Update .NET and Angular versions
- Review access logs regularly

## Incident Response
1. Have a plan for security incidents
2. Keep contact information for key personnel
3. Document security incidents
4. Learn from incidents and improve security

---

**Last Updated:** February 2026
**Next Review:** Before Production Deployment
