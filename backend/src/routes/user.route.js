import { Router } from "express";
import { createSuperAdmin, createUser, deleteUser, getAllUsers, getCurrectUser, loginUser, logoutUser, updateUserPermissions } from "../controllers/user.controller.js";
import { APIResponce } from "../utils/APIResponce.js";
import { authAdmin, authorize, verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()
router.get('/', (req, res) => {
    res.status(200).json(new APIResponce(200, {}, 'User Route'))
})
router.route('/create-superadmin').post(createSuperAdmin);
router.route('/register-user').post(verifyJWT,authAdmin,createUser);
router.route('/login').post(loginUser);
router.route('/logout').get(verifyJWT,logoutUser);
router.route('/update-permissions/:userId').patch(verifyJWT,authAdmin,updateUserPermissions);
router.route('/delete-user/:userId').delete(verifyJWT,authAdmin,deleteUser);
router.route('/get-users').get(verifyJWT,authAdmin,getAllUsers);
router.route('/current-user').get(verifyJWT,getCurrectUser);

export default router;