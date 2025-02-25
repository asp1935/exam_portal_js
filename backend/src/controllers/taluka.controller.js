import { APIResponce } from "../utils/APIResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Taluka from "../models/taluka.model.js";
import District from "../models/district.model.js";
import { fileURLToPath } from 'url';
import path from "path";
import fs from 'fs';
import PDFDocument from 'pdfkit'

// Get the current file directory (ESM alternative to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addTaluka = asyncHandler(async (req, res) => {
    const { districtId, talukaName } = req.body;
    if (!districtId || !talukaName) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields Required!!!'));
    }

    try {
        const district = await District.findByPk(districtId);
        if (!district) {
            return res.status(404).json(new APIResponce(404, {}, 'District Not Found!!!'));
        }
        const newTaluka = await Taluka.create({
            talukaName,
            districtId
        })
        if (!newTaluka) {
            return res.status(500).json(new APIResponce(500, {}, 'Something went wrong while adding Taluka!!!'))
        }
        return res
            .status(201)
            .json(new APIResponce(201, newTaluka, 'Taluka Added successfully.'));
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Taluka Already Exist!!!'));
        } else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!!!'));
        }

    }
});

const getAllTalukas = asyncHandler(async (req, res) => {
    try {
        const allTalukas = await Taluka.findAll({
            include: [{
                model: District,
                as: 'district',
                attributes: ['districtName']
            }],
            attributes: ['id', 'talukaName', 'createdAt', 'updatedAt'],
        })

        if (!allTalukas) {
            return res.status(500).json(new APIResponce(500, {}, 'Something went wrong!!!'));
        }

        const result = allTalukas.map((taluka) => ({
            id: taluka.id,
            districtName: taluka.district?.districtName, // Safely access districtName
            talukaName: taluka.talukaName,
            createdAt: taluka.createdAt,
            updatedAt: taluka.updatedAt,
        }));

        return res
            .status(200)
            .json(new APIResponce(200, result, 'Talukas Fetched Successfully'));

    } catch (error) {
        console.log('Server Error', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!!!'))

    }
});

const getTalukasByDist = asyncHandler(async (req, res) => {
    const { distId } = req.params;
    if (!distId) {
        return res.status(400).json(new APIResponce(400, {}, 'District not Provided!!!'))
    }
    const district = await District.findByPk(distId);
    if (!district) {
        return res.status(404).json(new APIResponce(404, {}, 'District Not Found!!!'));
    }
    try {
        const talukas = await Taluka.findAll({
            where: {
                districtId: distId
            },
            include: [{
                model: District,
                as: 'district',
                attributes: ['districtName']
            }],
            attributes: ['id', 'talukaName', 'createdAt', 'updatedAt']
        });
        if (!talukas) {
            return res.status(500).json(new APIResponce(500, {}, 'Something Went Wrong!!!'))
        }
        const result = talukas.map(taluka => ({
            id: taluka.id,
            districtName: taluka.district?.districtName,
            talukaName: taluka.talukaName,
            createdAt: taluka.createdAt,
            updatedAt: taluka.updatedAt
        }))
        return res
            .status(200)
            .json(new APIResponce(200, result, 'Talukas Fetched Successfully'));

    } catch (error) {
        console.log('Server Error', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!!!'))

    }
});

const updateTaluka = asyncHandler(async (req, res) => {
    const { talukaId } = req.params;
    const { newTalukaName } = req.body;

    if (!newTalukaName || !talukaId) {
        return res.status(400).json(new APIResponce(400, {}, 'New Taluka Name is not Provided!!!'))
    }
    try {
        const taluka = await Taluka.findByPk(talukaId);
        if (!taluka) {
            return res.status(404).json(new APIResponce(404, {}, 'Taluka not Found!!!'))
        }
        taluka.talukaName = newTalukaName;
        await taluka.save();
        const updatedTaluka = await Taluka.findOne({
            where: {
                id: taluka.id
            },
            include: [{
                model: District,
                as: 'district',
                attributes: ['districtName']
            }],
            attributes: ['id', 'talukaName', 'createdAt', 'updatedAt']
        });
        if (!updatedTaluka) {
            return res.status(500).json(new APIResponce(500, {}, 'Something Went Wrong!!!'))
        }
        const result = {
            id: updatedTaluka.id,
            districtName: updatedTaluka.district?.districtName,
            talukaName: updatedTaluka.talukaName,
            createdAt: updatedTaluka.createdAt,
            updatedAt: updatedTaluka.updatedAt
        }

        return res.status(200).json(new APIResponce(200, result, 'Taluka Updated Successfully...'))
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Taluka Already Exist!!!'));
        } else {
            console.log('Server Error', error);
            return res.status(500).json(new APIResponce(500, {}, "Internal Server Error!!!"))
        }
    }
});

const deleteTaluka = asyncHandler(async (req, res) => {
    const { talukaId } = req.params;
    if (!talukaId) {
        return res.status(400).json(new APIResponce(400, {}, "Taluka Id not Provided!!!"));
    }
    try {
        const deletedTaluka = await Taluka.destroy({
            where: { id: talukaId },
        });

        if (deletedTaluka) {
            return res.status(200).json(new APIResponce(200, {}, 'Taluka deleted successfully.'));
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'Taluka not found.'));
        }
    } catch (error) {
        console.error('Error deleting Taluka:', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!'));
    }
});
//district wise pdf
const downloadTalukaList = asyncHandler(async (req, res) => {
    try {
        const allTalukas = await Taluka.findAll({
            include: [{
                model: District,
                as: 'district',
                attributes: ['districtName']
            }],
            attributes: ['id', 'talukaName'],
        });
        if (!allTalukas) {
            return res.status(204).json(new APIResponce(204, {}, 'No Data Present!!!'))
        }
        const talukas = allTalukas.map((taluka) => ({
            id: taluka.id,
            districtName: taluka.district?.districtName, // Safely access districtName
            talukaName: taluka.talukaName,

        }));


        // Sort talukas by districtName
        talukas.sort((a, b) => {
            if (a.districtName < b.districtName) {
                return -1; // a comes before b
            }
            if (a.districtName > b.districtName) {
                return 1; // b comes before a
            }
            return 0; // a and b are equal
        });
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
        doc.fontSize(14).text(`Taluka List`, { align: 'center', characterSpacing: '0.5' });
        doc.moveDown();

        // Define table parameters
        const headers = ['SN', 'District', 'Taluka'];
        const columnWidths = [30, 150, 150];
        let x = 50;
        let y = 150;
        const rowHeight = 20;

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
        talukas.forEach((dist, index) => {
            const values = [
                index + 1, // Sr.No
                dist.districtName, // District name
                dist.talukaName, //Taluka Name
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
        doc.end()
    } catch (error) {
        console.log('Server Error', error);
        return res.status(500).json(new APIResponce(500, {}, "Internal Server Error while downloading Taluka"))
    }
})



export {
    addTaluka,
    updateTaluka,
    getAllTalukas,
    getTalukasByDist,
    deleteTaluka,
    downloadTalukaList,
}