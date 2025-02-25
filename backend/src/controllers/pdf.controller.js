import Center from "../models/center.model.js";
import Exam from "../models/exam.model.js";
import School from "../models/school.model.js";
import Student from "../models/student.model.js";
import Subject from "../models/subject.model.js";
import { APIResponce } from "../utils/APIResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from 'pdfkit';
import Taluka from "../models/taluka.model.js";
import District from "../models/district.model.js";
import Criteria from "../models/criteria.model.js";
import SetA_Result from "../models/setA_Result.model.js";
import SetB_Result from "../models/setB_Result.model.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const todaysDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');

    return `${day}-${month}-${year}`;
}

const centerwiseHallTicket = asyncHandler(async (req, res) => {
    const { centerId } = req.params;
    if (!centerId || isNaN(parseInt(centerId))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Center ID!!!'));
    }
    const whereCondition = { '$School.centerId$': centerId };

    try {
        const examDetails = await Exam.findOne({
            include: [{
                model: Subject,
                as: 'subjects',
                attributes: ['id', 'subName', 'examDate', 'examTime']
            }],
            order: [['createdAt', 'DESC']],
        });

        if (!examDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'Exam Details are not Available, Please Add Details!!!'));
        }

        const studentList = await Student.findAll({
            where: whereCondition,
            include: [{
                model: School,
                as: 'school',
                attributes: ['schoolName'],
                include: {
                    model: Center,
                    as: 'center',
                    attributes: ['centerName']
                }
            }],
            attributes: ['id', 'fName', 'mName', 'lName', 'mobile', 'examNo']
        });

        if (!studentList || studentList.length === 0) {
            return res.status(404).json(new APIResponce(404, {}, 'No Student available.'));
        }

        // Create a new PDF document
        const doc = new PDFDocument({ size: 'A4', layout: 'portrait' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${studentList[1].school.center.centerName}-HallTickets.pdf"`);

        // Pipe the PDF to the response
        doc.pipe(res);

        const examinationName = examDetails.examName;
        const logoPath = path.resolve(__dirname, `../../${examDetails.logoUrl ? (examDetails.logoUrl) : '../../public/logo.png'}`);
        const examHead = path.resolve(__dirname, `../../${examDetails.signPngUrl ? (examDetails.signPngUrl) : '../../public/sign.png'}`);
        const logoWidth = 30;
        const logoHeight = 30;
        const hallTicketWidth = 535;
        const hallTicketHeight = 270;
        let x = 30;
        let y = 20;

        studentList.forEach((student, index) => {
            if (y + hallTicketHeight > 700) {
                doc.addPage({ size: 'A4', layout: 'portrait' });
                y = 30;
            }

            // Draw Hall Ticket Border
            doc.lineWidth(1)
                .strokeColor('black')
                .rect(x, y, hallTicketWidth, hallTicketHeight)
                .stroke();

            // Add Logo and Exam Name
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, x + 125, y + 5, { width: logoWidth, height: logoHeight });
            }

            doc.fontSize(18).font('Times-Bold').text(examinationName, x + 80, y + 13, { align: 'center', underline: true });

            doc.moveDown(0.3);
            doc.fontSize(12).font('Times-Bold').text('Hall Ticket', { align: 'center', underline: true });

            // Student Details
            doc.moveDown();
            doc.fontSize(12).font('Times-Bold');
            doc.text(`Student Name: `, x + 20, y + 60);
            doc.text(`Exam No: `, x + 300, y + 80);
            doc.text(`Center Name: `, x + 20, y + 80);
            doc.text(`School Name: `, x + 20, y + 100);

            doc.fontSize(12).font('Times-Roman');
            doc.text(`${student.fName} ${student.mName} ${student.lName}`, x + 120, y + 60);
            doc.fontSize(18).font('Times-Bold').fillColor('red').text(`${student.examNo}`, x + 360, y + 78);
            doc.fontSize(12).font('Times-Roman').fillColor('black');

            doc.text(`${student.school.center.centerName}`, x + 120, y + 80);
            doc.text(`${student.school.schoolName}`, x + 120, y + 100);

            // Subject Details
            doc.fontSize(14).font('Times-Bold').text(`Time Table`, x + 20, y + 115, { underline: true, align: 'center' });
            doc.font('Times-Roman');

            const headers = ['Sr.No.', 'Subject', 'Date', 'Time'];
            const columnWidths = [50, 120, 80, 80];
            const rowHeight = 20;
            let tableX = 120;
            let tableY = y + 145;
            headers.forEach((header, index) => {
                doc.lineWidth(1)
                    .fillColor('white')
                    .rect(tableX, tableY, columnWidths[index], rowHeight)
                    .fill()
                    .strokeColor('black')
                    .rect(tableX, tableY, columnWidths[index], rowHeight)
                    .stroke();

                doc.font('Times-Bold')
                    .fillColor('black')
                    .fontSize(10)
                    .text(header.toUpperCase(), tableX + 5, tableY + 5, {
                        width: columnWidths[index] - 10,
                        align: 'center',
                    });

                tableX += columnWidths[index];
            });
            tableX = 120;
            tableY += rowHeight;

            examDetails.subjects.forEach((subject, subIndex) => {
                const values = [subIndex + 1, subject.subName, subject.examDate, subject.examTime]
                // doc.text(`${subIndex + 1}. ${subject.subName} - Date: ${subject.examDate}, Time: ${subject.examTime}`, x + 30, y + 190 + subIndex * 20);
                values.forEach((value, i) => {
                    doc.lineWidth(0.5)
                        .strokeColor('black')
                        .rect(tableX, tableY, columnWidths[i], rowHeight)
                        .stroke();

                    doc.font('Times-Roman')
                        .fontSize(10)
                        .text(value.toString(), tableX + 5, tableY + 5, {
                            width: columnWidths[i] - 10,
                            align: 'center',
                        });

                    tableX += columnWidths[i];
                });
                tableX = 120;
                tableY += rowHeight;
            });


            // Hall Ticket Note
            doc.moveDown();
            doc.fontSize(10).fillColor('red').text('Note: This hall ticket is mandatory for exam entry. Please carry a valid ID along with the hall ticket.', x + 20, y + 210, {
                width: hallTicketWidth - 40,
                align: 'center'
            });
            // Add Logo and Exam Name
            if (fs.existsSync(logoPath)) {
                doc.image(examHead, x + 433, y + 220, { width: 50, height: 30 });
            }
            doc.fontSize(12).fillColor('black').font('Times-Bold').text(`Exam Head`, x + 430, y + 250);

            // Move to next hall ticket position
            y += hallTicketHeight + 5;
            doc.fontSize(10).fillColor('red').text('Support and Development By -', x + 130, y);
            doc.fontSize(10).fillColor('blue').text('http://jijausoftwares.in/', x + 270, y, { underline: true });
            doc.fontSize(10).fillColor('black').text('------------------------------------------------', x + 20, y + 15, { align: 'center', characterSpacing: '4' });
            y += 35;



        });

        doc.end();
    } catch (error) {
        console.error('Error While downloading hall ticket:', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Downloading Hall Ticket!!!'));
    }
});

