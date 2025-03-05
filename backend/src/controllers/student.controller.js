import { APIResponce } from "../utils/APIResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import School from "../models/school.model.js";
import Student from "../models/student.model.js";
import Center from "../models/center.model.js";
import Taluka from "../models/taluka.model.js";
import District from "../models/district.model.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const distructObject = (students) => {
    if (Array.isArray(students)) {
        return students.map((student) => ({
            id: student?.id || '',
            districtName: student?.school?.center?.taluka?.district?.districtName || '',
            talukaName: student?.school?.center?.taluka?.talukaName || '',
            centerName: student?.school?.center?.centerName || '',
            schoolName: student?.school?.schoolName || '',
            standard: student?.standard || '',
            medium: student?.medium || '',
            examNo: student?.examNo || '',
            sName: student?.fName + ' ' + student.mName + ' ' + student.lName || '',

            mobile: student.mobile || '',

        }))

    }
    else {
        return {
            id: students?.id || '',
            districtName: students?.school?.center?.taluka?.district?.districtName || '',
            talukaName: students?.school?.center?.taluka?.talukaName || '',
            centerName: students?.school?.center?.centerName || '',
            schoolName: students?.school?.schoolName || '',
            standard: students?.standard || '',
            medium: students?.medium || '',
            examNo: students?.examNo || '',
            fName: students?.fName || '',
            mName: students?.mName || '',
            lName: students?.lName || '',
            mobile: students.mobile || '',
        }
    }


}

const generateExamNo = async (schoolId, standard) => {

    // Find the latest exam number for the given school and standard
    const lastStudent = await Student.findOne({
        where: { schoolId: schoolId, standard: standard },
        order: [['examNo', 'DESC']] // Get the latest exam number
    });

    let newSeq = 1;

    if (lastStudent && lastStudent.examNo) {

        // Extract numeric part and increment
        const lastExamNo = parseInt(lastStudent.examNo.toString().substring(3));

        newSeq = lastExamNo + 1;
    }

    // Generate new exam number as an integer
    return parseInt(`${schoolId}${standard}${String(newSeq).padStart(3, '0')}`);
};


const addStudent = asyncHandler(async (req, res) => {
    const { schoolId, standard, medium, fName, mName, lName, mobile } = req.body;

    // Ensure all required fields are present and not empty
    if ([schoolId, standard, medium, fName, mName, lName, mobile].some(field =>
        field === undefined || field === null ||
        (typeof field === 'string' && field.trim() === '') ||
        (typeof field === 'number' && isNaN(field))
    )) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required!!!'));
    }

    // Validate numeric fields (schoolId, standard, mobile)
    if (![schoolId, standard, mobile].every(num => Number.isInteger(num) && num > 0)) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid numeric values!!!'));
    }

    // Validate mobile number
    if (mobile.toString().length !== 10 || typeof mobile !== 'number') {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Mobile no Format!!!'));
    }

    // Validate medium
    if (!['M', 'S', 'E'].includes(medium)) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Medium !!!'));
    }

    try {
        const schoolDetails = await School.findByPk(schoolId);
        if (!schoolDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'School not Found!!!'));
        }

        const examNo = await generateExamNo(schoolId, standard);

        if (!examNo) {
            return res.json(500).json(new APIResponce(500, {}, 'Something went wrong while genrating Exam No.!!!'))
        }

        const newStudent = await Student.create({
            schoolId,
            standard,
            medium,
            fName,
            mName,
            lName,
            mobile,
            examNo
        })
        if (!newStudent) {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Adding new Student!!!'));
        }

        return res
            .status(200)
            .json(new APIResponce(200, newStudent, 'Student Added Successfully...'))
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Student Already Exist!!!'));
        }
        else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while adding Student!!!'))
        }
    }
});

