import { APIResponce } from '../utils/APIResponce.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import fs from 'fs';
import csv from 'csv-parser';
import SetA_Result from '../models/setA_Result.model.js';
import SetB_Result from '../models/setB_Result.model.js';
import Student from '../models/student.model.js';
import calculateTotlMarksAndRanking from '../utils/calculateTotalMarksAndRanking.js';
import School from '../models/school.model.js';
import Center from '../models/center.model.js';
import Taluka from '../models/taluka.model.js';
import District from '../models/district.model.js';
import path from 'path';
import { fileURLToPath } from "url";
import PDFDocument from 'pdfkit';
import { Op } from 'sequelize';

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
            aSetMark: student?.setA_result?.marks || 0,
            bSetMark: student?.setB_result?.marks || 0,
            totalMarks: student?.totalMarks || 0,
            rank: student?.rank || '',
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
            aSetMark: students?.setA_result?.marks || 0,
            bSetMark: students?.setB_result?.marks || 0,
            totalMarks: students?.totalMarks || 0,
            rank: students?.rank || '',
        }
    }


}

// const aSetResultUpload = asyncHandler(async (req, res) => {
//     const results = [];
//     const csvFilePath = req.file?.path;
//     if (!csvFilePath) {
//         return res.status(400).json(new APIResponce(400, {}, 'Set A result CSV file requires!!!'))
//     }
//     fs.createReadStream(csvFilePath)
//         .pipe(csv({ headers: ['examNo', 'marks'], skipLines: 1 }))
//         .on('data', (data) => {

//             // Determine mark and remark
//             const examNo = parseInt(data.examNo);
//             if (isNaN(examNo)) return; // Skip row if examNo is not a valid number
//             const marks = data.marks ? parseInt(data.marks) : null;
//             const remark = marks !== null && marks >= 0 ? 'Present' : 'Absent';

//             // Push data to the results array
//             results.push({
//                 examNo: examNo,
//                 marks: marks,
//                 remark: remark,
//             });

//         })
//         .on('end', async () => {
//             try {
//                 // Bulk create or update results in the database
//                 await SetA_Result.bulkCreate(results, {
//                     updateOnDuplicate: ['marks', 'remark'],
//                 });
//                 // Fetch and display absent students
//                 const absentStudents = await SetA_Result.findAll({
//                     where: { remark: 'Absent' },
//                     attributes: ['examNo'],
//                 });

//                 res.status(201).json(new APIResponce(200, absentStudents, 'Result uploaded Successfully'));
//             } catch (error) {
//                 console.error('Error saving data:', error);
//                 res.status(500).json({ error: 'Failed to save data' });
//             } finally {
//                 // Clean up the uploaded file
//                 fs.unlinkSync(req.file.path);
//             }
//         })  
// })

const resultSetUpload = asyncHandler(async (req, res) => {
    const results = [];
    const csvFilePath = req.file?.path;
    const setType = req.query.set; // Expecting 'A' or 'B'

    if (Array.isArray(setType)) {
        return res.status(400).json(new APIResponce(400, {}, 'Only one set type is allowed! Use either A or B, not both.'));
    }
    // Check if set type is provided and valid
    if (!setType || !['A', 'B'].includes(setType.toUpperCase())) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid or missing set type!!!'));
    }

    // select the model based on set type
    const ResultModel = setType.toUpperCase() === 'A' ? SetA_Result : SetB_Result;

    if (!csvFilePath) {
        return res.status(400).json(new APIResponce(400, {}, `Set ${setType} result CSV file is required!`));
    }

    fs.createReadStream(csvFilePath)
        .pipe(csv({ headers: ['examNo', 'marks'], skipLines: 1 }))
        .on('data', async (data) => {
            const examNo = parseInt(data.examNo);
            if (isNaN(examNo)) return; // Skip row if examNo is not a valid number
            const marks = data.marks ? parseInt(data.marks) : 0;
            const remark = marks !== null && marks > 0 ? 'Present' : 'Absent';

            results.push({
                examNo: examNo,
                marks: marks,
                remark: remark,
            });
        })
        .on('end', async () => {
            try {
                await ResultModel.bulkCreate(results, {
                    updateOnDuplicate: ['marks', 'remark'],
                });

                // Fetch and display absent students
                const absentStudents = await ResultModel.findAll({
                    where: { remark: 'Absent' },
                    attributes: ['examNo'],
                });

                res.status(201).json(new APIResponce(200, absentStudents, `Set ${setType} Result uploaded successfully ${absentStudents.length > 0 ? `${absentStudents.length} Absent Students` : '0 Absent Students'}`));
            } catch (error) {
                console.error('Error saving data:', error);
                res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Uploading Result Data !!!'));
            } finally {
                fs.unlinkSync(req.file.path);
            }
        });
});

