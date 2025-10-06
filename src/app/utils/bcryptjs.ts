import bcrypt from 'bcryptjs'

export const encryptPass = async (password: string) => {
    return await bcrypt.hash(password, 10)
}

export const comparePass = async (password: string, encryptpass: string) => {
    return await bcrypt.compare(password, encryptpass)
}