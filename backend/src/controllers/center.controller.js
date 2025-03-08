import Center from '../models/center.model.js';
import District from '../models/district.model.js';
import Taluka from '../models/taluka.model.js';
import { APIResponce } from '../utils/APIResponce.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';


// Get the current file directory (ESM alternative to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distructObject = (centers) => {
    if (Array.isArray(centers)) {
        return centers.map((center) => ({
            id: center.id,
            districtName: center?.taluka?.district?.districtName || '',
            talukaName: center?.taluka?.talukaName || '',
            centerName: center.centerName,
            ceatedAt: center.createdAt,
            updatedAt: center.updatedAt,
        }))

    }
    else {
        return {
            id: centers.id,
            distictName: centers?.taluka?.district?.districtName || '',
            talukaName: centers?.taluka?.talukaName || '',
            centerName: centers.centerName,
            ceatedAt: centers.createdAt,
            updatedAt: centers.updatedAt,
        }

    }


}

const addCenter = asyncHandler(async (req, res) => {
    const { talukaId, centerName } = req.body;
    if (!talukaId || !centerName) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required!!!'));
    }
    try {
        const talukaDetails = await Taluka.findByPk(talukaId);
        if (!talukaDetails) {
            return res.status(404).json(new APIResponce(404, {}, 'Taluka Not Found!!!'))
        }
        const newCenter = await Center.create({
            talukaId,
            centerName
        })

        if (!newCenter) {
            return res.status(500).json(new APIResponce(500, {}, 'Something went wrong while adding new Center'));
        }
        return res
            .status(200)
            .json(new APIResponce(200, newCenter, 'New Center Addedd Successfully...'))
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Center Already Exist!!!'));
        } else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error!!!'))
        }
    }
})

const getAllCenters = asyncHandler(async (req, res) => {
    try {
        const { districtId, talukaId } = req.query;
        let whereCondition = {};

        if (districtId) {
            const district = await District.findByPk(districtId);
            if (!district) {
                return res.status(404).json(new APIResponce(404, {}, 'District Not Found!!!'));
            }
        }

        if (talukaId) {
            const taluka = await Taluka.findByPk(talukaId);
            if (!taluka) {
                return res.status(404).json(new APIResponce(404, {}, 'Taluka Not Found!!!'));
            }
        }
        // Apply filters if IDs are provided
        if (talukaId) {
            whereCondition = { talukaId };
        } else if (districtId) {
            whereCondition = {
                '$taluka.district.id$': districtId // Filter by district indirectly via taluka
            };
        }

        const allCenters = await Center.findAll({
            where: whereCondition,
            include: [
                {
                    model: Taluka,
                    as: 'taluka',
                    include: {
                        model: District,
                        as: 'district',
                        attributes: ['districtName']
                    },
                    attributes: ['talukaName']
                }
            ],
            attributes: ['id', 'centerName', 'createdAt', 'updatedAt']
        })
        if (!allCenters) {
            return res.status(204).json(new APIResponce(204, {}, 'No Center Available'))
        }
        return res.status(200).json(new APIResponce(200, distructObject(allCenters), 'All centers Fetched...'))
    } catch (error) {
        console.log('Center fetch', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while fetching centers!!!'))
    }
})

const updateCenter = asyncHandler(async (req, res) => {
    const { centerId } = req.params;
    const { newCenterName } = req.body;

    if (!centerId || !newCenterName) {
        return res.status(400).json(new APIResponce(400, {}, "All Fields are Required!!!"))
    }
    try {
        const center = await Center.findByPk(centerId);
        if (!center) {
            return res.status(404).json(new APIResponce(404, {}, 'Center not Found!!!'));
        }

        center.centerName = newCenterName;
        await center.save();

        const updatedCenter = await Center.findOne({
            where: {
                id: center.id
            },
            include: [
                {
                    model: Taluka,
                    as: 'taluka',
                    attributes: ['talukaName'],
                    include: [{
                        model: District,
                        as: 'district',
                        attributes: ['districtName']
                    }],
                }
            ],
            attributes: ['id', 'centerName', 'createdAt', 'updatedAt']
        })
        if (!updatedCenter) {
            return res.status(500).json(new APIResponce(500, {}, 'Something Went Wrong!!!'))
        }

        return res.status(200).json(new APIResponce(200, distructObject(updatedCenter), "Center Details Updated Successfully!!!"));
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Center Already Exist!!!'));
        } else {
            console.log('Center Update Error', error);
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Updating Center!!!'))
        }
    }
})

const deleteCenter = asyncHandler(async (req, res) => {
    const { centerId } = req.params;
    if (!centerId) {
        return res.status(400).json(new APIResponce(400, {}, 'Center Id not Provided!!!'));
    }
    try {
        const deletedCenter = await Center.destroy({
            where: { id: centerId }
        })
        if (deletedCenter) {
            return res.status(200).json(new APIResponce(200, {}, 'Center Deleted Successfully...'))
        }
        else {
            return res.status(404).json(new APIResponce(404, {}, 'Center not found!!!'))
        }
    } catch (error) {
        console.log('Center Delete Error', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server error while Deleting Center!!!!'));
    }
});

const downloadCenterList = asyncHandler(async (req, res) => {
    try {
        const { districtId, talukaId } = req.query;
        let whereCondition = {};

        if (districtId) {
            const district = await District.findByPk(districtId);
            if (!district) {
                return res.status(404).json(new APIResponce(404, {}, 'District Not Found!!!'));
            }
        }

        if (talukaId) {
            const taluka = await Taluka.findByPk(talukaId);
            if (!taluka) {
                return res.status(404).json(new APIResponce(404, {}, 'Taluka Not Found!!!'));
            }
        }
        // Apply filters if IDs are provided
        if (districtId && talukaId) {
            whereCondition = { talukaId };
        } else if (districtId) {
            whereCondition = {
                '$taluka.district.id$': districtId // Filter by district indirectly via taluka
            };
        }
        const allCenters = await Center.findAll({
            where:whereCondition,
            include: [{
                model: Taluka,
                as: 'taluka',
                attributes: ['talukaName'],
                include: [{
                    model: District,
                    as: 'district',
                    attributes: ['districtName']
                }]
            }],
            attributes: ['id', 'centerName']
        })
        if (!allCenters) {
            return res.status(204).json(new APIResponce(204, {}, 'No Centers'))
        }
        const centers = distructObject(allCenters);

        // Sort talukas by districtName
        centers.sort((a, b) => {
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
        doc.fontSize(14).text(`Center List`, { align: 'center', characterSpacing: '0.5' });
        doc.moveDown();

        // Define table parameters
        const headers = ['SN', 'District', 'Taluka', 'Center'];
        const columnWidths = [30, 120, 120, 120];
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
        centers.forEach((dist, index) => {
            const values = [
                index + 1, // Sr.No
                dist.districtName, // District name
                dist.talukaName, //Taluka Name
                dist.centerName, //Center Name
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
                    .text(value?.toString(), x + 5, y + 5, {
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
        console.log('Error while Downloading Centers File', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Servere Error while Downloading Center File'))
    }
})

export {
    addCenter,
    getAllCenters,
    updateCenter,
    deleteCenter,
    downloadCenterList,
}
