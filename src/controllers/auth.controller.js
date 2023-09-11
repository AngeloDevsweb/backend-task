import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import {createAccessToken} from '../libs/jwt.js'
import jwt from 'jsonwebtoken'
import {TOKEN_SECRET} from '../config.js'

export const register = async(req, res) =>{
    const {email, password, username} = req.body

    try {
        //esta validacion es para saber si existe un email dentro de nuestros documentos en la base de datos
        // y si encuentra uno con el mismo nombre no permite guardar el email
        const userFound = await User.findOne({email})
        if(userFound){
            return res.status(400).json(['the email already exists'])
        }

        const passwordHash = await bcrypt.hash(password, 10) //genererara un string aleatorio
        const newUser = new User({
            username,
            email,
            password: passwordHash
        })
        //comando para guardar los datos en la base de datos
        const userSaved = await newUser.save()
        // utilizamos el token
        const token = await createAccessToken({id:userSaved._id}) //enviamos el id para que lo cree como un token
        //crea una cookie que ya viene de express, para que se cree directamente la cookie en nuestro navegador
        res.cookie("token", token)

        // respuesta al cliente
        res.json({
            email: userSaved.email,
            username: userSaved.username,
            id: userSaved.id
        })
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const login = async(req, res) =>{
    const {email, password} = req.body

    try {
        //guardamos en la variable el usuario o email que encontramos en la base de datos
        const userFound = await User.findOne({email})
        // hacemos una validacion
        if(!userFound) return res.status(400).json(["user not found"])

        //logica para verificar el password del usuario con el password de la base de datos del email que encontramos
        const isMatch = await bcrypt.compare(password, userFound.password)
        // hacemos validacion
        if(!isMatch) return res.status(400).json(["Incorrect password"])
        
        
        
       
        // utilizamos el token
        const token = await createAccessToken({id:userFound._id}) //enviamos el id para que lo cree como un token
        //crea una cookie que ya viene de express, para que se cree directamente la cookie en nuestro navegador
        res.cookie("token", token)

        // respuesta al cliente
        res.json({
            email: userFound.email,
            username: userFound.username,
            id: userFound.id,
            createdAt:userFound.createdAt
        })
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const logout = (req, res)=>{
    res.cookie("token", "",{
        expires: new Date(0),
    });
    return res.sendStatus(200);
}

export const profile = async(req, res)=>{
    const userFound = await User.findById(req.user.id)

    if(!userFound) return res.status(400).json({message:"user not found"})

    return res.json({
        id: userFound._id,
        username : userFound.username,
        email: userFound.email,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt
    })
}

export const verifyToken = async(req, res) =>{
    const {token} = req.cookies;

    if(!token) return res.status(401).json({message: 'no autorizado'})

    jwt.verify(token, TOKEN_SECRET, async (err, user)=>{
        if (err) return res.status(401).json({message: 'no autorizado'})

        const userFound = await User.findById(user.id)
        if(!userFound) return res.status(401).json({message: 'no autorizado'})

        return res.json({
            id:userFound._id,
            username: userFound.username,
            email: userFound.email
        })
    })

}