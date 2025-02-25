import { asyncHandler } from '../utils/AsyncHandler.js'
import { APIResponce } from '../utils/APIResponce.js'
import Exam from '../models/exam.model.js';
import Subject from '../models/subject.model.js';



const addExam = asyncHandler(async (req, res) => {
    const { examName, hallTicketNote, certificateNote, examDate, resultDate } = req.body;
    const logoPngPath = req?.files?.logoImage?.[0]?.path;
    const signPngPath = req?.files?.signImage?.[0]?.path;

    if (!examName) {
        return res.status(400).json(new APIResponce(400, {}, 'Exam Name is Required!!!'));
    }
    if (!logoPngPath || !signPngPath) {
        const missingField = !logoPngPath ? 'Logo Png' : 'Sign Png';
        return res.status(400).json(new APIResponce(400, {}, `${missingField} Required!!!`));
    }
    if (examDate && isNaN(Date.parse(examDate))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Exam Date !!!'));
    }
    if (resultDate && isNaN(Date.parse(resultDate))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Result Date !!!'));
    }

    // Validate hallTicketNote and certificateNote
    if (hallTicketNote && (typeof hallTicketNote !== 'string' || hallTicketNote.trim() === '')) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Hall Ticket Note!!!'));
    }

    if (certificateNote && (typeof certificateNote !== 'string' || certificateNote.trim() === '')) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Certificate Note!!!'));
    }

    try {
        // Create exam details with conditional fields
        const examDetails = await Exam.create({
            examName,
            logoUrl: logoPngPath,
            signPngUrl: signPngPath,
            ...(hallTicketNote && { hallTicketNote: hallTicketNote.trim() }),
            ...(certificateNote && { certificateNote: certificateNote.trim() }),
            ...(examDate && { examDate: examDate }),
            ...(resultDate && { resultDate: resultDate }),


        });

        if (!examDetails) {
            return res.status(500).json(new APIResponce(500, {}, 'Failed to add exam details!!!'));
        }

        // Success response
        return res.status(201).json(new APIResponce(201, examDetails, 'Exam Details Saved Successfully...'));

    } catch (error) {
        console.error('Error while saving exam details:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Exam Details is Already Exist!!!'))
        } else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while saving exam details!!!'));
        }
    }
});

const updateExamDetails = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { examName, hallTicketNote, certificateNote, examDate, resultDate } = req.body;

    // Validate examId
    if (!examId || isNaN(parseInt(examId))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid or Missing Exam ID!!!'));
    }

    // Validate input fields (allow undefined but check non-empty strings if provided)
    if ([examName, hallTicketNote, certificateNote].some(field => field !== undefined && (typeof field !== 'string' || field.trim() === ''))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid input for one or more fields!'));
    }
    if (examDate && isNaN(Date.parse(examDate))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Exam Date !!!'));
    }
    if (resultDate && isNaN(Date.parse(resultDate))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Result Date !!!'));
    }
    const parsedExamId = parseInt(examId);

    try {
        const examDetails = await Exam.findByPk(parsedExamId);
        if (!examDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'Exam Details Not Found!!!'));
        }

        // Update only provided fields
        examName && (examDetails.examName = examName);
        hallTicketNote && (examDetails.hallTicketNote = hallTicketNote);
        certificateNote && (examDetails.certificateNote = certificateNote);
        examDate && (examDetails.examDate = examDate);
        resultDate && (examDetails.resultDate = resultDate);



        await examDetails.save();

        return res.status(200).json(new APIResponce(200, examDetails, 'Exam Details Updated Successfully!!!'));
    } catch (error) {
        console.error('Error While Updating Exam Details:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Exam Details is Already Exist!!!'))
        } else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error While Updating Exam Details!!!'));
        }
    }
});

const updateImage = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { imageType } = req.body;

    if (!examId || isNaN(parseInt(examId))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid or Missing Exam ID!!!'));
    }
    const parsedExamId = parseInt(examId);


    if (!imageType || !['logoPng', 'signPng'].includes(imageType)) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Image Type Provided!!!'));
    }
    const imagePath = req?.file?.path;
    if (!imagePath) {
        return res.status(400).json(new APIResponce(400, {}, 'Image not Provided!!!'));
    }
    try {
        const examDetails = await Exam.findByPk(parsedExamId);
        if (!examDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'Exam Deatisl Not Found!!!'))
        }
        const imageName = imageType === 'logoPng' ? 'logoUrl' : 'signPngUrl'
        examDetails[imageName] = imagePath;
        await examDetails.save();

        return res.status(200).json(new APIResponce(200, examDetails, `Exam ${imageType === 'logoPng' ? 'Logo Png Updaeted Successfully...' : 'Sign Png Updated Successfully...'}`))

    } catch (error) {
        console.log('Error while updating Images', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internl Server Error While Updating Images!!!'))
    }
});

