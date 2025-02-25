import {Router} from 'express'
import { authorize, verifyJWT } from '../middlewares/auth.middleware.js';
import { addRepresentative, deleteRepresentative, getAllRepresentatives, getCenterRepresentative, updateRepresentative } from '../controllers/representative.controller.js';

const router=Router();

router.use(verifyJWT);

router.get('/',(req,res)=>{
    return res.status(200).json({statusCode:200,message:"Representative Route Working..."})
});

router.route('/add-representative').post(authorize(['add']),addRepresentative);
router.route('/get-all-representatives').get(authorize(['view']),getAllRepresentatives);
router.route('/update-representative/:representativeId').patch(authorize(['update']),updateRepresentative);
router.route('/delete-representative/:representativeId').delete(authorize(['delete']),deleteRepresentative);
router.route('/get-center-representative/:centerId').get(authorize(['view']),getCenterRepresentative);

export default router;