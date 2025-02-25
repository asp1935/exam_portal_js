import {Router} from 'express'
import { authorize, verifyJWT } from '../middlewares/auth.middleware.js';
import { addSchool, deleteschool, getAllSchools, updateSchool } from '../controllers/school.controller.js';

const router=Router();

router.use(verifyJWT);

router.get('/',(req,res)=>{
    return res.status(200).json({statusCode:200,message:'School Route Working...'});
})

router.route('/add-school').post(authorize(['add']),addSchool);
router.route('/get-all-schools').get(authorize(['view']),getAllSchools);
router.route('/update-school/:schoolId').patch(authorize(['update']),updateSchool);
router.route('/delete-school/:schoolId').delete(authorize(['delete']),deleteschool);



export default router;