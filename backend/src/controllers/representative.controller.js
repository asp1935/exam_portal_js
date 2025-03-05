import { APIResponce } from "../utils/APIResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Center from "../models/center.model.js";
import Representative from "../models/representative.model.js";
import Taluka from "../models/taluka.model.js";
import District from "../models/district.model.js";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';


// Get the current file directory (ESM alternative to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distructObject = (representatives) => {
    if (Array.isArray(representatives)) {
        return representatives.map((representative) => ({
            id: representative.id,
            districtName: representative?.center?.taluka?.district?.districtName || '',
            talukaName: representative?.center?.taluka?.talukaName || '',
            centerName: representative?.center?.centerName,
            rName: representative.rName,
            rMobile: representative.rMobile,
        }))

    }
    else {
        return {
            id: representatives.id,
            districtName: representatives?.center?.taluka?.district?.districtName || '',
            talukaName: representatives?.center?.taluka?.talukaName || '',
            centerName: representatives?.center?.centerName,
            rName: representatives.rName,
            rMobile: representatives.rMobile,
        }

    }


}

const addRepresentative = asyncHandler(async (req, res) => {
    const { repName, repMobile, centerId } = req.body;

    if (!repName || !repMobile || !centerId) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required!!! '));
    }
    //ensures exactly 10 digits
    if (typeof repMobile !== 'number' || repMobile.toString().length !== 10) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Mobile no Format!!! '));
    }

    // if (!/^\d{10}$/.test(repMobile)) {
    //     return res.status(400).json(new APIResponce(400, {}, 'Invalid Mobile no Format!!! '));
    // }
    try {
        const checkCenter = await Center.findByPk(centerId);
        if (!checkCenter) {
            return res.status(404).json(new APIResponce(404, {}, 'Center not Found!!!'))
        }

        const newRepresentative = await Representative.create({
            rName: repName,
            rMobile: repMobile,
            centerId: centerId

        })

        if (!newRepresentative) {
            return res.status(500).json(new APIResponce(500, {}, 'Something went wrong while Adding Representative'))
        }
        return res
            .status(200)
            .json(new APIResponce(200, newRepresentative, 'Representative Added Successfully...'));

    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Representative Already Exist!!!'));
        }
        else {
            return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while adding Representative'))
        }
    }
});

const getAllRepresentatives = asyncHandler(async (req, res) => {
    try {
        const { centerId } = req.params;

        let whereCondition = {};

        if (centerId) {
            console.log(centerId);

            const center = await Center.findByPk(centerId);
            if (!center) {
                return res.status(404).json(new APIResponce(404, {}, 'Center Not Found!!!'));
            }
            whereCondition = { centerId: centerId };
        }

        const allRepresentative = await Representative.findAll({
            where: whereCondition,
            include: [
                {
                    model: Center,
                    as: 'center',
                    attributes: ['centerName'],
                    include: [
                        {
                            model: Taluka,
                            as: 'taluka',
                            attributes: ['talukaName'],
                            include: [
                                {
                                    model: District,
                                    as: 'district',
                                    attributes: ['districtName'],
                                },
                            ],
                        },
                    ],
                },
            ],
            attributes: ['id', 'rName', 'rMobile'],
            order: [
                [{ model: Center, as: 'center' }, { model: Taluka, as: 'taluka' }, { model: District, as: 'district' }, 'districtName', 'ASC'], // First by district name
                [{ model: Center, as: 'center' }, { model: Taluka, as: 'taluka' }, 'talukaName', 'ASC'], // Then by taluka name
                [{ model: Center, as: 'center' }, 'centerName', 'ASC'], // Finally by center name
                ['rName', 'ASC']
            ],
        });

        if (!allRepresentative || allRepresentative.length === 0) {
            return res.status(404).json(new APIResponce(404, {}, 'No Representative available.'));
        }

        return res.status(200).json(new APIResponce(200, distructObject(allRepresentative), 'All Representatives fetched successfully.'));
    } catch (error) {
        console.error('Error while fetching representatives:', error.stack || error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while fetching representatives.'));
    }
});

const updateRepresentative = asyncHandler(async (req, res) => {
    const { representativeId } = req.params;
    const { newRepName, newRepMobile } = req.body;
    if (!representativeId || !newRepName || !newRepMobile) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required!!!'))
    }
    //ensures exactly 10 digits
    if (typeof newRepMobile !== 'number' || newRepMobile.toString().length !== 10) {
        return res.status(400).json(new APIResponce(400, {}, 'Invalid Mobile no Format!!! '));
    }
    try {
        const representative = await Representative.findByPk(representativeId);
        if (!representative) {
            return res.status(404).json(new APIResponce(404, {}, 'Representative Not Found!!!'));
        }
        representative.rName = newRepName;
        representative.rMobile = newRepMobile;
        await representative.save();
        const updatedRepresentative = await Representative.findByPk(representativeId, {
            include: [
                {
                    model: Center,
                    as: 'center',
                    attributes: ['centerName'],
                    include: [
                        {
                            model: Taluka,
                            as: 'taluka',
                            attributes: ['talukaName'],
                            include: [
                                {
                                    model: District,
                                    as: 'district',
                                    attributes: ['districtName'],
                                },
                            ],
                        },
                    ],
                },
            ],
            attributes: ['id', 'rName', 'rMobile'],
        });
        if (!updatedRepresentative) {
            return res.status(500).json(new APIResponce(500, {}, 'Something Went Wrong!!!'))
        }
        return res.status(200).json(new APIResponce(200, distructObject(updatedRepresentative), 'Representative Details Updated Successfully...'))
    } catch (error) {
        console.log('Something Went Wrong while updating Represenatative Details', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json(new APIResponce(400, {}, 'Taluka Already Exist!!!'));
        } else {
            console.log('Server Error', error);
            return res.status(500).json(new APIResponce(500, {}, "Internal Server Error!!!"))
        }
    }
});

