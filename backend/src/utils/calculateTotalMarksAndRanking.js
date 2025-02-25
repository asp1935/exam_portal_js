import Center from '../models/center.model.js';
import Criteria from '../models/criteria.model.js';
import School from '../models/school.model.js';
import SetA_Result from '../models/setA_Result.model.js';
import SetB_Result from '../models/setB_Result.model.js';
import Student from '../models/student.model.js';
import Taluka from '../models/taluka.model.js';

const calculateTotalMarksAndRanking = async () => {
    try {
        const criteria = await Criteria.findOne({
            order: [['createdAt', 'DESC']],
        });

        if (!criteria) {
            throw new Error('Criteria not found');
        }

        const { stateWiseRank, districtWiseRank, talukaWiseRank, centerWiseRank, passingMarks } = criteria;
        let pageSize;
        let page = 0;
        let students;

        for (let standard = 1; standard <= 8; standard++) {
            // do {
            students = await Student.findAll({
                // limit: pageSize,
                // offset: page * pageSize,
                where: { standard },
                attributes: ['id', 'examNo', 'standard', 'totalMarks', 'rank'],
                include: [
                    {
                        model: School,
                        as: 'school',
                        attributes: ['id', 'centerId'],
                        include: {
                            model: Center,
                            as: 'center',
                            attributes: ['id', 'talukaId'],
                            include: {
                                model: Taluka,
                                as: 'taluka',
                                attributes: ['id', 'districtId'],
                            },
                        },
                    },
                    {
                        model: SetA_Result,
                        as: 'setA_result',
                        attributes: ['marks', 'remark'],
                    },
                    {
                        model: SetB_Result,
                        as: 'setB_result',
                        attributes: ['marks', 'remark'],
                    },
                ],
            });

            console.log(`Fetched ${students.length} students for standard ${standard}`);

            students.forEach(student => {
                const setA_marks = student.setA_result ? student.setA_result.marks : 0;
                const setB_marks = student.setB_result ? student.setB_result.marks : 0;

                student.totalMarks = calculateTotalMarks(setA_marks, setB_marks);


                if (student.totalMarks < passingMarks) {
                    student.rank = 'Fail';
                }
                if (student?.setA_result?.remark === 'absent' || student?.setB_result?.remark === 'absent') {
                    student.totalMarks = 0;
                    student.rank = 'Absent'
                }
            });

            students.sort((a, b) => b.totalMarks - a.totalMarks);

            let rankedStudents = new Set();

            // State-wise Ranking
            if (stateWiseRank > 0) {
                rankTopN(students, stateWiseRank, 'State', rankedStudents);
            }

            // District-wise Ranking
            if (districtWiseRank > 0) {
                rankCategory(students, 'districtId', districtWiseRank, 'District', rankedStudents);
            }

            // Taluka-wise Ranking
            if (talukaWiseRank > 0) {
                rankCategory(students, 'talukaId', talukaWiseRank, 'Taluka', rankedStudents);
            }

            // Center-wise Ranking
            if (centerWiseRank > 0) {
                rankCategory(students, 'centerId', centerWiseRank, 'Center', rankedStudents);
            }

            // Qualified Rank for remaining students
            students.forEach(student => {
                if (!rankedStudents.has(student.id) && student.totalMarks >= passingMarks && student.rank !== 'Fail') {
                    student.rank = 'Qualified';
                }

            });

            // Update students with the calculated total marks and ranks using a transaction
            const transaction = await Student.sequelize.transaction();
            try {
                await Promise.all(
                    students.map(student =>
                        student.update({
                            totalMarks: student.totalMarks,
                            rank: student.rank,
                        }, { transaction })
                    )
                );
                await transaction.commit();
            } catch (error) {
                await transaction.rollback();
                console.error('Transaction failed:', error);
            }

            // page++;
            // } while (students.length > 0);

            page = 0;
        }

        return { statusCode: 200, data: students, message: 'Marks Updated and Ranking Calculated' };
    } catch (error) {
        console.error('Error while generating result:', error);
        return { statusCode: 500, data: {}, message: 'Something went wrong' };
    }
};

// Calculate total marks from Set A and Set B
const calculateTotalMarks = (setAMarks, setBMarks) => {
    return setAMarks + setBMarks;
};

// Rank the top N students globally
const rankTopN = (students, limit, prefix, rankedStudents) => {
    let rank = 1;
    students.forEach((student, index) => {
        if (rank > limit) return;

        if (rankedStudents.has(student.id)) return;

        if (index > 0 && student.totalMarks < students[index - 1].totalMarks) {
            rank += 1;
        }

        if (rank <= limit) {
            student.rank = `${prefix} ${rank}`;
            rankedStudents.add(student.id);
        }
    });
};

// Rank students by category (District, Taluka, or Center)
const rankCategory = (students, categoryKey, limit, prefix, rankedStudents) => {
    const categoryGroups = {};

    // Group students by category
    students.forEach(student => {
        const categoryId = student.school?.center?.taluka?.[categoryKey] ||
            student.school?.center?.[categoryKey] ||
            student.school?.[categoryKey];

        if (categoryId) {
            if (!categoryGroups[categoryId]) {
                categoryGroups[categoryId] = [];
            }
            categoryGroups[categoryId].push(student);
        }
    });

    // Process each category
    for (const categoryId in categoryGroups) {
        const categoryStudents = categoryGroups[categoryId];
        categoryStudents.sort((a, b) => b.totalMarks - a.totalMarks); // Sort by marks (highest first)

        let rank = 1;
        categoryStudents.forEach((student, index) => {
            if (rank > limit) return; // Stop if rank limit reached
            if (rankedStudents.has(student.id)) return; // Skip if already ranked

            // Assign rank first
            student.rank = `${prefix} ${rank}`;
            rankedStudents.add(student.id);

            console.log(`Assigned Rank: ${student.rank} to Student ID: ${student.id}`);

            // Increment only if the next student has fewer marks
            if (index < categoryStudents.length - 1 &&
                student.totalMarks > categoryStudents[index + 1].totalMarks) {
                rank += 1;
            }
        });
    }
};


export default calculateTotalMarksAndRanking;

