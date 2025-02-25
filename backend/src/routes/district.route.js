import { Router } from "express";
import { addDistrict, getAllDistrict,deleteDistrict, updateDistrict, downloadDistrictList } from "../controllers/district.controller.js";
import { APIResponce } from "../utils/APIResponce.js";
import { authorize, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.get('/', (req, res) => {
    res.status(200).json(new APIResponce(200, {}, 'District Route'))
})
router.use(verifyJWT);

router.route('/add-district').post(authorize(['add']), addDistrict);
router.route('/get-all-districts').get(authorize(['view']),getAllDistrict);
router.route('/update-district/:districtId').patch(authorize(['update']),updateDistrict);
router.route('/delete-district/:districtId').delete(authorize(['delete']),deleteDistrict);
router.route('/download-district-list').get(authorize(['download']),downloadDistrictList);

export default router;
