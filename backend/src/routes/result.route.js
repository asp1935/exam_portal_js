import { Router } from "express";
import { authAdmin, authorize, authSuperAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { clearAllMarks, deleteMarks, downloadResultList, gernrateResult, getAllSetWiseMarks, resultSetUpload, updateMarks } from "../controllers/result.controller.js";

const router = Router();


router.use(verifyJWT)

router.get('/', (req, res) => {
    return res.status(200).json({ statusCode: 200, message: "Result Route Working..." })
});

router.route('/result-upload').post(authAdmin, upload.single('resultFile'), resultSetUpload);
router.route('/update-marks').put(authAdmin, updateMarks);
router.route('/delete-marks/:examNo').delete(authAdmin, deleteMarks);
router.route('/clear-marks').delete(authSuperAdmin,clearAllMarks);
router.route('/get-set-wise-marks').get(authorize(['view']),getAllSetWiseMarks);
router.route('/genrate-result').get(authorize([]),gernrateResult);
router.route('/download-result').get(authorize(['download']),downloadResultList);

export default router;

