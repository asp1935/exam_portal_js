import {Router} from 'express';
import {authorize, verifyJWT} from '../middlewares/auth.middleware.js'
import { addStudent, deleteStudent, downloadStudentList, getAllStudents, updateStudent } from '../controllers/student.controller.js';

const router=Router();

// router.route('/download-student-list').get(downloadStudentList);

router.use(verifyJWT);

router.get('/',(req,res)=>{
    return res.status(200).json({statusCode:200,message:'Student Route Working...'});
});

router.route('/add-student').post(authorize(['add']),addStudent);
router.route('/get-all-students').get(authorize(['view']),getAllStudents);
router.route('/update-student/:studentId').put(authorize(['update']),updateStudent);
router.route('/delete-student/:examNo').delete(authorize(['delete']),deleteStudent);
router.route('/download-student-list').get(authorize(['download']),downloadStudentList);

export default router;