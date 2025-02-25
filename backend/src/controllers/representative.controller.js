import { APIResponce } from "../utils/APIResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Center from "../models/center.model.js";
import Representative from "../models/representative.model.js";
import Taluka from "../models/taluka.model.js";
import District from "../models/district.model.js";

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
        const allRepresentative = await Representative.findAll({
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





export {
    addRepresentative,
    getAllRepresentatives,
    updateRepresentative,
    deleteRepresentative,
    getCenterRepresentative,
}