const updateMarks = asyncHandler(async (req, res) => {
    const { examNo, marks, set } = req.body;

    // Validate required fields
    if (!set || !examNo || !marks) {
        return res.status(400).json(new APIResponce(400, {}, 'All Feilds are Required!!!'));
    }
    // Validate set type
    if (!['A', 'B'].includes(set.toUpperCase())) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Set Type!!!'));
    }
    // Validate examNo and marks as integers
    if (![examNo, marks].every(Number.isInteger)) {
        return res.status(400).json(new APIResponce(400, {}, 'Exam No and Marks must be Integers!'));
    }
    const remark = marks !== null && marks >= 0 ? 'Present' : 'Absent';
    // select the model based on set type
    const ResultModel = set.toUpperCase() === 'A' ? SetA_Result : SetB_Result;

    try {
        const existingRecord = await ResultModel.findOne({ where: { examNo } });
        if (existingRecord) {
            // If present, update the marks
            existingRecord.set({ marks, remark });
            await existingRecord.save();
            return res.status(200).json(new APIResponce(200, existingRecord, 'Marks updated successfully!'));
        } else {
            // If not present, create a new record
            const newMarks = await ResultModel.create({ examNo, marks, remark });
            if (!newMarks) {
                return res.status(500).json(new APIResponce(500, {}, 'Something Went Wrong!!!'))
            }
            return res.status(201).json(new APIResponce(201, newMarks, 'Marks added successfully!'));
        }
    } catch (error) {
        console.log('Error while updating Marks', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Updating Marks!!!'));
    }
});

