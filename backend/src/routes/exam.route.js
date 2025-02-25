import { Router } from 'express'
import { authorize, verifyJWT } from '../middlewares/auth.middleware.js';
import { addExam, addSubject, deleteExamDetails, deleteSubject, getExamDetails, updateExamDetails, updateImage, updateSubject } from '../controllers/exam.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = Router();

router.use(verifyJWT);
router.get('/', (req, res) => {
    return res.status(200).json({ message: 'Exam Route Working...' })
});

router.route('/add-exam').post(authorize(['add']), upload.fields([
    {
        name: 'logoImage',
        maxCount: 1,
    },
    {
        name: 'signImage',
        maxCount: 1
    }
]), addExam);

router.route('/update-details/:examId').patch(authorize(['update']),updateExamDetails);
router.route('/update-image/:examId').patch(authorize(['update']),upload.single('imageFile'),updateImage);
router.route('/delete-details/:examId').delete(authorize(['delete']),deleteExamDetails);

router.route('/add-subject').post(authorize(['add']),addSubject);
router.route('/update-subject/:subjectId').put(authorize(['update']),updateSubject);
router.route('/delete-subject/:subjectId').delete(authorize(['delete']),deleteSubject);

router.route('/get-exam-details').get(authorize(['view']),getExamDetails);

export default router;