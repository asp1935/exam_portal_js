import Center from '../models/center.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { APIResponce } from '../utils/APIResponce.js'
import School from '../models/school.model.js';
import Taluka from '../models/taluka.model.js';
import District from '../models/district.model.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';


// Get the current file directory (ESM alternative to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distructObject = (schools) => {
    if (Array.isArray(schools)) {
        return schools.map((school) => ({
            id: school.id,
            districtName: school?.center?.taluka?.district?.districtName || '',
            talukaName: school?.center?.taluka?.talukaName || '',
            centerName: school?.center?.centerName,
            schoolName: school?.schoolName
        }))

    }
    else {
        return {
            id: schools.id,
            districtName: schools?.center?.taluka?.district?.districtName || '',
            talukaName: schools?.center?.taluka?.talukaName || '',
            centerName: schools?.center?.centerName,
            schoolName: schools.schoolName,
        }

    }


}

const addSchool = asyncHandler(async (req, res) => {
    const { schoolName, centerId } = req.body;
    if (!schoolName || !centerId) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required!!!'));
    }
    try {
        const centerDetails = await Center.findByPk(centerId);
        if (!centerDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'Center not Found!!!'));
        }
        const newSchool = School.create({
            schoolName,
            centerId
        });
        if (!newSchool) {
            return res.status(500).json(new APIResponce(500, {}, 'Somethng went wrong while adding new School!!!'))
        }
        return res
            .status(200)
            .json(new APIResponce(200, newSchool, 'New School Added Successfully...'))
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'School is Already Exist!!!'))
        } else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!!!'))
        }
    }
});

const getAllSchools = asyncHandler(async (req, res) => {
    try {
        const { districtId, talukaId, centerId } = req.query;

        // Fetch district, taluka, and center in one go
        const [district, taluka, center] = await Promise.all([
            districtId ? District.findByPk(districtId) : null,
            talukaId ? Taluka.findByPk(talukaId) : null,
            centerId ? Center.findByPk(centerId) : null,
        ]);

        // Handle Not Found cases
        if (districtId && !district) return res.status(404).json(new APIResponce(404, {}, 'District Not Found!'));
        if (talukaId && !taluka) return res.status(404).json(new APIResponce(404, {}, 'Taluka Not Found!'));
        if (centerId && !center) return res.status(404).json(new APIResponce(404, {}, 'Center Not Found!'));

        // Build filtering condition
        let whereCondition = {};

        if (centerId) {
            whereCondition.centerId = centerId;
        } else if (talukaId) {
            whereCondition['$center.taluka.id$'] = talukaId;
        } else if (districtId) {
            whereCondition['$center.taluka.district.id$'] = districtId;
        }

        const allSchools = await School.findAll({
            where: whereCondition,
            include: [{
                model: Center,
                as: 'center',
                attributes: ['centerName'],
                include: [{
                    model: Taluka,
                    as: 'taluka',
                    attributes: ['talukaName'],
                    include: {
                        model: District,
                        as: 'district',
                        attributes: ['districtName']
                    }
                },
                    // {
                    //     model:Representative,
                    //     as:'representative',
                    //     attributes:['rName']
                    // }
                ]
            }],
            attributes: ['id', 'schoolName'],
            order: [
                ['center', 'taluka', 'district', 'districtName', 'ASC'],
                ['center', 'taluka', 'talukaName', 'ASC'],
                ['center', 'centerName', 'ASC'],
                ['schoolName', 'ASC'],
            ]
        });
        if (!allSchools || allSchools.length === 0) {
            return res.status(404).json(new APIResponce(404, {}, 'No School available.'));
        }
        return res.status(200).json(new APIResponce(200, distructObject(allSchools), 'All Schools Fetched Successfully...'))
    } catch (error) {
        console.log('All School Fetch Error', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error While Fetchig Schools'))
    }
})

const updateSchool = asyncHandler(async (req, res) => {
    const { schoolId } = req.params;
    const { schoolName } = req.body;

    if (!schoolId || !schoolName) {
        return res.status(400).json(new APIResponce(400, {}, 'School Id and School Name is Required!!!'));
    }
    try {
        const school = await School.findByPk(schoolId);
        if (!school) {
            return res.status(404).json(new APIResponce(404, {}, 'School Not Found!!!'));
        }
        school.schoolName = schoolName;
        school.save();

        const updatedSchool = await School.findOne({
            where: {
                id: schoolId
            },
            include: [{
                model: Center,
                as: 'center',
                attributes: ['centerName'],
                include: [{
                    model: Taluka,
                    as: 'taluka',
                    attributes: ['talukaName'],
                    include: {
                        model: District,
                        as: 'district',
                        attributes: ['districtName']
                    }
                }],
            }],
            attributes: ['id', 'schoolName'],
        });

        if (!updateSchool) {
            return res.status(500).json(new APIResponce(500, {}, 'Something went Wrong'));
        }
        return res
            .status(200)
            .json(new APIResponce(200, distructObject(updatedSchool), 'School Name Updated Successfully...'))

    } catch (error) {
        console.log('Update School Error', error);
        return res.status(500).json(new APIResponce(500, {}, 'Something went wrong while Updating School Details'));
    }
});

const deleteschool = asyncHandler(async (req, res) => {
    const { schoolId } = req.params;
    if (!schoolId) {
        return res.status(400).json(new APIResponce(400, {}, 'School Id is not Provided!!!'))
    }
    try {
        const deletedSchool = await School.destroy({
            where: {
                id: schoolId
            }
        });
        if (deletedSchool) {
            return res.status(200).json(new APIResponce(200, {}, 'School Deleted Successfully...'));
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'School not Found!!!'))
        }
    } catch (error) {
        console.log('Error While Deteting School', error);
        return res.status(500).json(new APIResponce(500, {}, 'Something went Wrong while Deteteing School!!!'))
    }
});

