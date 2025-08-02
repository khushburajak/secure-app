const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

exports.generateMFASecret = () => {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.base32;
};

exports.generateOTPAuthURL = (secret, email) => {
    return speakeasy.otpauthURL({
        secret,
        label: `SecureApp:${email}`,
        issuer: 'SecureApp'
    });
};

exports.verifyMFAToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
    });
};

exports.generateQRCode = async (otpauthUrl) => {
    return await QRCode.toDataURL(otpauthUrl);
};
