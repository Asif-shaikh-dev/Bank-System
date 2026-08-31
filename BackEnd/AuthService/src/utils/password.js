import bcrypt from 'bcrypt';

export const comparePasswords = (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
}