const downloadSchoolList = asyncHandler(async (req, res) => {
    try {
        const { districtId, talukaId, centerId } = req.query;

        // Fetch district, taluka, and center in one go
        const [district, taluka, center] = await Promise.all([
            districtId ? District.findByPk(districtId) : null,
            talukaId ? Taluka.findByPk(talukaId) : null,
            centerId ? Center.findByPk(centerId) : null,
        ]);

        // Handle Not Found cases
        if (districtId && !district) return res.status(404).json(new APIResponce(404, {}, 'District Not Found!'));
        if (talukaId && !taluka) return res.status(404).json(new APIResponce(404, {}, 'Taluka Not Found!'));
        if (centerId && !center) return res.status(404).json(new APIResponce(404, {}, 'Center Not Found!'));

        // Build filtering condition
        let whereCondition = {};

        if (centerId) {
            whereCondition.centerId = centerId;
        } else if (talukaId) {
            whereCondition['$center.taluka.id$'] = talukaId;
        } else if (districtId) {
            whereCondition['$center.taluka.district.id$'] = districtId;
        }

        const allSchools = await School.findAll({
            where: whereCondition,
            include: [{
                model: Center,
                as: 'center',
                attributes: ['centerName'],
                include: [{
                    model: Taluka,
                    as: 'taluka',
                    attributes: ['talukaName'],
                    include: {
                        model: District,
                        as: 'district',
                        attributes: ['districtName']
                    }
                },
                    // {
                    //     model:Representative,
                    //     as:'representative',
                    //     attributes:['rName']
                    // }
                ]
            }],
            attributes: ['id', 'schoolName'],
            order: [
                ['center', 'taluka', 'district', 'districtName', 'ASC'],
                ['center', 'taluka', 'talukaName', 'ASC'],
                ['center', 'centerName', 'ASC'],
                ['schoolName', 'ASC'],
            ]
        });
        if (!allSchools || allSchools.length === 0) {
            return res.status(404).json(new APIResponce(404, {}, 'No School available.'));
        }


        const schools = distructObject(allSchools);
        // Create a new PDF document
        const doc = new PDFDocument({ size: 'A4', layout: 'portrait' });

        // Construct the absolute path for the logo
        const logoPath = path.resolve(__dirname, '../../public/logo.png');

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="School-list.pdf"`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add logo and name
        const organizationName = 'Indian Talent Search Entrance';
        const logoWidth = 30;
        const logoHeight = 30;

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 120, 35, { width: logoWidth, height: logoHeight, align: 'center' }); // Add logo
            doc.fontSize(22).font('Times-Bold').text(organizationName, 110, 40, { align: 'center', underline: true }); // Add organization name
        } else {
            doc.fontSize(22).font('Times-Bold').text(organizationName, 50, 50, { align: 'center', underline: true }); // Add only organization name if no logo
        }
        // Add title below the logo and name
        doc.moveDown(0.5); // Add some space after the logo and name

        // Add title
        doc.fontSize(14).text(`School List`, { align: 'center', characterSpacing: '0.5' });
        doc.moveDown();

        // Define table parameters
        const headers = ['SN', 'District', 'Taluka', 'Center', 'School Name'];
        const columnWidths = [30, 70, 70, 70, 200];
        let x = 50;
        let y = 120;
        const rowHeight = 25;

        // Draw table header with borders
        headers.forEach((header, index) => {
            // Draw header cell
            doc.lineWidth(1)
                .strokeColor('black')
                .rect(x, y, columnWidths[index], rowHeight)
                .stroke();

            // Add bold header text
            doc.font('Times-Bold')
                .fontSize(10)
                .text(header.toUpperCase(), x + 5, y + 5, {
                    width: columnWidths[index] - 10,
                    align: 'center',
                });
            x += columnWidths[index];
        });

        // Reset x and move down for rows
        x = 50;
        y += rowHeight;

        // Draw table rows
        schools.forEach((school, index) => {
            const values = [
                index + 1, // Sr.No
                school.districtName, // District name
                school.talukaName, //Taluka Name
                school.centerName, //Center Name
                school.schoolName,
            ];

            values.forEach((value, i) => {
                // Draw cell border
                doc.lineWidth(0.5)
                    .strokeColor('black')
                    .rect(x, y, columnWidths[i], rowHeight)
                    .stroke();

                // Add cell text
                doc.font('Times-Roman')
                    .fontSize(10)
                    .text(value?.toString(), x + 5, y + 5, {
                        width: columnWidths[i] - 10,
                        align: 'center',

                    });

                x += columnWidths[i];
            });

            // Move to the next row
            x = 50;
            y += rowHeight;

            // Check if we need to add a new page
            if (y > 750) {
                doc.addPage({ size: 'A4', layout: 'portrait' });
                y = 50; // Reset y position for the new page

                // Redraw table headers on the new page
                headers.forEach((header, index) => {
                    doc.lineWidth(1)
                        .strokeColor('black')
                        .rect(x, y, columnWidths[index], rowHeight)
                        .stroke();

                    doc.font('Times-Bold')
                        .fontSize(12)
                        .text(header, x + 5, y + 5, {
                            width: columnWidths[index] - 10,
                            align: 'left',
                        });
                    x += columnWidths[index];
                });

                x = 50;
                y += rowHeight;
            }
        });

        // Finalize the PDF
        doc.end()
    } catch (error) {
        console.log('Error while Downloading School File', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Servere Error while Downloading School File'))
    }
})

export {
    addSchool,
    getAllSchools,
    updateSchool,
    deleteschool,
    downloadSchoolList
}