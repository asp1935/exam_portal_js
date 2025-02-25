import Criteria from '../models/criteria.model.js';
import { APIResponce } from '../utils/APIResponce.js';
import { asyncHandler } from '../utils/AsyncHandler.js'

const addCriteria = asyncHandler(async (req, res) => {
    const { passingMarks, totalMarks, stateRank, districtRank, talukaRank, centerRank } = req.body;

    // Check if all fields are present and are integers
    const fields = [passingMarks, totalMarks, stateRank, districtRank, talukaRank, centerRank];
    if (!fields.every(field => Number.isInteger(field))) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required and Must be Integers!'));
    }
    try {
        const newCriteria = await Criteria.create({
            passingMarks: passingMarks,
            totalMarks: totalMarks,
            stateWiseRank: stateRank,
            districtWiseRank: districtRank,
            talukaWiseRank: talukaRank,
            centerWiseRank: centerRank,
        });
        if (!newCriteria) {
            return res.status(500).json(new APIResponce(500, {}, 'Something went wrong will Adding new Criteria!!!'));
        }
        return res
            .status(200)
            .json(new APIResponce(200, newCriteria, 'New Result Criteria Added Successfully...'))
    } catch (error) {
        console.log('Error While adding new Criteria!!!', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server error while Adding new Criteria!!!'));
    }
});

const updateCriteria = asyncHandler(async (req, res) => {
    const { criteriaId } = req.params;
    const { passingMarks, totalMarks, stateRank, districtRank, talukaRank, centerRank } = req.body;

    // Convert criteriaId to an int
    const parsedCriteriaId = parseInt(criteriaId);
    if (!parsedCriteriaId || !Number.isInteger(parsedCriteriaId)) {
        return res.status(400).json(new APIResponce(400, {}, 'Valid Criteria Id Required!!!'));
    }

    // Check if all fields are present and are integers
    const updateFields = [passingMarks, totalMarks, stateRank, districtRank, talukaRank, centerRank];
    if (!updateFields.every(field => Number.isInteger(field))) {
        return res.status(400).json(new APIResponce(400, {}, 'All Fields are Required and Must be Integers!'));
    }

    try {
        // Update the criteria 
        const criteria = await Criteria.findByPk(parsedCriteriaId);

        if (!criteria) {
            return res.status(404).json(new APIResponce(404, {}, 'Criteria Not Found!!!'));
        }
        criteria.set(
            {
                passingMarks: passingMarks,
                totalMarks: totalMarks,
                stateWiseRank: stateRank,
                districtWiseRank: districtRank,
                talukaWiseRank: talukaRank,
                centerWiseRank: centerRank,
            }
        );
        await criteria.save();
        return res.status(200).json(new APIResponce(200, criteria, 'Criteria Updated Successfully...'));
    } catch (error) {
        console.log('Error while updating Criteria', error);
        return res.status(500).json(new APIResponce(500, {}, 'Internal Server Error while Updating Critera!!!'))
    }

});

const deleteCriteria = asyncHandler(async (req, res) => {
    const { criteriaId } = req.params;

    if (!criteriaId || !Number.isInteger(parseInt(criteriaId))) {
        return res.status(400).json(new APIResponce(400, {}, 'Valid Criteria Id Required!!!'));
    }

    const parsedCriteriaId = parseInt(criteriaId);
    console.log(parsedCriteriaId);
    
    try {
        const deletedCriteria = await Criteria.destroy({ where: { id: parsedCriteriaId } });
        if (deletedCriteria) {
            return res.status(200).json(new APIResponce(200, {}, 'Result Criteria Deleted Sccessfully...'))
        } else {
            return res.status(404).json(new APIResponce(404, {}, 'Result Criteria Not found!!!'));
        }
    } catch (error) {
        console.log('Error while Deleting Result Critera', error);
        return res.status(500).json(new APIResponce(500, {}, 'Intenal Server Error while Deleting Result Criteria!!!'));
    }
});

const getAllCriteris=asyncHandler(async(req,res)=>{
    const  criteriaId  = parseInt(req.query.criteriaId)||null;
    // const parsedCriteriaID = criteriaID ? parseInt(criteriaID) : null;

    if(criteriaId && !Number.isInteger(criteriaId)){
        return res.status(400).json(new APIResponce(400,{},'Valid Result Criteria Id Required!!!'))
    } 

    const whereCondition=criteriaId?{id:criteriaId}:{};

    try {
        const allCriterias=await Criteria.findAll({
            where:whereCondition,
        })
        if(allCriterias.length===0){
            return res.status(200).json(new APIResponce(200,allCriterias,'No Result Criteria Available...')); 
        }
        return res
            .status(200)
            .json(new APIResponce(200,allCriterias,'All Result Criterias Fetched...'))
    } catch (error) {
        console.log('Error while Fetching Result Criterias',error);
        return res.status(500).json(new APIResponce(500,{},'Intrenal Server Error while Fetching Result Criterias!!!'))
        
    }

});



export {
    addCriteria,
    updateCriteria,
    deleteCriteria,
    getAllCriteris,
}