const deleteMarks = asyncHandler(async (req, res) => {
    const examNo = req.params?.examNo;

    // Check if examNo is provided and is a valid number
    if (!examNo || isNaN(parseInt(examNo))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid or Missing Exam Number!!!'));
    }

    // Convert examNo to an integer
    const examNumber = parseInt(examNo);

    try {
        // Delete from SetA_Result and SetB_Result
        const deletedExamNoA = await SetA_Result.destroy({ where: { examNo: examNumber } });
        const deletedExamNoB = await SetB_Result.destroy({ where: { examNo: examNumber } });

        // Check if the record was found and deleted 
        if (deletedExamNoA === 0 && deletedExamNoB === 0) {
            return res.status(404).json(new APIResponce(404, {}, 'No Record Found for the Provided Exam Number!!!'));
        }

        return res.status(200).json(new APIResponce(200, { examNo: examNumber }, `Exam Number ${examNumber} deleted successfully!`));
    } catch (error) {
        console.log('Error while deleteing marks', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Deleting Marks!!!'))
    }
});

const clearAllMarks = asyncHandler(async (req, res) => {
    try {
        // Clear all records from SetA_Result and SetB_Result tables
        await SetA_Result.destroy({ where: {} });
        await SetB_Result.destroy({ where: {} });

        res.status(200).json(new APIResponce(200, {}, 'All records deleted successfully!'));
    } catch (error) {
        console.error('Error deleting records:', error);
        res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while deleting records!'));
    }
});

const getAllSetWiseMarks = asyncHandler(async (req, res) => {
    // Get page and limit from query params, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const examNo = parseInt(req.query.examNo) || null;
    const set = req.query.set;
    const offset = (page - 1) * limit;

    if (!set || !['A', 'B'].includes(set.toUpperCase())) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Set Type!!!'));
    }

    try {
        // Set up the where condition
        const whereCondition = examNo ? { examNo: examNo } : {};

        // select the model based on set type
        const ResultModel = set.toUpperCase() === 'A' ? SetA_Result : SetB_Result;

        // Fetch marks with pagination
        const { count, rows: marks } = await ResultModel.findAndCountAll({
            where: whereCondition,
            attributes: ['examNo', 'marks'],
            limit: limit,
            offset: offset,
            order: [['examNo', 'ASC']]  // Sorting by examNo in ascending order
        });

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);
        if (marks.length === 0) {
            return res.status(200).json(new APIResponce(200, {
                currentPage: page,
                totalPages: totalPages,
                totalRecords: count,
                marks: marks,

            }, 'No Data Available...'))
        }

        res.status(200).json(new APIResponce(200, {
            currentPage: page,
            totalPages: totalPages,
            totalRecords: count,
            marks: marks
        }, 'Marks fetched successfully!'));
    } catch (error) {
        console.error('Error fetching marks:', error);
        res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while fetching marks!'));
    }
});

const gernrateResult = asyncHandler(async (req, res) => {
    try {
        const { statusCode, data, message } = await calculateTotlMarksAndRanking();
        return res.status(statusCode).json(new APIResponce(statusCode, data, message))
    } catch (error) {
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!!!'))
    }
});

