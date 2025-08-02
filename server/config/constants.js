module.exports = {
    ROLES: ['user', 'admin'],
    PASSWORD_POLICY: {
        MIN_LENGTH: 8,
        REQUIREMENTS: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    },
    SESSION: {
        JWT_EXPIRY: '15m',
        REFRESH_EXPIRY: '7d'
    }
};
