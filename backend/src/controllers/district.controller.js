import { asyncHandler } from "../utils/AsyncHandler.js";
// import { DataTypes, where } from "sequelize";
// import sequelize from "../config/db.js";
import { APIResponce } from "../utils/APIResponce.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import PDFDocument from "pdfkit";
import District from "../models/district.model.js";




// Get the current file directory (ESM alternative to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const addDistrict = asyncHandler(async (req, res) => {
    const { districtName } = req.body;
    if (!districtName) {
        return res
            .status(400)
            .json(new APIResponce(400, {}, 'District Name is Required!!!'))
    }
    try {
        const newDistrict = await District.create({ districtName });
        return res.status(201).json(new APIResponce(201, newDistrict, 'New District Added Successfully...'))
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'District Already Exist!!!'));
        } else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal server error'));
        }
    }
});
const getAllDistrict = asyncHandler(async (req, res) => {
    try {
        const districtList = await District.findAll();
        if (!districtList) {
            return res
                .status(200)
                .json(new APIResponce(200, {}, 'No District Present'))
        }
        return res
            .status(200)
            .json(new APIResponce(201, districtList, 'District Fetched Successfully'))

    } catch (error) {
        return res
            .status(500)
            .json(new APIResponce(500, {}, 'Internal Server Error!!!'))
    }
})

const updateDistrict = asyncHandler(async (req, res) => {
    const { districtId } = req.params;
    const { districtName } = req.body;
    if (!districtId || !districtName) {
        if (!districtId) {
            return res
                .status(400)
                .json(new APIResponce(400, {}, 'District ID not Provided!!!'))
        }
        else {
            return res
                .status(400)
                .json(new APIResponce(400, {}, 'New Name not Provided!!!'))
        }
    }
    try {
        const district = await District.findByPk(districtId);
        if (!district) {
            res.status(404).json(new APIResponce({ message: 'District not found.' }));
        }
        district.districtName = districtName;
        await district.save();

        return res.status(200).json(new APIResponce(200, district, 'District Updated Successfully...'))
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'District Already Exist!!!'));
        } else {
            console.log('Error While Updating District', error);
            res.status(500).json(new APIResponce({ message: 'Internal Server Error' }));
        }
    }
})

const deleteDistrict = asyncHandler(async (req, res) => {
    const { districtId } = req.params;

    if (!districtId) {
        return res.status(400).json(new APIResponce(400, {}, 'District ID not provided!'));
    }

    try {
        const deletedDistrict = await District.destroy({
            where: { id: districtId },
        });

        if (deletedDistrict) {
            return res.status(200).json(new APIResponce(200, {}, 'District deleted successfully.'));
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'District not found.'));
        }
    } catch (error) {
        console.error('Error deleting district:', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!'));
    }
});

const downloadDistrictList = asyncHandler(async (req, res) => {
    const districts = await District.findAll();
    if (!districts) {
        console.error('No District found in the database!');
        return;
    }

    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait' });

    // Construct the absolute path for the logo
    const logoPath = path.resolve(__dirname, '../../public/logo.png');

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="District-list.pdf"`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add logo and name
    const organizationName = 'Indian Talent Search Entrance';
    const logoWidth = 30;
    const logoHeight = 30;

    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 120, 35, { width: logoWidth, height: logoHeight, align: 'center' }); // Add logo
        doc.fontSize(22).font('Helvetica-Bold').text(organizationName, 110, 40, { align: 'center', underline: true }); // Add organization name
    } else {
        doc.fontSize(22).font('Helvetica-Bold').text(organizationName, 50, 50, { align: 'center', underline: true }); // Add only organization name if no logo
    }
    // Add title below the logo and name
    doc.moveDown(0.5); // Add some space after the logo and name

    // Add title
    doc.fontSize(14).text(`District List`, { align: 'center', characterSpacing: '0.5' });
    doc.moveDown();

    // Define table parameters
    const headers = ['SN', 'District'];
    const columnWidths = [30, 150];
    let x = 50;
    let y = 150;
    const rowHeight = 30;

    // Draw table header with borders
    headers.forEach((header, index) => {
        // Draw header cell
        doc.lineWidth(1)
            .strokeColor('black')
            .rect(x, y, columnWidths[index], rowHeight)
            .stroke();

        // Add bold header text
        doc.font('Helvetica-Bold')
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
    districts.forEach((dist, index) => {
        const values = [
            index + 1, // Sr.No
            dist.districtName, // District name
        ];

        values.forEach((value, i) => {
            // Draw cell border
            doc.lineWidth(0.5)
                .strokeColor('black')
                .rect(x, y, columnWidths[i], rowHeight)
                .stroke();

            // Add cell text
            doc.font('Helvetica')
                .fontSize(10)
                .text(value.toString(), x + 5, y + 5, {
                    width: columnWidths[i] - 10,
                    align: 'left',

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

                doc.font('Helvetica-Bold')
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
    doc.end();
});



export {
    addDistrict,
    getAllDistrict,
    updateDistrict,
    deleteDistrict,
    downloadDistrictList
}