const getAllStudents = asyncHandler(async (req, res) => {
    try {
        const allStudent = await Student.findAll({
            include: [{
                model: School,
                as: 'school',
                attributes: ['schoolName'],
                include: {
                    model: Center,
                    as: 'center',
                    attributes: ['centerName'],
                    include: {
                        model: Taluka,
                        as: 'taluka',
                        attributes: ['talukaName'],
                        include: {
                            model: District,
                            as: 'district',
                            attributes: ['districtName']
                        }
                    }
                }
            }],
            attributes: ['id', 'standard', 'medium', 'fName', 'mName', 'lName', 'mobile', 'examNo'],
            order: [['examNo', 'ASC']]
        });
        if (!allStudent || allStudent.length === 0) {
            return res.status(404).json(new APIResponce(404, {}, 'No Student available.'));
        }
        return res.status(200).json(new APIResponce(200, distructObject(allStudent), 'All Students fetched successfully.'));


    } catch (error) {
        console.error('Error while fetching students:', error.stack || error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while fetching Students.'));
    }
});

const updateStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { schoolId, standard, medium, fName, mName, lName, mobile } = req.body;

    if (!studentId) {
        return res.status(400).json(new APIResponce(400, {}, 'Student Id is Required !!!'));
    }

    if ([schoolId, standard, medium, fName, mName, lName, mobile].some(field => !field?.toString().trim())) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required!!!'));
    }

    if (typeof mobile !== 'number' || mobile.toString().length !== 10) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Mobile no Format!!!'));
    }

    try {
        const student = await Student.findByPk(studentId);

        if (!student) {
            return res.status(404).json(new APIResponce(404, {}, 'Student not Found!!!'));
        }

        let newExamNo;
        try {
            newExamNo = await generateExamNo(schoolId, standard);
            
        } catch (err) {
            return res.status(500).json(new APIResponce(500, {}, 'Error generating exam number!'));
        }

        await student.update({ medium, fName, mName, lName, mobile, standard, examNo: newExamNo });

        const updatedStudent = await Student.findOne({
            where: { examNo: newExamNo },
            include: [{
                model: School,
                as: 'school',
                attributes: ['schoolName'],
                include: {
                    model: Center,
                    as: 'center',
                    attributes: ['centerName'],
                    include: {
                        model: Taluka,
                        as: 'taluka',
                        attributes: ['talukaName'],
                        include: {
                            model: District,
                            as: 'district',
                            attributes: ['districtName']
                        }
                    }
                }
            }],
            attributes: ['id', 'standard', 'medium', 'fName', 'mName', 'lName', 'mobile', 'examNo'],
        });

        if (!updatedStudent) {
            return res.status(500).json(new APIResponce(500, {}, 'Something Went Wrong!!!'));
        }

        return res.status(200).json(new APIResponce(200, distructObject(updatedStudent), 'Student Details Updated Successfully...'));

    } catch (error) {
        console.error('Error updating student details:', error);
        return res.status(500).json(new APIResponce(500, {}, "Internal Server Error!!!"));
    }
});


const deleteStudent = asyncHandler(async (req, res) => {
    const { examNo } = req.params;
    if (!examNo && typeof examNo !== 'number') {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Exam no!!!'))
    }
    try {
        const deletedStudent = await Student.destroy({
            where: { examNo }
        });
        if (deletedStudent) {
            return res.status(200).json(new APIResponce(200, {}, 'Student Deleted Successfully'));
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'Student Not Found!!!'))
        }
    } catch (error) {
        console.log('Student delete', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while deleting Student'));
    }
});