const deleteExamDetails = asyncHandler(async (req, res) => {
    const examId = req.params?.examId;
    if (!examId || isNaN(parseInt(examId))) {
        return res.status(400).json(new APIResponce(400, {}, 'Exam Id is Not Valid'))
    }
    const parsedExamId = parseInt(examId);

    try {
        const deletedexamDetails = await Exam.destroy({ where: { id: parsedExamId } });
        if (deleteExamDetails > 0) {
            return res.status(200).json(new APIResponce(200, {}, 'Exam Details Deleted Successfully....'))
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'Exam Details Not Found!!!'));
        }
    } catch (error) {
        console.log('Error while Deleting Exam Details', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internl Server Error while Deleting Exam Details!!!'));
    }
})

const addSubject = asyncHandler(async (req, res) => {
    const { subName, examDate, examTime } = req.body;
    if (!subName || !examDate || !examTime) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields Are Required!!!'));
    }
    if (!(examDate && !isNaN(new Date(examDate))) || !/^\d{2}:\d{2}$/.test(examTime)) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Exam Date or Time!!!'));
    }

    try {
        const examDetails = await Exam.findOne({
            order: [['createdAt', 'DESC']]
        });

        if (!examDetails || !examDetails.id) {
            return res.status(404).json(new APIResponce(404, {}, 'No Exam Found! Add Exam Details...'));
        }

        const addedSubjects = await Subject.create({
            examId: examDetails.id,
            subName,
            examDate,
            examTime
        })
        if (!addedSubjects) {
            return res.status(500).json(new APIResponce(500, {}, 'Something went wrong While Adding Subjects!!!.'));
        }

        return res.status(200).json(new APIResponce(200, addSubject, 'Subject Details Addedd Successfully...'))
    } catch (error) {
        console.log('Error While Adding Subjects', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Subject is Already Exist!!!'))
        } else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error While Adding Subjects!!!.'));
        }
    }

});

const updateSubject = asyncHandler(async (req, res) => {
    const subjectId = req.params?.subjectId;
    if (!subjectId || isNaN(parseInt(subjectId))) {
        return res.status(400).json(new APIResponce(400, {}, 'Subject Id is Required!!!'));
    }
    const parsedSubId = parseInt(subjectId);

    const { subName, examDate, examTime } = req.body;
    if (!subName || !examDate || !examTime) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required!!!'));
    }

    if ((examDate && isNaN(Date.parse(examDate))) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(examTime)) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Exam Date or Time!!!'));
    }
    
    try {
        const subjectDetails = await Subject.findByPk(parsedSubId);

        if (!subjectDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'Subject Not Found!!!'));
        }
        subjectDetails.set({ subName, examDate, examTime });
        await subjectDetails.save();

        return res.status(200).json(new APIResponce(200, subjectDetails, 'Subject Details Updated Successfully....'))

    } catch (error) {
        console.log('Error While updating Subject Details');
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Subject is Already Exist!!!'))
        } else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Updating Subject Details!!!'))
        }
    }
})

const deleteSubject = asyncHandler(async (req, res) => {
    const subjectId = req.params?.subjectId;
    if (!subjectId || isNaN(parseInt(subjectId))) {
        return res.status(400).json(new APIResponce(400, {}, 'Subject Id is Required!!!'));
    }
    const parsedSubId = parseInt(subjectId);
    try {
        const deletedSubject = await Subject.destroy({ where: { id: parsedSubId } });
        if (deletedSubject > 0) {
            return res.status(200).json(new APIResponce(200, {}, 'Subject Deleted Successfully...'));
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'Subject Details Not Found!!!'));

        }
    } catch (error) {
        console.log('Error while deleteing subject', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Deleteing Subject!!!'));
    }
});
const getExamDetails = asyncHandler(async (req, res) => {
    try {
        const examDetails = await Exam.findOne({
            include: [{
                model: Subject,
                as: 'subjects',
                attributes: ['id', 'subName', 'examDate', 'examTime']
            }],
            order: [['createdAt', 'DESC']],

        })
        if (!examDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'No Exam deatils Available!!!'));
        }
        return res.status(200).json(new APIResponce(200, examDetails, 'Exam Details Fetched Successfully...'))
    } catch (error) {
        console.log('Error While fething Exam Details', error);

        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while fetching Exam Details!!!'))
    }
})





export {
    addExam,
    updateExamDetails,
    updateImage,
    deleteExamDetails,
    addSubject,
    updateSubject,
    deleteSubject,
    getExamDetails,
}