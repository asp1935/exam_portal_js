import { Router } from "express"
import { authorize, verifyJWT } from "../middlewares/auth.middleware.js";
import { addTaluka, deleteTaluka, downloadTalukaList, getAllTalukas, getTalukas, getTalukasByDist, updateTaluka } from "../controllers/taluka.controller.js";

const router = Router();

router.use(verifyJWT);

router.get('/', (req, res) => {
    return res.status(200).json({ statusCode: 200, message: "Taluka Route Working..." });
})

router.route('/add-taluka').post(authorize(['add']), addTaluka);
router.route('/get-talukas').get(authorize(['view']), getAllTalukas);
router.route('/get-talukas-by-dist/:distId').get(authorize(['view']), getTalukasByDist);
router.route('/update-taluka/:talukaId').patch(authorize(['update']), updateTaluka);
router.route('/delete-taluka/:talukaId').delete(authorize(['delete']), deleteTaluka);
router.route('/download-taluka-list/:distId?').get(authorize(['download']), downloadTalukaList);
router.route('/get-talukas/:distId?').get(getTalukas);

export default router;