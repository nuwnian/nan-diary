// Security utilities for input sanitization and validation
class SecurityUtils {
    
    // Sanitize HTML to prevent XSS attacks
    static sanitizeHTML(input) {
        if (typeof input !== 'string') {return input;}
        
        // Create a temporary div to safely parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.textContent = input;
        return tempDiv.innerHTML;
    }
    
    // Sanitize rich text content (preserves basic formatting)
    static sanitizeRichText(html) {
        if (typeof html !== 'string') {return html;}
        
        // Allow only safe HTML tags for rich text
        const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'ul', 'ol', 'li'];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Remove all script tags and event handlers
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Remove all elements with event handlers
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(element => {
            // Remove all event handler attributes
            const attributes = Array.from(element.attributes);
            attributes.forEach(attr => {
                if (attr.name.startsWith('on')) {
                    element.removeAttribute(attr.name);
                }
            });
            
            // Remove elements not in allowed tags
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                // Replace with span to preserve content
                const span = document.createElement('span');
                span.innerHTML = element.innerHTML;
                element.parentNode?.replaceChild(span, element);
            }
        });
        
        return tempDiv.innerHTML;
    }
    
    // Validate project title
    static validateTitle(title) {
        if (typeof title !== 'string') {return false;}
        if (title.length < 1 || title.length > 100) {return false;}
        
        // Prevent dangerous characters
        const dangerousChars = /<script|javascript:|data:/i;
        return !dangerousChars.test(title);
    }
    
    // Validate project notes
    static validateNotes(notes) {
        if (typeof notes !== 'string') {return false;}
        if (notes.length > 50000) {return false;} // Limit note size
        
        // Check for excessive script tags
        const scriptCount = (notes.match(/<script/gi) || []).length;
        return scriptCount === 0;
    }
    
    // Rate limiting helper
    static checkRateLimit(userId, action, limit = 10, windowMs = 60000) {
        const key = `${userId}_${action}`;
        const now = Date.now();
        
        // Get stored rate limit data
        const stored = localStorage.getItem(`rl_${key}`);
        let rateLimitData = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };
        
        // Reset if window expired
        if (now > rateLimitData.resetTime) {
            rateLimitData = { count: 0, resetTime: now + windowMs };
        }
        
        // Check if limit exceeded
        if (rateLimitData.count >= limit) {
            return false;
        }
        
        // Increment counter
        rateLimitData.count++;
        localStorage.setItem(`rl_${key}`, JSON.stringify(rateLimitData));
        
        return true;
    }
    
    // Validate user session
    static async validateUserSession(auth) {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }
        
        // Check if token is still valid
        try {
            await auth.currentUser.getIdToken(true);
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            throw new Error('Session expired, please sign in again');
        }
    }
    
    // Log security events (for monitoring)
    static logSecurityEvent(event, details = {}) {
        const logData = {
            timestamp: new Date().toISOString(),
            event,
            details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // In production, you would send this to a logging service
        console.warn('Security Event:', logData);
        
        // Store critical events locally for debugging
        if (['xss_attempt', 'rate_limit_exceeded', 'auth_failure'].includes(event)) {
            const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
            logs.push(logData);
            
            // Keep only last 50 events
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            localStorage.setItem('security_logs', JSON.stringify(logs));
        }
    }
}

export default SecurityUtils;