const deleteRepresentative = asyncHandler(async (req, res) => {
    const { representativeId } = req.params;
    if (!representativeId) {
        return res.status(400).json(new APIResponce(400, {}, 'Represenatative Id Required!!!'))
    }
    try {
        const deletedRepresentative = await Representative.destroy({
            where: {
                id: representativeId
            }
        })
        if (deletedRepresentative) {
            return res.status(200).json(new APIResponce(200, {}, "Representative Deleted Successfully..."));
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'Represntative Not Found!!!'))
        }
    } catch (error) {
        console.log('Error while Deleting Represenatative', error);
        return res.status(500).json(new APIResponce(500, {}, 'Something went wrong while Deleting Represenatative!!!'));
    }
});

const getCenterRepresentative = asyncHandler(async (req, res) => {
    const { centerId } = req.params;

    if (!centerId) {
        return res.status(400).json(new APIResponce(400, {}, 'Center Id Not Provided!!!'));
    }

    try {
        const allRepresentatives = await Representative.findAll({
            where: { centerId },
            include: [
                {
                    model: Center,
                    as: 'center',
                    attributes: ['centerName'],
                    include: [
                        {
                            model: Taluka,
                            as: 'taluka',
                            attributes: ['talukaName'],
                            include: [
                                {
                                    model: District,
                                    as: 'district',
                                    attributes: ['districtName'],
                                },
                            ],
                        },
                    ],
                },
            ],
            attributes: ['id', 'rName', 'rMobile'],
            order: [
                [{ model: Center, as: 'center' }, 'centerName', 'ASC'],
                [{ model: Center, as: 'center' }, { model: Taluka, as: 'taluka' }, 'talukaName', 'ASC'],
                [{ model: Center, as: 'center' }, { model: Taluka, as: 'taluka' }, { model: District, as: 'district' }, 'districtName', 'ASC'],
                ['rName', 'ASC'],
            ],
        });

        if (!allRepresentatives.length) {
            return res.status(404).json(new APIResponce(404, {}, 'No Representative available.'));
        }

        return res.status(200).json(new APIResponce(200, distructObject(allRepresentatives), 'All Representatives fetched successfully.'));
    } catch (error) {
        console.error('Error while fetching representatives:', error.stack || error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while fetching representatives.'));
    }
});


const downloadRepresentativeList = asyncHandler(async (req, res) => {
    try {
        const { centerId } = req.params;

        let whereCondition = {};


        if (centerId) {
            const center = await Center.findByPk(centerId);
            if (!center) {
                return res.status(404).json(new APIResponce(404, {}, 'Center Not Found!!!'));
            }
            whereCondition = { centerId: centerId };
        }


        const allRepresentative = await Representative.findAll({
            where: whereCondition,
            include: [
                {
                    model: Center,
                    as: 'center',
                    attributes: ['centerName'],
                    include: [
                        {
                            model: Taluka,
                            as: 'taluka',
                            attributes: ['talukaName'],
                            include: [
                                {
                                    model: District,
                                    as: 'district',
                                    attributes: ['districtName'],
                                },
                            ],
                        },
                    ],
                },
            ],
            attributes: ['id', 'rName', 'rMobile'],
            order: [
                [{ model: Center, as: 'center' }, { model: Taluka, as: 'taluka' }, { model: District, as: 'district' }, 'districtName', 'DESC'], // First by district name
                [{ model: Center, as: 'center' }, { model: Taluka, as: 'taluka' }, 'talukaName', 'DESC'], // Then by taluka name
                [{ model: Center, as: 'center' }, 'centerName', 'DESC'], // Finally by center name
                ['rName', 'DESC']
            ],
        });

        const representatives = distructObject(allRepresentative);
        // Create a new PDF document
        const doc = new PDFDocument({ size: 'A4', layout: 'portrait' });

        // Construct the absolute path for the logo
        const logoPath = path.resolve(__dirname, '../../public/logo.png');

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Representative-list.pdf"`);

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
        doc.fontSize(14).text(`Representative List`, { align: 'center', characterSpacing: '0.5' });
        doc.moveDown();

        // Define table parameters
        const headers = ['SN', 'District', 'Taluka', 'Center', 'Rep. Name', 'Rep Mobile'];
        const columnWidths = [30, 70, 70, 70, 120, 100];
        let x = 50;
        let y = 120;
        const rowHeight = 20;

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
        representatives.forEach((representative, index) => {
            const values = [
                index + 1, // Sr.No
                representative.districtName, // District name
                representative.talukaName, //Taluka Name
                representative.centerName, //Center Name
                representative.rName,
                representative.rMobile
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
        console.log('Error while Downloading Representative File', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Servere Error while Downloading Representative File'))
    }
})


export {
    addRepresentative,
    getAllRepresentatives,
    updateRepresentative,
    deleteRepresentative,
    getCenterRepresentative,
    downloadRepresentativeList
}