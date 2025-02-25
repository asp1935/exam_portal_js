import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser'
import dotenv from 'dotenv';
dotenv.config();

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}));

app.use(express.urlencoded({extended:true,limit:'16kb'}));

app.use(express.json({limit:'16kb'}));

app.use(cookieparser());

app.use(express.static('public'));

// app.use((err, req, res, next) => {
//     const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
//     res.status(statusCode).json({
//         success: false,
//         message: err.message || "Internal Server Error",
//         stack: process.env.NODE_ENV === "production" ? null : err.stack
//     });
// });



app.get('/', (req, res) => {
    res.send('Server ok!');
});
 
import districtRouter from './routes/district.route.js';
import userRouter from './routes/user.route.js';
import talukaRouter from './routes/taluka.route.js';
import centerRouter from './routes/center.route.js';
import representativeRouter from './routes/representative.route.js';
import schoolRouter from './routes/school.route.js';
import studentRouter from './routes/student.route.js';
import resultRouter from './routes/result.route.js';
import criteriaRouter from './routes/criteria.route.js';
import examRouter from './routes/exam.route.js';
import PDFRouter from './routes/pdf.route.js';

app.use('/api/v1/district',districtRouter);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/taluka',talukaRouter);
app.use('/api/v1/center',centerRouter);
app.use('/api/v1/representative',representativeRouter);
app.use('/api/v1/school',schoolRouter);
app.use('/api/v1/student',studentRouter);
app.use('/api/v1/result',resultRouter);
app.use('/api/v1/criteria',criteriaRouter);
app.use('/api/v1/exam',examRouter);
app.use('/api/v1/pdf',PDFRouter);

export {app};