const centerwiseCertificate = asyncHandler(async (req, res) => {
    const { centerId } = req.params;
    if (!centerId || isNaN(parseInt(centerId))) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Center ID!!!'));
    }
    const whereCondition = { '$School.centerId$': centerId };

    try {
        const examDetails = await Exam.findOne({
            include: [{
                model: Subject,
                as: 'subjects',
                attributes: ['id', 'subName', 'examDate', 'examTime']
            }],
            order: [['createdAt', 'DESC']],
        });

        if (!examDetails || !examDetails.subjects.length) {
            return res.status(404).json(new APIResponce(404, {}, 'Exam Details are not Available, Please Add Details!!!'));
        }

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
            },
            {
                model: SetA_Result,
                as: 'setA_result',
                attributes: ['marks']
            },
            {
                model: SetB_Result,
                as: 'setB_result',
                attributes: ['marks']
            }
            ],
            attributes: ['id', 'standard', 'fName', 'mName', 'lName', 'mobile', 'examNo', 'totalMarks', 'rank']
        });

        if (!studentList || studentList.length === 0) {
            return res.status(404).json(new APIResponce(404, {}, 'No Student available.'));
        }

        const criteriaDetails = await Criteria.findOne({
            order: [['createdAt', 'DESC']]
        });

        if (!criteriaDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'Criteria Details are not Available, Please Add Details!!!'));
        }

        // Create a new PDF document
        const doc = new PDFDocument({ size: 'A4', layout: 'portrait' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${studentList[1].school.center.centerName}-certificates.pdf"`);

        // Pipe the PDF to the response
        doc.pipe(res);
        let x = 30;
        let y = 300;


        studentList.forEach((student, index) => {
            doc.fontSize(15).font('Times-Bold').fillColor('black');
            doc.text(`${examDetails.examDate}`, x, y, { align: 'center' })
            doc.moveDown(1);
            doc.text(`Student Name:`, x + 40, y + 50)
            doc.text(`Std:`, x + 400, y + 50)
            doc.text(`Exam Number:`, x + 40, y + 90)
            doc.text(`School Name:`, x + 40, y + 130)

            doc.text((`${student.lName} ${student.fName} ${student.mName} `).toUpperCase(), x + 142, y + 50)
            doc.text(`${student.standard} `, x + 430, y + 50)
            doc.text(`${student.examNo} `, x + 142, y + 90)
            doc.text(`${student.school.schoolName} Tal. ${student.school.center.taluka.talukaName} Dist. ${student.school.center.taluka.district.districtName}  `, x + 142, y + 130, { maxWidth: 50 })

            const headers = ['Subject', 'Maximum Marks', 'Obtained Marks', 'Result', 'Special Eligibility'];
            const columnWidths = [130, 90, 80, 80, 100];
            const rowHeight = 40;
            let tableX = 40;
            let tableY = y + 150;
            const maxMarks = criteriaDetails.totalMarks / (examDetails.subjects.length)
            headers.forEach((header, index) => {
                doc.lineWidth(1)
                    .fillColor('white')
                    .rect(tableX, tableY, columnWidths[index], rowHeight)
                    .fill()
                    .strokeColor('black')
                    .rect(tableX, tableY, columnWidths[index], rowHeight)
                    .stroke();

                doc.font('Times-Bold')
                    .fillColor('black')
                    .fontSize(14)
                    .text(header, tableX + 5, tableY + 5, {
                        width: columnWidths[index] - 10,
                        align: 'center',
                    });

                tableX += columnWidths[index];
            });
            tableX = 40
            tableY += rowHeight;

            examDetails.subjects.forEach((subject, index) => {
                const values = [subject.subName, maxMarks,];
                values.forEach((value, i) => {
                    doc.lineWidth(0.5)
                        .strokeColor('black')
                        .rect(tableX, tableY, columnWidths[i], rowHeight)
                        .stroke();
                    doc.font('Times-Roman')
                        .fontSize(14)
                        .text((value).toString(), tableX + 5, tableY + 15, {
                            width: columnWidths[i] - 10,
                            align: 'center',
                        });
                    tableX += columnWidths[i];
                })

                tableX = 40;
                tableY += rowHeight;
            });

            tableX = 260;
            tableY = y + 150 + rowHeight;
            doc.lineWidth(0.5)
                .strokeColor('black')
                .rect(tableX, tableY, columnWidths[3], rowHeight)
                .stroke();
            doc.font('Times-Roman')
                .fontSize(14)
                .text((student.setA_result.marks).toString(), tableX + 5, tableY + 15, {
                    width: columnWidths[3] - 10,
                    align: 'center',
                });

            tableY = y + 150 + rowHeight + rowHeight;

            doc.lineWidth(0.5)
                .strokeColor('black')
                .rect(tableX, tableY, columnWidths[3], rowHeight)
                .stroke();
            doc.font('Times-Roman')
                .fontSize(14)
                .text((student.setB_result.marks).toString(), tableX + 5, tableY + 15, {
                    width: columnWidths[3] - 10,
                    align: 'center',
                });
            tableX += 80;
            tableY = y + 150 + rowHeight
            doc.lineWidth(0.5)
                .strokeColor('black')
                .rect(tableX, tableY, columnWidths[3], rowHeight + rowHeight)
                .stroke();
            doc.font('Times-Roman')
                .fontSize(14)
                .text((`${['Fail', 'Absent'].includes(student.rank) ? student.rank : 'Qualified'}`), tableX + 5, tableY + 25, {
                    width: columnWidths[3] - 10,
                    align: 'center',
                });
            tableX += columnWidths[3];
            tableY = y + 150 + rowHeight
            doc.lineWidth(0.5)
                .strokeColor('black')
                .rect(tableX, tableY, columnWidths[4], rowHeight + rowHeight)
                .stroke();
            doc.font('Times-Roman')
                .fontSize(14)
                .text((`${['Fail', 'Absent', 'Qualified'].includes(student.rank) ? '-' : student.rank}`), tableX + 15, tableY + 25, {
                    width: columnWidths[3] - 10,
                    align: 'center',
                });

            doc.font('Times-Bold')
                .fontSize(14)
                .text(`Kolhapur`, x + 50, y + 300);

            doc.font('Times-Bold')
                .fontSize(14)
                .text(`Date : ${examDetails.resultDate || todaysDate }`, x + 30, y + 340);


            doc.addPage({ size: 'A4', layout: 'portrait' });
            y = 30;
        })
        doc.end();


    } catch (error) {
        console.error('Error While downloading hall ticket:', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Downloading Hall Ticket!!!'));
    }
})

// const 

export {
    centerwiseHallTicket,
    centerwiseCertificate
}