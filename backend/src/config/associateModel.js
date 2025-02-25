import Center from "../models/center.model.js";
import District from "../models/district.model.js";
import Exam from "../models/exam.model.js";
import Representative from "../models/representative.model.js";
import School from "../models/school.model.js";
import SetA_Result from "../models/setA_Result.model.js";
import SetB_Result from "../models/setB_Result.model.js";
import Student from "../models/student.model.js";
import Subject from "../models/subject.model.js";
import Taluka from "../models/taluka.model.js";

export function associateModels() {
    District.hasMany(Taluka, {
        foreignKey: "districtId",
        as: "talukas",  // Plural for hasMany
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    Taluka.belongsTo(District, {
        foreignKey: "districtId",
        as: "district",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    Taluka.hasMany(Center, {
        foreignKey: "talukaId",
        as: "centers",  // Unique alias
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    Center.belongsTo(Taluka, {
        foreignKey: "talukaId",
        as: "talukas",  // Unique alias
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    Center.hasOne(Representative, {
        foreignKey: "centerId",
        as: "representative",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    Center.hasMany(School, {
        foreignKey: "centerId",
        as: "schools",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    Representative.belongsTo(Center, {
        foreignKey: "centerId",
        as: "center",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });

    School.belongsTo(Center, {
        foreignKey: "centerId",
        as: "center",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    School.hasMany(Student, {
        foreignKey: 'schoolId',
        as: 'students',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
    Student.belongsTo(School, {
        foreignKey: 'schoolId',
        as: 'school',
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    Student.hasOne(SetA_Result, {
        foreignKey: 'examNo',
        sourceKey: 'examNo',
        as: 'setA_result',
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    Student.hasOne(SetB_Result, {
        foreignKey: 'examNo',
        sourceKey: 'examNo',
        as: 'setB_result',
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    SetA_Result.belongsTo(Student, {
        foreignKey: 'examNo',
        targetKey: 'examNo',
        as: 'student',
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    SetB_Result.belongsTo(Student, {
        foreignKey: 'examNo',
        targetKey: 'examNo',
        as: 'student',
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    });
    Exam.hasMany(Subject, {
        foreignKey: 'examId',
        as: 'subjects',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
    Subject.belongsTo(Exam, {
        foreignKey: 'examId',
        as: 'exam',
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })


}
