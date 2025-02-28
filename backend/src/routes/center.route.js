import {Router} from 'express';
import { authorize, verifyJWT } from '../middlewares/auth.middleware.js';
import { addCenter, deleteCenter, downloadCenterList, getAllCenters, updateCenter } from '../controllers/center.controller.js';

const router=Router();

router.use(verifyJWT);

router.get('/',(req,res)=>{
    return res.status(200).json({statusCode:200,message:"Center Route Working..."});
});

router.route('/add-center').post(authorize(['add']),addCenter);
router.route('/get-centers').get(authorize(['view']),getAllCenters);
router.route('/update-center/:centerId').patch(authorize(['update']),updateCenter);
router.route('/delete-center/:centerId').delete(authorize(['delete']),deleteCenter);
router.route('/download-center-list').get(authorize(['view']),downloadCenterList);

export default router;