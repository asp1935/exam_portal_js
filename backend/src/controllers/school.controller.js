import Center from '../models/center.model.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { APIResponce } from '../utils/APIResponce.js'
import School from '../models/school.model.js';
import Taluka from '../models/taluka.model.js';
import District from '../models/district.model.js';
import Representative from '../models/representative.model.js';

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
        const allSchools = await School.findAll({
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
            attributes: ['id', 'schoolName']
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
        if(deletedSchool){
            return res.status(200).json(new APIResponce(200,{},'School Deleted Successfully...'));
        }else{
            return res.status(404).json(new APIResponce(404,{},'School not Found!!!'))
        }
    } catch (error) {
        console.log('Error While Deteting School',error);
        return res.status(500).json(new APIResponce(500,{},'Something went Wrong while Deteteing School!!!'))
    }
})

export {
    addSchool,
    getAllSchools,
    updateSchool,
    deleteschool,
}