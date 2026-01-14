import express from 'express'
import { login, register,getAllUsers} from '../controllers/userController.js'

const router = express.Router()

router.post('/register',register)
router.post('/login',login)
router.get("/allusers/:id", getAllUsers)

export default router