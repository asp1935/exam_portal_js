import { DataTypes,Op } from "sequelize";
import sequelize from "../config/db.js";
import User from "../models/user.model.js";
import { APIResponce } from "../utils/APIResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";


//for creating super admin only and key is @Itce123



const createSuperAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, key } = req.body;
    if (
        [name, email, password, key].some((field) => field.trim() === '')
    ) {
        return res
            .status(400)
            .json(new APIResponce(400, {}, 'All Fields are Require!!!'));
    }
    if (key !== '@Itse123') {
        return res
            .status(401)
            .json(new APIResponce(400, {}, 'Key is Wrong!!!'));
    }
    const existedAdmin = await User.findOne({ where: { email } });
    if (existedAdmin) {
        return res.status(409).json(new APIResponce(409, {}, 'Admin Already Exist!!!'));
    }
    const admin = await User.create({
        name,
        email,
        password,
        role: 'superadmin',
    });
    if (!admin) {
        return res.status(500).json(new APIResponce(500, {}, 'Something went wrong while Creating User'))
    }
    const createdAdmin = await User.findOne({
        where: { id: admin.id },
        attributes: { exclude: ['password'] },
    })
    console.log(createdAdmin);

    return res
        .status(201)
        .json(new APIResponce(200, createdAdmin, 'User Successfully Creaded...'))
});

const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, permissions } = req.body;
    const loggedUserRole = req?.user?.role;

    // Validate required fields
    if ([name, email, password, role].some((field) => field?.trim() === '')) {
        return res
            .status(400)
            .json(new APIResponce(400, {}, 'All Fields are Required!'));
    }

    // Validate permissions field
    if (!Array.isArray(permissions)) {
        return res
            .status(400)
            .json(new APIResponce(400, {}, 'Invalid format for permissions field!'));
    }

    const validPermissions = ['add', 'update', 'delete', 'view', 'download'];
    if (!permissions.every((perm) => validPermissions.includes(perm))) {
        return res
            .status(400)
            .json(new APIResponce(400, {}, 'Invalid permissions provided.'));
    }

    // Restrict role creation based on logged-in user's role
    if (loggedUserRole === 'admin' && role !== 'user') {
        return res
            .status(403)
            .json(new APIResponce(403, {}, 'Invalid User Role!!!'));
    }
    if (loggedUserRole === 'superadmin' && !['user', 'admin'].includes(role)) {
        return res
            .status(403)
            .json(new APIResponce(403, {}, 'Invalid Role!!!'));
    }

    // Check if the email already exists
    const existedUser = await User.findOne({ where: { email } });
    if (existedUser) {
        return res
            .status(409)
            .json(new APIResponce(409, {}, 'User already exists.'));
    }

    // Create the user
    const user = await User.create({
        name,
        email,
        password,
        role,
        permissions,
    });

    if (!user) {
        return res
            .status(500)
            .json(new APIResponce(500, {}, 'Error occurred while creating the user.'));
    }

    // Retrieve the created user without the password
    const createdUser = await User.findOne({
        where: { id: user.id },
        attributes: { exclude: ['password'] },
    });

    return res
        .status(201)
        .json(new APIResponce(201, createdUser, 'User created successfully.'));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields Required!!!'))
    }
    const userExist = await User.findOne({
        where: { email },
    })
    if (!userExist) {
        return res.status(404).json(new APIResponce(404, {}, 'User not Found!!!'))
    }
    const isPasswordCorrect = await userExist.validatePassword(password);
    if (!isPasswordCorrect) {
        return res.status(400).json(new APIResponce(400, {}, "Invalid Credentails"))
    }
    const accessToken = await userExist.genrateAccessToken();

    const options = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .json(new APIResponce(200, { userExist, accessToken }, 'Logged In Succesfully'));
});

const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie('accessToken', options)
        .json(new APIResponce(200, {}, 'Logout Successfully...'))
});

const updateUserPermissions = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { permissions } = req.body;

        if(!userId){
            return res.status(400).json(new APIResponce(400, {}, 'User Id not Provided!!!'));
        }

        if (!Array.isArray(permissions)) {
            return res.status(400).json(new APIResponce(400, {}, 'Permissions must be Array!!!'));
        }
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json(new APIResponce(404, {}, 'User not found!!!'));
        }
        user.permissions = permissions;
        await user.save();

        return res
            .status(200)
            .json(new APIResponce(200, user, 'Permissions Updated Successfully...'))

    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new APIResponce(500, {}, 'Internal Server Error'))
    }

});

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const loggedUserRole = req?.user?.role;

    if (!userId) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid User Id!!!'));
    }

    try {
        // Check role-based access
        const userToDelete = await User.findOne({ where: { id: userId } });

        if (!userToDelete) {
            return res.status(404).json(new APIResponce(404, {}, 'User not found.'));
        }

        if (loggedUserRole === 'admin') {
            // Admin can delete only users
            if (userToDelete.role !== 'user') {
                return res.status(403).json(new APIResponce(403, {}, 'S_Admins can only delete admins.'));
            }
        } else if (loggedUserRole === 'superadmin') {
            // Superadmin can delete both users and admins
            if (!['user', 'admin'].includes(userToDelete.role)) {
                return res.status(403).json(new APIResponce(403, {}, 'Superadmin can only delete users or admins.'));
            }
        } else {
            // Other roles are not allowed to delete
            return res.status(403).json(new APIResponce(403, {}, 'You are not authorized to perform this action.'));
        }

        // Delete the user
        const deletedUser = await User.destroy({
            where: { id: userId },
        });

        if (deletedUser > 0) {
            return res.status(200).json(new APIResponce(200, {}, 'User deleted successfully.'));
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'User not found.'));
        }
    } catch (error) {
        console.error('Error deleting User:', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!'));
    }
});


const getAllUsers = asyncHandler(async (req, res) => {
    const loggedUserRole = req?.user?.role;
    let users;
    try {
        if (loggedUserRole === 'admin') {
            users = await User.findAll({
                where: {
                    role: 'user'
                }
            })
        }
        else if(loggedUserRole === 'superadmin'){
            users=await User.findAll({
                where:{
                    role:{
                        [Op.in]:['user','admin'],
                    }
                }
            })
        }
        else{
            return res.status(403).json(new APIResponce(403,{},'Unauthorized Access!!!'))
        }

        if (!users) {
            return res.status(200, {}, 'No user Present')
        }
        return res
            .status(200)
            .json(new APIResponce(200, users, 'All Users Fetched...'))

    } catch (error) {
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Fetching Users!!!'))
    }
});

const getCurrectUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new APIResponce(200, req.user, "Currunt User Fetch Successfully..."))
});

export {
    createSuperAdmin,
    createUser,
    loginUser,
    logoutUser,
    updateUserPermissions,
    deleteUser,
    getAllUsers,
    getCurrectUser,
}