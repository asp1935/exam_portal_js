import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "../models/user.model.js";
import { APIResponce } from "../utils/APIResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";


// Helper function for error response
const handleError = (res, status, message) => {
    return res.status(status).json(new APIResponce(status, {}, message));
};

// Middleware to verify JWT
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return handleError(res, 401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            where: { id: decodedToken?.id },
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return handleError(res, 403, "Invalid or expired token");
        }
        req.user = user;
        next();
    } catch (error) {
        return handleError(res, 403, "Invalid or expired token");
    }
});

// Role-based access control
// export const authorize = (requiredPermissions = []) => {
//     return (req, res, next) => {
//         const { role, permissions } = req.user;

//         const rolePermissions = {
//             superadmin: ["*"], // Super admin has all permissions
//             admin: ["add", "update", "download"], // Admin-specific permissions
//             user: permissions, // Use user's permissions
//         };

//         const allowedPermissions = rolePermissions[role] || [];
//         const hasAccess =
//             allowedPermissions.includes("*") ||
//             requiredPermissions.every((perm) => allowedPermissions.includes(perm));

//         if (!hasAccess) {
//             return handleError(res, 403, "Access Denied. Insufficient Permissions.");
//         }

//         next();
//     };
// };

export const authorize = (requiredPermissions = []) => {
    return (req, res, next) => {
        const { role, permissions } = req.user;

        if (role === 'superadmin') {
            return next(); // Super admin has unrestricted access
        }

        if (role === 'admin') {
            if (requiredPermissions.includes('register')) {
                return handleError(res, 403, 'Access Denied!!!');
            }
            return next(); // Admin has all other access
        }

        if (role === 'user') {
            const hasPermissions = requiredPermissions.every((permission) =>
                permissions.includes(permission)
            );
            if (!hasPermissions) {
                return handleError(res, 403, 'Access Denied. Require Permission to Access!!!');
            }
            return next(); // User has the required permissions
        }

        // For any other role
        return handleError(res, 403, 'Access Denied. Unauthorized Role!!!');
    };
};


// Specific role-based middleware
export const authAdmin = (req, res, next) => {
    const { role } = req.user;
    if (["superadmin", "admin"].includes(role)) {
        return next();
    }
    return handleError(res, 403, "Access Denied. Unauthorized User.");
};

export const authSuperAdmin = (req, res, next) => {
    const { role } = req.user;
    if (role === "superadmin") {
        return next();
    }
    return handleError(res, 403, "Access Denied. Unauthorized User.");
};
