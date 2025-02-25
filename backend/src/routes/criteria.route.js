import { Router } from "express";
import { authorize, verifyJWT } from "../middlewares/auth.middleware.js";
import { addCriteria, deleteCriteria, getAllCriteris, updateCriteria } from "../controllers/criteria.controller.js";

const router=Router();

router.use(verifyJWT);
router.get('/',(req,res)=>{
    return res.status(200).json({statusCode:200,message:'Criteria Route Working...'});
});

router.route('/add-criteria').post(authorize(['add']),addCriteria);
router.route('/update-criteria/:criteriaId').patch(authorize(['update']),updateCriteria);
router.route('/delete-criteria/:criteriaId').delete(authorize(['delete']),deleteCriteria);
router.route('/get-criterias').get(authorize(['view']),getAllCriteris);

export default router;
