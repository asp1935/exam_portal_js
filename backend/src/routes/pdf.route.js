import {Router} from 'express'
import {authorize, verifyJWT} from '../middlewares/auth.middleware.js';
import { centerwiseCertificate, centerwiseHallTicket } from '../controllers/pdf.controller.js';

const router=Router();

// router.use(verifyJWT);

router.get('/',(req,res)=>{
    return res.status(200).json({statusCode:200,message:'PDF Route Working Fine...'})
})

router.route('/download-hallticket/:centerId').get(centerwiseHallTicket);
router.route('/download-certificate/:centerId').get(centerwiseCertificate);

export default router;