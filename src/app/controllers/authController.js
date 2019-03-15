const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

const authConfig = require('../../config/auth')

const User = require('../models/user')

const router = express.Router();

function genereteToken(params={}){

    return jwt.sign(params,authConfig.secret,{expiresIn:86400})
}    

router.post('/register', async(req,res)=>{
    const {email} = req.body;
    try {
        if(await User.findOne({email}))
            return res.status(400).send({error: 'User already exists'})
        
        const user = await User.create(req.body)

        user.password = undefined;

        return res.send({user,token: genereteToken({id:user.id})})

    } catch (error) {
        console.log(error)
        return res.status(400).send({error:'Registration failed'})
        
    }
})

router.post('/authenticate', async (req,res)=>{
    const {email, password}= req.body;

    const user = await User.findOne({email}).select('+password');
    if(!user) 
        return res.status(400).send({error:'E-mail not found'}) 
    
    if(!await bcrypt.compare(password,user.password))
        return res.status(400).send({error:'Invalid password'})

    user.password = undefined;


    return res.send({user,token: genereteToken({id:user.id})})

})

router.post('/forgot_password', async (req, res)=>{

    const {email} = req.body;

    try {

        const user = await User.findOne({email});

        if(!user)
            return res.status(400).send({error: 'User not found'});
            
        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();

        now.setHours(now.getHours()+1)

        await User.findOneAndUpdate(user.id,{
            '$set':{
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })

        mailer.sendMail({
            to: email,
            from: 'reincedaniel@gmail.com',
            template: 'auth/forgot_password',
            context:{token}
        },(error)=>{
            
            if(error)
                return res.status.send({error:'cannot send forgot password email'})
        return res.send('Enviado com sucesso');

        console.log('p2: : '+error)
        
        })
        
    } catch (error) {
        console.log('p4: : '+error)
        res.status(400).send({error:'Erro on forgot password, try again'})
    }
})

router.post('/reset_password', async (req,res)=>{
    const {email, token, password} = req.body;

    try{

        const user = await User.findOne({email})
        .select('+passwordResetToken passwordResetExpires')

        if(!user)
            return res.status(400).send({error: 'User not found'});

        if(token !== user.passwordResetToken)
            return res.status(400).send({error: 'Token invalid'})
        
        const now = new Date();

        if(now>user.passwordResetExpires)
            return res.status(400).send({error:'Token expired, generete a new one'})

        user.password=password;

        await user.save()

        res.send('Ok')

    }catch(error){
        res.status(400).send({error: 'cannot reset password, try again'})
    }
})

module.exports = app => app.use('/auth',router)