const downloadResultList = asyncHandler(async (req, res) => {
    const { districtId, talukaId, centerId, schoolId, rankOrder } = req.query;

    let whereCondition = {};
    let orderCondition = [['examNo', 'ASC']];


    const validRanks = ['state', 'district', 'taluka', 'center'];
    const rankMap = {
        state: '%State%',
        district: '%District%',
        taluka: '%Taluka%',
        center: '%Center%'
    };
    const rankIdFieldMap = {
        district: "$School.Center.Taluka.districtId$",
        taluka: "$School.Center.talukaId$",
        center: "$School.centerId$"
    };

    if (rankOrder && validRanks.includes(rankOrder.toLowerCase())) {
        const lowerRankOrder = rankOrder.toLowerCase();
        orderCondition = [['standard', 'ASC'], ['rank', 'ASC']];

        if (lowerRankOrder === 'state') {
            whereCondition.rank = { [Op.like]: rankMap[lowerRankOrder] };
        } else if (lowerRankOrder === 'district' && districtId) {
            whereCondition[rankIdFieldMap.district] = parseInt(districtId, 10);
            whereCondition.rank = { [Op.like]: rankMap[lowerRankOrder] };
        } else if (lowerRankOrder === 'taluka' && talukaId) {
            whereCondition[rankIdFieldMap.taluka] = parseInt(talukaId, 10);
            whereCondition.rank = { [Op.like]: rankMap[lowerRankOrder] };
        } else {
            return res.status(400).json(new APIResponce(400, {}, 'Invalid Compbination Passed!!!'))
        }

    } else if (districtId) {
        whereCondition["$School.Center.Taluka.districtId$"] = parseInt(districtId, 10);
    } else if (talukaId) {
        whereCondition["$School.Center.talukaId$"] = parseInt(talukaId, 10);
    } else if (centerId) {
        whereCondition["$School.centerId$"] = parseInt(centerId, 10);
    } else if (schoolId) {
        whereCondition.schoolId = parseInt(schoolId, 10);
    }



    console.log(whereCondition);

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
        }, {
            model: SetA_Result,
            as: 'setA_result',
            attributes: ['marks'],
        },
        {
            model: SetB_Result,
            as: 'setB_result',
            attributes: ['marks'],
        }],
        order: orderCondition
    });

    if (!studentList || studentList.length === 0) {
        return res.status(404).json(new APIResponce(404, {}, 'No Student available.'));
    }
    const students = distructObject(studentList)
    // return res.status(200).json(new APIResponce(200,students,'Student data'))

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

    // Define table parameters
    const headers = ['SN', 'Std', 'Student Name', 'Mobile', 'School Name', 'Exam No.', 'Set A', 'Set B', 'Total', 'Remark'];
    const columnWidths = [30, 30, 180, 80, 150, 60, 50, 50, 50, 80];
    const rowHeaderHeight = 20;
    const rowHeight = 25;
    let x = 30;
    let y = 120;
    let page = 1;
    const centerAlignColumns = [0, 1, 3, 5, 6, 7, 8, 9];
    // let currentCenter = students[0]?.centerName;
    // Func to draw table headers
    const drawTableHeaders = () => {
        x = 30;
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
                .text(header, x + 5, y + 5, {
                    width: columnWidths[index] - 10,
                    align: 'center'
                });

            x += columnWidths[index];
        });

        x = 30;
        y += rowHeaderHeight;
    };

    // Func to draw page footer with page numbers
    const drawHeader = (currentPage, totalPages) => {
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
        doc.fontSize(12).text(`Taluka: ${students[0].talukaName}`, 250, 100, { align: 'left', characterSpacing: '0.5' });
        doc.fontSize(12).text(`Center: ${students[0].centerName}`, 500, 100, { align: 'left', characterSpacing: '0.5' });
        // doc.fontSize(12).text(`Center: ${currentCenter}`, 500, 100, { align: 'left', characterSpacing: '0.5' });

        doc.fontSize(10)
            .text(`Page: ${currentPage} of ${totalPages}`, 700, 100, { align: 'left', characterSpacing: '0.5' });

    };

    // Calculate total pages 
    const itemsPerPage = Math.floor((500 - y) / rowHeight);
    const totalPages = Math.ceil(students.length / itemsPerPage);

    // Draw table headers for first page
    drawHeader(page, totalPages);
    drawTableHeaders();

    // Draw table rows
    students.forEach((student, index) => {
        // if (student.centerName !== currentCenter) {
        //     currentCenter = student.centerName;
        //     page++;
        //     doc.addPage({ size: 'A4', layout: 'horizontal' });
        //     y = 120;

        //     // Draw new header and table headers for the new center
        //     drawHeader(page, totalPages);
        //     drawTableHeaders();
        // }
        const values = [
            index + 1, // Sr.No
            student.standard,
            student.sName,
            student.mobile,
            student.schoolName,
            student.examNo,
            student.aSetMark,
            student.bSetMark,
            student.totalMarks,
            student.rank,
        ]
        values.forEach((value, i) => {
            doc.lineWidth(0.5)
                .strokeColor('black')
                .rect(x, y, columnWidths[i], rowHeight)
                .stroke();

            doc.font('Times-Roman')
                .fontSize(10)
                .text(value.toString(), x + 5, y + 5, {
                    width: columnWidths[i] - 10,
                    align: 'center',
                });

            x += columnWidths[i];
        });

        x = 30;
        y += rowHeight;

        // Check if a new page is needed
        if (y > 500) {
            drawHeader(page, totalPages); // Draw footer before adding a new page
            page++;
            doc.addPage({ size: 'A4', layout: 'horizontal' });
            y = 120;
            drawTableHeaders();
        }
    });

    // Draw footer on the last page
    drawHeader(page, totalPages);

    // Finalize the PDF
    doc.end();


});


export {
    resultSetUpload,
    updateMarks,
    deleteMarks,
    clearAllMarks,
    getAllSetWiseMarks,
    gernrateResult,
    downloadResultList,

}