const downloadStudentList = asyncHandler(async (req, res) => {
    const { districtId, talukaId, centerId, schoolId } = req.query;

    // const queryOptions = {
    //     include: [{
    //         model: School,
    //         as: 'school',
    //         attributes: ['schoolName'],
    //         include: {
    //             model: Center,
    //             as: 'center',
    //             attributes: ['centerName'],
    //             include: {
    //                 model: Taluka,
    //                 as: 'taluka',
    //                 attributes: ['talukaName'],
    //                 include: {
    //                     model: District,
    //                     as: 'district',
    //                     attributes: ['districtName']
    //                 }
    //             }
    //         }
    //     }]
    // }

    // // Apply filters based on query params
    // if(schoolId){
    //     queryOptions.where={schoolId};
    // }else if(centerId){
    //     queryOptions.include[0].where={centerId}
    // }else if(talukaId){
    //     queryOptions.include[0].include.where={talukaId}
    // }else if(districtId){
    //     queryOptions.include[0].include.include.where={districtId}
    // }
    // const studentList=await Student.findAll(queryOptions);

    let whereCondition = {};
    if (districtId) {
        whereCondition["$School.Center.Taluka.districtId$"] = districtId;
    } else if (talukaId) {
        whereCondition["$School.Center.talukaId$"] = talukaId;
    } else if (centerId) {
        whereCondition["$School.centerId$"] = centerId;
    } else if (schoolId) {
        whereCondition.schoolId = schoolId;
    }


    // Query to get students
    const studentList = await Student.findAll({
        where: whereCondition,
        include: [{
            model: School,
            as: 'school',
            attributes: ['schoolName'],
            include: {
                model: Center,
                as: 'center',
                attributes: ['centerName'],
                include: {
                    model: Taluka,
                    as: 'taluka',
                    attributes: ['talukaName'],
                    include: {
                        model: District,
                        as: 'district',
                        attributes: ['districtName']
                    }
                }
            }
        }],
    });

    if (!studentList || studentList.length === 0) {
        return res.status(404).json(new APIResponce(404, {}, 'No Student available.'));
    }
    const students = distructObject(studentList)

    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', layout: 'horizontal' });

    // Construct the absolute path for the logo
    const logoPath = path.resolve(__dirname, '../../public/logo.png');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="District-list.pdf"');

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add logo and organization name
    const organizationName = 'Indian Talent Search Entrance';
    const logoWidth = 30;
    const logoHeight = 30;

    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 250, 35, { width: logoWidth, height: logoHeight, align: 'center' });
        doc.fontSize(22).font('Times-Bold').text(organizationName, 110, 40, { align: 'center', underline: true });
    } else {
        doc.fontSize(22).font('Times-Bold').text(organizationName, 50, 50, { align: 'center', underline: true });
    }

    // Add title and district name
    doc.moveDown(0.2);
    doc.fontSize(14).text(`Student List`, { align: 'center', characterSpacing: '0.5' });
    doc.moveDown();
    doc.fontSize(12).text(`District: ${students[0].districtName}`, 50, 100, { align: 'left', characterSpacing: '0.5' });

    // Define table parameters
    const headers = ['SN', 'Std', 'Student Name', 'Mobile', 'School Name', 'Center Name', 'Exam No.'];
    const columnWidths = [30, 30, 180, 90, 180, 100, 70];
    const rowHeaderHeight = 20;
    const rowHeight = 25;
    let x = 50;
    let y = 120;
    let page = 1;

    // Func to draw table headers
    const drawTableHeaders = () => {
        x = 50;
        headers.forEach((header, index) => {
            doc.lineWidth(1)
                .fillColor('#D3D3D3')
                .rect(x, y, columnWidths[index], rowHeaderHeight)
                .fill()
                .strokeColor('black')
                .rect(x, y, columnWidths[index], rowHeaderHeight)
                .stroke();

            doc.font('Times-Bold')
                .fillColor('black')
                .fontSize(10)
                .text(header.toUpperCase(), x + 5, y + 5, {
                    width: columnWidths[index] - 10,
                    align: 'center',
                });

            x += columnWidths[index];
        });

        x = 50;
        y += rowHeaderHeight;
    };

    // Func to draw page footer with page numbers
    const drawFooter = (currentPage, totalPages) => {
        doc.fontSize(10)
            .text(`Page: ${currentPage} of ${totalPages}`, 700, 100, { align: 'left', characterSpacing: '0.5' });
    };

    // Calculate total pages 
    const itemsPerPage = Math.floor((500 - y) / rowHeight);
    const totalPages = Math.ceil(students.length / itemsPerPage);

    // Draw table headers for first page
    drawTableHeaders();

    // Draw table rows
    students.forEach((student, index) => {
        const values = [
            index + 1, // Sr.No
            student.standard,
            student.sName,
            student.mobile,
            student.schoolName,
            student.centerName,
            student.examNo
        ];

        values.forEach((value, i) => {
            doc.lineWidth(0.5)
                .strokeColor('black')
                .rect(x, y, columnWidths[i], rowHeight)
                .stroke();

            doc.font('Times-Roman')
                .fontSize(10)
                .text(value.toString(), x + 5, y + 5, {
                    width: columnWidths[i] - 10,
                    align: 'left',
                });

            x += columnWidths[i];
        });

        x = 50;
        y += rowHeight;

        // Check if a new page is needed
        if (y > 500) {
            drawFooter(page, totalPages); // Draw footer before adding a new page
            page++;
            doc.addPage({ size: 'A4', layout: 'horizontal' });
            y = 50;
            drawTableHeaders();
        }
    });

    // Draw footer on the last page
    drawFooter(page, totalPages);

    // Finalize the PDF
    doc.end();


});



export {
    addStudent,
    getAllStudents,
    updateStudent,
    deleteStudent,
    downloadStudentList,
}

